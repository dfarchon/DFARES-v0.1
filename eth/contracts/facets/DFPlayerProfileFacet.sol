// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

// Library imports
import {LibDiamond} from "../vendor/libraries/LibDiamond.sol";

// Storage imports
import {WithStorage, PlayerProfileStorage, LibStorage} from "../libraries/LibStorage.sol";

contract DFPlayerProfileFacet is WithStorage {
  event PlayerDisplayNameUpdated(address player, string displayName);

  // Struct to hold address and associated player profile.
  struct PlayerProfile {
    address playerAddress;
    string displayName;
  }

  // Modifier to control access
  modifier onlyAdminOrSelf(address player) {
    require(msg.sender == LibDiamond.contractOwner() || msg.sender == player, "Not authorized");
    _;
  }

  // Function to set the displayName, accessible only by admin or player themselves
  function setDisplayName(address player, string memory newDisplayName) public onlyAdminOrSelf(player) {
    PlayerProfileStorage storage pps = LibStorage.playerProfileStorage();
    pps.displayNames[player] = newDisplayName;
    emit PlayerDisplayNameUpdated(player, newDisplayName);
  }

  // Function to get the displayName for a given player
  function getDisplayName(address player) public view returns (string memory) {
    PlayerProfileStorage storage pps = LibStorage.playerProfileStorage();
    return pps.displayNames[player];
  }

  function bulkGetDisplayNames(uint256 startIdx, uint256 endIdx) public view returns (PlayerProfile[] memory ret) {
    address[] storage keys = gs().playerIds;
    mapping(address => string) storage data = pps().displayNames;

    require(endIdx > startIdx && endIdx <= keys.length, "Invalid range");

    ret = new PlayerProfile[](endIdx - startIdx);

    for (uint256 i = startIdx; i < endIdx; i++) {
      ret[i - startIdx] = PlayerProfile({
        playerAddress: keys[i],
        displayName: data[keys[i]]
      });
    }
  }
}
