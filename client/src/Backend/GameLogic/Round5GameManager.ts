import { isLocatable } from '@dfares/gamelogic';
import { EthConnection, ThrottledConcurrentQueue } from '@dfares/network';
import {
  isUnconfirmedAcceptApplicationTx,
  isUnconfirmedAcceptInviteTx,
  isUnconfirmedActivateArtifactTx,
  isUnconfirmedBlueTx,
  isUnconfirmedBurnTx,
  isUnconfirmedBuyArtifactTx,
  isUnconfirmedBuyHatTx,
  isUnconfirmedBuyPlanetTx,
  isUnconfirmedBuySpaceshipTx,
  isUnconfirmedCancelApplicationTx,
  isUnconfirmedCancelInviteTx,
  isUnconfirmedCapturePlanetTx,
  isUnconfirmedChangeArtifactImageTypeTx,
  isUnconfirmedChangeUnionNameTx,
  isUnconfirmedClaimTx,
  isUnconfirmedCreateUnionTx,
  isUnconfirmedDeactivateArtifactTx,
  isUnconfirmedDepositArtifactTx,
  isUnconfirmedDisbandUnionTx,
  isUnconfirmedFindArtifactTx,
  isUnconfirmedInitTx,
  isUnconfirmedInvadePlanetTx,
  isUnconfirmedInviteMemberTx,
  isUnconfirmedKardashevTx,
  isUnconfirmedKickMemberTx,
  isUnconfirmedLeaveUnionTx,
  isUnconfirmedLevelUpUnionTx,
  isUnconfirmedMoveTx,
  isUnconfirmedPinkTx,
  isUnconfirmedProspectPlanetTx,
  isUnconfirmedRefreshPlanetTx,
  isUnconfirmedRejectApplicationTx,
  isUnconfirmedRevealTx,
  isUnconfirmedSendApplicationTx,
  isUnconfirmedTransferLeaderRoleTx,
  isUnconfirmedUpgradeTx,
  isUnconfirmedWithdrawArtifactTx,
  isUnconfirmedWithdrawSilverTx,
} from '@dfares/serde';
import {
  Artifact,
  ArtifactId,
  ArtifactType,
  BurnedCoords,
  ClaimedCoords,
  EthAddress,
  KardashevCoords,
  LocationId,
  Planet,
  Player,
  PlayerProfile,
  QueuedArrival,
  RevealedCoords,
  Setting,
  Transaction,
  Union,
  UnionId,
  VoyageId,
  WorldLocation,
} from '@dfares/types';
import delay from 'delay';
import NotificationManager from '../../Frontend/Game/NotificationManager';
import { pollSetting } from '../../Frontend/Utils/SettingsHooks';
import { TerminalHandle } from '../../Frontend/Views/Terminal';
import {
  ContractConstants,
  ContractsAPIEvent,
} from '../../_types/darkforest/api/ContractsAPITypes';
import { HashConfig } from '../../_types/global/GlobalTypes';
import PersistentChunkStore from '../Storage/PersistentChunkStore';
import SnarkArgsHelper from '../Utils/SnarkArgsHelper';
import { GameManagerEvent } from './BaseGameManager';
import { ContractsAPI, makeContractsAPI } from './ContractsAPI';
import { InitialGameStateDownloader } from './InitialGameStateDownloader';
import Round4GameManager from './Round4GameManager';

class Round5GameManager extends Round4GameManager {
  /**
   * Map from ethereum address to player profile object.
   */
  protected readonly playerProfiles: Map<string, PlayerProfile>;

  /**
   * Handle to an interval that periodically refreshes some information about the player profile from the blockchain.
   */
  private playerProfileInterval: ReturnType<typeof setInterval>;


  protected constructor(
    terminal: React.MutableRefObject<TerminalHandle | undefined>,
    account: EthAddress | undefined,
    players: Map<string, Player>,
    playerProfiles: Map<string, PlayerProfile>,
    touchedPlanets: Map<LocationId, Planet>,
    allTouchedPlanetIds: Set<LocationId>,
    revealedCoords: Map<LocationId, RevealedCoords>,
    claimedCoords: Map<LocationId, ClaimedCoords>,
    burnedCoords: Map<LocationId, BurnedCoords>,
    kardashevCoords: Map<LocationId, KardashevCoords>,
    worldRadius: number,
    innerRadius: number,
    unprocessedArrivals: Map<VoyageId, QueuedArrival>,
    unprocessedPlanetArrivalIds: Map<LocationId, VoyageId[]>,
    contractsAPI: ContractsAPI,
    contractConstants: ContractConstants,
    persistentChunkStore: PersistentChunkStore,
    snarkHelper: SnarkArgsHelper,
    homeLocation: WorldLocation | undefined,
    useMockHash: boolean,
    artifacts: Map<ArtifactId, Artifact>,
    ethConnection: EthConnection,
    paused: boolean,
    halfPrice: boolean,
    unions: Map<UnionId, Union>
  ) {
    super(
      terminal,
      account,
      players,
      touchedPlanets,
      allTouchedPlanetIds,
      revealedCoords,
      claimedCoords,
      burnedCoords,
      kardashevCoords,
      worldRadius,
      innerRadius,
      unprocessedArrivals,
      unprocessedPlanetArrivalIds,
      contractsAPI,
      contractConstants,
      persistentChunkStore,
      snarkHelper,
      homeLocation,
      useMockHash,
      artifacts,
      ethConnection,
      paused,
      halfPrice,
      unions
    );

    // client side does not fetch the actual profile on initialization, but would refresh player profile later when in need.
    this.playerProfiles = playerProfiles;

    this.playerProfileInterval = setInterval(() => {
      this.hardRefreshAllPlayerProfiles();
    }, 10_000);
  }

  public destroy(): void {
    super.destroy();
    clearInterval(this.playerProfileInterval);
  }

  static async create({
    connection,
    terminal,
    contractAddress,
    spectate = false,
  }: {
    connection: EthConnection;
    terminal: React.MutableRefObject<TerminalHandle|undefined>;
    contractAddress: EthAddress;
    spectate: boolean;
  }): Promise<Round5GameManager> {
    if (!terminal.current) {
      throw new Error('you must pass in a handle to a terminal');
    }

    const account = spectate
      ? <EthAddress>'0x0000000000000000000000000000000000000001'
      : connection.getAddress();

    if (!account) {
      throw new Error('no account on eth connection');
    }

    const gameStateDownloader = new InitialGameStateDownloader(terminal.current);
    const contractsAPI = await makeContractsAPI({ connection, contractAddress });

    terminal.current?.println('Loading game data from dist...');

    const persistentChunkStore = await PersistentChunkStore.create({ account, contractAddress });

    terminal.current?.println('Downloading data from Ethereum blockchain...');
    terminal.current?.println('(the contract is very big. this may take a while)');
    terminal.current?.newline();

    const initialState = await gameStateDownloader.download(contractsAPI, persistentChunkStore);

    const possibleHomes = await persistentChunkStore.getHomeLocations();

    terminal.current?.println('');
    terminal.current?.println('Building Index...');

    await persistentChunkStore.saveTouchedPlanetIds(initialState.allTouchedPlanetIds);
    await persistentChunkStore.saveRevealedCoords(initialState.allRevealedCoords);
    await persistentChunkStore.saveClaimedCoords(initialState.allClaimedCoords);

    const knownArtifacts: Map<ArtifactId, Artifact> = new Map();

    for (let i = 0; i < initialState.loadedPlanets.length; i++) {
      const planet = initialState.touchedAndLocatedPlanets.get(initialState.loadedPlanets[i]);

      if (!planet) {
        continue;
      }

      planet.heldArtifactIds = initialState.heldArtifacts[i].map((a) => a.id);

      for (const heldArtifact of initialState.heldArtifacts[i]) {
        knownArtifacts.set(heldArtifact.id, heldArtifact);
      }
    }

    for (const myArtifact of initialState.myArtifacts) {
      knownArtifacts.set(myArtifact.id, myArtifact);
    }

    for (const artifact of initialState.artifactsOnVoyages) {
      knownArtifacts.set(artifact.id, artifact);
    }

    // figure out what's my home planet
    let homeLocation: WorldLocation | undefined = undefined;
    for (const loc of possibleHomes) {
      if (initialState.allTouchedPlanetIds.includes(loc.hash)) {
        homeLocation = loc;
        await persistentChunkStore.confirmHomeLocation(loc);
        break;
      }
    }

    const hashConfig: HashConfig = {
      planetHashKey: initialState.contractConstants.PLANETHASH_KEY,
      spaceTypeKey: initialState.contractConstants.SPACETYPE_KEY,
      biomebaseKey: initialState.contractConstants.BIOMEBASE_KEY,
      perlinLengthScale: initialState.contractConstants.PERLIN_LENGTH_SCALE,
      perlinMirrorX: initialState.contractConstants.PERLIN_MIRROR_X,
      perlinMirrorY: initialState.contractConstants.PERLIN_MIRROR_Y,
      planetRarity: initialState.contractConstants.PLANET_RARITY,
    };

    const useMockHash = initialState.contractConstants.DISABLE_ZK_CHECKS;
    const snarkHelper = SnarkArgsHelper.create(hashConfig, terminal, useMockHash);

    const gameManager = new Round5GameManager(
      terminal,
      account,
      initialState.players,
      initialState.playerProfiles,
      initialState.touchedAndLocatedPlanets,
      new Set(Array.from(initialState.allTouchedPlanetIds)),
      initialState.revealedCoordsMap,
      initialState.claimedCoordsMap
        ? initialState.claimedCoordsMap
        : new Map<LocationId, ClaimedCoords>(),
      initialState.burnedCoordsMap
        ? initialState.burnedCoordsMap
        : new Map<LocationId, BurnedCoords>(),

      initialState.kardashevCoordsMap
        ? initialState.kardashevCoordsMap
        : new Map<LocationId, KardashevCoords>(),

      initialState.worldRadius,
      initialState.innerRadius,
      initialState.arrivals,
      initialState.planetVoyageIdMap,
      contractsAPI,
      initialState.contractConstants,
      persistentChunkStore,
      snarkHelper,
      homeLocation,
      useMockHash,
      knownArtifacts,
      connection,
      initialState.paused,
      initialState.halfPrice,
      initialState.unions
    );

    gameManager.setPlayerTwitters(initialState.twitters);

    const config = {
      contractAddress,
      account: gameManager.getAccount(),
    };
    pollSetting(config, Setting.AutoApproveNonPurchaseTransactions);

    persistentChunkStore.setDiagnosticUpdater(gameManager);
    contractsAPI.setDiagnosticUpdater(gameManager);

    // important that this happens AFTER we load the game state from the blockchain. Otherwise our
    // 'loading game state' contract calls will be competing with events from the blockchain that
    // are happening now, which makes no sense.
    contractsAPI.setupEventListeners();

    // get twitter handles
    gameManager.refreshTwitters();

    gameManager.listenForNewBlock();

    // set up listeners: whenever ContractsAPI reports some game state update, do some logic
    gameManager.contractsAPI
      .on(ContractsAPIEvent.PlayerProfileUpdate, async (playerAddress: EthAddress, newProfile: PlayerProfile) => {
        // update player profile on update event propogated from contract
        const oldProfile = gameManager.playerProfiles.get(playerAddress);
        gameManager.playerProfiles.set(playerAddress, Object.assign({}, oldProfile, newProfile));
      })
      .on(ContractsAPIEvent.ArtifactUpdate, async (artifactId: ArtifactId) => {
        await gameManager.hardRefreshArtifact(artifactId);
        gameManager.emit(GameManagerEvent.ArtifactUpdate, artifactId);
      })
      .on(
        ContractsAPIEvent.PlanetTransferred,
        async (planetId: LocationId, newOwner: EthAddress) => {
          await gameManager.hardRefreshPlanet(planetId);
          const planetAfter = gameManager.getPlanetWithId(planetId);

          if (planetAfter && newOwner === gameManager.account) {
            NotificationManager.getInstance().receivedPlanet(planetAfter);
          }
        }
      )
      .on(ContractsAPIEvent.PlayerUpdate, async (playerId: EthAddress) => {
        await gameManager.hardRefreshPlayer(playerId);
      })
      .on(ContractsAPIEvent.UnionUpdate, async (unionId: UnionId) => {
        await gameManager.hardRefreshUnion(unionId);
      })
      .on(ContractsAPIEvent.PauseStateChanged, async (paused: boolean) => {
        gameManager.paused = paused;
        gameManager.paused$.publish(paused);
      })
      .on(ContractsAPIEvent.HalfPriceChanged, async (halfPrice: boolean) => {
        gameManager.halfPrice = halfPrice;
        gameManager.halfPrice$.publish(halfPrice);
      })
      .on(ContractsAPIEvent.PlanetUpdate, async (planetId: LocationId) => {
        // don't reload planets that you don't have in your map. once a planet
        // is in your map it will be loaded from the contract.
        const localPlanet = gameManager.entityStore.getPlanetWithId(planetId);
        if (localPlanet && isLocatable(localPlanet)) {
          await gameManager.hardRefreshPlanet(planetId);
          gameManager.emit(GameManagerEvent.PlanetUpdate);
        }
      })
      .on(
        ContractsAPIEvent.ArrivalQueued,
        async (_arrivalId: VoyageId, fromId: LocationId, toId: LocationId) => {
          // only reload planets if the toPlanet is in the map
          const localToPlanet = gameManager.entityStore.getPlanetWithId(toId);
          if (localToPlanet && isLocatable(localToPlanet)) {
            await gameManager.bulkHardRefreshPlanets([fromId, toId]);
            gameManager.emit(GameManagerEvent.PlanetUpdate);
          }
        }
      )
      .on(
        ContractsAPIEvent.LocationRevealed,
        async (planetId: LocationId, _revealer: EthAddress) => {
          // TODO: hook notifs or emit event to UI if you want
          await gameManager.hardRefreshPlanet(planetId);
          gameManager.emit(GameManagerEvent.PlanetUpdate);
        }
      )
      .on(
        ContractsAPIEvent.LocationClaimed,
        async (planetId: LocationId, _revealer: EthAddress) => {
          // TODO: hook notifs or emit event to UI if you want

          // console.log('[testInfo]: ContractsAPIEvent.LocationClaimed');
          await gameManager.hardRefreshPlanet(planetId);
          gameManager.emit(GameManagerEvent.PlanetUpdate);
        }
      )

      .on(ContractsAPIEvent.TxQueued, (tx: Transaction) => {
        gameManager.entityStore.onTxIntent(tx);
      })
      .on(ContractsAPIEvent.TxSubmitted, (tx: Transaction) => {
        gameManager.persistentChunkStore.onEthTxSubmit(tx);
        gameManager.onTxSubmit(tx);
      })
      .on(ContractsAPIEvent.TxConfirmed, async (tx: Transaction) => {
        if (!tx.hash) return; // this should never happen
        gameManager.persistentChunkStore.onEthTxComplete(tx.hash);

        if (isUnconfirmedRevealTx(tx)) {
          await gameManager.hardRefreshPlanet(tx.intent.locationId);
        } else if (isUnconfirmedBurnTx(tx)) {
          await gameManager.hardRefreshPlanet(tx.intent.locationId);
          await gameManager.hardRefreshPinkZones();
        } else if (isUnconfirmedPinkTx(tx)) {
          await gameManager.hardRefreshPlanet(tx.intent.locationId);
        } else if (isUnconfirmedKardashevTx(tx)) {
          await gameManager.hardRefreshPlanet(tx.intent.locationId);
          await gameManager.hardRefreshBlueZones();
        } else if (isUnconfirmedBlueTx(tx)) {
          const centerPlanetId = gameManager.getBlueZoneCenterPlanetId(tx.intent.locationId);
          if (centerPlanetId) {
            await gameManager.bulkHardRefreshPlanets([tx.intent.locationId, centerPlanetId]);
          } else {
            // notice: this should never happen
            await gameManager.bulkHardRefreshPlanets([tx.intent.locationId]);
          }
          gameManager.emit(GameManagerEvent.PlanetUpdate);
        } else if (isUnconfirmedInitTx(tx)) {
          terminal.current?.println('Loading Home Planet from Blockchain...');
          const retries = 5;
          for (let i = 0; i < retries; i++) {
            const planet = await gameManager.contractsAPI.getPlanetById(tx.intent.locationId);
            if (planet) {
              break;
            } else if (i === retries - 1) {
              console.error("couldn't load player's home planet");
            } else {
              await delay(2000);
            }
          }
          await gameManager.hardRefreshPlanet(tx.intent.locationId);
          // mining manager should be initialized already via joinGame, but just in case...
          gameManager.initMiningManager(tx.intent.location.coords, 4);
        } else if (isUnconfirmedMoveTx(tx)) {
          const promises = [gameManager.bulkHardRefreshPlanets([tx.intent.from, tx.intent.to])];
          if (tx.intent.artifact) {
            promises.push(gameManager.hardRefreshArtifact(tx.intent.artifact));
          }
          await Promise.all(promises);
        } else if (isUnconfirmedUpgradeTx(tx)) {
          await gameManager.hardRefreshPlanet(tx.intent.locationId);
        } else if (isUnconfirmedRefreshPlanetTx(tx)) {
          await gameManager.hardRefreshPlanet(tx.intent.locationId);
        } else if (isUnconfirmedBuyHatTx(tx)) {
          await gameManager.hardRefreshPlanet(tx.intent.locationId);
        } else if (isUnconfirmedInitTx(tx)) {
          await gameManager.hardRefreshPlanet(tx.intent.locationId);
        } else if (isUnconfirmedBuyPlanetTx(tx)) {
          //todo
          await gameManager.hardRefreshPlanet(tx.intent.locationId);
        } else if (isUnconfirmedBuySpaceshipTx(tx)) {
          await gameManager.hardRefreshPlanet(tx.intent.locationId);
        } else if (isUnconfirmedFindArtifactTx(tx)) {
          await gameManager.hardRefreshPlanet(tx.intent.planetId);
        } else if (isUnconfirmedDepositArtifactTx(tx)) {
          await Promise.all([
            gameManager.hardRefreshPlanet(tx.intent.locationId),
            gameManager.hardRefreshArtifact(tx.intent.artifactId),
          ]);
        } else if (isUnconfirmedWithdrawArtifactTx(tx)) {
          await Promise.all([
            await gameManager.hardRefreshPlanet(tx.intent.locationId),
            await gameManager.hardRefreshArtifact(tx.intent.artifactId),
          ]);
        } else if (isUnconfirmedProspectPlanetTx(tx)) {
          await gameManager.softRefreshPlanet(tx.intent.planetId);
        } else if (isUnconfirmedActivateArtifactTx(tx)) {
          let refreshFlag = true;
          const fromPlanet = await gameManager.getPlanetWithId(tx.intent.locationId);
          const artifact = await gameManager.getArtifactWithId(tx.intent.artifactId);

          if (artifact?.artifactType === ArtifactType.FireLink) {
            if (fromPlanet && fromPlanet.locationId && tx.intent.linkTo) {
              const toPlanet = await gameManager.getPlanetWithId(tx.intent.linkTo);
              if (toPlanet) {
                const activeArtifactOnToPlanet = await gameManager.getActiveArtifact(toPlanet);
                if (
                  activeArtifactOnToPlanet &&
                  activeArtifactOnToPlanet.artifactType === ArtifactType.IceLink &&
                  activeArtifactOnToPlanet.linkTo
                ) {
                  const toLinkPlanet = await gameManager.getPlanetWithId(
                    activeArtifactOnToPlanet.linkTo
                  );
                  if (toLinkPlanet) {
                    await Promise.all([
                      gameManager.bulkHardRefreshPlanets([
                        fromPlanet.locationId,
                        toPlanet.locationId,
                        toLinkPlanet.locationId,
                      ]),
                      gameManager.hardRefreshArtifact(tx.intent.artifactId),
                    ]);
                    refreshFlag = false;
                  }
                }
              }
            }
          }

          if (refreshFlag) {
            if (tx.intent.linkTo) {
              await Promise.all([
                gameManager.bulkHardRefreshPlanets([tx.intent.locationId, tx.intent.linkTo]),
                gameManager.hardRefreshArtifact(tx.intent.artifactId),
              ]);
            } else {
              await Promise.all([
                gameManager.hardRefreshPlanet(tx.intent.locationId),
                gameManager.hardRefreshArtifact(tx.intent.artifactId),
              ]);
            }
          }
        } else if (isUnconfirmedDeactivateArtifactTx(tx)) {
          // console.log(tx);
          if (tx.intent.linkTo) {
            await Promise.all([
              gameManager.bulkHardRefreshPlanets([tx.intent.locationId, tx.intent.linkTo]),
              gameManager.hardRefreshArtifact(tx.intent.artifactId),
            ]);
          } else {
            await Promise.all([
              gameManager.hardRefreshPlanet(tx.intent.locationId),
              gameManager.hardRefreshArtifact(tx.intent.artifactId),
            ]);
          }
        } else if (isUnconfirmedChangeArtifactImageTypeTx(tx)) {
          await Promise.all([
            await gameManager.hardRefreshPlanet(tx.intent.locationId),
            await gameManager.hardRefreshArtifact(tx.intent.artifactId),
          ]);
        } else if (isUnconfirmedBuyArtifactTx(tx)) {
          await Promise.all([
            gameManager.hardRefreshPlanet(tx.intent.locationId),
            gameManager.hardRefreshArtifact(tx.intent.artifactId),
          ]);
        } else if (isUnconfirmedWithdrawSilverTx(tx)) {
          await gameManager.softRefreshPlanet(tx.intent.locationId);
        } else if (isUnconfirmedCapturePlanetTx(tx)) {
          await Promise.all([
            gameManager.hardRefreshPlayer(gameManager.getAccount()),
            gameManager.hardRefreshPlanet(tx.intent.locationId),
          ]);
        } else if (isUnconfirmedInvadePlanetTx(tx)) {
          await Promise.all([
            gameManager.hardRefreshPlayer(gameManager.getAccount()),
            gameManager.hardRefreshPlanet(tx.intent.locationId),
          ]);
        } else if (isUnconfirmedClaimTx(tx)) {
          gameManager.entityStore.updatePlanet(
            tx.intent.locationId,
            (p) => (p.claimer = gameManager.getAccount())
          );
        } else if (isUnconfirmedCreateUnionTx(tx)) {
          const unions = gameManager.getAllUnions();
          const newUnionId = unions.length + 1;

          await Promise.all([
            gameManager.hardRefreshUnion(newUnionId.toString() as UnionId),
            gameManager.hardRefreshPlayer(gameManager.getAccount()),
          ]);
        } else if (isUnconfirmedInviteMemberTx(tx)) {
          await Promise.all([gameManager.hardRefreshUnion(tx.intent.unionId)]);
        } else if (isUnconfirmedCancelInviteTx(tx)) {
          await Promise.all([gameManager.hardRefreshUnion(tx.intent.unionId)]);
        } else if (isUnconfirmedAcceptInviteTx(tx)) {
          await Promise.all([
            gameManager.hardRefreshUnion(tx.intent.unionId),
            gameManager.hardRefreshPlayer(gameManager.getAccount()),
          ]);
        } else if (isUnconfirmedSendApplicationTx(tx)) {
          await Promise.all([
            gameManager.hardRefreshUnion(tx.intent.unionId),
            gameManager.hardRefreshPlayer(gameManager.getAccount()),
          ]);
        } else if (isUnconfirmedCancelApplicationTx(tx)) {
          await Promise.all([
            gameManager.hardRefreshUnion(tx.intent.unionId),
            gameManager.hardRefreshPlayer(gameManager.getAccount()),
          ]);
        } else if (isUnconfirmedRejectApplicationTx(tx)) {
          await Promise.all([
            gameManager.hardRefreshUnion(tx.intent.unionId),
            gameManager.hardRefreshPlayer(tx.intent.applicant),
          ]);
        } else if (isUnconfirmedAcceptApplicationTx(tx)) {
          await Promise.all([
            gameManager.hardRefreshUnion(tx.intent.unionId),
            gameManager.hardRefreshPlayer(tx.intent.applicant),
          ]);
        } else if (isUnconfirmedLeaveUnionTx(tx)) {
          await Promise.all([
            gameManager.hardRefreshUnion(tx.intent.unionId),
            gameManager.hardRefreshPlayer(gameManager.getAccount()),
          ]);
        } else if (isUnconfirmedKickMemberTx(tx)) {
          await Promise.all([
            gameManager.hardRefreshUnion(tx.intent.unionId),
            gameManager.hardRefreshPlayer(tx.intent.member),
          ]);
        } else if (isUnconfirmedTransferLeaderRoleTx(tx)) {
          await Promise.all([
            gameManager.hardRefreshUnion(tx.intent.unionId),
            gameManager.hardRefreshPlayer(tx.intent.newLeader),
            gameManager.hardRefreshPlayer(gameManager.getAccount()),
          ]);
        } else if (isUnconfirmedChangeUnionNameTx(tx)) {
          await Promise.all([gameManager.hardRefreshUnion(tx.intent.unionId)]);
        } else if (isUnconfirmedDisbandUnionTx(tx)) {
          const group = [];
          const union = gameManager.getUnion(tx.intent.unionId);
          if (union) {
            for (let i = 0; i < union.members.length; i++) {
              group.push(gameManager.hardRefreshPlayer(union.members[i]));
            }
          }
          group.push(gameManager.hardRefreshUnion(tx.intent.unionId));
          await Promise.all(group);
        } else if (isUnconfirmedLevelUpUnionTx(tx)) {
          await Promise.all([gameManager.hardRefreshUnion(tx.intent.unionId)]);
        }

        gameManager.entityStore.clearUnconfirmedTxIntent(tx);
        gameManager.onTxConfirmed(tx);
      })
      .on(ContractsAPIEvent.TxErrored, async (tx: Transaction) => {
        gameManager.entityStore.clearUnconfirmedTxIntent(tx);
        if (tx.hash) {
          gameManager.persistentChunkStore.onEthTxComplete(tx.hash);
        }
        gameManager.onTxReverted(tx);
      })
      .on(ContractsAPIEvent.TxCancelled, async (tx: Transaction) => {
        gameManager.onTxCancelled(tx);
      })
      .on(ContractsAPIEvent.RadiusUpdated, async () => {
        // round 4 hotfix
        // gameManager.hardRefreshRadius();
      });

    const unconfirmedTxs = await persistentChunkStore.getUnconfirmedSubmittedEthTxs();
    const confirmationQueue = new ThrottledConcurrentQueue({
      invocationIntervalMs: 1000,
      maxInvocationsPerIntervalMs: 10,
      maxConcurrency: 1,
    });

    for (const unconfirmedTx of unconfirmedTxs) {
      confirmationQueue.add(async () => {
        const tx = gameManager.contractsAPI.txExecutor.waitForTransaction(unconfirmedTx);
        gameManager.contractsAPI.emitTransactionEvents(tx);
        return tx.confirmedPromise;
      });
    }

    // we only want to initialize the mining manager if the player has already joined the game
    // if they haven't, we'll do this once the player has joined the game
    if (!!homeLocation && initialState.players.has(account as string)) {
      gameManager.initMiningManager(homeLocation.coords);
    }

    return gameManager;
  }


  protected async hardRefreshAllPlayerProfiles(): Promise<void> {
    const allProfiles = Array.from((await this.contractsAPI.getAllPlayerProfiles()).values());

    this.playerProfiles.clear();

    for (const profile of allProfiles) {
      this.playerProfiles.set(profile.playerAddress, Object.assign({}, profile));
    }
  }

  /**
   * Gets a list of all player profiles in the game.
   * @returns
   */
  public getAllPlayerProfiles(): PlayerProfile[] {
    return Array.from(this.playerProfiles.values());
  }

  /**
   * Gets either the given player, or the player logged in this client if no address provided.
   * @param address
   * @returns
   */
  public getPlayerProfile(address?: EthAddress): PlayerProfile | undefined {
    address = address || this.account;

    if (!address) {
      return undefined;
    }

    return this.playerProfiles.get(address);
  }

  public setDisplayName(newDisplayName: string) {
    const addr = this.getAccount();
    if (!addr) return;

    try {
      this.contractsAPI.setDisplayName(addr, newDisplayName);
      return newDisplayName;
    } catch(error) {
      console.error('Error setting display name:', error);
      return;
    }
  }
}

export default Round5GameManager;
