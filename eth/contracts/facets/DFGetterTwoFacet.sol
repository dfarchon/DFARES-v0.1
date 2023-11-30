// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

// Storage imports
import {WithStorage, GameConstants} from "../libraries/LibStorage.sol";

// Type imports
import {RevealedCoords,  ClaimedCoords,LastClaimedStruct} from "../DFTypes.sol";

contract DFGetterTwoFacet is WithStorage {

    function CLAIM_END_TIMESTAMP() public view returns (uint256){
        return gameConstants().CLAIM_END_TIMESTAMP;
    }

    function claimedCoords(uint256 key) public view returns (ClaimedCoords memory) {
        return gs().claimedCoords[key];
    }

      /**
     * Returns the total amount of planets that have been claimed. A planet does not get counted
     * more than once if it's been claimed by multiple people.
     */
    function getNClaimedPlanets() public view returns (uint256) {
        return gs().claimedIds.length;
    }

    /**
     * API for loading a sublist of the set of claimed planets, so that clients can download this
     * info without DDOSing xDai.
     */
    function bulkGetClaimedPlanetIds(uint256 startIdx, uint256 endIdx)
        public
        view
        returns (uint256[] memory ret)
    {
        // return slice of revealedPlanetIds array from startIdx through endIdx - 1
        ret = new uint256[](endIdx - startIdx);
        for (uint256 i = startIdx; i < endIdx; i++) {
            ret[i - startIdx] = gs().claimedIds[i];
        }
    }

    /**
     * API for loading a sublist of the set of claimed planets, so that clients can download this
     * info without DDOSing xDai.
     */
    function bulkGetClaimedCoordsByIds(uint256[] calldata ids)
        public
        view
        returns (ClaimedCoords[] memory ret)
    {
        ret = new ClaimedCoords[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            ret[i] = gs().claimedCoords[ids[i]];
        }
    }

    function bulkGetLastClaimTimestamp(uint256 startIdx, uint256 endIdx)
        public
        view
        returns (LastClaimedStruct[] memory ret)
    {
        ret = new LastClaimedStruct[](endIdx - startIdx);

        for (uint256 i = startIdx; i < endIdx; i++) {
            address player = gs().playerIds[i];
            ret[i - startIdx] = LastClaimedStruct({
                player: player,
                lastClaimTimestamp: gs().lastClaimTimestamp[player]
            });
        }
    }

    /**
     * Returns the last time that the given player claimed a planet.
     */
    function getLastClaimTimestamp(address player) public view returns (uint256) {
        return gs().lastClaimTimestamp[player];
    }
}
