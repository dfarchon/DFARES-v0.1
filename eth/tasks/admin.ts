import { CONTRACT_PRECISION } from '@dfares/constants';
import { fakeHash, mimcHash, modPBigInt, perlin } from '@dfares/hashing';
import {
  buildContractCallArgs,
  fakeProof,
  InitSnarkContractCallArgs,
  initSnarkWasmPath,
  initSnarkZkeyPath,
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
  console.log(pauseReceipt);
  await pauseReceipt.wait();
  console.log('admin:pause success');
}

task('admin:resume', 'resume the game').setAction(gameResume);

async function gameResume({}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const unpauseReceipt = await contract.unpause();
  console.log(unpauseReceipt);
  await unpauseReceipt.wait();
  console.log('admin:resume success');
}

task('admin:setHalfPrice', 'enable half-price entry fee').setAction(setHalfPrice);

async function setHalfPrice({}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.setHalfPrice();
  await receipt.wait();
  console.log('admin:setHalfPrice success');
}

task('admin:setUnHalfPrice', 'disable half-price entry fee').setAction(setUnHalfPrice);

async function setUnHalfPrice({}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.setUnHalfPrice();
  await receipt.wait();
  console.log('admin:setUnHalfPrice success');
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

task('admin:addScore', 'add player score')
  .addPositionalParam('address', '0x-prefixed address of a player', undefined, types.string)
  .addPositionalParam('amount', "the add score's amount")
  .setAction(addScore);

async function addScore(
  { address, amount }: { address: string; amount: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const receipt = await contract.addScore(address, amount);
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

task(
  'admin:safeSetOwner',
  'sets planet owner, initializing the planet first if needed (requires x/y coords for snark args)'
)
  .addPositionalParam('address', '0x-prefixed address of the new owner', undefined, types.string)
  .addPositionalParam('x', 'planet x coordinate', undefined, types.int)
  .addPositionalParam('y', 'planet y coordinate', undefined, types.int)
  .addOptionalPositionalParam(
    'radius',
    'spawn radius used in init proof (defaults to WORLD_RADIUS_MIN)',
    undefined,
    types.int
  )
  .setAction(safeSetOwner);

async function safeSetOwner(
  { address, x, y, radius }: { address: string; x: number; y: number; radius?: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const initRadius = radius ?? hre.initializers.WORLD_RADIUS_MIN;
  const pfArgs = await makeInitProof(
    x,
    y,
    initRadius,
    hre.initializers.PLANETHASH_KEY,
    hre.initializers.SPACETYPE_KEY,
    hre.initializers.PERLIN_LENGTH_SCALE,
    hre.initializers.PERLIN_MIRROR_X,
    hre.initializers.PERLIN_MIRROR_Y,
    hre.initializers.DISABLE_ZK_CHECKS,
    hre.initializers.PLANET_RARITY
  );
  const receipt = await contract.safeSetOwner(address, ...pfArgs);
  await receipt.wait();
  console.log(`admin:safeSetOwner success for (${x}, ${y}) -> ${address}`);
}

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

task('admin:setInnerRadius', 'change the radius')
  .addPositionalParam('radius', 'the radius', undefined, types.int)
  .setAction(gameSetInnerRadius);

async function gameSetInnerRadius(args: { radius: number }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const setRadiusReceipt = await contract.adminSetInnerRadius(args.radius);
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

  const receipt = await contract.changeBurnPlanetCooldown(args.cooldown);
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

task('admin:changeActivateArtifactCooldown', 'change activate artifact cooldown')
  .addPositionalParam('cooldown', 'the cooldown', undefined, types.int)
  .setAction(changeActivateArtifactCooldown);

async function changeActivateArtifactCooldown(
  args: { cooldown: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.changeActivateArtifactCooldown(args.cooldown);
  await receipt.wait();
}

task('admin:changeBuyArtifactCooldown', 'change buy artifact cooldown')
  .addPositionalParam('cooldown', 'the cooldown', undefined, types.int)
  .setAction(changeBuyArtifactCooldown);

async function changeBuyArtifactCooldown(
  args: { cooldown: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.changeBuyArtifactCooldown(args.cooldown);
  await receipt.wait();
}

task('admin:changeBuyEnergyCooldown', 'change buy energy cooldown')
  .addPositionalParam('cooldown', 'the cooldown', undefined, types.int)
  .setAction(changeBuyEnergyCooldown);

async function changeBuyEnergyCooldown(args: { cooldown: number }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.changeBuyEnergyCooldown(args.cooldown);
  await receipt.wait();
}

task('admin:changeBuyEnergyLevelFees', 'change buy energy level fees')
  .addPositionalParam('level', 'the planet level', undefined, types.int)
  .addPositionalParam('fee', 'the fee per second (gwei multiplier)', undefined, types.int)
  .setAction(changeBuyEnergyLevelFees);

async function changeBuyEnergyLevelFees(
  args: { level: number; fee: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.changeBuyEnergyLevelFees(args.level, args.fee);
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

task('admin:setKardashevEndTime', 'change kardashev end time')
  .addPositionalParam('endtime', 'the endtime', undefined, types.int)
  .setAction(setKardashevEndTime);

async function setKardashevEndTime(args: { endtime: number }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.setKardashevEndTime(args.endtime);
  await receipt.wait();
}

task('admin:setKardashevCooldown', 'change kardashev planet cooldown')
  .addPositionalParam('cooldown', 'the cooldown', undefined, types.int)
  .setAction(setKardashevCooldown);

async function setKardashevCooldown(args: { cooldown: number }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.setKardashevCooldowm(args.cooldown);
  await receipt.wait();
}

task('admin:setTransferEnergyCooldown', 'change transfer energy (blue planet) cooldown')
  .addPositionalParam('cooldown', 'the cooldown', undefined, types.int)
  .setAction(setTransferEnergyCooldown);

async function setTransferEnergyCooldown(
  args: { cooldown: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.setTransferEnergyCooldown(args.cooldown);
  await receipt.wait();
}

task('admin:changeKardashevEffectRadius', 'change kardashev effect radius')
  .addPositionalParam('level', 'the planet level', undefined, types.int)
  .addPositionalParam('radius', 'the radius', undefined, types.int)
  .setAction(changeKardashevEffectRadius);

async function changeKardashevEffectRadius(
  args: { level: number; radius: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.changeKardashevEffectRadius(args.level, args.radius);
  await receipt.wait();
}

task('admin:changeKardashevRequireSilver', 'change kardashev require silver amount')
  .addPositionalParam('level', 'the planet level', undefined, types.int)
  .addPositionalParam('silver', 'the silver amount', undefined, types.int)
  .setAction(changeKardashevRequireSilver);

async function changeKardashevRequireSilver(
  args: { level: number; silver: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.changeKardashevRequireSilverAmounts(
    args.level,
    Number(args.silver * CONTRACT_PRECISION)
  );
  await receipt.wait();
}

task('admin:changeTransferEnergyRequireSilver', 'change transfer energy require silver amount')
  .addPositionalParam('level', 'the planet level', undefined, types.int)
  .addPositionalParam('silver', 'the silver amount', undefined, types.int)
  .setAction(changeTransferEnergyRequireSilver);

async function changeTransferEnergyRequireSilver(
  args: { level: number; silver: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.changeTransferEnergyRequireSilverAmounts(
    args.level,
    Number(args.silver * CONTRACT_PRECISION)
  );
  await receipt.wait();
}

task('admin:setEntryFee', 'change Entry Fee')
  .addPositionalParam('fee', 'the entry fee', undefined, types.int)
  .setAction(setEntryFee);

async function setEntryFee(args: { fee: number }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.setEntryFee(args.fee);
  await receipt.wait();
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

async function makeInitProof(
  x: number,
  y: number,
  radius: number,
  planetHashKey: number,
  spaceTypeKey: number,
  scale: number,
  mirrorX: boolean,
  mirrorY: boolean,
  zkChecksDisabled: boolean,
  planetRarity: number
): Promise<InitSnarkContractCallArgs> {
  const targetDistFromOriginSquare = (x ** 2 + y ** 2).toString();

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
      radius.toString(),
      planetHashKey.toString(),
      spaceTypeKey.toString(),
      scale.toString(),
      mirrorX ? '1' : '0',
      mirrorY ? '1' : '0',
      targetDistFromOriginSquare,
    ]);
    return buildContractCallArgs(proof, publicSignals) as InitSnarkContractCallArgs;
  } else {
    const { proof, publicSignals }: SnarkJSProofAndSignals = await snarkjs.groth16.fullProve(
      {
        x: modPBigInt(x).toString(),
        y: modPBigInt(y).toString(),
        r: radius.toString(),
        PLANETHASH_KEY: planetHashKey.toString(),
        SPACETYPE_KEY: spaceTypeKey.toString(),
        SCALE: scale.toString(),
        xMirror: mirrorX ? '1' : '0',
        yMirror: mirrorY ? '1' : '0',
        targetDistFromOriginSquare,
      },
      initSnarkWasmPath,
      initSnarkZkeyPath
    );

    return buildContractCallArgs(proof, publicSignals) as InitSnarkContractCallArgs;
  }
}

task('admin:adminGiveSpaceShip', 'give a spaceship artifact to a player on a planet')
  .addPositionalParam('planetId', 'non-0x-prefixed planet locationId', undefined, types.string)
  .addPositionalParam('address', '0x-prefixed address of the owner', undefined, types.string)
  .addPositionalParam('artifactType', 'ArtifactType enum value', undefined, types.int)
  .setAction(adminGiveSpaceShip);

async function adminGiveSpaceShip(
  { planetId, address, artifactType }: { planetId: string; address: string; artifactType: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.adminGiveSpaceShip(
    BigNumber.from('0x' + planetId),
    address,
    artifactType
  );
  await receipt.wait();
  console.log(`admin:adminGiveSpaceShip success on planet 0x${planetId}`);
}

task('admin:adminInitializePlanet', 'initialize a planet with perlin and distance from origin')
  .addPositionalParam('planetId', 'non-0x-prefixed planet locationId', undefined, types.string)
  .addPositionalParam('perlin', 'perlin value at the planet location', undefined, types.int)
  .addPositionalParam(
    'distFromOriginSquare',
    'squared distance from origin (x^2 + y^2)',
    undefined,
    types.int
  )
  .setAction(adminInitializePlanet);

async function adminInitializePlanet(
  {
    planetId,
    perlin: perlinValue,
    distFromOriginSquare,
  }: { planetId: string; perlin: number; distFromOriginSquare: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const receipt = await contract.adminInitializePlanet(
    BigNumber.from('0x' + planetId),
    perlinValue,
    distFromOriginSquare
  );
  await receipt.wait();
  console.log(`admin:adminInitializePlanet success for 0x${planetId}`);
}

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
      playerRank
      // {
      //   gasPrice: Number(parseFloat(GAS_ADJUST_DELTA) * parseInt('5000000000')).toString(),
      // }
    );

    console.log(receipt);
    await receipt.wait();
    console.log('admin:adminSetFinalScoreAndRank success');
  } catch (e) {
    console.log(e);
  }
}

/**
 * Union
 */

task('admin:setUnionCreationFee', 'change union creation fee')
  .addPositionalParam('fee', 'the fee', undefined, types.int)
  .setAction(adminSetUnionCreationFee);

async function adminSetUnionCreationFee(args: { fee: number }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const receipt = await contract.adminSetUnionCreationFee(args.fee);
  await receipt.wait();
}

task('admin:setUnionUpgradeFeePreMember', 'change union creation fee')
  .addPositionalParam('fee', 'the fee', undefined, types.int)
  .setAction(adminSetUnionUpgradeFeePreMember);

async function adminSetUnionUpgradeFeePreMember(
  args: { fee: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const receipt = await contract.adminSetUnionUpgradeFeePreMember(args.fee);
  await receipt.wait();
}

task('admin:adminSetUnionRejoinCooldown', 'change union creation fee')
  .addPositionalParam('cooldown', 'the cooldown', undefined, types.int)
  .setAction(adminSetUnionRejoinCooldown);

async function adminSetUnionRejoinCooldown(
  args: { cooldown: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const receipt = await contract.adminSetUnionRejoinCooldown(args.cooldown);
  await receipt.wait();
}
