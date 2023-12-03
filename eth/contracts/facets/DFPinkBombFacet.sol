// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

// External contract imports
import {DFCoreFacet} from "./DFCoreFacet.sol";
import {DFWhitelistFacet} from "./DFWhitelistFacet.sol";

// Library imports
import {LibPlanet} from "../libraries/LibPlanet.sol";
import {LibDiamond} from "../vendor/libraries/LibDiamond.sol";

// Storage imports
import {WithStorage} from "../libraries/LibStorage.sol";

// Vendor Imports
import {LibTrig} from "../vendor/libraries/LibTrig.sol";
import {ABDKMath64x64} from "../vendor/libraries/ABDKMath64x64.sol";

// Type imports
import {Planet, BurnedCoords, Artifact, ArtifactType} from "../DFTypes.sol";
import {DFArtifactFacet} from "../facets/DFArtifactFacet.sol";

contract DFPinkBombFacet is WithStorage {
    modifier notPaused() {
        require(!gs().paused, "Game is paused");
        _;
    }

    modifier onlyWhitelisted() {
        require(
            DFWhitelistFacet(address(this)).isWhitelisted(msg.sender) ||
                msg.sender == LibDiamond.contractOwner(),
            "Player is not whitelisted"
        );
        _;
    }

    event LocationBurned(address player, uint256 loc, uint256 x, uint256 y);

    struct Zone {
        int256 x;
        int256 y;
    }

    /**
     * Same snark args as DFCoreFacet#revealLocation
     * todo: add more limit to burnLocation
     */
    function burnLocation(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[9] memory _input
    ) public onlyWhitelisted notPaused {
        require(
            block.timestamp < gameConstants().BURN_END_TIMESTAMP,
            "Cannot burner planets after the round has ended"
        );
        require(
            block.timestamp - gs().lastBurnTimestamp[msg.sender] >
                gameConstants().BURN_PLANET_COOLDOWN,
            "wait for cooldown before burn again"
        );
        uint256 planetId = _input[0];
        uint256 x = _input[2];
        uint256 y = _input[3];

        require(
            DFCoreFacet(address(this)).checkRevealProof(_a, _b, _c, _input),
            "Failed reveal pf check"
        );

        LibPlanet.refreshPlanet(planetId);
        Planet storage planet = gs().planets[planetId];

        require(!planet.destroyed, "planet is destroyed");
        require(containsPinkShip(planetId), "pink ship must be present on planet");

        planet.destroyed = true;

        gs().lastBurnTimestamp[msg.sender] = block.timestamp;

        gs().burnedIds.push(planetId);
        gs().burnedPlanets[msg.sender].push(planetId);
        gs().burnedCoords[planetId] = BurnedCoords({
            locationId: planetId,
            x: x,
            y: y,
            operator: msg.sender,
            burnedAt: block.timestamp
        });
    }

    function containsPinkShip(uint256 locationId) public view returns (bool) {
        uint256[] memory artifactIds = gs().planetArtifacts[locationId];

        for (uint256 i = 0; i < artifactIds.length; i++) {
            Artifact memory artifact = DFArtifactFacet(address(this)).getArtifact(artifactIds[i]);
            if (
                artifact.artifactType == ArtifactType.ShipPink && msg.sender == artifact.controller
            ) {
                return true;
            }
        }

        return false;
    }

    //mytodo: add pinkPlanet function
}
