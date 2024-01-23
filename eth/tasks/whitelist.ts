import { GAS_ADJUST_DELTA } from '@dfares/constants';
import { generateKeys, keyHash, keysPerTx } from '@dfares/whitelist';
import * as fs from 'fs';
import { subtask, task, types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import * as path from 'path';

task('whitelist:getNAllowed', 'get the allowed accounts amount').setAction(getNAllowed);

async function getNAllowed(args: {}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const amount = await contract.getNAllowed();
  console.log('there are', amount.toString(), 'allowed account(s)');
}

task('whitelist:enable', 'enable whitelist').setAction(enableWhitelist);

async function enableWhitelist(args: {}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const tx = await contract.enableWhitelist();
  await tx.wait();

  const enabled = await contract.getWhitelistEnabled();
  console.log('whitelist enabled: ', enabled);
}

task('whitelist:disable', 'disable whitelist').setAction(disableWhitelist);

async function disableWhitelist(args: {}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const tx = await contract.disableWhitelist();
  await tx.wait();

  const enabled = await contract.getWhitelistEnabled();
  console.log('whitelist enabled: ', enabled);
}

task('whitelist:getWhitelistEnabled', 'get whitelist enabled').setAction(getWhitelistEnabled);

async function getWhitelistEnabled(args: {}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const enabled = await contract.getWhitelistEnabled();
  console.log('whitelist enabled: ', enabled);
}

task('whitelist:changeDrip', 'change the faucet amount for whitelisted players')
  .addPositionalParam('value', 'drip value (in ether or xDAI)', undefined, types.float)
  .setAction(changeDrip);

async function changeDrip(args: { value: number }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const txReceipt = await contract.changeDrip(hre.ethers.utils.parseEther(args.value.toString()));
  await txReceipt.wait();

  console.log(`changed drip to ${args.value}`);
}

task('whitelist:drip', 'get drip').setAction(getDrip);

async function getDrip(args: {}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const drip = await contract.drip();
  console.log('drip: ', drip.toString());
}

task('whitelist:disableKeys', 'disables keys stored in the given file path')
  .addPositionalParam(
    'filePath',
    'the path to the file containing keys to disable',
    undefined,
    types.string
  )
  .setAction(whitelistDisable);

async function whitelistDisable(args: { filePath: string }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');
  const keyFileContents = fs.readFileSync(args.filePath).toString();
  const keys = keyFileContents.split('\n').filter((k) => k.length > 0);

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  while (keys.length > 0) {
    const subset = keys.splice(0, Math.min(keys.length, 400));
    console.log(`clearing ${subset.length} keys`);
    const hashes: string[] = subset.map((x) => hre.ethers.utils.id(x));
    const akReceipt = await contract.disableKeys(hashes, {
      gasPrice: Number(parseFloat(GAS_ADJUST_DELTA) * parseInt('5000000000')).toString(),
    }); // 5gwei
    await akReceipt.wait();
  }
}

task('whitelist:generate', 'create n keys and add to whitelist contract')
  .addParam('output', 'the filepath in which to output', undefined, types.string)
  .addParam('amount', 'number of keys', undefined, types.int)
  .setAction(whitelistGenerate);

async function whitelistGenerate(
  args: { output: string; amount: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');

  const nKeys = args.amount;

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const filepath = path.resolve(args.output);

  await fs.promises.mkdir(path.dirname(filepath), { recursive: true });

  let allKeys: string[] = [];
  let keysGenerated = 0;
  for (let i = 0; i < nKeys / keysPerTx; i += 1) {
    const keysToGenerate = Math.min(nKeys - keysGenerated, keysPerTx);
    console.log(`Keyset ${i}: registering ${keysToGenerate} keys`);

    const keys = generateKeys(keysToGenerate);
    const keyHashes = keys.map(keyHash);

    try {
      const akReceipt = await contract.addKeys(keyHashes, {
        gasPrice: Number(parseFloat(GAS_ADJUST_DELTA) * parseInt('5000000000')).toString(),
      }); // 5gwei
      await akReceipt.wait();

      allKeys = allKeys.concat(keys);
      keysGenerated += keysPerTx;

      for (const key of keys) {
        await fs.promises.appendFile(filepath, key + '\n');
      }
    } catch (e) {
      console.log(`Error generating keyset ${i}: ${e}`);
    }
  }

  const balance = await hre.ethers.provider.getBalance(contract.address);
  console.log('whitelist balance:', hre.ethers.utils.formatEther(balance));
  console.log(`keys appended to: ${filepath}`);
}

task('whitelist:exists', 'check if previously whitelisted')
  .addOptionalParam('address', 'network address', undefined, types.string)
  .addOptionalParam('key', 'whitelist key', undefined, types.string)
  .setAction(whitelistExists);

async function whitelistExists(
  { address, key }: { address?: string; key?: string },
  hre: HardhatRuntimeEnvironment
) {
  if (key !== undefined && address !== undefined) {
    throw new Error(`Provided both key and address. Choose one.`);
  }

  if (address !== undefined) {
    return await hre.run('whitelist:existsAddress', { address });
  } else if (key !== undefined) {
    return await hre.run('whitelist:existsKeyHash', { key });
  }
}

subtask('whitelist:existsAddress', 'determine if an address is whitelisted')
  .addParam('address', 'network address', undefined, types.string)
  .setAction(whitelistExistsAddress);

async function whitelistExistsAddress(args: { address: string }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const isAddress = hre.ethers.utils.isAddress(args.address);
  if (!isAddress) {
    throw new Error(`Address ${args.address} is NOT a valid address.`);
  }

  const isWhitelisted = await contract.isWhitelisted(args.address);

  const balance = await hre.ethers.provider.getBalance(contract.address);
  console.log('whitelist balance:', hre.ethers.utils.formatEther(balance));

  console.log(`Player ${args.address} is${isWhitelisted ? '' : ' NOT'} whitelisted.`);
}

subtask('whitelist:existsKeyHash', 'determine if a whitelist key is valid')
  .addParam('key', 'whitelist key', undefined, types.string)
  .setAction(whitelistExistsKeyHash);

async function whitelistExistsKeyHash(args: { key: string }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const hash = keyHash(args.key);
  const isValid = await contract.isKeyHashValid(hash);

  const balance = await hre.ethers.provider.getBalance(contract.address);
  console.log('whitelist balance:', hre.ethers.utils.formatEther(balance));

  console.log(`Key ${args.key} is${isValid ? '' : ' NOT'} valid.`);
}

task('whitelist:register', 'add address(es) to whitelist')
  .addParam(
    'address',
    'network address (or comma seperated list of addresses)',
    undefined,
    types.string
  )
  .setAction(whitelistRegister);

async function whitelistRegister(args: { address: string }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  for (const address of args.address.split(',')) {
    const isAddress = hre.ethers.utils.isAddress(address);
    if (!isAddress) {
      throw new Error(`Address ${address} is NOT a valid address.`);
    }

    const isWhitelisted = await contract.isWhitelisted(address);
    if (isWhitelisted) {
      throw new Error(`Address ${address} is already whitelisted.`);
    }

    const whitelistTx = await contract.addToWhitelist(address);
    await whitelistTx.wait();

    const balance = await hre.ethers.provider.getBalance(contract.address);
    console.log('whitelist balance:', hre.ethers.utils.formatEther(balance));

    console.log(`[${new Date()}] Registered player ${address}.`);
  }
}

task('whitelist:batchAddToWhitelist', 'add addresses to whitelist')
  .addPositionalParam(
    'filePath',
    'the path to the file containing addresses to whitelist',
    undefined,
    types.string
  )
  .setAction(batchAddToWhitelist);

async function batchAddToWhitelist(args: { filePath: string }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');
  const keyFileContents = fs.readFileSync(args.filePath).toString();
  const players = keyFileContents.split('\n').filter((k) => k.length > 0);

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const addressList = [];
  for (let i = 0; i < players.length; i++) {
    const addr = players[i];
    addressList.push(addr);
    console.log(i, addr);
  }

  try {
    const receipt = await contract.batchAddToWhitelist(addressList, {
      gasPrice: Number(parseFloat(GAS_ADJUST_DELTA) * parseInt('5000000000')).toString(),
    });
    await receipt.wait();
  } catch (e) {
    console.log(e);
  }
  return;
}

task('whitelist:setRelayerReward', 'enable/disable relayer rewards and set the reward amount')
  .addOptionalParam('enable', 'enable/disable relayer rewards', undefined, types.boolean)
  .addOptionalParam(
    'amount',
    'the amount of XDAI to transfer to relayers as a reward',
    undefined,
    types.int
  )
  .setAction(whitelistSetRelayerReward);

async function whitelistSetRelayerReward(
  args: { enable: boolean; amount: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const enabled = await contract.relayerRewardsEnabled();
  console.log(`Relayer rewards are currently: ${enabled ? 'ENABLED' : 'DISABLED'}`);
  const amount = await contract.relayerReward();
  console.log(
    `Relayer rewards are set at a value of ${hre.ethers.utils.formatEther(amount.toString())} XDAI.`
  );

  if (args.enable !== undefined) {
    console.log('...');
    const tx = await contract.setRelayerRewardsEnabled(args.enable);
    await tx.wait();
    console.log(`Relayer rewards have been: ${args.enable ? 'ENABLED' : 'DISABLED'}`);
  }

  if (args.amount !== undefined) {
    console.log('...');
    const tx = await contract.changeRelayerReward(
      hre.ethers.utils.parseEther(args.amount.toString(10))
    );
    await tx.wait();
    console.log(`Relayer rewards have been set to: ${args.amount} XDAI`);
  }
}
