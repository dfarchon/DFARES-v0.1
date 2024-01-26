import { decodeArrival, decodeArtifact } from '@dfares/serde';
import { task, types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

task('artifact:read', 'Read Artifact data from Tokens contract').setAction(artifactsRead);

async function artifactsRead({}, hre: HardhatRuntimeEnvironment) {
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const id = await contract.tokenByIndex(0);
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

task('artifact:getArtifactById', '')
  .addOptionalParam('id', 'id', undefined, types.string)
  .setAction(getArtifactById);

async function getArtifactById(args: { id: string }, hre: HardhatRuntimeEnvironment) {
  const contract = await hre.ethers.getContractAt('DarkForest', hre.contracts.CONTRACT_ADDRESS);

  const artifactId = args.id;

  const rawArtifact = await contract.getArtifactById(artifactId);
  const artifact = decodeArtifact(rawArtifact);
  // console.log(artifact);

  const voyoageId = artifact.onVoyageId;
  if (voyoageId) {
    const planetArrival = await contract.planetArrivals(voyoageId);
    const arrival = decodeArrival(planetArrival);
    console.log(arrival);
  }

  // const artifactId = '0x4448b3bcc7142836e9c79c0a94cc9018d5ea93da12e90f6b7c730ba0b51acad7';
  // const rawArtifact = await contract.getArtifactById(artifactId);
  // const artifact = decodeArtifact(rawArtifact);
  // console.log(artifact);
}
