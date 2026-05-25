// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

// External contract imports
import {DFVerifierFacet} from "./DFVerifierFacet.sol";
import {DFWhitelistFacet} from "./DFWhitelistFacet.sol";
import {DFCaptureFacet} from "./DFCaptureFacet.sol";

// Library imports
import {ABDKMath64x64} from "../vendor/libraries/ABDKMath64x64.sol";
import {LibDiamond} from "../vendor/libraries/LibDiamond.sol";
import {LibGameUtils} from "../libraries/LibGameUtils.sol";
import {LibArtifactUtils} from "../libraries/LibArtifactUtils.sol";
import {LibPlanet} from "../libraries/LibPlanet.sol";

// Storage imports
import {WithStorage} from "../libraries/LibStorage.sol";

// Type imports
import {SpaceType, Planet, Player, ArtifactType, DFPInitPlanetArgs, DFPMoveArgs, DFPFindArtifactArgs, AdminCreatePlanetArgs, Artifact, ClaimedCoords} from "../DFTypes.sol";

contract DFCoreFacet is WithStorage {
    using ABDKMath64x64 for *;

    event PlayerInitialized(address player, uint256 loc);
    event PlanetUpgraded(address player, uint256 loc, uint256 branch, uint256 toBranchLevel); // emitted in LibPlanet
    event PlanetTransferred(address sender, uint256 loc, address receiver);
    event LocationRevealed(address revealer, uint256 loc, uint256 x, uint256 y);
    event PlanetSilverWithdrawn(address player, uint256 loc, uint256 amount);
    event LocationClaimed(address revealer, address previousClaimer, uint256 loc);
    event ArtifactChangeImageType(
        address player,
        uint256 artifactId,
        uint256 loc,
        uint256 imageType
    );
    event PlanetProspected(address player, uint256 loc);
    event ArtifactFound(address player, uint256 artifactId, uint256 loc);
    event ArtifactDeposited(address player, uint256 artifactId, uint256 loc);
    event ArtifactWithdrawn(address player, uint256 artifactId, uint256 loc);
    event ArtifactActivated(address player, uint256 artifactId, uint256 loc, uint256 linkTo); // also emitted in LibPlanet
    event ArtifactDeactivated(address player, uint256 artifactId, uint256 loc, uint256 linkTo); // also emitted in LibPlanet
    event WorldRadiusUpdated(uint256 radius);
    event InnerRadiusUpdated(uint256 radius);
    //////////////////////
    /// ACCESS CONTROL ///
    //////////////////////

    modifier onlyAdmin() {
        LibDiamond.enforceIsContractOwner();
        _;
    }

    modifier onlyWhitelisted() {
        require(
            DFWhitelistFacet(address(this)).isWhitelisted(msg.sender) ||
                msg.sender == LibDiamond.contractOwner(),
            "Player is not whitelisted"
        );
        _;
    }

    modifier disabled() {
        require(false, "This functionality is disabled for the current round.");
        _;
    }

    modifier notPaused() {
        require(!gs().paused, "Game is paused");
        _;
    }

    modifier notTokenEnded() {
        require(
            block.timestamp < gameConstants().TOKEN_MINT_END_TIMESTAMP,
            "Token mint period has ended"
        );
        _;
    }

    //////////////////////
    /// Game Mechanics ///
    //////////////////////

    function refreshPlanet(uint256 location) public notPaused {
        LibPlanet.refreshPlanet(location);
    }

    function getRefreshedPlanet(uint256 location, uint256 timestamp)
        public
        view
        returns (
            Planet memory,
            // NOTE: when change gameConstants().MAX_RECEIVING_PLANET also need to change here

            uint256[16] memory eventsToRemove,
            uint256[16] memory artifactsToAdd,
            bool shouldDeactiveArtifact
        )
    {
        return LibPlanet.getRefreshedPlanet(location, timestamp);
    }

    function checkRevealProof(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[9] memory _input
    ) public view returns (bool) {
        if (!snarkConstants().DISABLE_ZK_CHECKS) {
            require(
                DFVerifierFacet(address(this)).verifyRevealProof(_a, _b, _c, _input),
                "Failed reveal pf check"
            );
        }

        LibGameUtils.revertIfBadSnarkPerlinFlags(
            [_input[4], _input[5], _input[6], _input[7], _input[8]],
            false
        );

        return true;
    }

    //###############
    //  NEW MAP ALGO
    //###############
    function revealLocation(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[9] memory _input
    ) public notPaused onlyWhitelisted {
        require(checkRevealProof(_a, _b, _c, _input), "Failed reveal pf check");

        // if (!gs().planets[_input[0]].isInitialized) {
        //     LibPlanet.initializePlanetWithDefaults(_input[0], _input[1], false);
        // }

        uint256 x = _input[2];
        uint256 y = _input[3];
        int256 planetX = DFCaptureFacet(address(this)).getIntFromUInt(x);
        int256 planetY = DFCaptureFacet(address(this)).getIntFromUInt(y);
        uint256 distFromOriginSquare = uint256(planetX * planetX + planetY * planetY);

        if (!gs().planets[_input[0]].isInitialized) {
            LibPlanet.initializePlanetWithDefaults(
                _input[0],
                _input[1],
                distFromOriginSquare,
                false
            );
        }

        LibPlanet.revealLocation(
            _input[0],
            _input[1],
            _input[2],
            _input[3],
            msg.sender != LibDiamond.contractOwner()
        );
        emit LocationRevealed(msg.sender, _input[0], _input[2], _input[3]);
    }

    function getEntryFee() public view returns (uint256) {
        return gameConstants().ENTRY_FEE * 1000000000;
    }

    function initializePlayer(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[9] memory _input
    ) public payable onlyWhitelisted returns (uint256) {
        LibPlanet.initializePlanet(_a, _b, _c, _input, true);

        uint256 _location = _input[0];
        uint256 _perlin = _input[1];
        uint256 _radius = _input[2];

        require(LibPlanet.checkPlayerInit(_location, _perlin, _radius, _input[8]));

        // Pay the entry fee
        uint256 entryFee = getEntryFee();
        if (gs().halfPrice) entryFee /= 2;
        require(msg.value == entryFee, "Wrong value sent");

        ls().initializePlayerCnt++;
        ls().entryCost += entryFee;

        // whitelist
        if (!ws().enabled) {
            require(!ws().allowedAccounts[msg.sender], "player is already allowed");
            ws().allowedAccounts[msg.sender] = true;
            ws().allowedAccountsArray.push(msg.sender);
        }

        // Initialize player data
        gs().playerIds.push(msg.sender);

        gs().players[msg.sender] = Player(
            true,
            msg.sender,
            block.timestamp,
            _location,
            0,
            0,
            0,
            gameConstants().SPACE_JUNK_LIMIT,
            false,
            0,
            false,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        );

        LibGameUtils.updateWorldRadius();
        LibGameUtils.updateInnerRadius();
        emit WorldRadiusUpdated(gs().worldRadius);
        emit InnerRadiusUpdated(gs().innerRadius);

        emit PlayerInitialized(msg.sender, _location);

        // Players only need to submit a transaction to enter the game.
        giveSpaceShips(_location);

        return _location;
    }

    function upgradePlanet(uint256 _location, uint256 _branch)
        public
        notPaused
        returns (uint256, uint256)
    {
        // _branch specifies which of the three upgrade branches player is leveling up
        // 0 improves silver production and capacity
        // 1 improves population
        // 2 improves range
        refreshPlanet(_location);
        LibPlanet.upgradePlanet(_location, _branch);
        return (_location, _branch);
    }

    function transferPlanet(uint256 _location, address _player) public notPaused {
        require(gameConstants().PLANET_TRANSFER_ENABLED, "planet transferring is disabled");

        require(gs().planets[_location].isInitialized == true, "Planet is not initialized");

        refreshPlanet(_location);

        require(
            gs().planets[_location].owner == msg.sender,
            "Only owner account can perform that operation on planet."
        );

        require(_player != msg.sender, "Cannot transfer planet to self");

        require(
            gs().players[_player].isInitialized,
            "Can only transfer ownership to initialized players"
        );

        require(!gs().planets[_location].destroyed, "can't transfer a s planet");
        require(!gs().planets[_location].frozen, "can't transfer a frozen planet");

        gs().planets[_location].owner = _player;
        ls().transferPlanetCnt++;

        emit PlanetTransferred(msg.sender, _location, _player);
    }

    function setPlanetCanShow(uint256 _location, bool _canShow) public onlyAdmin {
        require(gs().planets[_location].isInitialized == true, "Planet is not initialized");
        refreshPlanet(_location);
        gs().planets[_location].canShow = _canShow;
        ls().setPlanetCanShowCnt++;
    }

    // withdraw silver
    function withdrawSilver(uint256 locationId, uint256 amount) public notPaused {
        refreshPlanet(locationId);
        LibPlanet.withdrawSilver(locationId, amount);

        emit PlanetSilverWithdrawn(msg.sender, locationId, amount);
        ls().withdrawSilverCnt++;
        ls().playerLog[msg.sender].withdrawSilverCnt++;
    }

    /**
     * Sums up all the distances of all the planets this player has claimed.
     */
    function getScore(address player) public view returns (uint256) {
        uint256 bestScore = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
        uint256[] storage planetIds = gs().claimedPlanetsOwners[player];

        for (uint256 i = 0; i < planetIds.length; i++) {
            ClaimedCoords memory claimed = gs().claimedCoords[planetIds[i]];
            if (
                bestScore > claimed.score &&
                !gs().planets[planetIds[i]].destroyed &&
                !gs().planets[planetIds[i]].frozen
            ) {
                bestScore = claimed.score;
            }
        }

        return bestScore;
    }

    /**
     * If this planet has been claimed, gets information about the circumstances of that claim.
     */
    function getClaimedCoords(uint256 locationId) public view returns (ClaimedCoords memory) {
        return gs().claimedCoords[locationId];
    }

    /**
     * Assuming that the given player is allowed to claim the given planet, and that the distance is
      correct, update the data that the scoring function will need.
     */
    function storePlayerClaim(
        address player,
        uint256 planetId,
        uint256 distance,
        uint256 x,
        uint256 y
    ) internal returns (address) {
        ClaimedCoords memory oldClaim = getClaimedCoords(planetId);
        uint256[] storage playerClaims = gs().claimedPlanetsOwners[player];
        uint256[] storage oldPlayerClaimed = gs().claimedPlanetsOwners[oldClaim.claimer];

        if (gs().claimedCoords[planetId].claimer == address(0)) {
            gs().claimedIds.push(planetId);
            playerClaims.push(planetId);
            gs().claimedCoords[planetId] = ClaimedCoords({
                locationId: planetId,
                x: x,
                y: y,
                claimer: player,
                score: distance,
                claimedAt: block.timestamp
            });
            // Only execute if player is not current claimer
        } else if (gs().claimedCoords[planetId].claimer != player) {
            playerClaims.push(planetId);
            gs().claimedCoords[planetId].claimer = player;
            gs().claimedCoords[planetId].claimedAt = block.timestamp;
            for (uint256 i = 0; i < oldPlayerClaimed.length; i++) {
                if (oldPlayerClaimed[i] == planetId) {
                    oldPlayerClaimed[i] = oldPlayerClaimed[oldPlayerClaimed.length - 1];
                    oldPlayerClaimed.pop();
                    break;
                }
            }
        }
        // return previous claimer for event emission
        return oldClaim.claimer;
    }

    /**
     * Calculates the distance of the given coordinate from (0, 0).
     */
    function distanceFromCenter(uint256 x, uint256 y) private pure returns (uint256) {
        if (x == 0 && y == 0) {
            return 0;
        }

        uint256 distance = ABDKMath64x64.toUInt(
            ABDKMath64x64.sqrt(
                ABDKMath64x64.add(
                    ABDKMath64x64.pow(ABDKMath64x64.fromUInt(x), 2),
                    ABDKMath64x64.pow(ABDKMath64x64.fromUInt(y), 2)
                )
            )
        );

        return distance;
    }

    // `x`, `y` are in `{0, 1, 2, ..., LOCATION_ID_UB - 1}` by convention, if a number `n` is
    // greater than `LOCATION_ID_UB / 2`, it is considered a negative number whose "actual" value is
    // `n - LOCATION_ID_UB` this code snippet calculates the absolute value of `x` or `y` (given the
    // above convention)
    function getAbsoluteModP(uint256 n) private pure returns (uint256) {
        uint256 LOCATION_ID_UB = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        require(n < LOCATION_ID_UB, "Number outside of AbsoluteModP Range");
        if (n > LOCATION_ID_UB / 2) {
            return LOCATION_ID_UB - n;
        }

        return n;
    }

    //  In dark forest v0.6 r3, players can claim planets that own. This will reveal a planets a
    //  coordinates to all other players. A Player's score is determined by taking the distance of
    //  their closest planet from the center of the universe. A planet can be claimed multiple
    //  times, but only the last player to claim a planet can use it as part of their score.
    function claimLocation(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[9] memory _input
    ) public notPaused onlyWhitelisted {
        require(
            block.timestamp < gameConstants().CLAIM_END_TIMESTAMP,
            "Cannot claim planets after the round has ended"
        );
        require(
            block.timestamp - gs().lastClaimTimestamp[msg.sender] >
                gameConstants().CLAIM_PLANET_COOLDOWN,
            "wait for cooldown before revealing again"
        );

        uint256 locationId = _input[0];

        require(gs().planets[locationId].isInitialized, "Cannot claim uninitialized planet");

        require(checkRevealProof(_a, _b, _c, _input), "Failed reveal pf check");
        uint256 x = _input[2];
        uint256 y = _input[3];

        LibPlanet.refreshPlanet(locationId);
        Planet memory planet = gs().planets[locationId];
        require(planet.owner == msg.sender, "Only planet owner can perform operation on planets");
        require(planet.planetLevel >= 3, "Planet level must >= 3");
        require(!planet.destroyed, "Cannot claim destroyed planet");
        require(!planet.frozen, "Cannot claim frozen planet");
        gs().lastClaimTimestamp[msg.sender] = block.timestamp;
        address previousClaimer = storePlayerClaim(
            msg.sender,
            _input[0],
            distanceFromCenter(getAbsoluteModP(x), getAbsoluteModP(y)),
            x,
            y
        );

        emit LocationClaimed(msg.sender, previousClaimer, _input[0]);
        ls().claimLocationCnt++;
        ls().playerLog[msg.sender].claimLocationCnt++;
    }

    // DFArtifactFacet

    function changeArtifactImageType(
        uint256 locationId,
        uint256 artifactId,
        uint256 newImageType
    ) public notPaused {
        LibPlanet.refreshPlanet(locationId);
        Planet storage planet = gs().planets[locationId];

        require(!planet.destroyed, "planet is destroyed");
        require(!planet.frozen, "planet is frozen");
        require(
            planet.owner == msg.sender,
            "you can only change artifactImageType on a planet you own"
        );

        require(
            LibGameUtils.isArtifactOnPlanet(locationId, artifactId),
            "artifact is not on planet"
        );

        Artifact storage artifact = gs().artifacts[artifactId];

        require(artifact.isInitialized, "Artifact has not been initialized");
        require(artifact.artifactType == ArtifactType.Avatar, "artifact type should by avatar");
        require(artifact.imageType != newImageType, "need change imageType");
        artifact.imageType = newImageType;

        emit ArtifactChangeImageType(msg.sender, artifactId, locationId, newImageType);
        ls().changeArtifactImageTypeCnt++;
        ls().playerLog[msg.sender].changeArtifactImageTypeCnt++;
    }

    // if there's an activated artifact on this planet, deactivates it. otherwise reverts.
    // deactivating an artifact this debuffs the planet, and also removes whatever special
    // effect that the artifact bestowned upon this planet.
    function deactivateArtifact(uint256 locationId) public notPaused {
        LibPlanet.refreshPlanet(locationId);

        LibArtifactUtils.deactivateArtifact(locationId);
        // event is emitted in the above library function
        ls().deactivateArtifactCnt++;
        ls().playerLog[msg.sender].deactivateArtifactCnt++;
    }

    // in order to be able to find an artifact on a planet, the planet
    // must first be 'prospected'. prospecting commits to a currently-unknown
    // seed that is used to randomly generate the artifact that will be
    // found on this planet.
    function prospectPlanet(uint256 locationId) public notPaused {
        LibPlanet.refreshPlanet(locationId);
        LibArtifactUtils.prospectPlanet(locationId);
        emit PlanetProspected(msg.sender, locationId);
        ls().prospectPlanetCnt++;
        ls().playerLog[msg.sender].prospectPlanetCnt++;
    }

    function findArtifact(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[7] memory _input
    ) public notPaused notTokenEnded {
        uint256 planetId = _input[0];
        uint256 biomebase = _input[1];

        LibGameUtils.revertIfBadSnarkPerlinFlags(
            [_input[2], _input[3], _input[4], _input[5], _input[6]],
            true
        );

        LibPlanet.refreshPlanet(planetId);

        if (!snarkConstants().DISABLE_ZK_CHECKS) {
            require(
                DFVerifierFacet(address(this)).verifyBiomebaseProof(_a, _b, _c, _input),
                "biome zkSNARK failed doesn't check out"
            );
        }

        uint256 foundArtifactId = LibArtifactUtils.findArtifact(
            DFPFindArtifactArgs(planetId, biomebase, address(this))
        );

        emit ArtifactFound(msg.sender, foundArtifactId, planetId);
        ls().findArtifactCnt++;
        ls().playerLog[msg.sender].findArtifactCnt++;
    }

    function depositArtifact(uint256 locationId, uint256 artifactId) public notPaused {
        // should this be implemented as logic that is triggered when a player sends
        // an artifact to the contract with locationId in the extra data?
        // might be better use of the ERC721 standard - can use safeTransfer then
        LibPlanet.refreshPlanet(locationId);

        LibArtifactUtils.depositArtifact(locationId, artifactId, address(this));

        emit ArtifactDeposited(msg.sender, artifactId, locationId);
        ls().depositArtifactCnt++;
        ls().playerLog[msg.sender].depositArtifactCnt++;
    }

    // withdraws the given artifact from the given planet. you must own the planet,
    // the artifact must be on the given planet
    function withdrawArtifact(uint256 locationId, uint256 artifactId) public notPaused {
        LibPlanet.refreshPlanet(locationId);

        LibArtifactUtils.withdrawArtifact(locationId, artifactId);

        emit ArtifactWithdrawn(msg.sender, artifactId, locationId);
        ls().withdrawArtifactCnt++;
        ls().playerLog[msg.sender].withdrawArtifactCnt++;
    }

    /**
      Gives players 5 spaceships on their home planet. Can only be called once
      by a given player. This is a first pass at getting spaceships into the game.
      Eventually ships will be able to spawn in the game naturally (construction, capturing, etc.)
     */
    function giveSpaceShips(uint256 locationId) public onlyWhitelisted {
        require(!gs().players[msg.sender].claimedShips, "player already claimed ships");
        require(
            gs().planets[locationId].owner == msg.sender && gs().planets[locationId].isHomePlanet,
            "you can only spawn ships on your home planet"
        );

        address owner = gs().planets[locationId].owner;
        if (gameConstants().SPACESHIPS.MOTHERSHIP) {
            uint256 id1 = LibArtifactUtils.createAndPlaceSpaceship(
                locationId,
                owner,
                ArtifactType.ShipMothership
            );

            gs().mySpaceshipIds[owner].push(id1);
            emit ArtifactFound(msg.sender, id1, locationId);
        }

        if (gameConstants().SPACESHIPS.CRESCENT) {
            uint256 id2 = LibArtifactUtils.createAndPlaceSpaceship(
                locationId,
                owner,
                ArtifactType.ShipCrescent
            );
            gs().mySpaceshipIds[owner].push(id2);
            emit ArtifactFound(msg.sender, id2, locationId);
        }

        if (gameConstants().SPACESHIPS.WHALE) {
            uint256 id3 = LibArtifactUtils.createAndPlaceSpaceship(
                locationId,
                owner,
                ArtifactType.ShipWhale
            );
            gs().mySpaceshipIds[owner].push(id3);
            emit ArtifactFound(msg.sender, id3, locationId);
        }

        if (gameConstants().SPACESHIPS.GEAR) {
            uint256 id4 = LibArtifactUtils.createAndPlaceSpaceship(
                locationId,
                owner,
                ArtifactType.ShipGear
            );

            gs().mySpaceshipIds[owner].push(id4);
            emit ArtifactFound(msg.sender, id4, locationId);
        }

        if (gameConstants().SPACESHIPS.TITAN) {
            uint256 id5 = LibArtifactUtils.createAndPlaceSpaceship(
                locationId,
                owner,
                ArtifactType.ShipTitan
            );
            gs().mySpaceshipIds[owner].push(id5);
            emit ArtifactFound(msg.sender, id5, locationId);
        }

        if (gameConstants().SPACESHIPS.PINKSHIP) {
            uint256 id5 = LibArtifactUtils.createAndPlaceSpaceship(
                locationId,
                owner,
                ArtifactType.ShipPink
            );
            gs().mySpaceshipIds[owner].push(id5);
            emit ArtifactFound(msg.sender, id5, locationId);
        }

        gs().players[msg.sender].claimedShips = true;
        ls().giveSpaceShipsCnt++;
    }
}
