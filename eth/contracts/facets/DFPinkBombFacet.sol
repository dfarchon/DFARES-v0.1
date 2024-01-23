// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

// External contract imports
import {DFCoreFacet} from "./DFCoreFacet.sol";
import {DFWhitelistFacet} from "./DFWhitelistFacet.sol";
import {DFCaptureFacet} from "./DFCaptureFacet.sol";
import {DFArtifactFacet} from "./DFArtifactFacet.sol";

// Library imports
import {LibPlanet} from "../libraries/LibPlanet.sol";
import {LibDiamond} from "../vendor/libraries/LibDiamond.sol";
import {LibGameUtils} from "../libraries/LibGameUtils.sol";

// Storage imports
import {WithStorage} from "../libraries/LibStorage.sol";

// Vendor Imports
import {LibTrig} from "../vendor/libraries/LibTrig.sol";
import {ABDKMath64x64} from "../vendor/libraries/ABDKMath64x64.sol";

// Type imports
import {Planet, Player, BurnedCoords, Artifact, ArtifactType, RevealedCoords} from "../DFTypes.sol";

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
    event LocationRevealed(address revealer, uint256 loc, uint256 x, uint256 y);

    /**
     * Same snark args as DFCoreFacet#revealLocation
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

        require(
            DFCoreFacet(address(this)).checkRevealProof(_a, _b, _c, _input),
            "Failed reveal pf check"
        );

        uint256 x = _input[2];
        uint256 y = _input[3];
        int256 planetX = DFCaptureFacet(address(this)).getIntFromUInt(x);
        int256 planetY = DFCaptureFacet(address(this)).getIntFromUInt(y);
        uint256 distFromOriginSquare = uint256(planetX * planetX + planetY * planetY);

        if (!gs().planets[_input[0]].isInitialized) {
            LibPlanet.initializePlanetWithDefaults(
                _input[0],
                _input[1],
                distFromOriginSquare,
                false
            );
        }

        uint256 planetId = _input[0];
        LibPlanet.refreshPlanet(planetId);
        require(gs().burnedCoords[planetId].locationId == 0, "Location already burned");

        Planet storage planet = gs().planets[planetId];

        require(!planet.destroyed, "planet is destroyed");
        require(!planet.frozen, "planet is frozen");
        require(planet.burnStartTimestamp == 0, "planet is already burned");
        require(containsPinkShip(planetId), "pink ship must be present on planet");

        require(planet.planetLevel >= 1, "planet level >=1");

        Player storage player = gs().players[msg.sender];
        player.dropBombAmount++;

        uint256 silverAmount = gameConstants().BURN_PLANET_REQUIRE_SILVER_AMOUNTS[
            planet.planetLevel
        ] * (10**(player.dropBombAmount));

        require(gs().players[msg.sender].silver >= silverAmount * 1000, "silver is not enough");

        gs().players[msg.sender].silver -= silverAmount * 1000;

        planet.operator = msg.sender;

        gs().lastBurnTimestamp[msg.sender] = block.timestamp;
        planet.burnStartTimestamp = block.timestamp;

        require(gs().burnedCoords[planetId].locationId == 0, "Location already burned");

        gs().burnedIds.push(planetId);
        gs().burnedPlanets[msg.sender].push(planetId);
        gs().burnedCoords[planetId] = BurnedCoords({
            locationId: planetId,
            x: x,
            y: y,
            operator: msg.sender,
            burnedAt: block.timestamp
        });

        if (gs().firstBurnLocationOperator == address(0))
            gs().firstBurnLocationOperator = msg.sender;
        emit LocationBurned(msg.sender, _input[0], _input[2], _input[3]);
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

    function pinkLocation(
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
            DFCoreFacet(address(this)).checkRevealProof(_a, _b, _c, _input),
            "Failed reveal pf check"
        );

        uint256 x = _input[2];
        uint256 y = _input[3];
        int256 planetX = DFCaptureFacet(address(this)).getIntFromUInt(x);
        int256 planetY = DFCaptureFacet(address(this)).getIntFromUInt(y);
        uint256 distFromOriginSquare = uint256(planetX * planetX + planetY * planetY);

        if (!gs().planets[_input[0]].isInitialized) {
            LibPlanet.initializePlanetWithDefaults(
                _input[0],
                _input[1],
                distFromOriginSquare,
                false
            );
        }

        uint256 planetId = _input[0];
        LibPlanet.refreshPlanet(planetId);

        Artifact memory activeArtifact = LibGameUtils.getActiveArtifact(planetId);

        require(
            activeArtifact.artifactType != ArtifactType.StellarShield,
            "need no active StellarShield"
        );

        // int256 planetX = DFCaptureFacet(address(this)).getIntFromUInt(x);
        // int256 planetY = DFCaptureFacet(address(this)).getIntFromUInt(y);
        // uint256 distSquare = uint256(planetX**2 + planetY**2);

        Planet storage planet = gs().planets[planetId];

        gs().players[msg.sender].pinkAmount++;
        gs().players[planet.owner].pinkedAmount++;

        require(!planet.destroyed, "planet is destroyed");
        require(!planet.frozen, "planet is frozen");
        require(planet.planetLevel >= 3, "planet level >=3");
        require(planetInPinkZone(x, y), "planet is not in your pink zone");

        planet.destroyed = true;
        if (planet.operator != address(0)) planet.operator = msg.sender;

        if (gs().revealedCoords[planetId].locationId == 0) {
            gs().revealedPlanetIds.push(planetId);
            gs().revealedCoords[planetId] = RevealedCoords({
                locationId: planetId,
                x: x,
                y: y,
                revealer: msg.sender
            });

            //myNotice: pinkLocation don't update player's lastRevealTimestamp
            // gs().players[msg.sender].lastRevealTimestamp = block.timestamp;
            emit LocationRevealed(msg.sender, _input[0], _input[2], _input[3]);
        }
    }

    function planetInPinkZone(uint256 x, uint256 y) public returns (bool) {
        int256 planetX = DFCaptureFacet(address(this)).getIntFromUInt(x);
        int256 planetY = DFCaptureFacet(address(this)).getIntFromUInt(y);

        uint256[] memory burnedPlanets = gs().burnedPlanets[msg.sender];
        for (uint256 i = 0; i < burnedPlanets.length; i++) {
            uint256 planetId = burnedPlanets[i];
            Planet memory planet = gs().planets[planetId];
            BurnedCoords memory center = gs().burnedCoords[planetId];

            int256 centerX = DFCaptureFacet(address(this)).getIntFromUInt(center.x);
            int256 centerY = DFCaptureFacet(address(this)).getIntFromUInt((center.y));

            int256 xDiff = (planetX - centerX);
            int256 yDiff = (planetY - centerY);
            uint256 distanceToZone = DFCaptureFacet(address(this)).sqrt(
                uint256(xDiff * xDiff + yDiff * yDiff)
            );

            if (
                distanceToZone <=
                gameConstants().BURN_PLANET_LEVEL_EFFECT_RADIUS[planet.planetLevel] &&
                block.timestamp - planet.burnStartTimestamp > gameConstants().PINK_PLANET_COOLDOWN
            ) {
                return true;
            }
        }

        return false;
    }
}
