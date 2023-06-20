/**
 * This package contains deployed contract addresses, ABIs, and Typechain types
 * for the Dark Forest game.
 *
 * ## Installation
 *
 * You can install this package using [`npm`](https://www.npmjs.com) or
 * [`yarn`](https://classic.yarnpkg.com/lang/en/) by running:
 *
 * ```bash
 * npm install --save @darkforest_eth/contracts
 * ```
 * ```bash
 * yarn add @darkforest_eth/contracts
 * ```
 *
 * When using this in a plugin, you might want to load it with [skypack](https://www.skypack.dev)
 *
 * ```js
 * import * as contracts from 'http://cdn.skypack.dev/@darkforest_eth/contracts'
 * ```
 *
 * ## Typechain
 *
 * The Typechain types can be found in the `typechain` directory.
 *
 * ## ABIs
 *
 * The contract ABIs can be found in the `abis` directory.
 *
 * @packageDocumentation
 */
/**
 * The name of the network where these contracts are deployed.
 */
export declare const NETWORK = "localhost";
/**
 * The id of the network where these contracts are deployed.
 */
export declare const NETWORK_ID = 31337;
/**
 * The block in which the DarkForest contract was initialized.
 */
export declare const START_BLOCK = 0;
/**
 * The address for the DarkForest contract.
 */
export declare const CONTRACT_ADDRESS = "0xd3373051B52d47A1CEBa770A762C852AE2A94062";
/**
 * The address for the initalizer contract. Useful for lobbies.
 */
export declare const INIT_ADDRESS = "0xe5586817669ec04A95062E206cf16a948686b698";
//# sourceMappingURL=index.d.ts.map