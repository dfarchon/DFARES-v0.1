// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

// External contract imports
import {DFArtifactFacet} from "../facets/DFArtifactFacet.sol";

// Library imports
import {LibGameUtils} from "./LibGameUtils.sol";

// Storage imports
import {LibStorage, GameStorage, GameConstants} from "./LibStorage.sol";

// Type imports
import {Biome, Planet, PlanetType, Artifact, ArtifactType, ArtifactRarity, DFPFindArtifactArgs, DFTCreateArtifactArgs} from "../DFTypes.sol";

library LibArtifactUtils {
    function gs() internal pure returns (GameStorage storage) {
        return LibStorage.gameStorage();
    }

    function gameConstants() internal pure returns (GameConstants storage) {
        return LibStorage.gameConstants();
    }

    // also need to copy some of DFCore's event signatures
    event ArtifactActivated(address player, uint256 artifactId, uint256 loc);
    event ArtifactDeactivated(address player, uint256 artifactId, uint256 loc);
    event PlanetUpgraded(address player, uint256 loc, uint256 branch, uint256 toBranchLevel);

    // verifies that user is allowed to call findArtifact on this planet
    function checkFindArtifact(uint256 locationId, Planet memory planet)
        public
        view
        returns (bool)
    {
        require(!planet.hasTriedFindingArtifact, "artifact already minted from this planet");
        require(planet.owner == msg.sender, "you can only find artifacts on planets you own");
        require(planet.prospectedBlockNumber != 0, "planet never prospected");
        require(
            planet.prospectedBlockNumber < block.number,
            "can only call findArtifact after prospectedBlockNumber"
        );
        require(block.number > planet.prospectedBlockNumber, "invalid prospectedBlockNumber");
        require(block.number - planet.prospectedBlockNumber < 256, "planet prospect expired");
        require(!planet.destroyed, "planet is destroyed");
        require(!planet.frozen, "planet is frozen");
        if (gameConstants().SPACESHIPS.GEAR) {
            require(containsGear(locationId), "gear ship must be present on planet");
        }

        return true;
    }

    /**
     * Create a new spaceship and place it on a planet owned by the given player. Returns the id
     * of the newly created spaceship.
     */
    function createAndPlaceSpaceship(
        uint256 planetId,
        address owner,
        ArtifactType shipType
    ) public returns (uint256) {
        require(shipType <= ArtifactType.ShipTitan && shipType >= ArtifactType.ShipMothership);

        uint256 id = uint256(keccak256(abi.encodePacked(planetId, gs().miscNonce++)));

        DFTCreateArtifactArgs memory createArtifactArgs = DFTCreateArtifactArgs(
            id,
            msg.sender,
            planetId,
            ArtifactRarity.Unknown,
            Biome.Unknown,
            shipType,
            address(this),
            owner
        );

        Artifact memory foundArtifact = DFArtifactFacet(address(this)).createArtifact(
            createArtifactArgs
        );
        LibGameUtils._putArtifactOnPlanet(foundArtifact.id, planetId);

        return id;
    }

    function findArtifact(DFPFindArtifactArgs memory args) public returns (uint256 artifactId) {
        Planet storage planet = gs().planets[args.planetId];

        require(checkFindArtifact(args.planetId, planet));

        Biome biome = LibGameUtils._getBiome(planet.spaceType, args.biomebase);

        uint256 artifactSeed = uint256(
            keccak256(
                abi.encodePacked(
                    args.planetId,
                    args.coreAddress,
                    blockhash(planet.prospectedBlockNumber)
                )
            )
        );

        (ArtifactType artifactType, uint256 levelBonus) = LibGameUtils
            ._randomArtifactTypeAndLevelBonus(artifactSeed, biome, planet.spaceType);

        DFTCreateArtifactArgs memory createArtifactArgs = DFTCreateArtifactArgs(
            artifactSeed,
            msg.sender,
            args.planetId,
            LibGameUtils.artifactRarityFromPlanetLevel(levelBonus + planet.planetLevel),
            biome,
            artifactType,
            args.coreAddress,
            address(0)
        );

        Artifact memory foundArtifact = DFArtifactFacet(address(this)).createArtifact(
            createArtifactArgs
        );

        LibGameUtils._putArtifactOnPlanet(foundArtifact.id, args.planetId);

        planet.hasTriedFindingArtifact = true;
        gs().players[msg.sender].score += gameConstants().ARTIFACT_POINT_VALUES[
            uint256(foundArtifact.rarity)
        ];

        artifactId = foundArtifact.id;
    }

    function activateArtifact(
        uint256 locationId,
        uint256 artifactId,
        uint256 linkTo
    ) public {
        Planet storage planet = gs().planets[locationId];
        Artifact storage artifact = gs().artifacts[artifactId];

        require(
            LibGameUtils.isArtifactOnPlanet(locationId, artifactId),
            "can't active an artifact on a planet it's not on"
        );

        if (isSpaceship(artifact.artifactType)) {
            activateSpaceshipArtifact(locationId, artifactId, planet, artifact);
        } else {
            activateNonSpaceshipArtifact(locationId, artifactId, linkTo, planet, artifact);
        }

        artifact.activations++;
    }

    function activateSpaceshipArtifact(
        uint256 locationId,
        uint256 artifactId,
        Planet storage planet,
        Artifact storage artifact
    ) private {
        if (artifact.artifactType == ArtifactType.ShipCrescent) {
            require(artifact.activations == 0, "crescent cannot be activated more than once");

            require(
                planet.planetType != PlanetType.SILVER_MINE,
                "cannot turn a silver mine into a silver mine"
            );

            require(planet.owner == address(0), "can only activate crescent on unowned planets");
            require(planet.planetLevel >= 1, "planet level must be more than one");

            artifact.lastActivated = block.timestamp;
            artifact.lastDeactivated = block.timestamp;

            if (planet.silver == 0) {
                planet.silver = 1;
                Planet memory defaultPlanet = LibGameUtils._defaultPlanet(
                    locationId,
                    planet.planetLevel,
                    PlanetType.SILVER_MINE,
                    planet.spaceType,
                    gameConstants().TIME_FACTOR_HUNDREDTHS
                );

                planet.silverGrowth = defaultPlanet.silverGrowth;
            }

            planet.planetType = PlanetType.SILVER_MINE;
            emit ArtifactActivated(msg.sender, artifactId, locationId);
        }
    }

    function activateNonSpaceshipArtifact(
        uint256 locationId,
        uint256 artifactId,
        uint256 linkTo,
        Planet storage planet,
        Artifact memory artifact
    ) private {
        require(
            planet.owner == msg.sender,
            "you must own the planet you are activating an artifact on"
        );
        require(
            !LibGameUtils.getActiveArtifact(locationId).isInitialized,
            "there is already an active artifact on this planet"
        );
        require(!planet.destroyed, "planet is destroyed");
        require(!planet.frozen, "planet is frozen");

        require(artifact.isInitialized, "this artifact is not on this planet");

        // Unknown is the 0th one, Monolith is the 1st, and so on.
        // TODO v0.6: consider photoid canon

        uint256[17] memory artifactCooldownsHours = [
            uint256(24),
            0,
            0,
            0,
            0,
            4,
            4,
            24,
            24,
            24,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ];

        require(
            artifact.lastDeactivated +
                artifactCooldownsHours[uint256(artifact.artifactType)] *
                60 *
                60 <
                block.timestamp,
            "this artifact is on a cooldown"
        );

        bool shouldDeactivateAndBurn = false;

        artifact.lastActivated = block.timestamp;
        emit ArtifactActivated(msg.sender, artifactId, locationId);

        if (artifact.artifactType == ArtifactType.Wormhole) {
            require(linkTo != 0, "you must provide a linkTo to activate a wormhole");
            require(
                gs().planets[linkTo].owner == msg.sender,
                "you can only create a wormhole to a planet you own"
            );
            require(!gs().planets[linkTo].destroyed, "planet destroyed");
            require(!gs().planets[linkTo].frozen, "planet frozen");

            artifact.linkTo = linkTo;
        } else if (artifact.artifactType == ArtifactType.BloomFilter) {
            require(
                2 * uint256(artifact.rarity) >= planet.planetLevel,
                "artifact is not powerful enough to apply effect to this planet level"
            );
            planet.population = planet.populationCap;
            // planet.silver = planet.silverCap;
            shouldDeactivateAndBurn = true;
        } else if (artifact.artifactType == ArtifactType.BlackDomain) {
            // require(
            //     2 * uint256(artifact.rarity) >= planet.planetLevel,
            //     "artifact is not powerful enough to apply effect to this planet level"
            // );
            // planet.destroyed = true;
            // shouldDeactivateAndBurn = true;
            require(linkTo!=0,"you must provide a linkTo to activate a BlockDomain");
            Planet storage toPlanet = gs().planets[linkTo];

            require(
                toPlanet.owner != address(0),
                "you can only create a BlockDomain link to a planet has owner"
            );
            require(!toPlanet.destroyed, "planet destroyed");
            require(!toPlanet.frozen, "planet frozen");
            require(
                planet.planetLevel >= toPlanet.planetLevel,
                "fromPlanetLevel must be >= toPlanetLevel"
            );

            require(
                2 * uint256(artifact.rarity) >= planet.planetLevel,
                "artifact is not powerful enough to apply effect to this planet level"
            );

             Artifact memory artifactOnToPlanet = LibGameUtils.getActiveArtifact(linkTo);
            if (artifactOnToPlanet.artifactType == ArtifactType.PlanetaryShield) {
                require(
                    artifact.rarity > artifactOnToPlanet.rarity,
                    "BlockDomain rarity must be higher"
                );
            }
            toPlanet.destroyed = true;
            shouldDeactivateAndBurn = true;

        } else if (artifact.artifactType == ArtifactType.IceLink) {
            require(linkTo != 0, "you must provide a linkTo to activate a IceLink");
            Planet storage toPlanet = gs().planets[linkTo];

            require(
                toPlanet.owner != msg.sender && toPlanet.owner != address(0),
                "you can only create a icelink to a planet other own"
            );
            require(!toPlanet.destroyed, "planet destroyed");
            require(!toPlanet.frozen, "planet frozen");
            require(
                planet.planetLevel >= toPlanet.planetLevel,
                "fromPlanetLevel must be >= toPlanetLevel"
            );

            Artifact memory artifactOnToPlanet = LibGameUtils.getActiveArtifact(linkTo);
            if (artifactOnToPlanet.artifactType == ArtifactType.PlanetaryShield) {
                require(
                    artifact.rarity > artifactOnToPlanet.rarity,
                    "Ice Link rarity must be higher"
                );
            }

            planet.frozen = true;
            gs().planets[linkTo].frozen = true;
            artifact.linkTo = linkTo;
        } else if (artifact.artifactType == ArtifactType.FireLink) {
            require(linkTo != 0, "you must provide a linkTo to activate a FireLink");
            Planet storage toPlanet = gs().planets[linkTo];

            require(!toPlanet.destroyed, "planet destroyed");

            require(toPlanet.frozen, "toPlanet must be frozen");
            require(
                planet.planetLevel >= toPlanet.planetLevel,
                "fromPlanetLevel need gte toPlanetLevel"
            );

            Artifact memory activeArtifactOnToPlanet = LibGameUtils.getActiveArtifact(linkTo);

            require(activeArtifactOnToPlanet.artifactType == ArtifactType.IceLink,"artifact on toPlanet must be IceLink");

            require(artifact.rarity>=activeArtifactOnToPlanet.rarity,"FireLink rarity must gte IceLink rarity");

            artifact.linkTo = linkTo;

            shouldDeactivateAndBurn = true;

            // deactivateArtifact(toPlanet.locationId);
            deactivateArtifactWithoutCheckOwner(toPlanet.locationId);



        } else if (artifact.artifactType == ArtifactType.SoulSwap) {
            require(linkTo != 0, "you must provide a linkTo to activate a SoulSwap");

            require(!gs().planets[linkTo].destroyed, "planet destroyed");
            require(!gs().planets[linkTo].frozen, "planet frozen");

            require(
                2 * uint256(artifact.rarity) >= planet.planetLevel,
                "artifact is not powerful enough to apply effect to this planet level"
            );
            require(
                planet.population > (planet.populationCap * 9) / 10,
                "from planet energy need gt 90%"
            );

            require(
                // This is dependent on Arrival being the only type of planet event.
                gs().planetEvents[planet.locationId].length == 0,
                "fromPlanet has incoming voyages."
            );

            require(
                // This is dependent on Arrival being the only type of planet event.
                gs().planetEvents[linkTo].length == 0,
                "toPlanet has incoming voyages."
            );

            planet.owner = gs().planets[linkTo].owner;
            gs().planets[linkTo].owner = msg.sender;
            shouldDeactivateAndBurn = true;
        } else if (artifact.artifactType == ArtifactType.Bomb) {
            // require(linkTo != 0, "you must provide a linkTo to activate a Bomb");
            // planet.owner = gs().planets[linkTo].owner;
            // gs().planets[linkTo].owner = msg.sender;
            shouldDeactivateAndBurn = true;
        } else if (artifact.artifactType == ArtifactType.Doom) {
            // require(linkTo != 0, "you must provide a linkTo to activate a Doom");
            // require(!gs().planets[linkTo].destroyed, "planet destroyed");
            // planet.owner = gs().planets[linkTo].owner;
            // gs().planets[linkTo].owner = msg.sender;
        } else if (artifact.artifactType == ArtifactType.BlindBox) {
            // planet.owner = gs().planets[linkTo].owner;
            // gs().planets[linkTo].owner = msg.sender;
            // shouldDeactivateAndBurn = true;
        } else if (artifact.artifactType == ArtifactType.Avatar) {
            // planet.owner = gs().planets[linkTo].owner;
            // gs().planets[linkTo].owner = msg.sender;
        }

        if (shouldDeactivateAndBurn) {
            artifact.lastDeactivated = block.timestamp; // immediately deactivate
            DFArtifactFacet(address(this)).updateArtifact(artifact); // save artifact state immediately, because _takeArtifactOffPlanet will access pull it from tokens contract
            emit ArtifactDeactivated(msg.sender, artifactId, locationId);
            // burn it after use. will be owned by contract but not on a planet anyone can control
            LibGameUtils._takeArtifactOffPlanet(artifactId, locationId);
        } else {
            DFArtifactFacet(address(this)).updateArtifact(artifact);
        }

        // this is fine even tho some artifacts are immediately deactivated, because
        // those artifacts do not buff the planet.
        LibGameUtils._buffPlanet(locationId, LibGameUtils._getUpgradeForArtifact(artifact));
    }

    function deactivateArtifact(uint256 locationId) public {
        Planet storage planet = gs().planets[locationId];

        require(
            planet.owner == msg.sender,
            "you must own the planet you are deactivating an artifact on"
        );

        require(!planet.destroyed, "planet is destroyed");
        Artifact memory artifact = LibGameUtils.getActiveArtifact(locationId);

        require(artifact.isInitialized, "this artifact is not activated on this planet");

        if (artifact.artifactType != ArtifactType.IceLink) {
            require(!planet.frozen, "planet is frozen");
        } else {
            Planet storage toPlanet = gs().planets[artifact.linkTo];
            planet.frozen = false;
            toPlanet.frozen = false;
        }
        artifact.lastDeactivated = block.timestamp;
        artifact.linkTo = 0;
        emit ArtifactDeactivated(msg.sender, artifact.id, locationId);
        DFArtifactFacet(address(this)).updateArtifact(artifact);

        bool shouldBurn = artifact.artifactType == ArtifactType.PlanetaryShield ||
            artifact.artifactType == ArtifactType.PhotoidCannon ||
            artifact.artifactType == ArtifactType.IceLink;

        if (shouldBurn) {
            // burn it after use. will be owned by contract but not on a planet anyone can control
            LibGameUtils._takeArtifactOffPlanet(artifact.id, locationId);
        }

        LibGameUtils._debuffPlanet(locationId, LibGameUtils._getUpgradeForArtifact(artifact));
    }


    function deactivateArtifactWithoutCheckOwner(uint256 locationId) private{
        Planet storage planet = gs().planets[locationId];

        require(!planet.destroyed, "planet is destroyed");
        Artifact memory artifact = LibGameUtils.getActiveArtifact(locationId);

        require(artifact.isInitialized, "this artifact is not activated on this planet");

        if (artifact.artifactType != ArtifactType.IceLink) {
            require(!planet.frozen, "planet is frozen");
        } else {
            Planet storage toPlanet = gs().planets[artifact.linkTo];
            planet.frozen = false;
            toPlanet.frozen = false;
        }
        artifact.lastDeactivated = block.timestamp;
        artifact.linkTo = 0;
        emit ArtifactDeactivated(msg.sender, artifact.id, locationId);
        DFArtifactFacet(address(this)).updateArtifact(artifact);

        bool shouldBurn = artifact.artifactType == ArtifactType.PlanetaryShield ||
            artifact.artifactType == ArtifactType.PhotoidCannon ||
            artifact.artifactType == ArtifactType.IceLink;

        if (shouldBurn) {
            // burn it after use. will be owned by contract but not on a planet anyone can control
            LibGameUtils._takeArtifactOffPlanet(artifact.id, locationId);
        }

        LibGameUtils._debuffPlanet(locationId, LibGameUtils._getUpgradeForArtifact(artifact));
    }

    function depositArtifact(
        uint256 locationId,
        uint256 artifactId,
        address coreAddress
    ) public {
        Planet storage planet = gs().planets[locationId];

        require(!gs().planets[locationId].destroyed, "planet is destroyed");
        require(!gs().planets[locationId].frozen, "planet is frozen");

        require(planet.planetType == PlanetType.TRADING_POST, "can only deposit on trading posts");
        require(
            DFArtifactFacet(address(this)).ownerOf(artifactId) == msg.sender,
            "you can only deposit artifacts you own"
        );
        require(planet.owner == msg.sender, "you can only deposit on a planet you own");

        Artifact memory artifact = DFArtifactFacet(address(this)).getArtifact(artifactId);
        require(
            planet.planetLevel > uint256(artifact.rarity),
            "spacetime rip not high enough level to deposit this artifact"
        );
        require(!isSpaceship(artifact.artifactType), "cannot deposit spaceships");

        require(
            gs().planetArtifacts[locationId].length < gameConstants().MAX_ARTIFACT_PER_PLANET,
            "too many artifacts on this planet"
        );

        LibGameUtils._putArtifactOnPlanet(artifactId, locationId);

        DFArtifactFacet(address(this)).transferArtifact(artifactId, coreAddress);
    }

    function withdrawArtifact(uint256 locationId, uint256 artifactId) public {
        Planet storage planet = gs().planets[locationId];

        require(
            planet.planetType == PlanetType.TRADING_POST,
            "can only withdraw from trading posts"
        );
        require(!gs().planets[locationId].destroyed, "planet is destroyed");
        require(!gs().planets[locationId].frozen, "planet is frozen");

        require(planet.owner == msg.sender, "you can only withdraw from a planet you own");
        Artifact memory artifact = LibGameUtils.getPlanetArtifact(locationId, artifactId);
        require(artifact.isInitialized, "this artifact is not on this planet");

        require(
            planet.planetLevel > uint256(artifact.rarity),
            "spacetime rip not high enough level to withdraw this artifact"
        );
        require(!isSpaceship(artifact.artifactType), "cannot withdraw spaceships");
        LibGameUtils._takeArtifactOffPlanet(artifactId, locationId);

        DFArtifactFacet(address(this)).transferArtifact(artifactId, msg.sender);
    }

    function prospectPlanet(uint256 locationId) public {
        Planet storage planet = gs().planets[locationId];

        require(!planet.destroyed, "planet is destroyed");
        require(!planet.frozen, "planet is frozen");

        require(planet.planetType == PlanetType.RUINS, "you can't find an artifact on this planet");
        require(planet.owner == msg.sender, "you must own this planet");
        require(planet.prospectedBlockNumber == 0, "this planet has already been prospected");

        if (gameConstants().SPACESHIPS.GEAR) {
            require(containsGear(locationId), "gear ship must be present on planet");
        }else {
            require(
            (planet.population * 100) >= (planet.populationCap * 100) / 78,
            // We lie here, but it is a better UX
            "planet must have 80% energy before capturing"
            );
        }

        planet.prospectedBlockNumber = block.number;
    }

    function containsGear(uint256 locationId) public view returns (bool) {
        uint256[] memory artifactIds = gs().planetArtifacts[locationId];

        for (uint256 i = 0; i < artifactIds.length; i++) {
            Artifact memory artifact = DFArtifactFacet(address(this)).getArtifact(artifactIds[i]);
            if (
                artifact.artifactType == ArtifactType.ShipGear && msg.sender == artifact.controller
            ) {
                return true;
            }
        }

        return false;
    }

    function isSpaceship(ArtifactType artifactType) public pure returns (bool) {
        return
            artifactType >= ArtifactType.ShipMothership && artifactType <= ArtifactType.ShipTitan;
    }
}
