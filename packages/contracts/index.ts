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
export const NETWORK = 'redstoneTestnet';
/**
 * The id of the network where these contracts are deployed.
 */
export const NETWORK_ID = 17001;
/**
 * The block in which the DarkForest contract was initialized.
 */
export const START_BLOCK = 430500;
/**
 * The address for the DarkForest contract.
 */
export const CONTRACT_ADDRESS = '0x86fD75c02CA8C934C014D582b2F9Df1B12EC7508';
/**
 * The address for the initalizer contract. Useful for lobbies.
 */
export const INIT_ADDRESS = '0xCc0caD2269b4aE614e63d02b71Fb94d734e190a8';