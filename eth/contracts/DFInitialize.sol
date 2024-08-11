// SPDX-License-Identifier: GPL-3.0 AND MIT
/**
 * Customized version of DiamondInit.sol
 *
 * Vendored on November 16, 2021 from:
 * https://github.com/mudgen/diamond-3-hardhat/blob/7feb995/contracts/upgradeInitializers/DiamondInit.sol
 */
pragma solidity ^0.8.0;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
*
* Implementation of a diamond.
/******************************************************************************/

// It is expected that this contract is customized in order to deploy a diamond with data
// from a deployment script. The init function is used to initialize state variables
// of the diamond. Add parameters to the init function if you need to.

// Interface imports
import {IDiamondLoupe} from "./vendor/interfaces/IDiamondLoupe.sol";
import {IDiamondCut} from "./vendor/interfaces/IDiamondCut.sol";
import {IERC173} from "./vendor/interfaces/IERC173.sol";
import {IERC165} from "@solidstate/contracts/introspection/IERC165.sol";
import {IERC721} from "@solidstate/contracts/token/ERC721/IERC721.sol";
import {IERC721Metadata} from "@solidstate/contracts/token/ERC721/metadata/IERC721Metadata.sol";
import {IERC721Enumerable} from "@solidstate/contracts/token/ERC721/enumerable/IERC721Enumerable.sol";

// Inherited storage
import {ERC721MetadataStorage} from "@solidstate/contracts/token/ERC721/metadata/ERC721MetadataStorage.sol";

// Library imports
import {LibDiamond} from "./vendor/libraries/LibDiamond.sol";
import {LibGameUtils} from "./libraries/LibGameUtils.sol";
import {WithStorage, SpaceshipConstants} from "./libraries/LibStorage.sol";

// Type imports
import {PlanetDefaultStats, Upgrade, UpgradeBranch, InitArgs} from "./DFTypes.sol";

contract DFInitialize is WithStorage {
    using ERC721MetadataStorage for ERC721MetadataStorage.Layout;

    // You can add parameters to this function in order to pass in
    // data to set initialize state variables
    function init(
        bool whitelistEnabled,
        string memory artifactBaseURI,
        InitArgs memory initArgs
    ) external {
        // adding ERC165 data
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        ds.supportedInterfaces[type(IERC165).interfaceId] = true;
        ds.supportedInterfaces[type(IDiamondCut).interfaceId] = true;
        ds.supportedInterfaces[type(IDiamondLoupe).interfaceId] = true;
        ds.supportedInterfaces[type(IERC173).interfaceId] = true;
        ds.supportedInterfaces[type(IERC721).interfaceId] = true;
        ds.supportedInterfaces[type(IERC721Metadata).interfaceId] = true;
        ds.supportedInterfaces[type(IERC721Enumerable).interfaceId] = true;

        // Setup the ERC721 metadata
        // TODO(#1925): Add name and symbol for the artifact tokens
        ERC721MetadataStorage.layout().name = unicode"🌸";
        ERC721MetadataStorage.layout().symbol = unicode"🌸";
        ERC721MetadataStorage.layout().baseURI = artifactBaseURI;

        gs().diamondAddress = address(this);

        ws().enabled = whitelistEnabled;
        ws().drip = 0.05 ether;
        ws().relayerRewardsEnabled = false;
        ws().relayerReward = 0.01 ether;

        gs().planetLevelsCount = 10;

        // NOTE: only effect move speed
        gs().dynamicTimeFactor = 100;
        snarkConstants().DISABLE_ZK_CHECKS = initArgs.DISABLE_ZK_CHECKS;
        snarkConstants().PLANETHASH_KEY = initArgs.PLANETHASH_KEY;
        snarkConstants().SPACETYPE_KEY = initArgs.SPACETYPE_KEY;
        snarkConstants().BIOMEBASE_KEY = initArgs.BIOMEBASE_KEY;
        snarkConstants().PERLIN_MIRROR_X = initArgs.PERLIN_MIRROR_X;
        snarkConstants().PERLIN_MIRROR_Y = initArgs.PERLIN_MIRROR_Y;
        snarkConstants().PERLIN_LENGTH_SCALE = initArgs.PERLIN_LENGTH_SCALE;

        gameConstants().ADMIN_CAN_ADD_PLANETS = initArgs.ADMIN_CAN_ADD_PLANETS;
        gameConstants().WORLD_RADIUS_LOCKED = initArgs.WORLD_RADIUS_LOCKED;
        gameConstants().WORLD_RADIUS_MIN = initArgs.WORLD_RADIUS_MIN;
        gameConstants().MAX_NATURAL_PLANET_LEVEL = initArgs.MAX_NATURAL_PLANET_LEVEL;
        gameConstants().TIME_FACTOR_HUNDREDTHS = initArgs.TIME_FACTOR_HUNDREDTHS;
        gameConstants().PERLIN_THRESHOLD_1 = initArgs.PERLIN_THRESHOLD_1;
        gameConstants().PERLIN_THRESHOLD_2 = initArgs.PERLIN_THRESHOLD_2;
        gameConstants().PERLIN_THRESHOLD_3 = initArgs.PERLIN_THRESHOLD_3;
        gameConstants().INIT_PERLIN_MIN = initArgs.INIT_PERLIN_MIN;
        gameConstants().INIT_PERLIN_MAX = initArgs.INIT_PERLIN_MAX;
        gameConstants().SPAWN_RIM_AREA = initArgs.SPAWN_RIM_AREA;
        gameConstants().BIOME_THRESHOLD_1 = initArgs.BIOME_THRESHOLD_1;
        gameConstants().BIOME_THRESHOLD_2 = initArgs.BIOME_THRESHOLD_2;
        gameConstants().PLANET_RARITY = initArgs.PLANET_RARITY;
        gameConstants().PLANET_LEVEL_THRESHOLDS = initArgs.PLANET_LEVEL_THRESHOLDS;
        gameConstants().PLANET_TRANSFER_ENABLED = initArgs.PLANET_TRANSFER_ENABLED;
        gameConstants().PHOTOID_ACTIVATION_DELAY = initArgs.PHOTOID_ACTIVATION_DELAY;
        gameConstants().STELLAR_ACTIVATION_DELAY = initArgs.STELLAR_ACTIVATION_DELAY;
        gameConstants().LOCATION_REVEAL_COOLDOWN = initArgs.LOCATION_REVEAL_COOLDOWN;
        gameConstants().CLAIM_PLANET_COOLDOWN = initArgs.CLAIM_PLANET_COOLDOWN;
        gameConstants().PLANET_TYPE_WEIGHTS = initArgs.PLANET_TYPE_WEIGHTS;
        gameConstants().SILVER_SCORE_VALUE = initArgs.SILVER_SCORE_VALUE;
        gameConstants().ARTIFACT_POINT_VALUES = initArgs.ARTIFACT_POINT_VALUES;
        // Space Junk
        gameConstants().SPACE_JUNK_ENABLED = initArgs.SPACE_JUNK_ENABLED;
        gameConstants().SPACE_JUNK_LIMIT = initArgs.SPACE_JUNK_LIMIT;
        gameConstants().PLANET_LEVEL_JUNK = initArgs.PLANET_LEVEL_JUNK;
        gameConstants().ABANDON_SPEED_CHANGE_PERCENT = initArgs.ABANDON_SPEED_CHANGE_PERCENT;
        gameConstants().ABANDON_RANGE_CHANGE_PERCENT = initArgs.ABANDON_RANGE_CHANGE_PERCENT;
        // Capture Zones
        gameConstants().GAME_START_BLOCK = block.number;
        gameConstants().CAPTURE_ZONES_ENABLED = initArgs.CAPTURE_ZONES_ENABLED;
        gameConstants().CAPTURE_ZONE_CHANGE_BLOCK_INTERVAL = initArgs
            .CAPTURE_ZONE_CHANGE_BLOCK_INTERVAL;
        gameConstants().CAPTURE_ZONE_RADIUS = initArgs.CAPTURE_ZONE_RADIUS;
        gameConstants().CAPTURE_ZONE_PLANET_LEVEL_SCORE = initArgs.CAPTURE_ZONE_PLANET_LEVEL_SCORE;
        gameConstants().CAPTURE_ZONE_HOLD_BLOCKS_REQUIRED = initArgs
            .CAPTURE_ZONE_HOLD_BLOCKS_REQUIRED;
        gameConstants().CAPTURE_ZONES_PER_5000_WORLD_RADIUS = initArgs
            .CAPTURE_ZONES_PER_5000_WORLD_RADIUS;
        gameConstants().SPACESHIPS = initArgs.SPACESHIPS;

        //todo: add to initargs
        gameConstants().MAX_ARTIFACT_PER_PLANET = initArgs.MAX_ARTIFACT_PER_PLANET;
        gameConstants().MAX_SENDING_PLANET = initArgs.MAX_SENDING_PLANET;
        gameConstants().MAX_RECEIVING_PLANET = initArgs.MAX_RECEIVING_PLANET;
        gs().nextChangeBlock = block.number + initArgs.CAPTURE_ZONE_CHANGE_BLOCK_INTERVAL;
        gs().worldRadius = initArgs.WORLD_RADIUS_MIN; // will be overridden by `LibGameUtils.updateWorldRadius()` if !WORLD_RADIUS_LOCKED
        gs().innerRadius = initArgs.MAX_LEVEL_DIST[1]; //NOTE: Round 4 innerRadius
        gs().paused = initArgs.START_PAUSED;
        gs().halfPrice = false;
        gameConstants().TOKEN_MINT_END_TIMESTAMP = initArgs.TOKEN_MINT_END_TIMESTAMP;
        gameConstants().CLAIM_END_TIMESTAMP = initArgs.CLAIM_END_TIMESTAMP;
        gameConstants().ROUND_END_REWARDS_BY_RANK = initArgs.ROUND_END_REWARDS_BY_RANK;
        gameConstants().BURN_END_TIMESTAMP = initArgs.BURN_END_TIMESTAMP;
        gameConstants().BURN_PLANET_COOLDOWN = initArgs.BURN_PLANET_COOLDOWN;
        gameConstants().PINK_PLANET_COOLDOWN = initArgs.PINK_PLANET_COOLDOWN;
        gameConstants().ACTIVATE_ARTIFACT_COOLDOWN = initArgs.ACTIVATE_ARTIFACT_COOLDOWN;
        gameConstants().BUY_ARTIFACT_COOLDOWN = initArgs.BUY_ARTIFACT_COOLDOWN;
        gameConstants().BURN_PLANET_LEVEL_EFFECT_RADIUS = initArgs.BURN_PLANET_LEVEL_EFFECT_RADIUS;
        gameConstants().BURN_PLANET_REQUIRE_SILVER_AMOUNTS = initArgs
            .BURN_PLANET_REQUIRE_SILVER_AMOUNTS;
        // planet adjust
        gameConstants().MAX_LEVEL_DIST = initArgs.MAX_LEVEL_DIST;
        gameConstants().MAX_LEVEL_LIMIT = initArgs.MAX_LEVEL_LIMIT;
        gameConstants().MIN_LEVEL_BIAS = initArgs.MIN_LEVEL_BIAS;
        gameConstants().ENTRY_FEE = initArgs.ENTRY_FEE;

        gameConstants().KARDASHEV_END_TIMESTAMP = initArgs.KARDASHEV_END_TIMESTAMP;
        gameConstants().KARDASHEV_PLANET_COOLDOWN = initArgs.KARDASHEV_PLANET_COOLDOWN;
        gameConstants().BLUE_PLANET_COOLDOWN = initArgs.BLUE_PLANET_COOLDOWN;
        gameConstants().KARDASHEV_EFFECT_RADIUS = initArgs.KARDASHEV_EFFECT_RADIUS;
        gameConstants().KARDASHEV_REQUIRE_SILVER_AMOUNTS = initArgs
            .KARDASHEV_REQUIRE_SILVER_AMOUNTS;
        gameConstants().BLUE_PANET_REQUIRE_SILVER_AMOUNTS = initArgs
            .BLUE_PANET_REQUIRE_SILVER_AMOUNTS;

        initializeDefaults();
        initializeUpgrades();

        gs().initializedPlanetCountByLevel = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (uint256 i = 0; i < gameConstants().PLANET_LEVEL_THRESHOLDS.length; i += 1) {
            gs().cumulativeRarities.push(
                (2**24 / gameConstants().PLANET_LEVEL_THRESHOLDS[i]) * initArgs.PLANET_RARITY
            );
        }

        LibGameUtils.updateWorldRadius();
        LibGameUtils.updateInnerRadius();

        // union initialize
        gs().unionCreationFee = 0.002 ether;
        gs().unionUpgradeFeePerMember = 0.0005 ether;
        gs().unionRejoinCooldown = 12 hours;
    }

    function initializeDefaults() public {
        PlanetDefaultStats[] storage planetDefaultStats = planetDefaultStats();

        planetDefaultStats.push(
            PlanetDefaultStats({
                label: "Asteroid",
                populationCap: 100000,
                populationGrowth: 417,
                range: 99,
                speed: 160, // 75,
                defense: 400,
                silverGrowth: 0,
                silverCap: 0,
                barbarianPercentage: 0
            })
        );

        planetDefaultStats.push(
            PlanetDefaultStats({
                label: "Brown Dwarf",
                populationCap: 400000,
                populationGrowth: 833,
                range: 177,
                speed: 160, // 75,
                defense: 400,
                silverGrowth: 56,
                silverCap: 100000,
                barbarianPercentage: 1
            })
        );

        planetDefaultStats.push(
            PlanetDefaultStats({
                label: "Red Dwarf",
                populationCap: 1600000,
                populationGrowth: 1250,
                range: 315,
                speed: 160, // 75,
                defense: 300,
                silverGrowth: 167,
                silverCap: 500000,
                barbarianPercentage: 2
            })
        );

        planetDefaultStats.push(
            PlanetDefaultStats({
                label: "White Dwarf",
                populationCap: 6000000,
                populationGrowth: 1667,
                range: 591,
                speed: 160, // 75,
                defense: 300,
                silverGrowth: 417,
                silverCap: 2500000,
                barbarianPercentage: 3
            })
        );

        planetDefaultStats.push(
            PlanetDefaultStats({
                label: "Yellow Star",
                populationCap: 25000000,
                populationGrowth: 2083,
                range: 1025,
                speed: 160, // 75,
                defense: 300,
                silverGrowth: 833,
                silverCap: 12000000,
                barbarianPercentage: 4
            })
        );

        planetDefaultStats.push(
            PlanetDefaultStats({
                label: "Blue Star",
                populationCap: 100000000,
                populationGrowth: 2500,
                range: 1734,
                speed: 160, // 75,
                defense: 200,
                silverGrowth: 1667,
                silverCap: 50000000,
                barbarianPercentage: 5
            })
        );

        planetDefaultStats.push(
            PlanetDefaultStats({
                label: "Giant",
                populationCap: 300000000,
                populationGrowth: 2917,
                range: 2838,
                speed: 160, // 75,
                defense: 200,
                silverGrowth: 2778,
                silverCap: 100000000,
                barbarianPercentage: 7
            })
        );

        planetDefaultStats.push(
            PlanetDefaultStats({
                label: "Supergiant",
                populationCap: 500000000,
                populationGrowth: 3333,
                range: 4414,
                speed: 160, // 75,
                defense: 200,
                silverGrowth: 2778,
                silverCap: 200000000,
                barbarianPercentage: 10
            })
        );

        planetDefaultStats.push(
            PlanetDefaultStats({
                label: "Unlabeled1",
                populationCap: 700000000,
                populationGrowth: 3750,
                range: 6306,
                speed: 160, // 75,
                defense: 200,
                silverGrowth: 2778,
                silverCap: 300000000,
                barbarianPercentage: 20
            })
        );

        planetDefaultStats.push(
            PlanetDefaultStats({
                label: "Unlabeled2",
                populationCap: 800000000,
                populationGrowth: 4167,
                range: 8829,
                speed: 160, // 75,
                defense: 200,
                silverGrowth: 2778,
                silverCap: 400000000,
                barbarianPercentage: 25
            })
        );
    }

    function initializeUpgrades() public {
        Upgrade[4][3] storage upgrades = upgrades();
        Upgrade memory defenseUpgrade = Upgrade({
            popCapMultiplier: 120,
            popGroMultiplier: 120,
            rangeMultiplier: 100,
            speedMultiplier: 100,
            defMultiplier: 120
        });

        // defense
        upgrades[uint256(UpgradeBranch.DEFENSE)][0] = defenseUpgrade;
        upgrades[uint256(UpgradeBranch.DEFENSE)][1] = defenseUpgrade;
        upgrades[uint256(UpgradeBranch.DEFENSE)][2] = defenseUpgrade;
        upgrades[uint256(UpgradeBranch.DEFENSE)][3] = defenseUpgrade;

        Upgrade memory rangeUpgrade = Upgrade({
            popCapMultiplier: 120,
            popGroMultiplier: 120,
            rangeMultiplier: 125,
            speedMultiplier: 100,
            defMultiplier: 100
        });
        // range
        upgrades[uint256(UpgradeBranch.RANGE)][0] = rangeUpgrade;
        upgrades[uint256(UpgradeBranch.RANGE)][1] = rangeUpgrade;
        upgrades[uint256(UpgradeBranch.RANGE)][2] = rangeUpgrade;
        upgrades[uint256(UpgradeBranch.RANGE)][3] = rangeUpgrade;

        Upgrade memory speedUpgrade = Upgrade({
            popCapMultiplier: 120,
            popGroMultiplier: 120,
            rangeMultiplier: 100,
            speedMultiplier: 175,
            defMultiplier: 100
        });
        // speed
        upgrades[uint256(UpgradeBranch.SPEED)][0] = speedUpgrade;
        upgrades[uint256(UpgradeBranch.SPEED)][1] = speedUpgrade;
        upgrades[uint256(UpgradeBranch.SPEED)][2] = speedUpgrade;
        upgrades[uint256(UpgradeBranch.SPEED)][3] = speedUpgrade;
    }
}
