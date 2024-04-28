# Module: Frontend/Panes/Lobbies/LobbiesUtils

## Table of contents

### Interfaces

- [LobbiesPaneProps](../interfaces/Frontend_Panes_Lobbies_LobbiesUtils.LobbiesPaneProps.md)

### Variables

- [ButtonRow](Frontend_Panes_Lobbies_LobbiesUtils.md#buttonrow)

### Functions

- [ConfigDownload](Frontend_Panes_Lobbies_LobbiesUtils.md#configdownload)
- [ConfigUpload](Frontend_Panes_Lobbies_LobbiesUtils.md#configupload)
- [LinkButton](Frontend_Panes_Lobbies_LobbiesUtils.md#linkbutton)
- [NavigationTitle](Frontend_Panes_Lobbies_LobbiesUtils.md#navigationtitle)
- [Warning](Frontend_Panes_Lobbies_LobbiesUtils.md#warning)

## Variables

### ButtonRow

• `Const` **ButtonRow**: `StyledComponent`<`ForwardRefExoticComponent`<`Partial`<`Omit`<`DarkForestRow`, `"children"`\>\> & `Events`<`unknown`\> & `HTMLAttributes`<`HTMLElement`\> & {} & `RefAttributes`<`unknown`\>\>, `any`, {}, `never`\>

## Functions

### ConfigDownload

▸ **ConfigDownload**(`__namedParameters`): `Element`

#### Parameters

| Name                        | Type                                                                     |
| :-------------------------- | :----------------------------------------------------------------------- |
| `__namedParameters`         | `Object`                                                                 |
| `__namedParameters.address` | `undefined` \| `EthAddress`                                              |
| `__namedParameters.config`  | [`LobbyConfigState`](Frontend_Panes_Lobbies_Reducer.md#lobbyconfigstate) |
| `__namedParameters.onError` | (`msg`: `string`) => `void`                                              |

#### Returns

`Element`

---

### ConfigUpload

▸ **ConfigUpload**(`__namedParameters`): `Element`

#### Parameters

| Name                         | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `__namedParameters`          | `Object`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `__namedParameters.onError`  | (`msg`: `string`) => `void`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `__namedParameters.onUpload` | (`initializers`: { `ABANDON_RANGE_CHANGE_PERCENT`: `number` ; `ABANDON_SPEED_CHANGE_PERCENT`: `number` ; `ACTIVATE_ARTIFACT_COOLDOWN`: `number` ; `ADMIN_CAN_ADD_PLANETS`: `boolean` ; `ARTIFACT_POINT_VALUES`: `Tuple6`<`number`\> ; `BIOMEBASE_KEY`: `number` ; `BIOME_THRESHOLD_1`: `number` ; `BIOME_THRESHOLD_2`: `number` ; `BLUE_PANET_REQUIRE_SILVER_AMOUNTS`: `ExactArray10`<`number`\> ; `BLUE_PLANET_COOLDOWN`: `number` ; `BURN_END_TIMESTAMP`: `number` ; `BURN_PLANET_COOLDOWN`: `number` ; `BURN_PLANET_LEVEL_EFFECT_RADIUS`: `ExactArray10`<`number`\> ; `BURN_PLANET_REQUIRE_SILVER_AMOUNTS`: `ExactArray10`<`number`\> ; `BUY_ARTIFACT_COOLDOWN`: `number` ; `CAPTURE_ZONES_ENABLED`: `boolean` ; `CAPTURE_ZONES_PER_5000_WORLD_RADIUS`: `number` ; `CAPTURE_ZONE_CHANGE_BLOCK_INTERVAL`: `number` ; `CAPTURE_ZONE_HOLD_BLOCKS_REQUIRED`: `number` ; `CAPTURE_ZONE_PLANET_LEVEL_SCORE`: `ExactArray10`<`number`\> ; `CAPTURE_ZONE_RADIUS`: `number` ; `CLAIM_END_TIMESTAMP`: `number` ; `CLAIM_PLANET_COOLDOWN`: `number` ; `DISABLE_ZK_CHECKS`: `boolean` ; `ENTRY_FEE`: `number` ; `INIT_PERLIN_MAX`: `number` ; `INIT_PERLIN_MIN`: `number` ; `KARDASHEV_EFFECT_RADIUS`: `ExactArray10`<`number`\> ; `KARDASHEV_END_TIMESTAMP`: `number` ; `KARDASHEV_PLANET_COOLDOWN`: `number` ; `KARDASHEV_REQUIRE_SILVER_AMOUNTS`: `ExactArray10`<`number`\> ; `LOCATION_REVEAL_COOLDOWN`: `number` ; `MAX_ARTIFACT_PER_PLANET`: `number` ; `MAX_LEVEL_DIST`: `ExactArray5`<`number`\> ; `MAX_LEVEL_LIMIT`: `Tuple6`<`number`\> ; `MAX_NATURAL_PLANET_LEVEL`: `number` ; `MAX_RECEIVING_PLANET`: `number` ; `MAX_SENDING_PLANET`: `number` ; `MIN_LEVEL_BIAS`: `Tuple6`<`number`\> ; `PERLIN_LENGTH_SCALE`: `number` ; `PERLIN_MIRROR_X`: `boolean` ; `PERLIN_MIRROR_Y`: `boolean` ; `PERLIN_THRESHOLD_1`: `number` ; `PERLIN_THRESHOLD_2`: `number` ; `PERLIN_THRESHOLD_3`: `number` ; `PHOTOID_ACTIVATION_DELAY`: `number` ; `PINK_PLANET_COOLDOWN`: `number` ; `PLANETHASH_KEY`: `number` ; `PLANET_LEVEL_JUNK`: `ExactArray10`<`number`\> ; `PLANET_LEVEL_THRESHOLDS`: `ExactArray10`<`number`\> ; `PLANET_RARITY`: `number` ; `PLANET_TRANSFER_ENABLED`: `boolean` ; `PLANET_TYPE_WEIGHTS`: `ExactArray4`<`ExactArray10`<`ExactArray5`<`number`\>\>\> ; `ROUND_END_REWARDS_BY_RANK`: `ExactArray64`<`number`\> ; `SILVER_SCORE_VALUE`: `number` ; `SPACESHIPS`: { `CRESCENT`: `boolean` ; `GEAR`: `boolean` ; `MOTHERSHIP`: `boolean` ; `PINKSHIP`: `boolean` ; `TITAN`: `boolean` ; `WHALE`: `boolean` } ; `SPACETYPE_KEY`: `number` ; `SPACE_JUNK_ENABLED`: `boolean` ; `SPACE_JUNK_LIMIT`: `number` ; `SPAWN_RIM_AREA`: `number` ; `START_PAUSED`: `boolean` ; `STELLAR_ACTIVATION_DELAY`: `number` ; `TIME_FACTOR_HUNDREDTHS`: `number` ; `TOKEN_MINT_END_TIMESTAMP`: `number` ; `WORLD_RADIUS_LOCKED`: `boolean` ; `WORLD_RADIUS_MIN`: `number` }) => `void` |

#### Returns

`Element`

---

### LinkButton

▸ **LinkButton**(`__namedParameters`): `Element`

#### Parameters

| Name                | Type                                                             |
| :------------------ | :--------------------------------------------------------------- |
| `__namedParameters` | `PropsWithChildren`<{ `shortcut?`: `string` ; `to`: `string` }\> |

#### Returns

`Element`

---

### NavigationTitle

▸ **NavigationTitle**(`__namedParameters`): `Element`

#### Parameters

| Name                | Type     |
| :------------------ | :------- |
| `__namedParameters` | `Object` |

#### Returns

`Element`

---

### Warning

▸ **Warning**(`__namedParameters`): `null` \| `Element`

#### Parameters

| Name                | Type     |
| :------------------ | :------- |
| `__namedParameters` | `Object` |

#### Returns

`null` \| `Element`
