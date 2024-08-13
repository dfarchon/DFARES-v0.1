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
import {WithStorage, SpaceshipConstants} from "./libraries/LibStorage.sol";

// Type imports
import {PlanetDefaultStats, Upgrade, UpgradeBranch, InitArgs} from "./DFTypes.sol";

contract DFInitializeSec is WithStorage {
    using ERC721MetadataStorage for ERC721MetadataStorage.Layout;

    // You can add parameters to this function in order to pass in
    // data to set initialize state variables
    function init() external {
        // Setup the ERC721 metadata
        // TODO(#1925): Add name and symbol for the artifact tokens
        ERC721MetadataStorage.layout().name = unicode"🌸";
        ERC721MetadataStorage.layout().symbol = unicode"🌸";
    }
}
