# Class: default

[Backend/Plugins/minimapSpawn](../modules/Backend_Plugins_minimapSpawn.md).default

## Table of contents

### Constructors

- [constructor](Backend_Plugins_minimapSpawn.default.md#constructor)

### Properties

- [CorruptedSpaceColor](Backend_Plugins_minimapSpawn.default.md#corruptedspacecolor)
- [DeepSpaceColor](Backend_Plugins_minimapSpawn.default.md#deepspacecolor)
- [InnerNebulaColor](Backend_Plugins_minimapSpawn.default.md#innernebulacolor)
- [OuterNebulaColor](Backend_Plugins_minimapSpawn.default.md#outernebulacolor)
- [canvas](Backend_Plugins_minimapSpawn.default.md#canvas)
- [canvasSize](Backend_Plugins_minimapSpawn.default.md#canvassize)
- [clickOccurred](Backend_Plugins_minimapSpawn.default.md#clickoccurred)
- [coordsDiv](Backend_Plugins_minimapSpawn.default.md#coordsdiv)
- [dot](Backend_Plugins_minimapSpawn.default.md#dot)
- [formatCoords](Backend_Plugins_minimapSpawn.default.md#formatcoords)
- [maxDensity](Backend_Plugins_minimapSpawn.default.md#maxdensity)
- [minDensity](Backend_Plugins_minimapSpawn.default.md#mindensity)
- [moveInsideRim](Backend_Plugins_minimapSpawn.default.md#moveinsiderim)
- [selectedCoords](Backend_Plugins_minimapSpawn.default.md#selectedcoords)
- [sizeFactor](Backend_Plugins_minimapSpawn.default.md#sizefactor)
- [step](Backend_Plugins_minimapSpawn.default.md#step)
- [xWorld](Backend_Plugins_minimapSpawn.default.md#xworld)
- [yWorld](Backend_Plugins_minimapSpawn.default.md#yworld)

### Methods

- [destroy](Backend_Plugins_minimapSpawn.default.md#destroy)
- [render](Backend_Plugins_minimapSpawn.default.md#render)
- [runAndGetUserCoords](Backend_Plugins_minimapSpawn.default.md#runandgetusercoords)

## Constructors

### constructor

• **new default**()

## Properties

### CorruptedSpaceColor

• **CorruptedSpaceColor**: `string`

---

### DeepSpaceColor

• **DeepSpaceColor**: `string`

---

### InnerNebulaColor

• **InnerNebulaColor**: `string`

---

### OuterNebulaColor

• **OuterNebulaColor**: `string`

---

### canvas

• **canvas**: `HTMLCanvasElement`

---

### canvasSize

• **canvasSize**: `number`

---

### clickOccurred

• **clickOccurred**: `boolean`

---

### coordsDiv

• **coordsDiv**: `HTMLDivElement`

---

### dot

• **dot**: `number`

---

### formatCoords

• **formatCoords**: `string`

---

### maxDensity

• **maxDensity**: `number`

---

### minDensity

• **minDensity**: `number`

---

### moveInsideRim

• **moveInsideRim**: `undefined` \| `boolean`

---

### selectedCoords

• **selectedCoords**: `Object`

#### Type declaration

| Name | Type     |
| :--- | :------- |
| `x`  | `number` |
| `y`  | `number` |

---

### sizeFactor

• **sizeFactor**: `number`

---

### step

• **step**: `number`

---

### xWorld

• **xWorld**: `undefined` \| `number`

---

### yWorld

• **yWorld**: `undefined` \| `number`

## Methods

### destroy

▸ **destroy**(): `void`

#### Returns

`void`

---

### render

▸ **render**(`div`): `Promise`<`void`\>

#### Parameters

| Name  | Type  |
| :---- | :---- |
| `div` | `any` |

#### Returns

`Promise`<`void`\>

---

### runAndGetUserCoords

▸ **runAndGetUserCoords**(): `Promise`<{ `x`: `number` = 0; `y`: `number` = 0 }\>

#### Returns

`Promise`<{ `x`: `number` = 0; `y`: `number` = 0 }\>
