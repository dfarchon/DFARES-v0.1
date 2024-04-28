// NOTE: after install dfares/serde
import {
  MAX_AVATAR_TYPE,
  MAX_HAT_TYPE,
  MAX_LOGO_TYPE,
  MAX_MEME_TYPE,
  MIN_AVATAR_TYPE,
  MIN_HAT_TYPE,
  MIN_LOGO_TYPE,
  MIN_MEME_TYPE,
} from '@dfares/constants';
// import { logoTypeToNum } from '@dfares/procedural';
import { LogoType, LogoTypeNames } from '@dfares/types';
import { task, types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

task('game:findCheaters', 'finds planets that have been captured more than once').setAction(
  findCheaters
);

async function findCheaters({}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const { GAME_START_BLOCK } = await contract.getGameConstants();
  const endBlock = 20743532;

  console.log(GAME_START_BLOCK.toString());

  const capturers = new Map<string, string>();
  const cheaterScore = new Map<string, number>();

  const filter = {
    address: contract.address,
    topics: [
      [contract.filters.PlanetCaptured(null, null).topics].map(
        (topicsOrUndefined) => (topicsOrUndefined || [])[0]
      ),
    ] as Array<string | Array<string>>,
  };

  const logs = await hre.ethers.provider.getLogs({
    fromBlock: Number(GAME_START_BLOCK), // inclusive
    toBlock: endBlock, // inclusive
    ...filter,
  });

  const scoreMap = (await contract.getGameConstants()).CAPTURE_ZONE_PLANET_LEVEL_SCORE;

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    const parsedData = contract.interface.parseLog(log);
    const [player, _locationId] = parsedData.args;
    const hexLocationId = _locationId.toHexString();

    if (hexLocationId === '0000c1710074979bb76b36b238e68297e02839cb0452f0dad517517cda42e9d4') {
      console.log('Found Andy cheater planet');
    }

    if (capturers.has(hexLocationId)) {
      console.log(
        `Player ${player} cheated on location ${hexLocationId} in block ${log.blockNumber}`
      );

      const planet = await contract.planets(hexLocationId);
      console.log(`Planet scored ${scoreMap[Number(planet.planetLevel)]}`);

      let score = cheaterScore.get(player) ?? 0;
      score += Number(scoreMap[Number(planet.planetLevel)]);

      cheaterScore.set(player, score);
    } else {
      capturers.set(hexLocationId, player);
    }
  }

  for (const [cheater, score] of cheaterScore.entries()) {
    console.log(`Player ${cheater} earned ${score.toLocaleString()} score from cheating.`);

    const receipt = await contract.deductScore(cheater, score);
    await receipt.wait();
  }
}

task('game:getEntryFee', 'get entry fee').setAction(getEntryFee);

async function getEntryFee({}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const amount = await contract.getEntryFee();
  console.log('entry fee: ', amount.toString());
}

task('game:getFirstMythicArtifactOwner', 'get first mythic artifact owner').setAction(
  getFirstMythicArtifactOwner
);

async function getFirstMythicArtifactOwner({}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const amount = await contract.getFirstMythicArtifactOwner();
  console.log('first mythic artifact owner: ', amount.toString());
}

task('game:getFirstBurnLocationOperator', 'get first burnLocation operator').setAction(
  getFirstBurnLocationOperator
);

async function getFirstBurnLocationOperator({}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const amount = await contract.getFirstBurnLocationOperator();
  console.log('first burnLocation operator: ', amount.toString());
}

task('game:getFirstHat', 'getFirstHat').setAction(getFirstHat);

async function getFirstHat({}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const amount = await contract.getFirstHat();
  console.log('first hat owner: ', amount.toString());
}

// NOTE: after install dfares/serde

// task('game:rank', 'get the final rank').setAction(getRank);

// async function getRank({}, hre: HardhatRuntimeEnvironment) {
//   const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

//   const rawPlayerAmount = await contract.getNPlayers();
//   const playerAmount = rawPlayerAmount.toNumber();
//   console.log('total player amount:', playerAmount);

//   const rawPlayers = await contract.bulkGetPlayers(0, playerAmount);
//   const players = rawPlayers.map((p) => decodePlayer(p));
//   console.log('players amount:', players.length);
//   for (let i = 0; i < players.length; i++) {
//     const address = players[i].address;
//     const score = await contract.getScore(address);
//     const scoreStr = score.toString();
//     if (
//       scoreStr === '115792089237316195423570985008687907853269984665640564039457584007913129639935'
//     ) {
//       players[i].score = undefined;
//     } else players[i].score = score.toNumber();

//     console.log(i, address, score.toString());
//   }

//   const haveScorePlayers = players
//     .filter((p) => p.score !== undefined)
//     .sort((a, b) => {
//       if (a.score === undefined) return -1;
//       else if (b.score === undefined) return -1;
//       return a.score - b.score;
//     });

//   console.log('have score player amount:', haveScorePlayers.length);

//   for (let i = 0; i < haveScorePlayers.length; i++) {
//     const player = haveScorePlayers[i];
//     console.log(i + 1, player.address, player.score);
//   }
// }

task('game:getPlayerLog', 'get player log')
  .addPositionalParam(
    'playerAddress',
    'the address of the player to give the artifacts',
    undefined,
    types.string
  )
  .setAction(getPlayerLog);

async function getPlayerLog(
  { playerAddress }: { playerAddress: string },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const rawPlayerLog = await contract.getPlayerLog(playerAddress);
  // // console.log(rawPlayerLog);
  const buySkinCnt = rawPlayerLog.buySkinCnt.toNumber();
  const buySkinCost = hre.ethers.utils.formatUnits(rawPlayerLog.buySkinCost);
  const takeOffSkinCnt = rawPlayerLog.takeOffSkinCnt.toNumber();
  const withdrawSilverCnt = rawPlayerLog.withdrawSilverCnt.toNumber();
  const claimLocationCnt = rawPlayerLog.claimLocationCnt.toNumber();
  const changeArtifactImageTypeCnt = rawPlayerLog.changeArtifactImageTypeCnt.toNumber();
  const deactivateArtifactCnt = rawPlayerLog.deactivateArtifactCnt.toNumber();
  const prospectPlanetCnt = rawPlayerLog.prospectPlanetCnt.toNumber();
  const findArtifactCnt = rawPlayerLog.findArtifactCnt.toNumber();
  const depositArtifactCnt = rawPlayerLog.depositArtifactCnt.toNumber();
  const withdrawArtifactCnt = rawPlayerLog.withdrawArtifactCnt.toNumber();
  const kardashevCnt = rawPlayerLog.kardashevCnt.toNumber();
  const blueLocationCnt = rawPlayerLog.blueLocationCnt.toNumber();
  const createLobbyCnt = rawPlayerLog.createLobbyCnt.toNumber();
  const moveCnt = rawPlayerLog.moveCnt.toNumber();
  const burnLocationCnt = rawPlayerLog.burnLocationCnt.toNumber();
  const pinkLocationCnt = rawPlayerLog.pinkLocationCnt.toNumber();
  const buyPlanetCnt = rawPlayerLog.buyPlanetCnt.toNumber();
  const buyPlanetCost = hre.ethers.utils.formatUnits(rawPlayerLog.buyPlanetCost);
  const buySpaceshipCnt = rawPlayerLog.buySpaceshipCnt.toNumber();
  const buySpaceshipCost = hre.ethers.utils.formatUnits(rawPlayerLog.buySpaceshipCost);
  const donateCnt = rawPlayerLog.donateCnt.toNumber();
  const donateSum = hre.ethers.utils.formatUnits(rawPlayerLog.donateSum);

  console.log('account:', playerAddress.toLocaleLowerCase());
  console.log('       Hat Cost:', buySkinCost, 'ether');
  console.log('    Planet Cost:', buyPlanetCost, 'ether');
  console.log(' Spaceship Cost:', buySpaceshipCost, 'ether');
  console.log('     Donate Sum:', donateSum, 'ether');
  console.log('                buySkin Cnt:', buySkinCnt);
  console.log('            takeOffSkin Cnt:', takeOffSkinCnt);
  console.log('         withdrawSilver Cnt:', withdrawSilverCnt);
  console.log('          claimLocation Cnt:', claimLocationCnt);
  console.log('changeArtifactImageType Cnt:', changeArtifactImageTypeCnt);
  console.log('     deactivateArtifact Cnt:', deactivateArtifactCnt);
  console.log('         prospectPlanet Cnt:', prospectPlanetCnt);
  console.log('           findArtifact Cnt:', findArtifactCnt);
  console.log('        depositArtifact Cnt:', depositArtifactCnt);
  console.log('       withdrawArtifact Cnt:', withdrawArtifactCnt);
  console.log('              kardashev Cnt:', kardashevCnt);
  console.log('           blueLocation Cnt:', blueLocationCnt);
  console.log('            createLobby Cnt:', createLobbyCnt);
  console.log('                   move Cnt:', moveCnt);
  console.log('           burnLocation Cnt:', burnLocationCnt);
  console.log('           pinkLocation Cnt:', pinkLocationCnt);
  console.log('              buyPlanet Cnt:', buyPlanetCnt);
  console.log('           buySpaceship Cnt:', buySpaceshipCnt);
  console.log('                 donate Cnt:', donateCnt);
}

task('game:analysisHatEarn', 'analysis hat earn').setAction(analysisHatEarn);

async function analysisHatEarn({}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const hatTypes = [];

  //copy for packages - begin

  const minHatLimit = MIN_HAT_TYPE; // 1
  const maxHatLimit = MAX_HAT_TYPE;
  const minMemeLimit = maxHatLimit + MIN_MEME_TYPE;
  const maxMemeLimit = maxHatLimit + MAX_MEME_TYPE;
  const minLogoLimit = maxMemeLimit + MIN_LOGO_TYPE;
  const maxLogoLimit = maxMemeLimit + MAX_LOGO_TYPE;
  const minAvatarLimit = maxLogoLimit + MIN_AVATAR_TYPE;
  const maxAvatarLimit = maxLogoLimit + MAX_AVATAR_TYPE;

  function logoTypeToNum(logoType: LogoType): number {
    if (logoType === 0) return 0;
    const res = logoType + minLogoLimit - 1;
    return res as number;
  }

  for (let i = MIN_LOGO_TYPE; i <= MAX_LOGO_TYPE; i++) {
    const value = logoTypeToNum(Number(i) as LogoType);
    hatTypes.push(value);
  }

  const rawResult = await contract.bulkGetHatEarn(hatTypes);
  // console.log(rawResult);
  for (let i = MIN_LOGO_TYPE; i <= MAX_LOGO_TYPE; i++) {
    const p = i - MIN_LOGO_TYPE;
    let name = LogoTypeNames[p + 1].toString();
    while (name.length <= 25) name = ' ' + name;

    const amount = hre.ethers.utils.formatUnits(rawResult[p]);
    console.log(name, amount, 'ether');
  }
}

task('game:analysisGameLog', 'analysis game log').setAction(analysisGameLog);

async function analysisGameLog({}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const rawResult = await contract.getLog();
  const initializePlayerCnt = rawResult[0].toNumber();
  const entryCost = hre.ethers.utils.formatUnits(rawResult[1]);
  const transferPlanetCnt = rawResult[2].toNumber();
  const hatEarnSum = hre.ethers.utils.formatUnits(rawResult[3]);
  const buySkinCnt = rawResult[4].toNumber();
  const takeOffSkinCnt = rawResult[5].toNumber();
  const setHatCnt = rawResult[6].toNumber();
  const setPlanetCanShowCnt = rawResult[7].toNumber();
  const withdrawSilverCnt = rawResult[8].toNumber();
  const claimLocationCnt = rawResult[9].toNumber();
  const changeArtifactImageTypeCnt = rawResult[10].toNumber();
  const deactivateArtifactCnt = rawResult[11].toNumber();
  const prospectPlanetCnt = rawResult[12].toNumber();
  const findArtifactCnt = rawResult[13].toNumber();
  const depositArtifactCnt = rawResult[14].toNumber();
  const withdrawArtifactCnt = rawResult[15].toNumber();
  const giveSpaceShipsCnt = rawResult[16].toNumber();
  const kardashevCnt = rawResult[17].toNumber();
  const blueLocationCnt = rawResult[18].toNumber();
  const createLobbyCnt = rawResult[19].toNumber();
  const moveCnt = rawResult[20].toNumber();
  const burnLocationCnt = rawResult[21].toNumber();
  const pinkLocationCnt = rawResult[22].toNumber();
  const buyPlanetCnt = rawResult[23].toNumber();
  const buyPlanetEarn = hre.ethers.utils.formatUnits(rawResult[24]);
  const buySpaceshipCnt = rawResult[25].toNumber();
  const buySpaceshipCost = hre.ethers.utils.formatUnits(rawResult[26]);
  const donateCnt = rawResult[27].toNumber();
  const donateSum = hre.ethers.utils.formatUnits(rawResult[28]);

  console.log('       Hat Earn:', hatEarnSum, 'ether');
  console.log('    Planet Earn:', buyPlanetEarn, 'ether');
  console.log(' Spaceship Earn:', buySpaceshipCost, 'ether');
  console.log('     Donate Sum:', donateSum, 'ether');
  console.log('     Entry Cost:', entryCost, 'ether');
  console.log('  Player Amount:', initializePlayerCnt);
  console.log('         giveSpaceShips Cnt:', giveSpaceShipsCnt);
  console.log('         transferPlanet Cnt:', transferPlanetCnt);
  console.log('       setPlanetCanShow Cnt:', setPlanetCanShowCnt);
  console.log('                 setHat Cnt:', setHatCnt);
  console.log('                 buySkin Cnt:', buySkinCnt);
  console.log('             takeOffSkin Cnt:', takeOffSkinCnt);
  console.log('         withdrawSilver Cnt:', withdrawSilverCnt);
  console.log('          claimLocation Cnt:', claimLocationCnt);
  console.log('changeArtifactImageType Cnt:', changeArtifactImageTypeCnt);
  console.log('     deactivateArtifact Cnt:', deactivateArtifactCnt);
  console.log('         prospectPlanet Cnt:', prospectPlanetCnt);
  console.log('           findArtifact Cnt:', findArtifactCnt);
  console.log('        depositArtifact Cnt:', depositArtifactCnt);
  console.log('       withdrawArtifact Cnt:', withdrawArtifactCnt);
  console.log('              kardashev Cnt:', kardashevCnt);
  console.log('           blueLocation Cnt:', blueLocationCnt);
  console.log('            createLobby Cnt:', createLobbyCnt);
  console.log('                   move Cnt:', moveCnt);
  console.log('           burnLocation Cnt:', burnLocationCnt);
  console.log('           pinkLocation Cnt:', pinkLocationCnt);
  console.log('              buyPlanet Cnt:', buyPlanetCnt);
  console.log('           buySpaceship Cnt:', buySpaceshipCnt);
  console.log('                 donate Cnt:', donateCnt);
}

task('game:getPlayerHatSpent', 'get player log')
  .addPositionalParam(
    'playerAddress',
    'the address of the player to give the artifacts',
    undefined,
    types.string
  )
  .setAction(getPlayerHatSpent);

async function getPlayerHatSpent(
  { playerAddress }: { playerAddress: string },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const hatTypes = [];

  //copy for packages - begin
  const minHatLimit = MIN_HAT_TYPE; // 1
  const maxHatLimit = MAX_HAT_TYPE;
  const minMemeLimit = maxHatLimit + MIN_MEME_TYPE;
  const maxMemeLimit = maxHatLimit + MAX_MEME_TYPE;
  const minLogoLimit = maxMemeLimit + MIN_LOGO_TYPE;
  const maxLogoLimit = maxMemeLimit + MAX_LOGO_TYPE;
  const minAvatarLimit = maxLogoLimit + MIN_AVATAR_TYPE;
  const maxAvatarLimit = maxLogoLimit + MAX_AVATAR_TYPE;
  function logoTypeToNum(logoType: LogoType): number {
    if (logoType === 0) return 0;
    const res = logoType + minLogoLimit - 1;
    return res as number;
  }

  for (let i = MIN_LOGO_TYPE; i <= MAX_LOGO_TYPE; i++) {
    const value = logoTypeToNum(Number(i) as LogoType);
    hatTypes.push(value);
  }

  const rawResult = await contract.bulkGetPlayerHatSpent(playerAddress, hatTypes);
  // console.log(rawResult);
  for (let i = MIN_LOGO_TYPE; i <= MAX_LOGO_TYPE; i++) {
    const p = i - MIN_LOGO_TYPE;
    let name = LogoTypeNames[p + 1].toString();
    while (name.length <= 25) name = ' ' + name;

    const amount = hre.ethers.utils.formatUnits(rawResult[p]);
    console.log(name, amount, 'ether');
  }
}

task('game:showHatTypes', 'show hat types').setAction(showHatTypes);

async function showHatTypes() {
  for (let i = MIN_LOGO_TYPE; i <= MAX_LOGO_TYPE; i++) {
    console.log(
      i,
      LogoTypeNames[i + 1 - MIN_LOGO_TYPE].toString(),
      i + MAX_MEME_TYPE + MAX_HAT_TYPE
    );
  }
}

task('game:getHatPlayerSpent', 'getHatPlayerSpent')
  .addPositionalParam('hatType', 'hatType number', undefined, types.string)
  .addPositionalParam('address', 'address ', undefined, types.string)
  .setAction(getHatPlayerSpent);

async function getHatPlayerSpent(
  { hatType, address }: { hatType: string; address: string },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const logoType = Number(hatType) - MAX_MEME_TYPE - MAX_HAT_TYPE;
  console.log('logoType: ', logoType);
  console.log('logoName: ', LogoTypeNames[logoType]);

  const amount = await contract.getHatPlayerSpent(hatType, address);
  console.log('amount: ', hre.ethers.utils.formatUnits(amount), 'ether');
}

task('game:bulkGetHatPlayerSpent', 'bulkGetHatPlayerSpent')
  .addPositionalParam('hatType', 'hatType number', undefined, types.string)
  .setAction(bulkGetHatPlayerSpent);

async function bulkGetHatPlayerSpent(
  { hatType }: { hatType: string },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const accounts = await contract.getHatPlayerAccounts(Number(hatType));
  console.log('account length:', accounts.length);

  const rawData = await contract.bulkGetHatPlayerSpent(hatType, accounts);

  const logoType = Number(hatType) - MAX_MEME_TYPE - MAX_HAT_TYPE;
  console.log('logoType: ', logoType);
  console.log('logoName: ', LogoTypeNames[logoType]);

  for (let i = 0; i < accounts.length; i++) {
    console.log(accounts[i], ':', hre.ethers.utils.formatUnits(rawData[i].toNumber()), 'ether');
  }
}
