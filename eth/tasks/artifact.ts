// import { decodeArrival, decodeArtifact } from '@dfares/serde';
import { task, types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

task('artifact:read', 'Read Artifact data from Tokens contract').setAction(artifactsRead);

async function artifactsRead({}, hre: HardhatRuntimeEnvironment) {
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const name = await contract.name();
  console.log(name);

  const id = await contract.tokenByIndex(1);
  console.log(id.toString());

  const token = await contract.getArtifact(id);
  console.log(token);

  const URI = await contract.tokenURI(id);
  console.log(URI);
}

task('artifact:getArtifactsOnPlanet', '')
  .addOptionalParam('planetid', 'planet locationId', undefined, types.string)
  .setAction(getArtifactsOnPlanet);

async function getArtifactsOnPlanet(args: { planetId: string }, hre: HardhatRuntimeEnvironment) {
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
  const planetId = args.planetId;
  const res = await contract.getArtifactsOnPlanet(planetId);
  console.log(res);
}

// NOTE: after install dfares/serde
// task('artifact:getArtifactById', '')
//   .addOptionalParam('id', 'id', undefined, types.string)
//   .setAction(getArtifactById);

// async function getArtifactById(args: { id: string }, hre: HardhatRuntimeEnvironment) {
//   const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

//   const artifactId = args.id;

//   const rawArtifact = await contract.getArtifactById(artifactId);
//   const artifact = decodeArtifact(rawArtifact);
//   // console.log(artifact);

//   const voyoageId = artifact.onVoyageId;
//   if (voyoageId) {
//     const planetArrival = await contract.planetArrivals(voyoageId);
//     const arrival = decodeArrival(planetArrival);
//     console.log(arrival);
//   }

//   // const artifactId = '';
//   // const rawArtifact = await contract.getArtifactById(artifactId);
//   // const artifact = decodeArtifact(rawArtifact);
//   // console.log(artifact);
// }

// task('artifact:dev', '').setAction(dev);

// async function dev(args: {}, hre: HardhatRuntimeEnvironment) {
//   const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

//   // const artifactId = '';
//   // const rawArtifact = await contract.getArtifactById(artifactId);
//   // const artifact = decodeArtifact(rawArtifact);
//   // console.log(artifact);

//   const voyoageId = '149150';
//   if (voyoageId) {
//     const planetArrival = await contract.planetArrivals(voyoageId);
//     const arrival = decodeArrival(planetArrival);
//     console.log(arrival);
//   }
// }

// task('artifact:op', '').setAction(op);

// async function op(args: {}, hre: HardhatRuntimeEnvironment) {
//   const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);
//   const name = await contract.name();
//   console.log(name, '');

//   const totalSupply = await contract.totalSupply();
//   console.log('supply:', totalSupply.toString());

//   const allArtifacts = [];

//   for (let i = 0; i < totalSupply.toNumber(); i += 500) {
//     let l = i;
//     let r = Math.min(i + 500, totalSupply.toNumber());
//     console.log(l, r);
//     const tmp = await contract.bulkGetArtifacts(l, r);
//     for (let j = 0; j < tmp.length; j++) {
//       const artifact = tmp[j];
//       allArtifacts.push(artifact);
//     }
//   }

//   console.log('artifact length:', allArtifacts.length);

//   const rawGear = allArtifacts.filter((rawArtifact) => {
//     const artifact = decodeArtifact(rawArtifact);

//     return artifact.controller === '' && artifact.artifactType === 20;
//   });

//   const gear = decodeArtifact(rawGear[0]);

//   console.log(gear);
// }
