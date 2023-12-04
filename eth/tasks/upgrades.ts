import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DiamondChanges } from '../utils/diamond';
import {
  deployAdminFacet,
  deployArtifactFacet,
  deployCaptureFacet,
  deployCoreFacet,
  deployDebugFacet,
  deployGetterOneFacet,
  deployGetterTwoFacet,
  deployLibraries,
  deployLobbyFacet,
  deployMoveFacet,
  deployPinkBombFacet,
  deployRewardFacet,
  deployVerifierFacet,
  deployWhitelistFacet,
} from './deploy';

task('upgrade', 'upgrade contracts and replace in the diamond').setAction(upgrade);

async function upgrade({}, hre: HardhatRuntimeEnvironment) {
  await hre.run('utils:assertChainId');

  const isDev = hre.network.name === 'localhost' || hre.network.name === 'hardhat';

  // need to force a compile for tasks
  await hre.run('compile');

  const diamond = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  console.log('previous facets');

  const previousFacets = await diamond.facets();
  console.log('changes');

  const changes = new DiamondChanges(previousFacets);
  console.log('libraries');

  const libraries = await deployLibraries({}, hre);

  // Dark Forest facets
  console.log('coreFacets');
  const coreFacet = await deployCoreFacet({}, libraries, hre);
  console.log('moveFacets');
  const moveFacet = await deployMoveFacet({}, libraries, hre);

  console.log('artifactFacets');
  const artifactFacet = await deployArtifactFacet(
    { diamondAddress: diamond.address },
    libraries,
    hre
  );
  console.log('getterOneFacets');

  const getterOneFacet = await deployGetterOneFacet({}, libraries, hre);

  console.log('getterTwoFacets');
  const getterTwoFacet = await deployGetterTwoFacet({}, libraries, hre);

  console.log('whitelistFacets');

  const whitelistFacet = await deployWhitelistFacet({}, libraries, hre);
  console.log('adminFacets');

  const adminFacet = await deployAdminFacet({}, libraries, hre);
  console.log('verifyFacets');

  const verifierFacet = await deployVerifierFacet({}, libraries, hre);
  console.log('lobbyFacets');

  const lobbyFacet = await deployLobbyFacet({}, libraries, hre);

  console.log('captureFacets');

  const captureFacet = await deployCaptureFacet({}, libraries, hre);
  console.log('pinkBombFacets');

  const pinkBombFacet = await deployPinkBombFacet({}, libraries, hre);
  console.log('rewardFacets');

  const rewardFacet = await deployRewardFacet({}, libraries, hre);

  // The `cuts` to perform for Dark Forest facets

  const darkForestCuts = [
    ...changes.getFacetCuts('DFCoreFacet', coreFacet),
    ...changes.getFacetCuts('DFMoveFacet', moveFacet),
    ...changes.getFacetCuts('DFCaptureFacet', captureFacet),
    ...changes.getFacetCuts('DFPinkBombFacet', pinkBombFacet),
    ...changes.getFacetCuts('DFArtifactFacet', artifactFacet),
    ...changes.getFacetCuts('DFGetterOneFacet', getterOneFacet),
    ...changes.getFacetCuts('DFGetterTwoFacet', getterTwoFacet),
    ...changes.getFacetCuts('DFWhitelistFacet', whitelistFacet),
    ...changes.getFacetCuts('DFVerifierFacet', verifierFacet),
    ...changes.getFacetCuts('DFAdminFacet', adminFacet),
    ...changes.getFacetCuts('DFLobbyFacet', lobbyFacet),
    ...changes.getFacetCuts('DFRewardFacet', rewardFacet),
  ];

  if (isDev) {
    const debugFacet = await deployDebugFacet({}, libraries, hre);
    darkForestCuts.push(...changes.getFacetCuts('DFDebugFacet', debugFacet));
  }

  // The `cuts` to remove any old, unused functions
  const removeCuts = changes.getRemoveCuts(darkForestCuts);

  const shouldUpgrade = await changes.verify();
  if (!shouldUpgrade) {
    console.log('Upgrade aborted');
    return;
  }

  const toCut = [...darkForestCuts, ...removeCuts];

  // As mentioned in the `deploy` task, EIP-2535 specifies that the `diamondCut`
  // function takes two optional arguments: address _init and bytes calldata _calldata
  // However, in a standard upgrade, no state modifications are done, so the 0x0 address
  // and empty calldata are specified for those `diamondCut` parameters.
  // If the Diamond storage needs to be changed on an upgrade, a contract would need to be
  // deployed and these variables would need to be adjusted similar to the `deploy` task.
  const initAddress = hre.ethers.constants.AddressZero;
  const initFunctionCall = '0x';

  const upgradeTx = await diamond.diamondCut(toCut, initAddress, initFunctionCall);
  const upgradeReceipt = await upgradeTx.wait();
  if (!upgradeReceipt.status) {
    throw Error(`Diamond cut failed: ${upgradeTx.hash}`);
  }
  console.log('Completed diamond cut');

  // TODO: Upstream change to update task name from `hardhat-4byte-uploader`
  if (!isDev) {
    try {
      await hre.run('upload-selectors', { noCompile: true });
    } catch {
      console.warn('WARNING: Unable to update 4byte database with our selectors');
      console.warn('Please run the `upload-selectors` task manually so selectors can be reversed');
    }
  }

  console.log('Upgraded successfully. Godspeed cadet.');
}
