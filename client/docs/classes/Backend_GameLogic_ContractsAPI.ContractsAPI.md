# Class: ContractsAPI

[Backend/GameLogic/ContractsAPI](../modules/Backend_GameLogic_ContractsAPI.md).ContractsAPI

Roughly contains methods that map 1:1 with functions that live in the contract. Responsible for
reading and writing to and from the blockchain.

**`todo`** don't inherit from {@link EventEmitter}. instead use {@link Monomitter}

## Hierarchy

- `EventEmitter`

  ↳ **`ContractsAPI`**

## Table of contents

### Constructors

- [constructor](Backend_GameLogic_ContractsAPI.ContractsAPI.md#constructor)

### Properties

- [contractAddress](Backend_GameLogic_ContractsAPI.ContractsAPI.md#contractaddress)
- [contractCaller](Backend_GameLogic_ContractsAPI.ContractsAPI.md#contractcaller)
- [ethConnection](Backend_GameLogic_ContractsAPI.ContractsAPI.md#ethconnection)
- [txExecutor](Backend_GameLogic_ContractsAPI.ContractsAPI.md#txexecutor)
- [MIN_BALANCE](Backend_GameLogic_ContractsAPI.ContractsAPI.md#min_balance)

### Accessors

- [contract](Backend_GameLogic_ContractsAPI.ContractsAPI.md#contract)

### Methods

- [afterTransaction](Backend_GameLogic_ContractsAPI.ContractsAPI.md#aftertransaction)
- [beforeQueued](Backend_GameLogic_ContractsAPI.ContractsAPI.md#beforequeued)
- [beforeTransaction](Backend_GameLogic_ContractsAPI.ContractsAPI.md#beforetransaction)
- [bulkGetArtifacts](Backend_GameLogic_ContractsAPI.ContractsAPI.md#bulkgetartifacts)
- [bulkGetArtifactsOnPlanets](Backend_GameLogic_ContractsAPI.ContractsAPI.md#bulkgetartifactsonplanets)
- [bulkGetPlanets](Backend_GameLogic_ContractsAPI.ContractsAPI.md#bulkgetplanets)
- [cancelTransaction](Backend_GameLogic_ContractsAPI.ContractsAPI.md#canceltransaction)
- [destroy](Backend_GameLogic_ContractsAPI.ContractsAPI.md#destroy)
- [emitTransactionEvents](Backend_GameLogic_ContractsAPI.ContractsAPI.md#emittransactionevents)
- [getAddress](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getaddress)
- [getAllArrivals](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getallarrivals)
- [getArrival](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getarrival)
- [getArrivalsForPlanet](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getarrivalsforplanet)
- [getArtifactById](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getartifactbyid)
- [getBurnedCoordsByIdIfExists](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getburnedcoordsbyidifexists)
- [getBurnedPlanetsCoords](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getburnedplanetscoords)
- [getClaimedCoordsByIdIfExists](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getclaimedcoordsbyidifexists)
- [getClaimedPlanetsCoords](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getclaimedplanetscoords)
- [getConstants](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getconstants)
- [getContractAddress](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getcontractaddress)
- [getEntryFee](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getentryfee)
- [getGasFeeForTransaction](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getgasfeefortransaction)
- [getIsHalfPrice](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getishalfprice)
- [getIsPaused](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getispaused)
- [getKardashevCoordsByIdIfExists](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getkardashevcoordsbyidifexists)
- [getKardashevPlanetsCoords](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getkardashevplanetscoords)
- [getNTargetPlanetArrivalIds](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getntargetplanetarrivalids)
- [getPlanetById](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getplanetbyid)
- [getPlayerArtifacts](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getplayerartifacts)
- [getPlayerById](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getplayerbyid)
- [getPlayerSpaceships](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getplayerspaceships)
- [getPlayers](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getplayers)
- [getRevealedCoordsByIdIfExists](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getrevealedcoordsbyidifexists)
- [getRevealedPlanetsCoords](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getrevealedplanetscoords)
- [getScoreV3](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getscorev3)
- [getTargetPlanetAllArrivals](Backend_GameLogic_ContractsAPI.ContractsAPI.md#gettargetplanetallarrivals)
- [getTargetPlanetArrivalIdsRangeWithTimestamp](Backend_GameLogic_ContractsAPI.ContractsAPI.md#gettargetplanetarrivalidsrangewithtimestamp)
- [getTargetPlanetArrivalIdsWithTimestamp](Backend_GameLogic_ContractsAPI.ContractsAPI.md#gettargetplanetarrivalidswithtimestamp)
- [getTokenMintEndTimestamp](Backend_GameLogic_ContractsAPI.ContractsAPI.md#gettokenmintendtimestamp)
- [getTouchedPlanetIds](Backend_GameLogic_ContractsAPI.ContractsAPI.md#gettouchedplanetids)
- [getWorldRadius](Backend_GameLogic_ContractsAPI.ContractsAPI.md#getworldradius)
- [makeCall](Backend_GameLogic_ContractsAPI.ContractsAPI.md#makecall)
- [prioritizeTransaction](Backend_GameLogic_ContractsAPI.ContractsAPI.md#prioritizetransaction)
- [removeEventListeners](Backend_GameLogic_ContractsAPI.ContractsAPI.md#removeeventlisteners)
- [setDiagnosticUpdater](Backend_GameLogic_ContractsAPI.ContractsAPI.md#setdiagnosticupdater)
- [setupEventListeners](Backend_GameLogic_ContractsAPI.ContractsAPI.md#setupeventlisteners)
- [submitTransaction](Backend_GameLogic_ContractsAPI.ContractsAPI.md#submittransaction)

## Constructors

### constructor

• **new ContractsAPI**(`__namedParameters`)

#### Parameters

| Name                | Type                 |
| :------------------ | :------------------- |
| `__namedParameters` | `ContractsApiConfig` |

#### Overrides

EventEmitter.constructor

## Properties

### contractAddress

• `Private` **contractAddress**: `EthAddress`

The contract address is saved on the object upon construction

---

### contractCaller

• `Private` `Readonly` **contractCaller**: `ContractCaller`

Instrumented {@link ThrottledConcurrentQueue} for blockchain reads.

---

### ethConnection

• `Readonly` **ethConnection**: `EthConnection`

Our connection to the blockchain. In charge of low level networking, and also of the burner
wallet.

---

### txExecutor

• `Readonly` **txExecutor**: `TxExecutor`

Instrumented {@link ThrottledConcurrentQueue} for blockchain writes.

---

### MIN_BALANCE

▪ `Static` `Private` `Readonly` **MIN_BALANCE**: `BigNumber`

Don't allow users to submit txs if balance falls below this amount/

## Accessors

### contract

• `get` **contract**(): `DarkForest`

#### Returns

`DarkForest`

## Methods

### afterTransaction

▸ `Private` **afterTransaction**(`_txRequest`, `txDiagnosticInfo`): `Promise`<`void`\>

#### Parameters

| Name               | Type                       |
| :----------------- | :------------------------- |
| `_txRequest`       | `Transaction`<`TxIntent`\> |
| `txDiagnosticInfo` | `unknown`                  |

#### Returns

`Promise`<`void`\>

---

### beforeQueued

▸ `Private` **beforeQueued**(`id`, `intent`, `overrides?`): `Promise`<`void`\>

This function is called by {@link TxExecutor} before a transaction is queued.
It gives the client an opportunity to prevent a transaction from being queued based
on business logic or user interaction.

Reject the promise to prevent the queued transaction from being queued.

#### Parameters

| Name         | Type                 |
| :----------- | :------------------- |
| `id`         | `number`             |
| `intent`     | `TxIntent`           |
| `overrides?` | `TransactionRequest` |

#### Returns

`Promise`<`void`\>

---

### beforeTransaction

▸ `Private` **beforeTransaction**(`tx`): `Promise`<`void`\>

This function is called by {@link TxExecutor} before each transaction. It gives the client an
opportunity to prevent a transaction from going through based on business logic or user
interaction. To prevent the queued transaction from being submitted, throw an Error.

#### Parameters

| Name | Type                       |
| :--- | :------------------------- |
| `tx` | `Transaction`<`TxIntent`\> |

#### Returns

`Promise`<`void`\>

---

### bulkGetArtifacts

▸ **bulkGetArtifacts**(`artifactIds`, `onProgress?`): `Promise`<`Artifact`[]\>

#### Parameters

| Name          | Type                                      |
| :------------ | :---------------------------------------- |
| `artifactIds` | `ArtifactId`[]                            |
| `onProgress?` | (`fractionCompleted`: `number`) => `void` |

#### Returns

`Promise`<`Artifact`[]\>

---

### bulkGetArtifactsOnPlanets

▸ **bulkGetArtifactsOnPlanets**(`locationIds`, `onProgress?`): `Promise`<`Artifact`[][]\>

#### Parameters

| Name          | Type                                      |
| :------------ | :---------------------------------------- |
| `locationIds` | `LocationId`[]                            |
| `onProgress?` | (`fractionCompleted`: `number`) => `void` |

#### Returns

`Promise`<`Artifact`[][]\>

---

### bulkGetPlanets

▸ **bulkGetPlanets**(`toLoadPlanets`, `onProgressPlanet?`): `Promise`<`Map`<`LocationId`, `Planet`\>\>

#### Parameters

| Name                | Type                                      |
| :------------------ | :---------------------------------------- |
| `toLoadPlanets`     | `LocationId`[]                            |
| `onProgressPlanet?` | (`fractionCompleted`: `number`) => `void` |

#### Returns

`Promise`<`Map`<`LocationId`, `Planet`\>\>

---

### cancelTransaction

▸ **cancelTransaction**(`tx`): `void`

Remove a transaction from the queue.

#### Parameters

| Name | Type                       |
| :--- | :------------------------- |
| `tx` | `Transaction`<`TxIntent`\> |

#### Returns

`void`

---

### destroy

▸ **destroy**(): `void`

#### Returns

`void`

---

### emitTransactionEvents

▸ **emitTransactionEvents**(`tx`): `void`

This is a strange interface between the transaction queue system and the rest of the game. The
strange thing about it is that introduces another way by which transactions are pushed into the
game - these {@code ContractsAPIEvent} events.

#### Parameters

| Name | Type                       |
| :--- | :------------------------- |
| `tx` | `Transaction`<`TxIntent`\> |

#### Returns

`void`

---

### getAddress

▸ **getAddress**(): `undefined` \| `EthAddress`

#### Returns

`undefined` \| `EthAddress`

---

### getAllArrivals

▸ **getAllArrivals**(`planetsToLoad`, `onProgress?`): `Promise`<`QueuedArrival`[]\>

#### Parameters

| Name            | Type                                      |
| :-------------- | :---------------------------------------- |
| `planetsToLoad` | `LocationId`[]                            |
| `onProgress?`   | (`fractionCompleted`: `number`) => `void` |

#### Returns

`Promise`<`QueuedArrival`[]\>

---

### getArrival

▸ **getArrival**(`arrivalId`): `Promise`<`undefined` \| `QueuedArrival`\>

#### Parameters

| Name        | Type     |
| :---------- | :------- |
| `arrivalId` | `number` |

#### Returns

`Promise`<`undefined` \| `QueuedArrival`\>

---

### getArrivalsForPlanet

▸ **getArrivalsForPlanet**(`planetId`): `Promise`<`QueuedArrival`[]\>

#### Parameters

| Name       | Type         |
| :--------- | :----------- |
| `planetId` | `LocationId` |

#### Returns

`Promise`<`QueuedArrival`[]\>

---

### getArtifactById

▸ **getArtifactById**(`artifactId`): `Promise`<`undefined` \| `Artifact`\>

#### Parameters

| Name         | Type         |
| :----------- | :----------- |
| `artifactId` | `ArtifactId` |

#### Returns

`Promise`<`undefined` \| `Artifact`\>

---

### getBurnedCoordsByIdIfExists

▸ **getBurnedCoordsByIdIfExists**(`planetId`): `Promise`<`undefined` \| `BurnedCoords`\>

#### Parameters

| Name       | Type         |
| :--------- | :----------- |
| `planetId` | `LocationId` |

#### Returns

`Promise`<`undefined` \| `BurnedCoords`\>

---

### getBurnedPlanetsCoords

▸ **getBurnedPlanetsCoords**(`startingAt`, `onProgressIds?`, `onProgressCoords?`): `Promise`<`BurnedCoords`[]\>

#### Parameters

| Name                | Type                                      |
| :------------------ | :---------------------------------------- |
| `startingAt`        | `number`                                  |
| `onProgressIds?`    | (`fractionCompleted`: `number`) => `void` |
| `onProgressCoords?` | (`fractionCompleted`: `number`) => `void` |

#### Returns

`Promise`<`BurnedCoords`[]\>

---

### getClaimedCoordsByIdIfExists

▸ **getClaimedCoordsByIdIfExists**(`planetId`): `Promise`<`undefined` \| `ClaimedCoords`\>

#### Parameters

| Name       | Type         |
| :--------- | :----------- |
| `planetId` | `LocationId` |

#### Returns

`Promise`<`undefined` \| `ClaimedCoords`\>

---

### getClaimedPlanetsCoords

▸ **getClaimedPlanetsCoords**(`startingAt`, `onProgressIds?`, `onProgressCoords?`): `Promise`<`ClaimedCoords`[]\>

#### Parameters

| Name                | Type                                      |
| :------------------ | :---------------------------------------- |
| `startingAt`        | `number`                                  |
| `onProgressIds?`    | (`fractionCompleted`: `number`) => `void` |
| `onProgressCoords?` | (`fractionCompleted`: `number`) => `void` |

#### Returns

`Promise`<`ClaimedCoords`[]\>

---

### getConstants

▸ **getConstants**(): `Promise`<[`ContractConstants`](../interfaces/types_darkforest_api_ContractsAPITypes.ContractConstants.md)\>

#### Returns

`Promise`<[`ContractConstants`](../interfaces/types_darkforest_api_ContractsAPITypes.ContractConstants.md)\>

---

### getContractAddress

▸ **getContractAddress**(): `EthAddress`

#### Returns

`EthAddress`

---

### getEntryFee

▸ **getEntryFee**(): `Promise`<`BigNumber`\>

#### Returns

`Promise`<`BigNumber`\>

---

### getGasFeeForTransaction

▸ `Private` **getGasFeeForTransaction**(`tx`): `string` \| `AutoGasSetting`

We pass this function into {@link TxExecutor} to calculate what gas fee we should use for the
given transaction. The result is either a number, measured in gwei, represented as a string, or
a string representing that we want to use an auto gas setting.

#### Parameters

| Name | Type                       |
| :--- | :------------------------- |
| `tx` | `Transaction`<`TxIntent`\> |

#### Returns

`string` \| `AutoGasSetting`

---

### getIsHalfPrice

▸ **getIsHalfPrice**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

---

### getIsPaused

▸ **getIsPaused**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

---

### getKardashevCoordsByIdIfExists

▸ **getKardashevCoordsByIdIfExists**(`planetId`): `Promise`<`undefined` \| `KardashevCoords`\>

#### Parameters

| Name       | Type         |
| :--------- | :----------- |
| `planetId` | `LocationId` |

#### Returns

`Promise`<`undefined` \| `KardashevCoords`\>

---

### getKardashevPlanetsCoords

▸ **getKardashevPlanetsCoords**(`startingAt`, `onProgressIds?`, `onProgressCoords?`): `Promise`<`KardashevCoords`[]\>

#### Parameters

| Name                | Type                                      |
| :------------------ | :---------------------------------------- |
| `startingAt`        | `number`                                  |
| `onProgressIds?`    | (`fractionCompleted`: `number`) => `void` |
| `onProgressCoords?` | (`fractionCompleted`: `number`) => `void` |

#### Returns

`Promise`<`KardashevCoords`[]\>

---

### getNTargetPlanetArrivalIds

▸ **getNTargetPlanetArrivalIds**(`planetId`): `Promise`<`number`\>

#### Parameters

| Name       | Type         |
| :--------- | :----------- |
| `planetId` | `LocationId` |

#### Returns

`Promise`<`number`\>

---

### getPlanetById

▸ **getPlanetById**(`planetId`): `Promise`<`undefined` \| `Planet`\>

#### Parameters

| Name       | Type         |
| :--------- | :----------- |
| `planetId` | `LocationId` |

#### Returns

`Promise`<`undefined` \| `Planet`\>

---

### getPlayerArtifacts

▸ **getPlayerArtifacts**(`playerId?`, `onProgress?`): `Promise`<`Artifact`[]\>

#### Parameters

| Name          | Type                            |
| :------------ | :------------------------------ |
| `playerId?`   | `EthAddress`                    |
| `onProgress?` | (`percent`: `number`) => `void` |

#### Returns

`Promise`<`Artifact`[]\>

---

### getPlayerById

▸ **getPlayerById**(`playerId`): `Promise`<`undefined` \| `Player`\>

#### Parameters

| Name       | Type         |
| :--------- | :----------- |
| `playerId` | `EthAddress` |

#### Returns

`Promise`<`undefined` \| `Player`\>

---

### getPlayerSpaceships

▸ **getPlayerSpaceships**(`playerId?`, `onProgress?`): `Promise`<`Artifact`[]\>

#### Parameters

| Name          | Type                            |
| :------------ | :------------------------------ |
| `playerId?`   | `EthAddress`                    |
| `onProgress?` | (`percent`: `number`) => `void` |

#### Returns

`Promise`<`Artifact`[]\>

---

### getPlayers

▸ **getPlayers**(`onProgress?`): `Promise`<`Map`<`string`, `Player`\>\>

#### Parameters

| Name          | Type                                      |
| :------------ | :---------------------------------------- |
| `onProgress?` | (`fractionCompleted`: `number`) => `void` |

#### Returns

`Promise`<`Map`<`string`, `Player`\>\>

---

### getRevealedCoordsByIdIfExists

▸ **getRevealedCoordsByIdIfExists**(`planetId`): `Promise`<`undefined` \| `RevealedCoords`\>

#### Parameters

| Name       | Type         |
| :--------- | :----------- |
| `planetId` | `LocationId` |

#### Returns

`Promise`<`undefined` \| `RevealedCoords`\>

---

### getRevealedPlanetsCoords

▸ **getRevealedPlanetsCoords**(`startingAt`, `onProgressIds?`, `onProgressCoords?`): `Promise`<`RevealedCoords`[]\>

#### Parameters

| Name                | Type                                      |
| :------------------ | :---------------------------------------- |
| `startingAt`        | `number`                                  |
| `onProgressIds?`    | (`fractionCompleted`: `number`) => `void` |
| `onProgressCoords?` | (`fractionCompleted`: `number`) => `void` |

#### Returns

`Promise`<`RevealedCoords`[]\>

---

### getScoreV3

▸ **getScoreV3**(`address`): `Promise`<`undefined` \| `number`\>

If this player has a claimed planet, their score is the distance between the claimed planet and
the center. If this player does not have a claimed planet, then the score is undefined.

#### Parameters

| Name      | Type                        |
| :-------- | :-------------------------- |
| `address` | `undefined` \| `EthAddress` |

#### Returns

`Promise`<`undefined` \| `number`\>

---

### getTargetPlanetAllArrivals

▸ **getTargetPlanetAllArrivals**(`planetId`, `timestamp`, `onProgress?`): `Promise`<`QueuedArrival`[]\>

#### Parameters

| Name          | Type                                      |
| :------------ | :---------------------------------------- |
| `planetId`    | `LocationId`                              |
| `timestamp`   | `number`                                  |
| `onProgress?` | (`fractionCompleted`: `number`) => `void` |

#### Returns

`Promise`<`QueuedArrival`[]\>

---

### getTargetPlanetArrivalIdsRangeWithTimestamp

▸ **getTargetPlanetArrivalIdsRangeWithTimestamp**(`planetId`, `timestamp`): `Promise`<`number`[]\>

#### Parameters

| Name        | Type         |
| :---------- | :----------- |
| `planetId`  | `LocationId` |
| `timestamp` | `number`     |

#### Returns

`Promise`<`number`[]\>

---

### getTargetPlanetArrivalIdsWithTimestamp

▸ **getTargetPlanetArrivalIdsWithTimestamp**(`planetId`, `timestamp`): `Promise`<`number`[]\>

#### Parameters

| Name        | Type         |
| :---------- | :----------- |
| `planetId`  | `LocationId` |
| `timestamp` | `number`     |

#### Returns

`Promise`<`number`[]\>

---

### getTokenMintEndTimestamp

▸ **getTokenMintEndTimestamp**(): `Promise`<`number`\>

#### Returns

`Promise`<`number`\>

---

### getTouchedPlanetIds

▸ **getTouchedPlanetIds**(`startingAt`, `onProgress?`): `Promise`<`LocationId`[]\>

#### Parameters

| Name          | Type                                      |
| :------------ | :---------------------------------------- |
| `startingAt`  | `number`                                  |
| `onProgress?` | (`fractionCompleted`: `number`) => `void` |

#### Returns

`Promise`<`LocationId`[]\>

---

### getWorldRadius

▸ **getWorldRadius**(): `Promise`<`number`\>

#### Returns

`Promise`<`number`\>

---

### makeCall

▸ `Private` **makeCall**<`T`\>(`contractViewFunction`, `args?`): `Promise`<`T`\>

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name                   | Type                     | Default value |
| :--------------------- | :----------------------- | :------------ |
| `contractViewFunction` | `ContractFunction`<`T`\> | `undefined`   |
| `args`                 | `unknown`[]              | `[]`          |

#### Returns

`Promise`<`T`\>

---

### prioritizeTransaction

▸ **prioritizeTransaction**(`tx`): `void`

Make sure this transaction is the next to be executed.

#### Parameters

| Name | Type                       |
| :--- | :------------------------- |
| `tx` | `Transaction`<`TxIntent`\> |

#### Returns

`void`

---

### removeEventListeners

▸ **removeEventListeners**(): `void`

#### Returns

`void`

---

### setDiagnosticUpdater

▸ **setDiagnosticUpdater**(`diagnosticUpdater?`): `void`

#### Parameters

| Name                 | Type                |
| :------------------- | :------------------ |
| `diagnosticUpdater?` | `DiagnosticUpdater` |

#### Returns

`void`

---

### setupEventListeners

▸ **setupEventListeners**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

---

### submitTransaction

▸ **submitTransaction**<`T`\>(`txIntent`, `overrides?`): `Promise`<`Transaction`<`T`\>\>

#### Type parameters

| Name | Type               |
| :--- | :----------------- |
| `T`  | extends `TxIntent` |

#### Parameters

| Name         | Type                 |
| :----------- | :------------------- |
| `txIntent`   | `T`                  |
| `overrides?` | `TransactionRequest` |

#### Returns

`Promise`<`Transaction`<`T`\>\>
