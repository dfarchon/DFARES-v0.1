// myNotice: after install dfares/serde
import { task } from 'hardhat/config';
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

// myNotice: after install dfares/serde

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
