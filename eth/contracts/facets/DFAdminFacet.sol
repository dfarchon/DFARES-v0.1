// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

// Library imports
import {LibDiamond} from "../vendor/libraries/LibDiamond.sol";
import {LibGameUtils} from "../libraries/LibGameUtils.sol";
import {LibPlanet} from "../libraries/LibPlanet.sol";
import {LibArtifactUtils} from "../libraries/LibArtifactUtils.sol";

// Storage imports
import {WithStorage} from "../libraries/LibStorage.sol";

// Type imports
import {SpaceType, DFPInitPlanetArgs, AdminCreatePlanetArgs, Artifact, ArtifactType, ArtifactRarity, Player, Planet} from "../DFTypes.sol";

contract DFAdminFacet is WithStorage {
    event AdminOwnershipChanged(uint256 loc, address newOwner);
    event AdminPlanetCreated(uint256 loc);
    event AdminGiveSpaceship(uint256 loc, address owner, ArtifactType artifactType);
    event PauseStateChanged(bool paused);
    event HalfPriceChanged(bool halfPrice);
    event WorldRadiusUpdated(uint256 radius);
    event InnerRadiusUpdated(uint256 radius);
    event ArtifactConfigUpdated(ArtifactRarity rarity, ArtifactType artifactType, bool enabled);
    event ArtifactConfigUpdatedAll();

    /////////////////////////////
    /// Administrative Engine ///
    /////////////////////////////

    modifier onlyAdmin() {
        LibDiamond.enforceIsContractOwner();
        _;
    }

    function pause() public onlyAdmin {
        require(!gs().paused, "Game is already paused");
        gs().paused = true;
        emit PauseStateChanged(true);
    }

    function unpause() public onlyAdmin {
        require(gs().paused, "Game is already unpaused");
        gs().paused = false;
        emit PauseStateChanged(false);
    }

    function setHalfPrice() public onlyAdmin {
        require(!gs().halfPrice, "Game is in half-price stage.");
        gs().halfPrice = true;
        emit HalfPriceChanged(true);
    }

    function setUnHalfPrice() public onlyAdmin {
        require(gs().halfPrice, "Game isn't in half-price stage.");
        gs().halfPrice = false;
        emit HalfPriceChanged(false);
    }

    /**
     * Only works for initialized planets.
     */
    function setOwner(uint256 planetId, address newOwner) public onlyAdmin {
        gs().planets[planetId].owner = newOwner;
        emit AdminOwnershipChanged(planetId, newOwner);
    }

    function deductScore(address playerAddress, uint256 amount) public onlyAdmin {
        Player storage player = gs().players[playerAddress];

        require(player.isInitialized, "player does not exist");
        require(amount <= player.score, "tried to deduct much score");

        player.score -= amount;
    }

    function addScore(address playerAddress, uint256 amount) public onlyAdmin {
        Player storage player = gs().players[playerAddress];

        require(player.isInitialized, "player does not exist");

        player.score += amount;
    }

    function deductSilver(address playerAddress, uint256 amount) public onlyAdmin {
        Player storage player = gs().players[playerAddress];

        require(player.isInitialized, "player does not exist");
        require(amount <= player.silver, "tried to deduct much score");

        player.silver -= amount;
    }

    function addSilver(address playerAddress, uint256 amount) public onlyAdmin {
        Player storage player = gs().players[playerAddress];

        require(player.isInitialized, "player does not exist");

        player.silver += amount;
    }

    /**
     * Sets the owner of the given planet, even if it's not initialized (which is why
     * it requires the same snark arguments as DFCoreFacet#initializePlanet).
     */
    function safeSetOwner(
        address newOwner,
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[9] memory _input
    ) public onlyAdmin {
        uint256 planetId = _input[0];

        if (!gs().planets[planetId].isInitialized) {
            LibPlanet.initializePlanet(_a, _b, _c, _input, false);
        }

        gs().planets[planetId].silver = gs().planets[planetId].silverCap;
        gs().planets[planetId].population = gs().planets[planetId].populationCap;

        setOwner(planetId, newOwner);
    }

    function changeWorldRadiusMin(uint256 _newConstant) public onlyAdmin {
        gameConstants().WORLD_RADIUS_MIN = _newConstant;
        LibGameUtils.updateWorldRadius();
        emit WorldRadiusUpdated(gs().worldRadius);
    }

    function adminSetWorldRadius(uint256 _newRadius) public onlyAdmin {
        gs().worldRadius = _newRadius;
    }

    function adminSetInnerRadius(uint256 _radius) public onlyAdmin {
        gs().adminSetInnerRadius = _radius;
        LibGameUtils.updateInnerRadius();
        emit InnerRadiusUpdated(gs().innerRadius);
    }

    function changeCaptureZoneRadius(uint256 _newRadius) public onlyAdmin {
        gameConstants().CAPTURE_ZONE_RADIUS = _newRadius;
    }

    function changeBurnPlanetEffectRadius(uint256 level, uint256 _newRadius) public onlyAdmin {
        gameConstants().BURN_PLANET_LEVEL_EFFECT_RADIUS[level] = _newRadius;
    }

    function changeBurnPlanetRequireSilver(uint256 level, uint256 _newSilver) public onlyAdmin {
        gameConstants().BURN_PLANET_REQUIRE_SILVER_AMOUNTS[level] = _newSilver;
    }

    function changeLocationRevealCooldown(uint256 newCooldown) public onlyAdmin {
        gameConstants().LOCATION_REVEAL_COOLDOWN = newCooldown;
    }

    function changeClaimPlanetCooldown(uint256 newCooldown) public onlyAdmin {
        gameConstants().CLAIM_PLANET_COOLDOWN = newCooldown;
    }

    function changeBurnPlanetCooldown(uint256 newCooldown) public onlyAdmin {
        gameConstants().BURN_PLANET_COOLDOWN = newCooldown;
    }

    function changePinkPlanetCooldown(uint256 newCooldown) public onlyAdmin {
        gameConstants().PINK_PLANET_COOLDOWN = newCooldown;
    }

    function changeActivateArtifactCooldown(uint256 newCooldown) public onlyAdmin {
        gameConstants().ACTIVATE_ARTIFACT_COOLDOWN = newCooldown;
    }

    function changeBuyArtifactCooldown(uint256 newCooldown) public onlyAdmin {
        gameConstants().BUY_ARTIFACT_COOLDOWN = newCooldown;
    }

    function setArtifactEnabled(
        ArtifactRarity rarity,
        ArtifactType artifactType,
        bool enabled
    ) public onlyAdmin {
        _requireConfigurableArtifactRarity(rarity);
        _requireConfigurableArtifactType(artifactType);

        uint256 rarityIndex = uint256(rarity);
        uint256 artifactTypeIndex = uint256(artifactType);
        bool currentEnabled = gameConstants().ARTIFACTS[rarityIndex][artifactTypeIndex];

        if (currentEnabled == enabled) {
            emit ArtifactConfigUpdated(rarity, artifactType, enabled);
            return;
        }

        if (enabled) {
            gameConstants().ENABLED_ARTIFACT_TYPE_COUNTS[rarityIndex]++;
        } else {
            require(
                gameConstants().ENABLED_ARTIFACT_TYPE_COUNTS[rarityIndex] > 1,
                "must keep one artifact enabled"
            );
            gameConstants().ENABLED_ARTIFACT_TYPE_COUNTS[rarityIndex]--;
        }

        gameConstants().ARTIFACTS[rarityIndex][artifactTypeIndex] = enabled;
        emit ArtifactConfigUpdated(rarity, artifactType, enabled);
    }

    function setArtifactConfig(bool[23][6] memory artifacts) public onlyAdmin {
        uint256[6] memory enabledArtifactTypeCounts;

        for (uint256 rarity = 0; rarity < 6; rarity++) {
            for (uint256 artifactType = 0; artifactType < 23; artifactType++) {
                if (!artifacts[rarity][artifactType]) {
                    continue;
                }

                require(
                    rarity >= uint256(ArtifactRarity.Common) &&
                        rarity <= uint256(ArtifactRarity.Mythic),
                    "invalid artifact rarity"
                );
                require(
                    artifactType >= uint256(ArtifactType.Monolith) &&
                        artifactType <= uint256(ArtifactType.Avatar),
                    "invalid artifact type"
                );
                enabledArtifactTypeCounts[rarity]++;
            }
        }

        for (
            uint256 rarity = uint256(ArtifactRarity.Common);
            rarity <= uint256(ArtifactRarity.Mythic);
            rarity++
        ) {
            require(enabledArtifactTypeCounts[rarity] > 0, "no artifacts enabled for rarity");
        }

        gameConstants().ARTIFACTS = artifacts;
        gameConstants().ENABLED_ARTIFACT_TYPE_COUNTS = enabledArtifactTypeCounts;
        emit ArtifactConfigUpdatedAll();
    }

    function changeBuyEnergyCooldown(uint256 newCooldown) public onlyAdmin {
        gameConstants().BUY_ENERGY_COOLDOWN = newCooldown;
    }

    function changeBuyEnergyLevelFees(uint256 level, uint256 _newFee) public onlyAdmin {
        gameConstants().BUY_ENERGY_LEVEL_FEES[level] = _newFee;
    }

    function withdraw() public onlyAdmin {
        // TODO: Don't send to msg.sender, instead send to contract admin
        payable(msg.sender).transfer(address(this).balance);
    }

    function setTokenMintEndTime(uint256 newTokenMintEndTime) public onlyAdmin {
        gameConstants().TOKEN_MINT_END_TIMESTAMP = newTokenMintEndTime;
    }

    function setClaimEndTime(uint256 newClaimEndTime) public onlyAdmin {
        gameConstants().CLAIM_END_TIMESTAMP = newClaimEndTime;
    }

    function setBurnEndTime(uint256 newBurnEndTime) public onlyAdmin {
        gameConstants().BURN_END_TIMESTAMP = newBurnEndTime;
    }

    function setEntryFee(uint256 newEntryFee) public onlyAdmin {
        gameConstants().ENTRY_FEE = newEntryFee;
    }

    function setKardashevEndTime(uint256 newEndTime) public onlyAdmin {
        gameConstants().KARDASHEV_END_TIMESTAMP = newEndTime;
    }

    function setKardashevCooldowm(uint256 newCooldown) public onlyAdmin {
        gameConstants().KARDASHEV_PLANET_COOLDOWN = newCooldown;
    }

    function setTransferEnergyCooldown(uint256 newCooldown) public onlyAdmin {
        gameConstants().BLUE_PLANET_COOLDOWN = newCooldown;
    }

    function changeKardashevEffectRadius(uint256 level, uint256 _newRadius) public onlyAdmin {
        gameConstants().KARDASHEV_EFFECT_RADIUS[level] = _newRadius;
    }

    function changeKardashevRequireSilverAmounts(uint256 level, uint256 _newSilver)
        public
        onlyAdmin
    {
        gameConstants().KARDASHEV_REQUIRE_SILVER_AMOUNTS[level] = _newSilver;
    }

    function changeTransferEnergyRequireSilverAmounts(uint256 level, uint256 _newSilver)
        public
        onlyAdmin
    {
        gameConstants().BLUE_PANET_REQUIRE_SILVER_AMOUNTS[level] = _newSilver;
    }

    function createPlanet(AdminCreatePlanetArgs memory args) public onlyAdmin {
        require(gameConstants().ADMIN_CAN_ADD_PLANETS, "admin can no longer add planets");
        if (args.requireValidLocationId) {
            require(LibGameUtils._locationIdValid(args.location), "Not a valid planet location");
        }

        //NOTE: need pass dist here, get wrong space type if some condition at
        //new map algo, need to be fixed
        //
        //NOTE: admin only add Level 9
        SpaceType spaceType = LibGameUtils.spaceTypeFromPerlin(args.perlin, 0);
        LibPlanet._initializePlanet(
            DFPInitPlanetArgs(
                args.location,
                args.perlin,
                args.level,
                gameConstants().TIME_FACTOR_HUNDREDTHS,
                spaceType,
                args.planetType,
                false
            )
        );
        gs().planetIds.push(args.location);
        gs().initializedPlanetCountByLevel[args.level] += 1;

        emit AdminPlanetCreated(args.location);
    }

    function adminGiveSpaceShip(
        uint256 locationId,
        address owner,
        ArtifactType artifactType
    ) public onlyAdmin {
        require(gs().planets[locationId].isInitialized, "planet is not initialized");
        require(LibArtifactUtils.isSpaceship(artifactType), "artifact type must be a space ship");

        uint256 shipId = LibArtifactUtils.createAndPlaceSpaceship(locationId, owner, artifactType);
        Artifact memory artifact = gs().artifacts[shipId];
        Planet memory planet = gs().planets[locationId];

        planet = LibPlanet.applySpaceshipArrive(artifact, planet);

        gs().planets[locationId] = planet;

        gs().mySpaceshipIds[owner].push(shipId);

        emit AdminGiveSpaceship(locationId, owner, artifactType);
    }

    //###############
    //  NEW MAP ALGO
    //###############
    function adminInitializePlanet(
        uint256 locationId,
        uint256 perlin,
        uint256 distFromOriginSquare
    ) public onlyAdmin {
        require(!gs().planets[locationId].isInitialized, "planet is already initialized");

        LibPlanet.initializePlanetWithDefaults(locationId, perlin, distFromOriginSquare, false);
    }

    function setPlanetTransferEnabled(bool enabled) public onlyAdmin {
        gameConstants().PLANET_TRANSFER_ENABLED = enabled;
    }

    function setDynamicTimeFactor(uint256 factor) public onlyAdmin {
        gs().dynamicTimeFactor = factor;
    }

    function adminSetFinalScoreAndRank(
        address[] calldata playerAddresses,
        uint256[] calldata scores,
        uint256[] calldata ranks
    ) public onlyAdmin {
        require(
            playerAddresses.length == scores.length,
            "player and score array lengths do not match"
        );
        require(scores.length == ranks.length, "score and rank array do not match");
        require(block.timestamp > gameConstants().TOKEN_MINT_END_TIMESTAMP, "game is not over");
        require(block.timestamp > gameConstants().CLAIM_END_TIMESTAMP, "game is not over");
        require(block.timestamp > gameConstants().BURN_END_TIMESTAMP, "game is not over");

        for (uint256 i = 0; i < playerAddresses.length; i++) {
            address playerAddress = playerAddresses[i];
            uint256 score = scores[i];
            uint256 rank = ranks[i];
            Player storage player = gs().players[playerAddress];
            player.score = score;
            player.finalRank = rank;
        }
    }

    function _requireConfigurableArtifactRarity(ArtifactRarity rarity) private pure {
        require(
            rarity >= ArtifactRarity.Common && rarity <= ArtifactRarity.Mythic,
            "invalid artifact rarity"
        );
    }

    function _requireConfigurableArtifactType(ArtifactType artifactType) private pure {
        require(
            artifactType >= ArtifactType.Monolith && artifactType <= ArtifactType.Avatar,
            "invalid artifact type"
        );
    }
}
