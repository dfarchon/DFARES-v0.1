import { EMPTY_LOCATION_ID, GAS_ADJUST_DELTA, TOKEN_NAME } from '@dfares/constants';
import { DarkForest } from '@dfares/contracts/typechain';
import {
  aggregateBulkGetter,
  ContractCaller,
  EthConnection,
  ethToWei,
  TxCollection,
  TxExecutor,
} from '@dfares/network';
import {
  address,
  artifactIdFromEthersBN,
  artifactIdToDecStr,
  decodeArrival,
  decodeArtifact,
  decodeArtifactPointValues,
  decodeClaimedCoords,
  decodePlanet,
  decodePlanetDefaults,
  decodePlayer,
  decodeRevealedCoords,
  decodeUpgradeBranches,
  locationIdFromEthersBN,
  locationIdToDecStr,
} from '@dfares/serde';
import {
  Artifact,
  ArtifactId,
  ArtifactType,
  AutoGasSetting,
  ClaimedCoords,
  DiagnosticUpdater,
  EthAddress,
  LocationId,
  Planet,
  Player,
  QueuedArrival,
  RevealedCoords,
  Setting,
  Transaction,
  TransactionId,
  TxIntent,
  VoyageId,
} from '@dfares/types';
import { BigNumber as EthersBN, ContractFunction, Event, providers } from 'ethers';
import { EventEmitter } from 'events';
import _ from 'lodash';
import NotificationManager from '../../Frontend/Game/NotificationManager';
import { openConfirmationWindowForTransaction } from '../../Frontend/Game/Popups';
import { getSetting } from '../../Frontend/Utils/SettingsHooks';
import {
  ContractConstants,
  ContractEvent,
  ContractsAPIEvent,
} from '../../_types/darkforest/api/ContractsAPITypes';
import { loadDiamondContract } from '../Network/Blockchain';
import { eventLogger, EventType } from '../Network/EventLogger';

interface ContractsApiConfig {
  connection: EthConnection;
  contractAddress: EthAddress;
}

/**
 * Roughly contains methods that map 1:1 with functions that live in the contract. Responsible for
 * reading and writing to and from the blockchain.
 *
 * @todo don't inherit from {@link EventEmitter}. instead use {@link Monomitter}
 */
export class ContractsAPI extends EventEmitter {
  /**
   * Don't allow users to submit txs if balance falls below this amount/
   */
  private static readonly MIN_BALANCE = ethToWei(0.002);

  /**
   * Instrumented {@link ThrottledConcurrentQueue} for blockchain reads.
   */
  private readonly contractCaller: ContractCaller;

  /**
   * Instrumented {@link ThrottledConcurrentQueue} for blockchain writes.
   */
  public readonly txExecutor: TxExecutor;

  /**
   * Our connection to the blockchain. In charge of low level networking, and also of the burner
   * wallet.
   */
  public readonly ethConnection: EthConnection;

  /**
   * The contract address is saved on the object upon construction
   */
  private contractAddress: EthAddress;

  get contract() {
    return this.ethConnection.getContract<DarkForest>(this.contractAddress);
  }

  public constructor({ connection, contractAddress }: ContractsApiConfig) {
    super();
    this.contractCaller = new ContractCaller();
    this.ethConnection = connection;
    this.contractAddress = contractAddress;
    this.txExecutor = new TxExecutor(
      connection,
      this.getGasFeeForTransaction.bind(this),
      this.beforeQueued.bind(this),
      this.beforeTransaction.bind(this),
      this.afterTransaction.bind(this)
    );

    this.setupEventListeners();
  }

  /**
   * We pass this function into {@link TxExecutor} to calculate what gas fee we should use for the
   * given transaction. The result is either a number, measured in gwei, represented as a string, or
   * a string representing that we want to use an auto gas setting.
   */
  private getGasFeeForTransaction(tx: Transaction): AutoGasSetting | string {
    if (
      (tx.intent.methodName === 'initializePlayer' || tx.intent.methodName === 'getSpaceShips') &&
      tx.intent.contract.address === this.contract.address
    ) {
      return Number(parseFloat(GAS_ADJUST_DELTA) * parseInt('50'))
        .toFixed(16)
        .toString();
    }

    const config = {
      contractAddress: this.contractAddress,
      account: this.ethConnection.getAddress(),
    };

    return getSetting(config, Setting.GasFeeGwei);
  }

  /**
   * This function is called by {@link TxExecutor} before a transaction is queued.
   * It gives the client an opportunity to prevent a transaction from being queued based
   * on business logic or user interaction.
   *
   * Reject the promise to prevent the queued transaction from being queued.
   */
  private async beforeQueued(
    id: TransactionId,
    intent: TxIntent,
    overrides?: providers.TransactionRequest
  ): Promise<void> {
    const address = this.ethConnection.getAddress();
    if (!address) throw new Error("can't send a transaction, no signer");

    const balance = await this.ethConnection.loadBalance(address);

    if (balance.lt(ContractsAPI.MIN_BALANCE)) {
      const notifsManager = NotificationManager.getInstance();
      notifsManager.balanceEmpty();
      throw new Error(`${TOKEN_NAME} balance too low!`);
    }
    const config = {
      contractAddress: this.contractAddress,
      account: this.ethConnection.getAddress(),
    };

    const gasFeeGwei = overrides?.gasPrice
      ? EthersBN.from(overrides?.gasPrice).toNumber()
      : Number(getSetting(config, Setting.GasFeeGwei));

    const gasFeeLimit = Number(overrides?.gasLimit || getSetting(config, Setting.GasFeeLimit));

    await openConfirmationWindowForTransaction({
      contractAddress: this.contractAddress,
      connection: this.ethConnection,
      id,
      intent,
      overrides,
      from: address,
      gasFeeGwei,
      gasFeeLimit,
    });
  }

  /**
   * This function is called by {@link TxExecutor} before each transaction. It gives the client an
   * opportunity to prevent a transaction from going through based on business logic or user
   * interaction. To prevent the queued transaction from being submitted, throw an Error.
   */
  private async beforeTransaction(tx: Transaction): Promise<void> {
    this.emit(ContractsAPIEvent.TxProcessing, tx);
  }

  private async afterTransaction(_txRequest: Transaction, txDiagnosticInfo: unknown) {
    eventLogger.logEvent(EventType.Transaction, txDiagnosticInfo);
  }

  public destroy(): void {
    this.removeEventListeners();
  }

  private makeCall<T>(contractViewFunction: ContractFunction<T>, args: unknown[] = []): Promise<T> {
    return this.contractCaller.makeCall(contractViewFunction, args);
  }

  public async setupEventListeners(): Promise<void> {
    const { contract } = this;

    const filter = {
      address: contract.address,
      topics: [
        [
          contract.filters.ArrivalQueued(null, null, null, null, null).topics,
          contract.filters.ArtifactActivated(null, null, null, null).topics,
          contract.filters.ArtifactDeactivated(null, null, null, null).topics,
          contract.filters.ArtifactDeposited(null, null, null).topics,
          contract.filters.ArtifactFound(null, null, null).topics,
          contract.filters.ArtifactWithdrawn(null, null, null).topics,
          contract.filters.LocationRevealed(null, null, null, null).topics,
          contract.filters.LocationClaimed(null, null, null).topics,
          contract.filters.PlanetHatBought(null, null, null).topics,
          contract.filters.PlanetProspected(null, null).topics,
          contract.filters.PlanetSilverWithdrawn(null, null, null).topics,
          contract.filters.PlanetTransferred(null, null, null).topics,
          contract.filters.PlanetInvaded(null, null).topics,
          contract.filters.PlanetCaptured(null, null).topics,
          contract.filters.PlayerInitialized(null, null).topics,
          contract.filters.AdminOwnershipChanged(null, null).topics,
          contract.filters.AdminGiveSpaceship(null, null).topics,
          contract.filters.PauseStateChanged(null).topics,
          contract.filters.LobbyCreated(null, null).topics,
        ].map((topicsOrUndefined) => (topicsOrUndefined || [])[0]),
      ] as Array<string | Array<string>>,
    };

    const eventHandlers = {
      [ContractEvent.PauseStateChanged]: (paused: boolean) => {
        this.emit(ContractsAPIEvent.PauseStateChanged, paused);
      },
      [ContractEvent.AdminOwnershipChanged]: (location: EthersBN, _newOwner: string) => {
        this.emit(ContractsAPIEvent.PlanetUpdate, locationIdFromEthersBN(location));
      },
      [ContractEvent.AdminGiveSpaceship]: (
        location: EthersBN,
        _newOwner: string,
        _type: ArtifactType
      ) => {
        this.emit(ContractsAPIEvent.PlanetUpdate, locationIdFromEthersBN(location));
      },
      [ContractEvent.ArtifactFound]: (
        _playerAddr: string,
        rawArtifactId: EthersBN,
        loc: EthersBN
      ) => {
        const artifactId = artifactIdFromEthersBN(rawArtifactId);
        this.emit(ContractsAPIEvent.ArtifactUpdate, artifactId);
        this.emit(ContractsAPIEvent.PlanetUpdate, locationIdFromEthersBN(loc));
      },
      [ContractEvent.ArtifactDeposited]: (
        _playerAddr: string,
        rawArtifactId: EthersBN,
        loc: EthersBN
      ) => {
        const artifactId = artifactIdFromEthersBN(rawArtifactId);
        this.emit(ContractsAPIEvent.ArtifactUpdate, artifactId);
        this.emit(ContractsAPIEvent.PlanetUpdate, locationIdFromEthersBN(loc));
      },
      [ContractEvent.ArtifactWithdrawn]: (
        _playerAddr: string,
        rawArtifactId: EthersBN,
        loc: EthersBN
      ) => {
        const artifactId = artifactIdFromEthersBN(rawArtifactId);
        this.emit(ContractsAPIEvent.ArtifactUpdate, artifactId);
        this.emit(ContractsAPIEvent.PlanetUpdate, locationIdFromEthersBN(loc));
      },
      [ContractEvent.ArtifactActivated]: (
        _playerAddr: string,
        rawArtifactId: EthersBN,
        loc: EthersBN,
        linkTo: EthersBN
      ) => {
        const artifactId = artifactIdFromEthersBN(rawArtifactId);
        this.emit(ContractsAPIEvent.ArtifactUpdate, artifactId);
        this.emit(ContractsAPIEvent.PlanetUpdate, locationIdFromEthersBN(loc));
        this.emit(ContractsAPIEvent.PlanetUpdate, locationIdFromEthersBN(linkTo));
      },
      [ContractEvent.ArtifactDeactivated]: (
        _playerAddr: string,
        rawArtifactId: EthersBN,
        loc: EthersBN,
        linkTo: EthersBN
      ) => {
        const artifactId = artifactIdFromEthersBN(rawArtifactId);
        this.emit(ContractsAPIEvent.ArtifactUpdate, artifactId);
        this.emit(ContractsAPIEvent.PlanetUpdate, locationIdFromEthersBN(loc));
        this.emit(ContractsAPIEvent.PlanetUpdate, locationIdFromEthersBN(linkTo));
      },
      [ContractEvent.PlayerInitialized]: async (player: string, locRaw: EthersBN, _: Event) => {
        this.emit(ContractsAPIEvent.PlayerUpdate, address(player));
        this.emit(ContractsAPIEvent.PlanetUpdate, locationIdFromEthersBN(locRaw));
        this.emit(ContractsAPIEvent.RadiusUpdated);
      },
      [ContractEvent.PlanetTransferred]: async (
        _senderAddress: string,
        planetId: EthersBN,
        receiverAddress: string,
        _: Event
      ) => {
        this.emit(
          ContractsAPIEvent.PlanetTransferred,
          locationIdFromEthersBN(planetId),
          address(receiverAddress)
        );
      },
      [ContractEvent.ArrivalQueued]: async (
        playerAddr: string,
        arrivalId: EthersBN,
        fromLocRaw: EthersBN,
        toLocRaw: EthersBN,
        _artifactIdRaw: EthersBN,
        _: Event
      ) => {
        this.emit(
          ContractsAPIEvent.ArrivalQueued,
          arrivalId.toString() as VoyageId,
          locationIdFromEthersBN(fromLocRaw),
          locationIdFromEthersBN(toLocRaw)
        );
        this.emit(ContractsAPIEvent.PlayerUpdate, address(playerAddr));
        this.emit(ContractsAPIEvent.RadiusUpdated);
      },
      [ContractEvent.PlanetUpgraded]: async (
        _playerAddr: string,
        location: EthersBN,
        _branch: EthersBN,
        _toBranchLevel: EthersBN,
        _: Event
      ) => {
        this.emit(ContractsAPIEvent.PlanetUpdate, locationIdFromEthersBN(location));
      },
      [ContractEvent.PlanetInvaded]: async (_playerAddr: string, location: EthersBN, _: Event) => {
        this.emit(ContractsAPIEvent.PlanetUpdate, locationIdFromEthersBN(location));
      },
      [ContractEvent.PlanetCaptured]: async (_playerAddr: string, location: EthersBN, _: Event) => {
        this.emit(ContractsAPIEvent.PlanetUpdate, locationIdFromEthersBN(location));
      },
      [ContractEvent.PlanetHatBought]: async (
        _playerAddress: string,
        location: EthersBN,
        _: Event
      ) => this.emit(ContractsAPIEvent.PlanetUpdate, locationIdFromEthersBN(location)),
      [ContractEvent.LocationRevealed]: async (
        revealerAddr: string,
        location: EthersBN,
        _x: EthersBN,
        _y: EthersBN,
        _: Event
      ) => {
        this.emit(ContractsAPIEvent.PlanetUpdate, locationIdFromEthersBN(location));
        this.emit(
          ContractsAPIEvent.LocationRevealed,
          locationIdFromEthersBN(location),
          address(revealerAddr.toLowerCase())
        );
        this.emit(ContractsAPIEvent.PlayerUpdate, address(revealerAddr));
      },

      [ContractEvent.PlanetClaimed]: async (
        revealerAddr: string,
        _previousClaimer: string,
        location: EthersBN,
        _: Event
      ) => {
        this.emit(ContractsAPIEvent.PlanetUpdate, locationIdFromEthersBN(location));
        this.emit(
          ContractsAPIEvent.PlanetClaimed,
          locationIdFromEthersBN(location),
          address(revealerAddr.toLowerCase())
        );
        this.emit(ContractsAPIEvent.PlayerUpdate, address(revealerAddr));
        this.emit(ContractsAPIEvent.PlayerUpdate, address(_previousClaimer));
      },
      [ContractEvent.PlanetSilverWithdrawn]: async (
        player: string,
        location: EthersBN,
        _amount: EthersBN,
        _: Event
      ) => {
        this.emit(ContractsAPIEvent.PlanetUpdate, locationIdFromEthersBN(location));
        this.emit(ContractsAPIEvent.PlayerUpdate, address(player));
      },
      [ContractEvent.LobbyCreated]: (ownerAddr: string, lobbyAddr: string) => {
        this.emit(ContractsAPIEvent.LobbyCreated, address(ownerAddr), address(lobbyAddr));
      },
    };

    this.ethConnection.subscribeToContractEvents(contract, eventHandlers, filter);
  }

  public removeEventListeners(): void {
    const { contract } = this;

    contract.removeAllListeners(ContractEvent.PlayerInitialized);
    contract.removeAllListeners(ContractEvent.ArrivalQueued);
    contract.removeAllListeners(ContractEvent.PlanetUpgraded);
    contract.removeAllListeners(ContractEvent.PlanetHatBought);
    contract.removeAllListeners(ContractEvent.PlanetTransferred);
    contract.removeAllListeners(ContractEvent.ArtifactFound);
    contract.removeAllListeners(ContractEvent.ArtifactDeposited);
    contract.removeAllListeners(ContractEvent.ArtifactWithdrawn);
    contract.removeAllListeners(ContractEvent.ArtifactActivated);
    contract.removeAllListeners(ContractEvent.ArtifactDeactivated);
    contract.removeAllListeners(ContractEvent.LocationRevealed);
    contract.removeAllListeners(ContractEvent.PlanetClaimed);
    contract.removeAllListeners(ContractEvent.PlanetSilverWithdrawn);
    contract.removeAllListeners(ContractEvent.PlanetInvaded);
    contract.removeAllListeners(ContractEvent.PlanetCaptured);
  }

  public getContractAddress(): EthAddress {
    return this.contractAddress;
  }

  /**
   * If this player has a claimed planet, their score is the distance between the claimed planet and
   * the center. If this player does not have a claimed planet, then the score is undefined.
   */
  async getScoreV3(address: EthAddress | undefined): Promise<number | undefined> {
    if (address === undefined) return undefined;

    const score = await this.makeCall<EthersBN>(this.contract.getScore, [address]);

    if (
      score.eq(EthersBN.from('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'))
    ) {
      return undefined;
    }

    return score.toNumber();
  }

  async getConstants(): Promise<ContractConstants> {
    const {
      DISABLE_ZK_CHECKS,
      PLANETHASH_KEY,
      SPACETYPE_KEY,
      BIOMEBASE_KEY,
      PERLIN_LENGTH_SCALE,
      PERLIN_MIRROR_X,
      PERLIN_MIRROR_Y,
    } = await this.makeCall(this.contract.getSnarkConstants);

    const {
      ADMIN_CAN_ADD_PLANETS,
      WORLD_RADIUS_LOCKED,
      WORLD_RADIUS_MIN,
      MAX_NATURAL_PLANET_LEVEL,
      MAX_ARTIFACT_PER_PLANET,
      MAX_SENDING_PLANET,
      MAX_RECEIVING_PLANET,
      TIME_FACTOR_HUNDREDTHS,
      PERLIN_THRESHOLD_1,
      PERLIN_THRESHOLD_2,
      PERLIN_THRESHOLD_3,
      INIT_PERLIN_MIN,
      INIT_PERLIN_MAX,
      SPAWN_RIM_AREA,
      BIOME_THRESHOLD_1,
      BIOME_THRESHOLD_2,
      PLANET_LEVEL_THRESHOLDS,
      PLANET_RARITY,
      PLANET_TRANSFER_ENABLED,
      PHOTOID_ACTIVATION_DELAY,
      STELLAR_ACTIVATION_DELAY,
      LOCATION_REVEAL_COOLDOWN,
      CLAIM_PLANET_COOLDOWN,
      PLANET_TYPE_WEIGHTS,
      SILVER_SCORE_VALUE,
      ARTIFACT_POINT_VALUES,
      SPACE_JUNK_ENABLED,
      SPACE_JUNK_LIMIT,
      PLANET_LEVEL_JUNK,
      ABANDON_SPEED_CHANGE_PERCENT,
      ABANDON_RANGE_CHANGE_PERCENT,
      // Capture Zones
      GAME_START_BLOCK,
      CAPTURE_ZONES_ENABLED,
      CAPTURE_ZONE_CHANGE_BLOCK_INTERVAL,
      CAPTURE_ZONE_RADIUS,
      CAPTURE_ZONE_PLANET_LEVEL_SCORE,
      CAPTURE_ZONE_HOLD_BLOCKS_REQUIRED,
      CAPTURE_ZONES_PER_5000_WORLD_RADIUS,
      SPACESHIPS,
      ROUND_END_REWARDS_BY_RANK,
      TOKEN_MINT_END_TIMESTAMP,
      CLAIM_END_TIMESTAMP,
    } = await this.makeCall(this.contract.getGameConstants);

    // const TOKEN_MINT_END_TIMESTAMP = (
    //   await this.makeCall(this.contract.TOKEN_MINT_END_TIMESTAMP)
    // ).toNumber();

    // const CLAIM_END_TIMESTAMP = (await this.makeCall(this.contract.CLAIM_END_TIMESTAMP)).toNumber();

    const adminAddress = address(await this.makeCall(this.contract.adminAddress));

    const upgrades = decodeUpgradeBranches(await this.makeCall(this.contract.getUpgrades));

    // const PLANET_TYPE_WEIGHTS: PlanetTypeWeightsBySpaceType =
    //   await this.makeCall<PlanetTypeWeightsBySpaceType>(this.contract.getTypeWeights);

    // const rawPointValues = await this.makeCall(this.contract.getArtifactPointValues);
    // const ARTIFACT_POINT_VALUES = decodeArtifactPointValues(rawPointValues);

    const ARTIFACT_POINT_VALUES_decoded = decodeArtifactPointValues(ARTIFACT_POINT_VALUES);

    const planetDefaults = decodePlanetDefaults(await this.makeCall(this.contract.getDefaultStats));

    const planetCumulativeRarities = (
      await this.makeCall<EthersBN[]>(this.contract.getCumulativeRarities)
    ).map((x: EthersBN) => x.toNumber());

    const constants: ContractConstants = {
      //SnarkConstants
      DISABLE_ZK_CHECKS,
      PLANETHASH_KEY: PLANETHASH_KEY.toNumber(),
      SPACETYPE_KEY: SPACETYPE_KEY.toNumber(),
      BIOMEBASE_KEY: BIOMEBASE_KEY.toNumber(),
      PERLIN_MIRROR_X,
      PERLIN_MIRROR_Y,
      PERLIN_LENGTH_SCALE: PERLIN_LENGTH_SCALE.toNumber(),

      //GameConstants
      ADMIN_CAN_ADD_PLANETS,
      WORLD_RADIUS_LOCKED,
      WORLD_RADIUS_MIN: WORLD_RADIUS_MIN.toNumber(),
      MAX_NATURAL_PLANET_LEVEL: MAX_NATURAL_PLANET_LEVEL.toNumber(),
      MAX_ARTIFACT_PER_PLANET: MAX_ARTIFACT_PER_PLANET.toNumber(),
      MAX_SENDING_PLANET: MAX_SENDING_PLANET.toNumber(),
      MAX_RECEIVING_PLANET: MAX_RECEIVING_PLANET.toNumber(),
      TIME_FACTOR_HUNDREDTHS: TIME_FACTOR_HUNDREDTHS.toNumber(),

      PERLIN_THRESHOLD_1: PERLIN_THRESHOLD_1.toNumber(),
      PERLIN_THRESHOLD_2: PERLIN_THRESHOLD_2.toNumber(),
      PERLIN_THRESHOLD_3: PERLIN_THRESHOLD_3.toNumber(),
      INIT_PERLIN_MIN: INIT_PERLIN_MIN.toNumber(),
      INIT_PERLIN_MAX: INIT_PERLIN_MAX.toNumber(),
      SPAWN_RIM_AREA: SPAWN_RIM_AREA.toNumber(),
      BIOME_THRESHOLD_1: BIOME_THRESHOLD_1.toNumber(),
      BIOME_THRESHOLD_2: BIOME_THRESHOLD_2.toNumber(),
      PLANET_LEVEL_THRESHOLDS: [
        PLANET_LEVEL_THRESHOLDS[0].toNumber(),
        PLANET_LEVEL_THRESHOLDS[1].toNumber(),
        PLANET_LEVEL_THRESHOLDS[2].toNumber(),
        PLANET_LEVEL_THRESHOLDS[3].toNumber(),
        PLANET_LEVEL_THRESHOLDS[4].toNumber(),
        PLANET_LEVEL_THRESHOLDS[5].toNumber(),
        PLANET_LEVEL_THRESHOLDS[6].toNumber(),
        PLANET_LEVEL_THRESHOLDS[7].toNumber(),
        PLANET_LEVEL_THRESHOLDS[8].toNumber(),
        PLANET_LEVEL_THRESHOLDS[9].toNumber(),
      ],

      PLANET_RARITY: PLANET_RARITY.toNumber(),
      PLANET_TRANSFER_ENABLED,

      PHOTOID_ACTIVATION_DELAY: PHOTOID_ACTIVATION_DELAY.toNumber(),
      STELLAR_ACTIVATION_DELAY: STELLAR_ACTIVATION_DELAY.toNumber(),
      LOCATION_REVEAL_COOLDOWN: LOCATION_REVEAL_COOLDOWN.toNumber(),
      CLAIM_PLANET_COOLDOWN: CLAIM_PLANET_COOLDOWN.toNumber(),
      PLANET_TYPE_WEIGHTS,
      SILVER_SCORE_VALUE: SILVER_SCORE_VALUE.toNumber(),
      ARTIFACT_POINT_VALUES: ARTIFACT_POINT_VALUES_decoded,
      SPACE_JUNK_ENABLED,
      SPACE_JUNK_LIMIT: SPACE_JUNK_LIMIT.toNumber(),
      PLANET_LEVEL_JUNK: [
        PLANET_LEVEL_JUNK[0].toNumber(),
        PLANET_LEVEL_JUNK[1].toNumber(),
        PLANET_LEVEL_JUNK[2].toNumber(),
        PLANET_LEVEL_JUNK[3].toNumber(),
        PLANET_LEVEL_JUNK[4].toNumber(),
        PLANET_LEVEL_JUNK[5].toNumber(),
        PLANET_LEVEL_JUNK[6].toNumber(),
        PLANET_LEVEL_JUNK[7].toNumber(),
        PLANET_LEVEL_JUNK[8].toNumber(),
        PLANET_LEVEL_JUNK[9].toNumber(),
      ],

      ABANDON_SPEED_CHANGE_PERCENT: ABANDON_RANGE_CHANGE_PERCENT.toNumber(),
      ABANDON_RANGE_CHANGE_PERCENT: ABANDON_SPEED_CHANGE_PERCENT.toNumber(),

      // Capture Zones
      GAME_START_BLOCK: GAME_START_BLOCK.toNumber(),
      CAPTURE_ZONES_ENABLED,
      CAPTURE_ZONE_CHANGE_BLOCK_INTERVAL: CAPTURE_ZONE_CHANGE_BLOCK_INTERVAL.toNumber(),
      CAPTURE_ZONE_RADIUS: CAPTURE_ZONE_RADIUS.toNumber(),
      CAPTURE_ZONE_PLANET_LEVEL_SCORE: [
        CAPTURE_ZONE_PLANET_LEVEL_SCORE[0].toNumber(),
        CAPTURE_ZONE_PLANET_LEVEL_SCORE[1].toNumber(),
        CAPTURE_ZONE_PLANET_LEVEL_SCORE[2].toNumber(),
        CAPTURE_ZONE_PLANET_LEVEL_SCORE[3].toNumber(),
        CAPTURE_ZONE_PLANET_LEVEL_SCORE[4].toNumber(),
        CAPTURE_ZONE_PLANET_LEVEL_SCORE[5].toNumber(),
        CAPTURE_ZONE_PLANET_LEVEL_SCORE[6].toNumber(),
        CAPTURE_ZONE_PLANET_LEVEL_SCORE[7].toNumber(),
        CAPTURE_ZONE_PLANET_LEVEL_SCORE[8].toNumber(),
        CAPTURE_ZONE_PLANET_LEVEL_SCORE[9].toNumber(),
      ],
      CAPTURE_ZONE_HOLD_BLOCKS_REQUIRED: CAPTURE_ZONE_HOLD_BLOCKS_REQUIRED.toNumber(),
      CAPTURE_ZONES_PER_5000_WORLD_RADIUS: CAPTURE_ZONES_PER_5000_WORLD_RADIUS.toNumber(),
      SPACESHIPS: SPACESHIPS,
      ROUND_END_REWARDS_BY_RANK: [
        ROUND_END_REWARDS_BY_RANK[0].toNumber(),
        ROUND_END_REWARDS_BY_RANK[1].toNumber(),
        ROUND_END_REWARDS_BY_RANK[2].toNumber(),
        ROUND_END_REWARDS_BY_RANK[3].toNumber(),
        ROUND_END_REWARDS_BY_RANK[4].toNumber(),
        ROUND_END_REWARDS_BY_RANK[5].toNumber(),
        ROUND_END_REWARDS_BY_RANK[6].toNumber(),
        ROUND_END_REWARDS_BY_RANK[7].toNumber(),
        ROUND_END_REWARDS_BY_RANK[8].toNumber(),
        ROUND_END_REWARDS_BY_RANK[9].toNumber(),
        ROUND_END_REWARDS_BY_RANK[10].toNumber(),
        ROUND_END_REWARDS_BY_RANK[11].toNumber(),
        ROUND_END_REWARDS_BY_RANK[12].toNumber(),
        ROUND_END_REWARDS_BY_RANK[13].toNumber(),
        ROUND_END_REWARDS_BY_RANK[14].toNumber(),
        ROUND_END_REWARDS_BY_RANK[15].toNumber(),
        ROUND_END_REWARDS_BY_RANK[16].toNumber(),
        ROUND_END_REWARDS_BY_RANK[17].toNumber(),
        ROUND_END_REWARDS_BY_RANK[18].toNumber(),
        ROUND_END_REWARDS_BY_RANK[19].toNumber(),
        ROUND_END_REWARDS_BY_RANK[20].toNumber(),
        ROUND_END_REWARDS_BY_RANK[21].toNumber(),
        ROUND_END_REWARDS_BY_RANK[22].toNumber(),
        ROUND_END_REWARDS_BY_RANK[23].toNumber(),
        ROUND_END_REWARDS_BY_RANK[24].toNumber(),
        ROUND_END_REWARDS_BY_RANK[25].toNumber(),
        ROUND_END_REWARDS_BY_RANK[26].toNumber(),
        ROUND_END_REWARDS_BY_RANK[27].toNumber(),
        ROUND_END_REWARDS_BY_RANK[28].toNumber(),
        ROUND_END_REWARDS_BY_RANK[29].toNumber(),
        ROUND_END_REWARDS_BY_RANK[30].toNumber(),
        ROUND_END_REWARDS_BY_RANK[31].toNumber(),
        ROUND_END_REWARDS_BY_RANK[32].toNumber(),
        ROUND_END_REWARDS_BY_RANK[33].toNumber(),
        ROUND_END_REWARDS_BY_RANK[34].toNumber(),
        ROUND_END_REWARDS_BY_RANK[35].toNumber(),
        ROUND_END_REWARDS_BY_RANK[36].toNumber(),
        ROUND_END_REWARDS_BY_RANK[37].toNumber(),
        ROUND_END_REWARDS_BY_RANK[38].toNumber(),
        ROUND_END_REWARDS_BY_RANK[39].toNumber(),
        ROUND_END_REWARDS_BY_RANK[40].toNumber(),
        ROUND_END_REWARDS_BY_RANK[41].toNumber(),
        ROUND_END_REWARDS_BY_RANK[42].toNumber(),
        ROUND_END_REWARDS_BY_RANK[43].toNumber(),
        ROUND_END_REWARDS_BY_RANK[44].toNumber(),
        ROUND_END_REWARDS_BY_RANK[45].toNumber(),
        ROUND_END_REWARDS_BY_RANK[46].toNumber(),
        ROUND_END_REWARDS_BY_RANK[47].toNumber(),
        ROUND_END_REWARDS_BY_RANK[48].toNumber(),
        ROUND_END_REWARDS_BY_RANK[49].toNumber(),
        ROUND_END_REWARDS_BY_RANK[50].toNumber(),
        ROUND_END_REWARDS_BY_RANK[51].toNumber(),
        ROUND_END_REWARDS_BY_RANK[52].toNumber(),
        ROUND_END_REWARDS_BY_RANK[53].toNumber(),
        ROUND_END_REWARDS_BY_RANK[54].toNumber(),
        ROUND_END_REWARDS_BY_RANK[55].toNumber(),
        ROUND_END_REWARDS_BY_RANK[56].toNumber(),
        ROUND_END_REWARDS_BY_RANK[57].toNumber(),
        ROUND_END_REWARDS_BY_RANK[58].toNumber(),
        ROUND_END_REWARDS_BY_RANK[59].toNumber(),
        ROUND_END_REWARDS_BY_RANK[60].toNumber(),
        ROUND_END_REWARDS_BY_RANK[61].toNumber(),
        ROUND_END_REWARDS_BY_RANK[62].toNumber(),
        ROUND_END_REWARDS_BY_RANK[63].toNumber(),
      ],

      TOKEN_MINT_END_TIMESTAMP: TOKEN_MINT_END_TIMESTAMP.toNumber(),
      CLAIM_END_TIMESTAMP: CLAIM_END_TIMESTAMP.toNumber(),

      defaultPopulationCap: planetDefaults.populationCap,
      defaultPopulationGrowth: planetDefaults.populationGrowth,
      defaultRange: planetDefaults.range,
      defaultSpeed: planetDefaults.speed,
      defaultDefense: planetDefaults.defense,
      defaultSilverGrowth: planetDefaults.silverGrowth,
      defaultSilverCap: planetDefaults.silverCap,
      defaultBarbarianPercentage: planetDefaults.barbarianPercentage,
      planetCumulativeRarities,
      upgrades,
      adminAddress,
    };
    // console.log(constants);
    return constants;
  }

  public async getPlayers(
    onProgress?: (fractionCompleted: number) => void
  ): Promise<Map<string, Player>> {
    const nPlayers: number = (await this.makeCall<EthersBN>(this.contract.getNPlayers)).toNumber();

    const players = await aggregateBulkGetter<Player>(
      nPlayers,
      200,
      async (start, end) =>
        (await this.makeCall(this.contract.bulkGetPlayers, [start, end])).map(decodePlayer),
      onProgress
    );

    const lastClaimTimestamps = await aggregateBulkGetter(
      nPlayers,
      5,
      (start: number, end: number) =>
        this.contractCaller.makeCall(this.contract.bulkGetLastClaimTimestamp, [start, end])
    );
    const playerLastClaimTimestampMap = lastClaimTimestamps.reduce(
      (acc, pair): Map<string, EthersBN> => {
        acc.set(pair.player, pair.lastClaimTimestamp);
        return acc;
      },
      new Map<string, EthersBN>()
    );

    const playerMap: Map<EthAddress, Player> = new Map();

    for (const player of players) {
      player.lastClaimTimestamp = playerLastClaimTimestampMap.get(player.address)?.toNumber() || 0;
      playerMap.set(player.address, player);
    }
    return playerMap;
  }

  public async getPlayerById(playerId: EthAddress): Promise<Player | undefined> {
    const rawPlayer = await this.makeCall(this.contract.players, [playerId]);
    const lastClaimedTimestamp = await this.makeCall(this.contract.getLastClaimTimestamp, [
      playerId,
    ]);
    const scoreFromBlockchain = await this.getScoreV3(playerId);
    if (!rawPlayer.isInitialized) return undefined;

    const player = decodePlayer(rawPlayer);
    player.lastClaimTimestamp = lastClaimedTimestamp.toNumber();
    player.score = scoreFromBlockchain;
    return player;
  }

  public async getWorldRadius(): Promise<number> {
    const radius = (await this.makeCall<EthersBN>(this.contract.worldRadius)).toNumber();
    return radius;
  }

  // timestamp since epoch (in seconds)
  public async getTokenMintEndTimestamp(): Promise<number> {
    const timestamp = (
      await this.makeCall<EthersBN>(this.contract.TOKEN_MINT_END_TIMESTAMP)
    ).toNumber();
    return timestamp;
  }

  public async getArrival(arrivalId: number): Promise<QueuedArrival | undefined> {
    const rawArrival = await this.makeCall(this.contract.planetArrivals, [arrivalId]);
    return decodeArrival(rawArrival);
  }

  public async getArrivalsForPlanet(planetId: LocationId): Promise<QueuedArrival[]> {
    const events = (
      await this.makeCall(this.contract.getPlanetArrivals, [locationIdToDecStr(planetId)])
    ).map(decodeArrival);

    return events;
  }

  public async getAllArrivals(
    planetsToLoad: LocationId[],
    onProgress?: (fractionCompleted: number) => void
  ): Promise<QueuedArrival[]> {
    const arrivalsUnflattened = await aggregateBulkGetter<QueuedArrival[]>(
      planetsToLoad.length,
      200,
      async (start, end) => {
        return (
          await this.makeCall(this.contract.bulkGetPlanetArrivalsByIds, [
            planetsToLoad.slice(start, end).map(locationIdToDecStr),
          ])
        ).map((arrivals) => arrivals.map(decodeArrival));
      },
      onProgress
    );

    return _.flatten(arrivalsUnflattened);
  }

  public async getTouchedPlanetIds(
    startingAt: number,
    onProgress?: (fractionCompleted: number) => void
  ): Promise<LocationId[]> {
    const nPlanets: number = (await this.makeCall<EthersBN>(this.contract.getNPlanets)).toNumber();

    const planetIds = await aggregateBulkGetter<EthersBN>(
      nPlanets - startingAt,
      1000,
      async (start, end) =>
        await this.makeCall(this.contract.bulkGetPlanetIds, [start + startingAt, end + startingAt]),
      onProgress
    );
    return planetIds.map(locationIdFromEthersBN);
  }

  public async getRevealedCoordsByIdIfExists(
    planetId: LocationId
  ): Promise<RevealedCoords | undefined> {
    const decStrId = locationIdToDecStr(planetId);
    const rawRevealedCoords = await this.makeCall(this.contract.revealedCoords, [decStrId]);
    const ret = decodeRevealedCoords(rawRevealedCoords);
    if (ret.hash === EMPTY_LOCATION_ID) {
      return undefined;
    }
    return ret;
  }

  public async getIsPaused(): Promise<boolean> {
    return this.makeCall(this.contract.paused);
  }

  public async getRevealedPlanetsCoords(
    startingAt: number,
    onProgressIds?: (fractionCompleted: number) => void,
    onProgressCoords?: (fractionCompleted: number) => void
  ): Promise<RevealedCoords[]> {
    const nRevealedPlanets: number = (
      await this.makeCall<EthersBN>(this.contract.getNRevealedPlanets)
    ).toNumber();

    const rawRevealedPlanetIds = await aggregateBulkGetter<EthersBN>(
      nRevealedPlanets - startingAt,
      500,
      async (start, end) =>
        await this.makeCall(this.contract.bulkGetRevealedPlanetIds, [
          start + startingAt,
          end + startingAt,
        ]),
      onProgressIds
    );

    const rawRevealedCoords = await aggregateBulkGetter(
      rawRevealedPlanetIds.length,
      500,
      async (start, end) =>
        await this.makeCall(this.contract.bulkGetRevealedCoordsByIds, [
          rawRevealedPlanetIds.slice(start, end),
        ]),
      onProgressCoords
    );

    return rawRevealedCoords.map(decodeRevealedCoords);
  }

  public async getClaimedCoordsByIdIfExists(
    planetId: LocationId
  ): Promise<ClaimedCoords | undefined> {
    const decStrId = locationIdToDecStr(planetId);
    const rawClaimedCoords = await this.makeCall(this.contract.claimedCoords, [decStrId]);
    const ret = decodeClaimedCoords(rawClaimedCoords);
    if (ret.hash === EMPTY_LOCATION_ID) {
      return undefined;
    }
    return ret;
  }

  public async getClaimedPlanetsCoords(
    startingAt: number,
    onProgressIds?: (fractionCompleted: number) => void,
    onProgressCoords?: (fractionCompleted: number) => void
  ): Promise<ClaimedCoords[]> {
    const nClaimedPlanets: number = (
      await this.makeCall<EthersBN>(this.contract.getNClaimedPlanets)
    ).toNumber();

    const rawClaimedPlanetIds = await aggregateBulkGetter<EthersBN>(
      nClaimedPlanets - startingAt,
      500,
      async (start, end) =>
        await this.makeCall(this.contract.bulkGetClaimedPlanetIds, [
          start + startingAt,
          end + startingAt,
        ]),
      onProgressIds
    );

    const rawClaimedCoords = await aggregateBulkGetter(
      rawClaimedPlanetIds.length,
      500,
      async (start, end) =>
        await this.makeCall(this.contract.bulkGetClaimedCoordsByIds, [
          rawClaimedPlanetIds.slice(start, end),
        ]),
      onProgressCoords
    );

    return rawClaimedCoords.map(decodeClaimedCoords);
  }

  public async bulkGetPlanets(
    toLoadPlanets: LocationId[],
    onProgressPlanet?: (fractionCompleted: number) => void
  ): Promise<Map<LocationId, Planet>> {
    const rawPlanets = await aggregateBulkGetter(
      toLoadPlanets.length,
      200,
      async (start, end) =>
        await this.makeCall(this.contract.bulkGetPlanetsByIds, [
          toLoadPlanets.slice(start, end).map(locationIdToDecStr),
        ]),
      onProgressPlanet
    );

    const planets: Map<LocationId, Planet> = new Map();

    for (let i = 0; i < toLoadPlanets.length; i += 1) {
      if (!!rawPlanets[i]) {
        const planet = decodePlanet(locationIdToDecStr(toLoadPlanets[i]), rawPlanets[i]);
        planet.transactions = new TxCollection();
        planets.set(planet.locationId, planet);
      }
    }
    return planets;
  }

  public async getPlanetById(planetId: LocationId): Promise<Planet | undefined> {
    const decStrId = locationIdToDecStr(planetId);
    const rawPlanet = await this.makeCall(this.contract.planets, [decStrId]);
    return decodePlanet(decStrId, rawPlanet);
  }

  public async getArtifactById(artifactId: ArtifactId): Promise<Artifact | undefined> {
    const exists = await this.makeCall<boolean>(this.contract.doesArtifactExist, [
      artifactIdToDecStr(artifactId),
    ]);
    if (!exists) return undefined;
    const rawArtifact = await this.makeCall(this.contract.getArtifactById, [
      artifactIdToDecStr(artifactId),
    ]);

    const artifact = decodeArtifact(rawArtifact);
    artifact.transactions = new TxCollection();
    return artifact;
  }

  public async bulkGetArtifactsOnPlanets(
    locationIds: LocationId[],
    onProgress?: (fractionCompleted: number) => void
  ): Promise<Artifact[][]> {
    const rawArtifacts = await aggregateBulkGetter(
      locationIds.length,
      200,
      async (start, end) =>
        await this.makeCall(this.contract.bulkGetPlanetArtifacts, [
          locationIds.slice(start, end).map(locationIdToDecStr),
        ]),
      onProgress
    );

    return rawArtifacts.map((rawArtifactArray) => {
      return rawArtifactArray.map(decodeArtifact);
    });
  }

  public async bulkGetArtifacts(
    artifactIds: ArtifactId[],
    onProgress?: (fractionCompleted: number) => void
  ): Promise<Artifact[]> {
    const rawArtifacts = await aggregateBulkGetter(
      artifactIds.length,
      200,
      async (start, end) =>
        await this.makeCall(this.contract.bulkGetArtifactsByIds, [
          artifactIds.slice(start, end).map(artifactIdToDecStr),
        ]),
      onProgress
    );

    const ret: Artifact[] = rawArtifacts.map(decodeArtifact);
    ret.forEach((a) => (a.transactions = new TxCollection()));

    return ret;
  }

  public async getPlayerArtifacts(
    playerId?: EthAddress,
    onProgress?: (percent: number) => void
  ): Promise<Artifact[]> {
    if (playerId === undefined) return [];

    const myArtifactIds = (await this.makeCall(this.contract.getPlayerArtifactIds, [playerId])).map(
      artifactIdFromEthersBN
    );
    return this.bulkGetArtifacts(myArtifactIds, onProgress);
  }

  public setDiagnosticUpdater(diagnosticUpdater?: DiagnosticUpdater) {
    this.contractCaller.setDiagnosticUpdater(diagnosticUpdater);
    this.txExecutor?.setDiagnosticUpdater(diagnosticUpdater);
    this.ethConnection.setDiagnosticUpdater(diagnosticUpdater);
  }

  public async submitTransaction<T extends TxIntent>(
    txIntent: T,
    overrides?: providers.TransactionRequest
  ): Promise<Transaction<T>> {
    const config = {
      contractAddress: this.contractAddress,
      account: this.ethConnection.getAddress(),
    };
    const queuedTx = await this.txExecutor.queueTransaction(txIntent, {
      gasLimit: getSetting(config, Setting.GasFeeLimit),
      ...overrides,
    });

    this.emit(ContractsAPIEvent.TxQueued, queuedTx);
    // TODO: Why is this setTimeout here? Can it be removed?
    setTimeout(() => this.emitTransactionEvents(queuedTx), 0);

    return queuedTx;
  }

  /**
   * Remove a transaction from the queue.
   */
  public cancelTransaction(tx: Transaction): void {
    this.txExecutor.dequeueTransction(tx);
    this.emit(ContractsAPIEvent.TxCancelled, tx);
  }

  /**
   * Make sure this transaction is the next to be executed.
   */
  public prioritizeTransaction(tx: Transaction): void {
    this.txExecutor.prioritizeTransaction(tx);
    this.emit(ContractsAPIEvent.TxPrioritized, tx);
  }

  /**
   * This is a strange interface between the transaction queue system and the rest of the game. The
   * strange thing about it is that introduces another way by which transactions are pushed into the
   * game - these {@code ContractsAPIEvent} events.
   */
  public emitTransactionEvents(tx: Transaction): void {
    tx.submittedPromise
      .then(() => {
        this.emit(ContractsAPIEvent.TxSubmitted, tx);
      })
      .catch(() => {
        this.emit(ContractsAPIEvent.TxErrored, tx);
      });

    tx.confirmedPromise
      .then(() => {
        this.emit(ContractsAPIEvent.TxConfirmed, tx);
      })
      .catch(() => {
        this.emit(ContractsAPIEvent.TxErrored, tx);
      });
  }

  public getAddress() {
    return this.ethConnection.getAddress();
  }
}

export async function makeContractsAPI({
  connection,
  contractAddress,
}: ContractsApiConfig): Promise<ContractsAPI> {
  await connection.loadContract(contractAddress, loadDiamondContract);

  return new ContractsAPI({ connection, contractAddress });
}
