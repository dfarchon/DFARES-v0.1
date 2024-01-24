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
    event PlanetHatBought(address player, uint256 loc, uint256 tohatLevel, uint256 tohatType);
    event PlanetTransferred(address sender, uint256 loc, address receiver);
    event LocationRevealed(address revealer, uint256 loc, uint256 x, uint256 y);

    event PlanetSilverWithdrawn(address player, uint256 loc, uint256 amount);

    event LocationClaimed(address revealer, address previousClaimer, uint256 loc);

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
            // myNotice: when change gameConstants().MAX_RECEIVING_PLANET also need to change here

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
        return 1 ether;
        // return 30 ether;
        // uint256 amount = gs().playerIds.length;
        // return (1 ether * amount * amount * amount) / 100000;
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
        require(msg.value == entryFee, "Wrong value sent");

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
            0
        );

        LibGameUtils.updateWorldRadius();
        emit PlayerInitialized(msg.sender, _location);
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

        emit PlanetTransferred(msg.sender, _location, _player);
    }

    function buyHat(uint256 _location, uint256 hatType) public payable notPaused {
        require(gs().planets[_location].isInitialized == true, "Planet is not initialized");
        refreshPlanet(_location);

        require(
            gs().planets[_location].owner == msg.sender,
            "Only owner account can perform that operation on planet."
        );

        Artifact memory activeArtifact = LibGameUtils.getActiveArtifact(_location);

        require(activeArtifact.artifactType != ArtifactType.Avatar, "need no active Avatar");

        // uint256 cost = (1 << gs().planets[_location].hatLevel) * 1 ether;
        uint256 cost = 0.1 ether;

        require(msg.value == cost, "Wrong value sent");

        if (gs().firstHat == address(0)) gs().firstHat = msg.sender;

        gs().players[msg.sender].hatCount++;
        // gs().planets[_location].hatLevel += 1;

        if (gs().planets[_location].hatLevel == 0) {
            gs().planets[_location].hatLevel = 1;
            gs().planets[_location].hatType = hatType;
        } else {
            gs().planets[_location].hatLevel = 0;
            gs().planets[_location].hatType = 0;
        }

        emit PlanetHatBought(
            msg.sender,
            _location,
            gs().planets[_location].hatLevel,
            gs().planets[_location].hatType
        );
    }

    function setHat(
        uint256 _location,
        uint256 hatLevel,
        uint256 hatType
    ) public onlyAdmin {
        require(gs().planets[_location].isInitialized == true, "Planet is not initialized");
        refreshPlanet(_location);

        gs().planets[_location].hatLevel = hatLevel;
        gs().planets[_location].hatType = hatType;
        if (hatLevel >= 1) {
            gs().planets[_location].adminProtect = true;
        } else gs().planets[_location].adminProtect = false;

        emit PlanetHatBought(
            msg.sender,
            _location,
            gs().planets[_location].hatLevel,
            gs().planets[_location].hatType
        );
    }

    function setPlanetCanShow(uint256 _location, bool _canShow) public onlyAdmin {
        require(gs().planets[_location].isInitialized == true, "Planet is not initialized");
        refreshPlanet(_location);
        gs().planets[_location].canShow = _canShow;
    }

    // withdraw silver
    function withdrawSilver(uint256 locationId, uint256 amount) public notPaused {
        refreshPlanet(locationId);
        LibPlanet.withdrawSilver(locationId, amount);
        emit PlanetSilverWithdrawn(msg.sender, locationId, amount);
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
    }
}
