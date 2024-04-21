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
 * npm install --save @dfares/contracts
 * ```
 * ```bash
 * yarn add @dfares/contracts
 * ```
 *
 * When using this in a plugin, you might want to load it with [skypack](https://www.skypack.dev)
 *
 * ```js
 * import * as contracts from 'http://cdn.skypack.dev/@dfares/contracts'
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
export declare const NETWORK = "redstoneTestnet";
/**
 * The id of the network where these contracts are deployed.
 */
export declare const NETWORK_ID = 17069;
/**
 * The block in which the DarkForest contract was initialized.
 */
export declare const START_BLOCK = 771919;
/**
 * The address for the DarkForest contract.
 */
export declare const CONTRACT_ADDRESS = "0x8a223091b5c75228622b748E69d030076d60dD02";
/**
 * The address for the initalizer contract. Useful for lobbies.
 */
export declare const INIT_ADDRESS = "0x4562E275a6A0e8f58f22ca47cc26F2a0CdBdd1a7";
//# sourceMappingURL=index.d.ts.map