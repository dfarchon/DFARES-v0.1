import * as fs from 'fs';
import { task, types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

task('batch:account', 'show account(s) in the given file path')
  .addPositionalParam(
    'filePath',
    'the path to the file containing accounts to show',
    undefined,
    types.string
  )
  .setAction(showAccount);

async function showAccount(args: { filePath: string }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');
  const accountFileContents = fs.readFileSync(args.filePath).toString();
  const accounts = accountFileContents.split('\n').filter((k) => k.length > 0);
  console.log(accounts);
  return;
}

task('batch:whitelist', 'whitelist account(s) in the given file path')
  .addPositionalParam(
    'filePath',
    'the path to the file containing accounts to whitelist',
    undefined,
    types.string
  )
  .setAction(batchWhitelist);

async function batchWhitelist(args: { filePath: string }, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');
  const accountFileContents = fs.readFileSync(args.filePath).toString();
  const accounts = accountFileContents.split('\n').filter((k) => k.length > 0);
  //   console.log(accounts);

  console.log('account number: ' + accounts.length);

  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  for (const address of accounts) {
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

task('batch:send', 'send token to account(s) in the given file path')
  .addPositionalParam(
    'filePath',
    'the path to the file containing accounts to whitelist',
    undefined,
    types.string
  )
  .addPositionalParam('value', 'drip value (in ether or xDAI)', undefined, types.float)

  .setAction(batchSend);

async function batchSend(
  args: { filePath: string; value: number },
  hre: HardhatRuntimeEnvironment
) {
  await hre.run('utils:assertChainId');
  const accountFileContents = fs.readFileSync(args.filePath).toString();
  const accounts = accountFileContents.split('\n').filter((k) => k.length > 0);

  console.log('account number: ' + accounts.length);

  const [admin] = await hre.ethers.getSigners();
  const beginBalance = await hre.ethers.provider.getBalance(admin.address);

  console.log('admin:', admin.address);
  console.log('balance:', hre.ethers.utils.formatEther(beginBalance));

  for (const address of accounts) {
    const isAddress = hre.ethers.utils.isAddress(address);
    if (!isAddress) {
      throw new Error(`Address ${address} is NOT a valid address.`);
    }
    console.log('address:', address);
    const tx = await admin.sendTransaction({
      to: address,
      value: hre.ethers.utils.parseEther(args.value.toString()), // Sends exactly 1.0 ether
    });

    await tx.wait();

    const balance = await hre.ethers.provider.getBalance(admin.address);
    console.log('admin balance:', hre.ethers.utils.formatEther(balance));
    const balance2 = await hre.ethers.provider.getBalance(address);
    console.log('receive account balance: ', hre.ethers.utils.formatEther(balance2));
    console.log('-------------------------------------------------');
  }
}
