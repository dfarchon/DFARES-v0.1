import * as decoders from 'decoders';
import {
  array6,
  between,
  exactArray10,
  exactArray23,
  ExactArray23,
  exactArray4,
  exactArray5,
  exactArray64,
  Tuple6,
} from './decoder-helpers';

// Handle Date or ISO8601 strings because the TOML parser converts to Date already
const dateInSeconds = decoders.map(decoders.either(decoders.date, decoders.iso8601), (val) =>
  Math.floor(val.getTime() / 1000)
);

const emptyArtifactTypeConfig = () =>
  [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ] as ExactArray23<boolean>;

type ArtifactConfigRow = Tuple6<boolean>;

type ArtifactConfigRows = {
  Monolith: ArtifactConfigRow;
  Colossus: ArtifactConfigRow;
  Spaceship: ArtifactConfigRow;
  Pyramid: ArtifactConfigRow;
  Wormhole: ArtifactConfigRow;
  PlanetaryShield: ArtifactConfigRow;
  PhotoidCannon: ArtifactConfigRow;
  BloomFilter: ArtifactConfigRow;
  BlackDomain: ArtifactConfigRow;
  IceLink: ArtifactConfigRow;
  FireLink: ArtifactConfigRow;
  Kardashev: ArtifactConfigRow;
  Bomb: ArtifactConfigRow;
  StellarShield: ArtifactConfigRow;
  BlindBox: ArtifactConfigRow;
  Avatar: ArtifactConfigRow;
};

const artifactConfigRowsDecoder = decoders.object({
  Monolith: array6(decoders.boolean),
  Colossus: array6(decoders.boolean),
  Spaceship: array6(decoders.boolean),
  Pyramid: array6(decoders.boolean),
  Wormhole: array6(decoders.boolean),
  PlanetaryShield: array6(decoders.boolean),
  PhotoidCannon: array6(decoders.boolean),
  BloomFilter: array6(decoders.boolean),
  BlackDomain: array6(decoders.boolean),
  IceLink: array6(decoders.boolean),
  FireLink: array6(decoders.boolean),
  Kardashev: array6(decoders.boolean),
  Bomb: array6(decoders.boolean),
  StellarShield: array6(decoders.boolean),
  BlindBox: array6(decoders.boolean),
  Avatar: array6(decoders.boolean),
});

const artifactTypeIndexByConfigKey: Array<{
  artifactType: number;
  configKey: keyof ArtifactConfigRows;
}> = [
  { artifactType: 1, configKey: 'Monolith' },
  { artifactType: 2, configKey: 'Colossus' },
  { artifactType: 3, configKey: 'Spaceship' },
  { artifactType: 4, configKey: 'Pyramid' },
  { artifactType: 5, configKey: 'Wormhole' },
  { artifactType: 6, configKey: 'PlanetaryShield' },
  { artifactType: 7, configKey: 'PhotoidCannon' },
  { artifactType: 8, configKey: 'BloomFilter' },
  { artifactType: 9, configKey: 'BlackDomain' },
  { artifactType: 10, configKey: 'IceLink' },
  { artifactType: 11, configKey: 'FireLink' },
  { artifactType: 12, configKey: 'Kardashev' },
  { artifactType: 13, configKey: 'Bomb' },
  { artifactType: 14, configKey: 'StellarShield' },
  { artifactType: 15, configKey: 'BlindBox' },
  { artifactType: 16, configKey: 'Avatar' },
];

const artifactConfigFromRows = (rows: ArtifactConfigRows) => {
  const artifactConfigByRarity = [
    emptyArtifactTypeConfig(),
    emptyArtifactTypeConfig(),
    emptyArtifactTypeConfig(),
    emptyArtifactTypeConfig(),
    emptyArtifactTypeConfig(),
    emptyArtifactTypeConfig(),
  ] as Tuple6<ExactArray23<boolean>>;

  for (const { artifactType, configKey } of artifactTypeIndexByConfigKey) {
    const artifactConfigRow = rows[configKey];
    for (let rarity = 0; rarity < artifactConfigByRarity.length; rarity++) {
      artifactConfigByRarity[rarity][artifactType] = artifactConfigRow[rarity];
    }
  }

  return artifactConfigByRarity;
};

const artifactsDecoder = decoders.either(
  decoders.map(artifactConfigRowsDecoder, artifactConfigFromRows),
  array6(exactArray23(decoders.boolean))
);

export type Initializers = ReturnType<typeof decodeInitializers>;

export const decodeInitializers = decoders.guard(
  decoders.exact({
    START_PAUSED: decoders.boolean,
    ADMIN_CAN_ADD_PLANETS: decoders.boolean,
    TOKEN_MINT_END_TIMESTAMP: dateInSeconds,
    CLAIM_END_TIMESTAMP: dateInSeconds,
    WORLD_RADIUS_LOCKED: decoders.boolean,
    WORLD_RADIUS_MIN: decoders.number,
    /**
     * SNARK keys & Perlin parameters
     */
    DISABLE_ZK_CHECKS: decoders.boolean,
    PLANETHASH_KEY: decoders.number,
    SPACETYPE_KEY: decoders.number,
    BIOMEBASE_KEY: decoders.number,
    PERLIN_MIRROR_X: decoders.boolean,
    PERLIN_MIRROR_Y: decoders.boolean,
    PERLIN_LENGTH_SCALE: decoders.number, // must be power of two at most 8192
    /**
     * Game configuration
     */
    MAX_NATURAL_PLANET_LEVEL: decoders.number,
    MAX_ARTIFACT_PER_PLANET: decoders.number,
    MAX_SENDING_PLANET: decoders.number,
    MAX_RECEIVING_PLANET: decoders.number,

    TIME_FACTOR_HUNDREDTHS: decoders.number,
    PERLIN_THRESHOLD_1: decoders.number,
    PERLIN_THRESHOLD_2: decoders.number,
    PERLIN_THRESHOLD_3: decoders.number,
    INIT_PERLIN_MIN: decoders.number,
    INIT_PERLIN_MAX: decoders.number,
    BIOME_THRESHOLD_1: decoders.number,
    BIOME_THRESHOLD_2: decoders.number,
    PLANET_LEVEL_THRESHOLDS: exactArray10(decoders.number),
    PLANET_RARITY: decoders.number,
    PLANET_TRANSFER_ENABLED: decoders.boolean,
    PHOTOID_ACTIVATION_DELAY: decoders.number,
    STELLAR_ACTIVATION_DELAY: decoders.number,
    SPAWN_RIM_AREA: decoders.number,
    LOCATION_REVEAL_COOLDOWN: decoders.number,
    CLAIM_PLANET_COOLDOWN: decoders.number,
    PLANET_TYPE_WEIGHTS: exactArray4(exactArray10(exactArray5(between(decoders.number, 0, 255)))),
    SILVER_SCORE_VALUE: decoders.number,
    ARTIFACT_POINT_VALUES: array6(decoders.number),
    ARTIFACTS: artifactsDecoder,
    /**
     * Space Junk
     */
    SPACE_JUNK_ENABLED: decoders.boolean,
    SPACE_JUNK_LIMIT: decoders.number,
    PLANET_LEVEL_JUNK: exactArray10(decoders.number),
    ABANDON_SPEED_CHANGE_PERCENT: decoders.number,
    ABANDON_RANGE_CHANGE_PERCENT: decoders.number,
    /**
     * Capture Zones
     */
    CAPTURE_ZONES_ENABLED: decoders.boolean,
    CAPTURE_ZONE_CHANGE_BLOCK_INTERVAL: decoders.number,
    CAPTURE_ZONE_RADIUS: decoders.number,
    CAPTURE_ZONE_PLANET_LEVEL_SCORE: exactArray10(decoders.number),
    CAPTURE_ZONE_HOLD_BLOCKS_REQUIRED: decoders.number,
    CAPTURE_ZONES_PER_5000_WORLD_RADIUS: decoders.number,

    /**
     * Pink
     */
    BURN_END_TIMESTAMP: dateInSeconds,
    BURN_PLANET_COOLDOWN: decoders.number,
    PINK_PLANET_COOLDOWN: decoders.number,
    ACTIVATE_ARTIFACT_COOLDOWN: decoders.number,
    BUY_ARTIFACT_COOLDOWN: decoders.number,
    /**
     * Buy Energy
     */
    BUY_ENERGY_COOLDOWN: decoders.number,
    BUY_ENERGY_LEVEL_FEES: exactArray10(decoders.number),

    BURN_PLANET_LEVEL_EFFECT_RADIUS: exactArray10(decoders.number),
    BURN_PLANET_REQUIRE_SILVER_AMOUNTS: exactArray10(decoders.number),

    MAX_LEVEL_DIST: exactArray5(decoders.number),
    MAX_LEVEL_LIMIT: array6(decoders.number),
    MIN_LEVEL_BIAS: array6(decoders.number),

    SPACESHIPS: decoders.object({
      GEAR: decoders.boolean,
      MOTHERSHIP: decoders.boolean,
      TITAN: decoders.boolean,
      CRESCENT: decoders.boolean,
      WHALE: decoders.boolean,
      PINKSHIP: decoders.boolean,
    }),
    ROUND_END_REWARDS_BY_RANK: exactArray64(decoders.number),
    ENTRY_FEE: decoders.number,
    KARDASHEV_END_TIMESTAMP: dateInSeconds,
    KARDASHEV_PLANET_COOLDOWN: decoders.number,
    BLUE_PLANET_COOLDOWN: decoders.number,
    KARDASHEV_EFFECT_RADIUS: exactArray10(decoders.number),
    KARDASHEV_REQUIRE_SILVER_AMOUNTS: exactArray10(decoders.number),
    BLUE_PANET_REQUIRE_SILVER_AMOUNTS: exactArray10(decoders.number),
  }),
  { style: 'simple' }
);
