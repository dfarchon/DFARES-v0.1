import { CONTRACT_PRECISION, GAS_ADJUST_DELTA } from '@dfares/constants';
import { fakeHash, mimcHash, modPBigInt, perlin } from '@dfares/hashing';
import {
  buildContractCallArgs,
  fakeProof,
  RevealSnarkContractCallArgs,
  revealSnarkWasmPath,
  revealSnarkZkeyPath,
  SnarkJSProofAndSignals,
} from '@dfares/snarks';
import { BigNumber } from 'ethers';
import * as fs from 'fs';
import { task, types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
// @ts-ignore
import * as snarkjs from 'snarkjs';

task('admin:pause', 'pause the game').setAction(gamePause);

async function gamePause({}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const pauseReceipt = await contract.pause();
  await pauseReceipt.wait();
}

task('admin:resume', 'resume the game').setAction(gameResume);

async function gameResume({}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const unpauseReceipt = await contract.unpause();
  await unpauseReceipt.wait();
}

task('admin:setPlanetOwner', 'sets the owner of the given planet to be the given address')
  .addPositionalParam('planetId', 'non-0x-prefixed planet locationId', undefined, types.string)
  .addPositionalParam('address', '0x-prefixed address of a player', undefined, types.string)
  .setAction(setPlanetOwner);

async function setPlanetOwner(
  { planetId, address }: { planetId: string; address: string },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const setPlanetOwnerReciept = await contract.setOwner(BigNumber.from('0x' + planetId), address);
  await setPlanetOwnerReciept.wait();
}

task('admin:deductScore', 'deduct player score')
  .addPositionalParam('address', '0x-prefixed address of a player', undefined, types.string)
  .addPositionalParam('amount', "the deduct score's amount")
  .setAction(deductScore);

async function deductScore(
  { address, amount }: { address: string; amount: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const receipt = await contract.deductScore(address, amount);
  await receipt.wait();
}

task('admin:addSilver', 'add player silver')
  .addPositionalParam('address', '0x-prefixed address of a player', undefined, types.string)
  .addPositionalParam('amount', "the deduct score's amount")
  .setAction(addSilver);

async function addSilver(
  { address, amount }: { address: string; amount: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const formatAmount = amount * CONTRACT_PRECISION;
  const receipt = await contract.addSilver(address, formatAmount);
  await receipt.wait();
}

task('admin:deductSilver', 'deduct player silver')
  .addPositionalParam('address', '0x-prefixed address of a player', undefined, types.string)
  .addPositionalParam('amount', "the deduct score's amount")
  .setAction(deductSilver);

async function deductSilver(
  { address, amount }: { address: string; amount: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const formatAmount = amount * CONTRACT_PRECISION;
  const receipt = await contract.deductSilver(address, formatAmount);
  await receipt.wait();
}

// safeSetOwner

task('admin:setWorldRadiusMin', 'change the WORLD_RADIUS_MIN')
  .addPositionalParam('radius', 'the minimum radius of the world', undefined, types.int)
  .setAction(gameSetWorldRadiusMin);

async function gameSetWorldRadiusMin(args: { radius: number }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const changeWorldRadiusMinReceipt = await contract.changeWorldRadiusMin(args.radius);
  await changeWorldRadiusMinReceipt.wait();
}

task('admin:setRadius', 'change the radius')
  .addPositionalParam('radius', 'the radius', undefined, types.int)
  .setAction(gameSetRadius);

async function gameSetRadius(args: { radius: number }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const setRadiusReceipt = await contract.adminSetWorldRadius(args.radius);
  await setRadiusReceipt.wait();
}

task('admin:changeCaptureZoneRadius', 'change capture zone radius')
  .addPositionalParam('radius', 'the radius', undefined, types.int)
  .setAction(changeCaptureZoneRadius);

async function changeCaptureZoneRadius(args: { radius: number }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const setRadiusReceipt = await contract.changeCaptureZoneRadius(args.radius);
  await setRadiusReceipt.wait();
}

task('admin:changeBurnPlanetEffectRadius', 'change burn planet effect radius')
  .addPositionalParam('level', 'the planet level', undefined, types.int)
  .addPositionalParam('radius', 'the radius', undefined, types.int)
  .setAction(changeBurnPlanetEffectRadius);

async function changeBurnPlanetEffectRadius(
  args: { level: number; radius: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const setRadiusReceipt = await contract.changeBurnPlanetEffectRadius(args.level, args.radius);
  await setRadiusReceipt.wait();
}

task('admin:changeBurnPlanetRequireSilver', 'change burn planet effect radius')
  .addPositionalParam('level', 'the planet level', undefined, types.int)
  .addPositionalParam('silver', 'the silver amount', undefined, types.int)
  .setAction(changeBurnPlanetRequireSilver);

async function changeBurnPlanetRequireSilver(
  args: { level: number; silver: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.changeBurnPlanetRequireSilver(
    args.level,
    Number(args.silver * CONTRACT_PRECISION)
  );
  await receipt.wait();
}

task('admin:changeLocationRevealCooldown', 'change location reveal cooldown')
  .addPositionalParam('cooldown', 'the cooldown', undefined, types.int)
  .setAction(changeLocationRevealCooldown);

async function changeLocationRevealCooldown(
  args: { cooldown: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.changeLocationRevealCooldown(args.cooldown);
  await receipt.wait();
}

task('admin:changeClaimPlanetCooldown', 'change cliam planet cooldown')
  .addPositionalParam('cooldown', 'the cooldown', undefined, types.int)
  .setAction(changeClaimPlanetCooldown);

async function changeClaimPlanetCooldown(
  args: { cooldown: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.changeClaimPlanetCooldown(args.cooldown);
  await receipt.wait();
}

task('admin:changeBurnPlanetCooldown', 'change burn planet cooldown')
  .addPositionalParam('cooldown', 'the cooldown', undefined, types.int)
  .setAction(changeBurnPlanetCooldown);

async function changeBurnPlanetCooldown(
  args: { cooldown: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.changeClaimPlanetCooldown(args.cooldown);
  await receipt.wait();
}

task('admin:changePinkPlanetCooldown', 'change Pink planet cooldown')
  .addPositionalParam('cooldown', 'the cooldown', undefined, types.int)
  .setAction(changePinkPlanetCooldown);

async function changePinkPlanetCooldown(
  args: { cooldown: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.changePinkPlanetCooldown(args.cooldown);
  await receipt.wait();
}

task('admin:withdraw', 'withdraw all the ether in game contract').setAction(withdraw);

async function withdraw(args: {}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.withdraw();
  await receipt.wait();
}

task('admin:setEndTime', 'change end time')
  .addPositionalParam('endtime', 'the endtime', undefined, types.int)
  .setAction(setEndTime);

async function setEndTime(args: { endtime: number }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt1 = await contract.setTokenMintEndTime(args.endtime);
  await receipt1.wait();
  console.log('alreadt set tokenMintEndTime');

  const receipt2 = await contract.setClaimEndTime(args.endtime);
  await receipt2.wait();
  console.log('alreadt set claimEndTime');

  const receipt3 = await contract.setBurnEndTime(args.endtime);
  await receipt3.wait();
  console.log('alreadt set burnEndTime');
}

task(
  'admin:createPlanets',
  'creates the planets defined in the darkforest.toml [[planets]] key. Only works when zk checks are enabled (using regular mimc fn)'
).setAction(createPlanets);

async function createPlanets({}, hre: HardhatRuntimeEnvironment) {
  // mytodo:
  // here have bugs
  console.log('possible bug need to fixed');
  return;
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  for (const adminPlanetInfo of hre.adminPlanets) {
    try {
      const location = hre.initializers.DISABLE_ZK_CHECKS
        ? fakeHash(hre.initializers.PLANET_RARITY)(adminPlanetInfo.x, adminPlanetInfo.y).toString()
        : mimcHash(hre.initializers.PLANETHASH_KEY)(
            adminPlanetInfo.x,
            adminPlanetInfo.y
          ).toString();

      const adminPlanetCoords = {
        x: adminPlanetInfo.x,
        y: adminPlanetInfo.y,
      };
      const perlinValue = perlin(adminPlanetCoords, {
        key: hre.initializers.SPACETYPE_KEY,
        scale: hre.initializers.PERLIN_LENGTH_SCALE,
        mirrorX: hre.initializers.PERLIN_MIRROR_X,
        mirrorY: hre.initializers.PERLIN_MIRROR_Y,
        floor: true,
      });

      const createPlanetReceipt = await contract.createPlanet({
        ...adminPlanetInfo,
        location,
        perlin: perlinValue,
      });
      await createPlanetReceipt.wait();
      if (adminPlanetInfo.revealLocation) {
        const pfArgs = await makeRevealProof(
          adminPlanetInfo.x,
          adminPlanetInfo.y,
          hre.initializers.PLANETHASH_KEY,
          hre.initializers.SPACETYPE_KEY,
          hre.initializers.PERLIN_LENGTH_SCALE,
          hre.initializers.PERLIN_MIRROR_X,
          hre.initializers.PERLIN_MIRROR_Y,
          hre.initializers.DISABLE_ZK_CHECKS,
          hre.initializers.PLANET_RARITY
        );
        const revealPlanetReceipt = await contract.revealLocation(...pfArgs);
        await revealPlanetReceipt.wait();
      }
      console.log(`created admin planet at (${adminPlanetInfo.x}, ${adminPlanetInfo.y})`);
    } catch (e) {
      console.log(`error creating planet at (${adminPlanetInfo.x}, ${adminPlanetInfo.y}):`);
      console.log(e);
    }
  }
}

async function makeRevealProof(
  x: number,
  y: number,
  planetHashKey: number,
  spaceTypeKey: number,
  scale: number,
  mirrorX: boolean,
  mirrorY: boolean,
  zkChecksDisabled: boolean,
  planetRarity: number
): Promise<RevealSnarkContractCallArgs> {
  if (zkChecksDisabled) {
    const location = fakeHash(planetRarity)(x, y).toString();
    const perlinValue = perlin(
      { x, y },
      {
        key: spaceTypeKey,
        scale,
        mirrorX,
        mirrorY,
        floor: true,
      }
    );
    const { proof, publicSignals } = fakeProof([
      location,
      perlinValue.toString(),
      modPBigInt(x).toString(),
      modPBigInt(y).toString(),
      planetHashKey.toString(),
      spaceTypeKey.toString(),
      scale.toString(),
      mirrorX ? '1' : '0',
      mirrorY ? '1' : '0',
    ]);
    return buildContractCallArgs(proof, publicSignals) as RevealSnarkContractCallArgs;
  } else {
    const { proof, publicSignals }: SnarkJSProofAndSignals = await snarkjs.groth16.fullProve(
      {
        x: modPBigInt(x).toString(),
        y: modPBigInt(y).toString(),
        PLANETHASH_KEY: planetHashKey.toString(),
        SPACETYPE_KEY: spaceTypeKey.toString(),
        SCALE: scale.toString(),
        xMirror: mirrorX ? '1' : '0',
        yMirror: mirrorY ? '1' : '0',
      },
      revealSnarkWasmPath,
      revealSnarkZkeyPath
    );

    return buildContractCallArgs(proof, publicSignals) as RevealSnarkContractCallArgs;
  }
}

//adminGiveSpaceShip

//adminInitializePlanet

task('admin:setPlanetTransferEnabled', 'resume the game')
  .addPositionalParam(
    'enabled',
    'whether or not the planet transfer functionality is enabled',
    undefined,
    types.boolean
  )
  .setAction(setPlanetTransferEnabled);

async function setPlanetTransferEnabled(
  args: { enabled: boolean },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const setTransferEnabledReceipt = await contract.setPlanetTransferEnabled(args.enabled);
  await setTransferEnabledReceipt.wait();
}

task('admin:setDynamicTimeFactor', 'resume the game')
  .addPositionalParam('factor', 'the dynamic time factor', undefined, types.int)
  .setAction(setDynamicTimeFactor);

async function setDynamicTimeFactor(args: { factor: number }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.setDynamicTimeFactor(args.factor);
  await receipt.wait();
}

task('admin:adminSetFinalScoreAndRank', 'admin set final scores & ranks')
  .addPositionalParam(
    'filePath',
    'the path to the file containing keys to disable',
    undefined,
    types.string
  )

  .setAction(adminSetFinalScoreAndRank);

async function adminSetFinalScoreAndRank(
  args: { filePath: string },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');

  const keyFileContents = fs.readFileSync(args.filePath).toString();
  const players = keyFileContents.split('\n').filter((k) => k.length > 0);

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const playerAddress: string[] = [];
  const playerScore: string[] = [];
  const playerRank: string[] = [];

  for (let i = 0; i < players.length; i++) {
    const playerInfo = players[i].split(' ');
    const addr = playerInfo[1];
    const score = playerInfo[2];
    const rank = playerInfo[0];
    playerAddress.push(addr);
    playerScore.push(score);
    playerRank.push(rank);
  }

  console.log(playerAddress);
  console.log(playerScore);
  console.log(playerRank);
  try {
    const receipt = await contract.adminSetFinalScoreAndRank(
      playerAddress,
      playerScore,
      playerRank,
      {
        gasPrice: Number(parseFloat(GAS_ADJUST_DELTA) * parseInt('5000000000')).toString(),
      }
    ); // 5gwei
    await receipt.wait();
  } catch (e) {
    console.log(e);
  }
}
