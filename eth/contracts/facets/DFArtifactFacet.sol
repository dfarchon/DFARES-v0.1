// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

// Contract imports
import {ERC721} from "@solidstate/contracts/token/ERC721/ERC721.sol";
import {ERC721BaseStorage} from "@solidstate/contracts/token/ERC721/base/ERC721BaseStorage.sol";
import {DFVerifierFacet} from "./DFVerifierFacet.sol";
import {DFWhitelistFacet} from "./DFWhitelistFacet.sol";

// Library Imports
import {LibDiamond} from "../vendor/libraries/LibDiamond.sol";
import {LibGameUtils} from "../libraries/LibGameUtils.sol";
import {LibArtifactUtils} from "../libraries/LibArtifactUtils.sol";
import {LibPlanet} from "../libraries/LibPlanet.sol";

// Storage imports
import {WithStorage} from "../libraries/LibStorage.sol";

// Type imports
import {Artifact, ArtifactType, Biome, ArtifactRarity, DFTCreateArtifactArgs, DFPFindArtifactArgs, Planet} from "../DFTypes.sol";

contract DFArtifactFacet is WithStorage, ERC721 {
    using ERC721BaseStorage for ERC721BaseStorage.Layout;

    event PlanetProspected(address player, uint256 loc);
    event ArtifactFound(address player, uint256 artifactId, uint256 loc);
    event ArtifactDeposited(address player, uint256 artifactId, uint256 loc);
    event ArtifactWithdrawn(address player, uint256 artifactId, uint256 loc);
    event ArtifactActivated(address player, uint256 artifactId, uint256 loc, uint256 linkTo); // also emitted in LibPlanet
    event ArtifactDeactivated(address player, uint256 artifactId, uint256 loc, uint256 linkTo); // also emitted in LibPlanet
    event ArtifactChangeImageType(
        address player,
        uint256 artifactId,
        uint256 loc,
        uint256 imageType
    );
    modifier onlyWhitelisted() {
        require(
            DFWhitelistFacet(address(this)).isWhitelisted(msg.sender) ||
                msg.sender == LibDiamond.contractOwner(),
            "Player is not whitelisted"
        );
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

    modifier onlyAdminOrCore() {
        require(
            msg.sender == gs().diamondAddress || msg.sender == LibDiamond.contractOwner(),
            "Only the Core or Admin addresses can fiddle with artifacts."
        );
        _;
    }

    modifier onlyAdmin() {
        require(
            msg.sender == LibDiamond.contractOwner(),
            "Only Admin address can perform this action."
        );
        _;
    }

    function createArtifact(DFTCreateArtifactArgs memory args)
        public
        onlyAdminOrCore
        returns (Artifact memory)
    {
        require(args.tokenId >= 1, "artifact id must be positive");

        _mint(args.owner, args.tokenId);

        Artifact memory newArtifact = Artifact(
            true,
            args.tokenId,
            args.planetId,
            args.rarity,
            args.biome,
            block.timestamp,
            args.discoverer,
            args.artifactType,
            0,
            0,
            0,
            0,
            args.controller,
            0
        );

        gs().artifacts[args.tokenId] = newArtifact;

        return newArtifact;
    }

    function createArtifactToSell(DFTCreateArtifactArgs memory args)
        private
        returns (Artifact memory)
    {
        require(args.tokenId >= 1, "artifact id must be positive");

        _mint(args.owner, args.tokenId);

        Artifact memory newArtifact = Artifact(
            true,
            args.tokenId,
            args.planetId,
            args.rarity,
            args.biome,
            block.timestamp,
            args.discoverer,
            args.artifactType,
            0,
            0,
            0,
            0,
            args.controller,
            0
        );

        gs().artifacts[args.tokenId] = newArtifact;

        return newArtifact;
    }

    function getArtifact(uint256 tokenId) public view returns (Artifact memory) {
        return gs().artifacts[tokenId];
    }

    function getArtifactAtIndex(uint256 idx) public view returns (Artifact memory) {
        return gs().artifacts[tokenByIndex(idx)];
    }

    function getPlayerArtifactIds(address playerId) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(playerId);
        uint256[] memory results = new uint256[](balance);

        for (uint256 idx = 0; idx < balance; idx++) {
            results[idx] = tokenOfOwnerByIndex(playerId, idx);
        }

        return results;
    }

    function transferArtifact(uint256 tokenId, address newOwner) public onlyAdminOrCore {
        if (newOwner == address(0)) {
            _burn(tokenId);
        } else {
            _transfer(ownerOf(tokenId), newOwner, tokenId);
        }
    }

    function transferArtifactToSell(uint256 tokenId, address newOwner) private {
        if (newOwner == address(0)) {
            _burn(tokenId);
        } else {
            _transfer(ownerOf(tokenId), newOwner, tokenId);
        }
    }

    function updateArtifact(Artifact memory updatedArtifact) public onlyAdminOrCore {
        require(
            ERC721BaseStorage.layout().exists(updatedArtifact.id),
            "you cannot update an artifact that doesn't exist"
        );

        gs().artifacts[updatedArtifact.id] = updatedArtifact;
    }

    function doesArtifactExist(uint256 tokenId) public view returns (bool) {
        return ERC721BaseStorage.layout().exists(tokenId);
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
    }

    function depositArtifact(uint256 locationId, uint256 artifactId) public notPaused {
        // should this be implemented as logic that is triggered when a player sends
        // an artifact to the contract with locationId in the extra data?
        // might be better use of the ERC721 standard - can use safeTransfer then
        LibPlanet.refreshPlanet(locationId);

        LibArtifactUtils.depositArtifact(locationId, artifactId, address(this));

        emit ArtifactDeposited(msg.sender, artifactId, locationId);
    }

    // withdraws the given artifact from the given planet. you must own the planet,
    // the artifact must be on the given planet
    function withdrawArtifact(uint256 locationId, uint256 artifactId) public notPaused {
        LibPlanet.refreshPlanet(locationId);

        LibArtifactUtils.withdrawArtifact(locationId, artifactId);

        emit ArtifactWithdrawn(msg.sender, artifactId, locationId);
    }

    // activates the given artifact on the given planet. the artifact must have
    // been previously deposited on this planet. the artifact cannot be activated
    // within a certain cooldown period, depending on the artifact type
    function activateArtifact(
        uint256 locationId,
        uint256 artifactId,
        uint256 linkTo
    ) public notPaused {
        LibPlanet.refreshPlanet(locationId);

        if (linkTo != 0) {
            LibPlanet.refreshPlanet(linkTo);
        }

        LibArtifactUtils.activateArtifact(locationId, artifactId, linkTo);
        // event is emitted in the above library function
    }

    // if there's an activated artifact on this planet, deactivates it. otherwise reverts.
    // deactivating an artifact this debuffs the planet, and also removes whatever special
    // effect that the artifact bestowned upon this planet.
    function deactivateArtifact(uint256 locationId) public notPaused {
        LibPlanet.refreshPlanet(locationId);

        LibArtifactUtils.deactivateArtifact(locationId);
        // event is emitted in the above library function
    }

    // in order to be able to find an artifact on a planet, the planet
    // must first be 'prospected'. prospecting commits to a currently-unknown
    // seed that is used to randomly generate the artifact that will be
    // found on this planet.
    function prospectPlanet(uint256 locationId) public notPaused {
        LibPlanet.refreshPlanet(locationId);
        LibArtifactUtils.prospectPlanet(locationId);
        emit PlanetProspected(msg.sender, locationId);
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
    }

    function adminGiveArtifact(DFTCreateArtifactArgs memory args) public onlyAdmin {
        Artifact memory artifact = createArtifact(args);
        transferArtifact(artifact.id, address(this));
        LibGameUtils._putArtifactOnPlanet(artifact.id, args.planetId);

        emit ArtifactFound(args.owner, artifact.id, args.planetId);
    }

    function buyArtifact(DFTCreateArtifactArgs memory args) public payable notPaused {
        // myNotice: only use args.planetId
        uint256 _location = args.planetId;
        require(gs().planets[_location].isInitialized == true, "Planet is not initialized");
        LibPlanet.refreshPlanet(_location);

        require(
            gs().planets[_location].owner == msg.sender,
            "Only owner account can perform that operation on planet."
        );

        require(
            block.timestamp - gs().lastBuyArtifactTimestamp[msg.sender] >
                gameConstants().BUY_ARTIFACT_COOLDOWN,
            "wait for cooldown before buying artifact again"
        );
        gs().lastBuyArtifactTimestamp[msg.sender] = block.timestamp;

        uint256 cost = 0.001 ether; //0.001 eth
        require(msg.value == cost, "Wrong value sent");

        uint256 id = uint256(
            keccak256(abi.encodePacked(args.planetId, blockhash(block.number), gs().miscNonce++))
        );

        args.tokenId = id;
        args.discoverer = msg.sender;
        //planetId;
        //biome;
        args.owner = gs().diamondAddress;
        args.controller = address(0);
        args.imageType = 0;

        uint256 lastByteOfSeed = id % 10000;
        uint256 secondLastByteOfSeed = ((id - lastByteOfSeed) / 10000) % 10;

        if (secondLastByteOfSeed == 0) {
            args.biome = Biome.Ocean;
        } else if (secondLastByteOfSeed == 1) {
            args.biome = Biome.Forest;
        } else if (secondLastByteOfSeed == 2) {
            args.biome = Biome.Grassland;
        } else if (secondLastByteOfSeed == 3) {
            args.biome = Biome.Tundra;
        } else if (secondLastByteOfSeed == 4) {
            args.biome = Biome.Swamp;
        } else if (secondLastByteOfSeed == 5) {
            args.biome = Biome.Desert;
        } else if (secondLastByteOfSeed == 6) {
            args.biome = Biome.Ice;
        } else if (secondLastByteOfSeed == 7) {
            args.biome = Biome.Wasteland;
        } else if (secondLastByteOfSeed == 8) {
            args.biome = Biome.Lava;
        } else {
            args.biome = Biome.Corrupted;
        }

        if (lastByteOfSeed < 1400) {
            args.rarity = ArtifactRarity.Common;
            args.artifactType = ArtifactType.Wormhole;
        } else if (lastByteOfSeed < 1750) {
            args.rarity = ArtifactRarity.Rare;
            args.artifactType = ArtifactType.Wormhole;
        } else if (lastByteOfSeed < 1964) {
            args.rarity = ArtifactRarity.Epic;
            args.artifactType = ArtifactType.Wormhole;
        } else if (lastByteOfSeed < 2016) {
            args.rarity = ArtifactRarity.Legendary;
            args.artifactType = ArtifactType.Wormhole;
        } else if (lastByteOfSeed < 2033) {
            args.rarity = ArtifactRarity.Mythic;
            args.artifactType = ArtifactType.Wormhole;
        } else if (lastByteOfSeed < 3373) {
            args.rarity = ArtifactRarity.Common;
            args.artifactType = ArtifactType.PlanetaryShield;
        } else if (lastByteOfSeed < 3716) {
            args.rarity = ArtifactRarity.Rare;
            args.artifactType = ArtifactType.PlanetaryShield;
        } else if (lastByteOfSeed < 3930) {
            args.rarity = ArtifactRarity.Epic;
            args.artifactType = ArtifactType.PlanetaryShield;
        } else if (lastByteOfSeed < 3983) {
            args.rarity = ArtifactRarity.Legendary;
            args.artifactType = ArtifactType.PlanetaryShield;
        } else if (lastByteOfSeed < 4000) {
            args.rarity = ArtifactRarity.Mythic;
            args.artifactType = ArtifactType.PlanetaryShield;
        } else if (lastByteOfSeed < 5000) {
            args.rarity = ArtifactRarity.Common;
            args.artifactType = ArtifactType.PhotoidCannon;
        } else if (lastByteOfSeed < 5550) {
            args.rarity = ArtifactRarity.Rare;
            args.artifactType = ArtifactType.PhotoidCannon;
        } else if (lastByteOfSeed < 5800) {
            args.rarity = ArtifactRarity.Epic;
            args.artifactType = ArtifactType.PhotoidCannon;
        } else if (lastByteOfSeed < 5950) {
            args.rarity = ArtifactRarity.Legendary;
            args.artifactType = ArtifactType.PhotoidCannon;
        } else if (lastByteOfSeed < 6000) {
            args.rarity = ArtifactRarity.Mythic;
            args.artifactType = ArtifactType.PhotoidCannon;
        } else if (lastByteOfSeed < 6700) {
            args.rarity = ArtifactRarity.Common;
            args.artifactType = ArtifactType.BloomFilter;
        } else if (lastByteOfSeed < 6860) {
            args.rarity = ArtifactRarity.Rare;
            args.artifactType = ArtifactType.BloomFilter;
        } else if (lastByteOfSeed < 6970) {
            args.rarity = ArtifactRarity.Epic;
            args.artifactType = ArtifactType.BloomFilter;
        } else if (lastByteOfSeed < 6995) {
            args.rarity = ArtifactRarity.Legendary;
            args.artifactType = ArtifactType.BloomFilter;
        } else if (lastByteOfSeed < 7000) {
            args.rarity = ArtifactRarity.Mythic;
            args.artifactType = ArtifactType.BloomFilter;
        } else if (lastByteOfSeed < 7700) {
            args.rarity = ArtifactRarity.Common;
            args.artifactType = ArtifactType.BlackDomain;
        } else if (lastByteOfSeed < 7860) {
            args.rarity = ArtifactRarity.Rare;
            args.artifactType = ArtifactType.BlackDomain;
        } else if (lastByteOfSeed < 7970) {
            args.rarity = ArtifactRarity.Epic;
            args.artifactType = ArtifactType.BlackDomain;
        } else if (lastByteOfSeed < 7995) {
            args.rarity = ArtifactRarity.Legendary;
            args.artifactType = ArtifactType.BlackDomain;
        } else if (lastByteOfSeed < 8000) {
            args.rarity = ArtifactRarity.Mythic;
            args.artifactType = ArtifactType.BlackDomain;
        } else if (lastByteOfSeed < 9000) {
            args.rarity = ArtifactRarity.Common;
            args.artifactType = ArtifactType.StellarShield;
        } else if (lastByteOfSeed < 9550) {
            args.rarity = ArtifactRarity.Rare;
            args.artifactType = ArtifactType.StellarShield;
        } else if (lastByteOfSeed < 9800) {
            args.rarity = ArtifactRarity.Epic;
            args.artifactType = ArtifactType.StellarShield;
        } else if (lastByteOfSeed < 9950) {
            args.rarity = ArtifactRarity.Legendary;
            args.artifactType = ArtifactType.StellarShield;
        } else {
            args.rarity = ArtifactRarity.Mythic;
            args.artifactType = ArtifactType.StellarShield;
        }

        Artifact memory artifact = createArtifactToSell(args);
        transferArtifactToSell(artifact.id, address(this));
        LibGameUtils._putArtifactOnPlanet(artifact.id, args.planetId);

        emit ArtifactFound(args.owner, artifact.id, args.planetId);

        gs().players[msg.sender].buyArtifactAmount++;
    }

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
    }
}
