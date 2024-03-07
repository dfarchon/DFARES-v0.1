import { mimcHash, perlin } from '@dfares/hashing';
import { locationIdFromBigInt } from '@dfares/serde';
import { Chunk, PerlinConfig, Rectangle, WorldLocation } from '@dfares/types';
import * as bigInt from 'big-integer';
import { BigInteger } from 'big-integer';
import { LOCATION_ID_UB } from '../../Frontend/Utils/constants';
import { MinerWorkerMessage } from '../../_types/global/GlobalTypes';
import { getPlanetLocations } from './permutation';

/* eslint-disable @typescript-eslint/no-explicit-any */
const ctx: Worker = self as any;
/* eslint-enable @typescript-eslint/no-explicit-any */

const exploreChunk = (
  chunkFootprint: Rectangle,
  workerIndex: number,
  totalWorkers: number,
  planetRarity: number,
  planetLevelDist: number[],
  planetRaritiesDist: number[],
  jobId: number,
  useFakeHash: boolean,
  planetHashKey: number,
  spaceTypeKey: number,
  biomebaseKey: number,
  perlinLengthScale: number,
  perlinMirrorX: boolean,
  perlinMirrorY: boolean
) => {
  const planetHashFn = mimcHash(planetHashKey);
  const spaceTypePerlinOpts: PerlinConfig = {
    key: spaceTypeKey,
    scale: perlinLengthScale,
    mirrorX: perlinMirrorX,
    mirrorY: perlinMirrorY,
    floor: true,
  };
  const biomebasePerlinOpts: PerlinConfig = {
    key: biomebaseKey,
    scale: perlinLengthScale,
    mirrorX: perlinMirrorX,
    mirrorY: perlinMirrorY,
    floor: true,
  };

  let planetLocations: WorldLocation[] = [];
  if (useFakeHash) {
    planetLocations =
      workerIndex > 0
        ? []
        : getPlanetLocations(
            spaceTypeKey,
            biomebaseKey,
            perlinLengthScale,
            perlinMirrorY,
            perlinMirrorY
          )(chunkFootprint, planetRarity);
  } else {


    const planetRarityBI: BigInteger = bigInt(planetRarity);
    let tmpRarity: BigInteger = bigInt(0);
    let count = 0;
    const { x: bottomLeftX, y: bottomLeftY } = chunkFootprint.bottomLeft;
    const { sideLength } = chunkFootprint;
    for (let x = bottomLeftX; x < bottomLeftX + sideLength; x++) {
      for (let y = bottomLeftY; y < bottomLeftY + sideLength; y++) {
        if (count % totalWorkers === workerIndex) {
          //MYTODO: FICK DDY
          // console.log(planetLevelDist, planetRaritiesDist, x, y, "#################");
          const distFromOriginSquare = x ** 2 + y ** 2;

          if(distFromOriginSquare > planetLevelDist[0] * planetLevelDist[0]) tmpRarity = bigInt(planetRaritiesDist[0]);
          for (let i = 0; i < planetLevelDist.length - 1; i++) {
            if (
              distFromOriginSquare < planetLevelDist[i] * planetLevelDist[i] &&
              distFromOriginSquare > planetLevelDist[i + 1] * planetLevelDist[i + 1]
            ) {
              tmpRarity = bigInt(planetRaritiesDist[i+1]);
            }
          }

          if(distFromOriginSquare < planetLevelDist[planetLevelDist.length - 1] * planetLevelDist[planetLevelDist.length - 1]) tmpRarity = bigInt(planetRaritiesDist[planetRaritiesDist.length - 1]);




          const hash: BigInteger = planetHashFn(x, y);
          if (hash.lesser(LOCATION_ID_UB.divide(tmpRarity))) {   //planetRarityBI
            planetLocations.push({
              coords: { x, y },
              hash: locationIdFromBigInt(hash),
              perlin: perlin({ x, y }, spaceTypePerlinOpts),
              biomebase: perlin({ x, y }, biomebasePerlinOpts),
            });
          }
        }
        count += 1;
      }
    }
  }
  const chunkCenter = {
    x: chunkFootprint.bottomLeft.x + chunkFootprint.sideLength / 2,
    y: chunkFootprint.bottomLeft.y + chunkFootprint.sideLength / 2,
  };
  const chunkData: Chunk = {
    chunkFootprint,
    planetLocations,
    perlin: perlin(chunkCenter, { ...spaceTypePerlinOpts, floor: false }),
  };
  ctx.postMessage(JSON.stringify([chunkData, jobId]));
};

ctx.addEventListener('message', (e: MessageEvent) => {
  const exploreMessage: MinerWorkerMessage = JSON.parse(e.data) as MinerWorkerMessage;

  exploreChunk(
    exploreMessage.chunkFootprint,
    exploreMessage.workerIndex,
    exploreMessage.totalWorkers,
    exploreMessage.planetRarity,
    exploreMessage.planetLevelDist,
    exploreMessage.planetRaritiesDist,
    exploreMessage.jobId,
    exploreMessage.useMockHash,
    exploreMessage.planetHashKey,
    exploreMessage.spaceTypeKey,
    exploreMessage.biomebaseKey,
    exploreMessage.perlinLengthScale,
    exploreMessage.perlinMirrorX,
    exploreMessage.perlinMirrorY
  );
});
