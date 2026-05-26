import { ArtifactType } from '@dfares/types';
import { expect } from 'chai';
import {
  conquerUnownedPlanet,
  fixtureLoader,
  increaseBlockchainTime,
  makeInitArgs,
  makeMoveArgs,
} from './utils/TestUtils';
import { defaultWorldFixture, World } from './utils/TestWorld';
import {
  LVL1_ASTEROID_1,
  LVL1_PLANET_DEEP_SPACE,
  LVL2_PLANET_SPACE,
  SPAWN_PLANET_1,
  SPAWN_PLANET_2,
} from './utils/WorldConstants';

describe('Space Ships', function () {
  let world: World;

  async function worldFixture() {
    const world = await fixtureLoader(defaultWorldFixture);
    let initArgs = makeInitArgs(SPAWN_PLANET_1);
    await world.user1Core.initializePlayer(...initArgs);
    await increaseBlockchainTime();

    initArgs = makeInitArgs(SPAWN_PLANET_2);
    await world.user2Core.initializePlayer(...initArgs);
    await increaseBlockchainTime();

    return world;
  }

  beforeEach(async function () {
    world = await fixtureLoader(worldFixture);
  });

  describe('spawning your ships', function () {
    it('gives you the configured space ships', async function () {
      expect((await world.user1Core.getArtifactsOnPlanet(SPAWN_PLANET_1.id)).length).to.be.equal(6);
    });

    it('can only be done once per player', async function () {
      await expect(world.user1Core.giveSpaceShips(SPAWN_PLANET_1.id)).to.be.revertedWith(
        'player already claimed ships'
      );
    });

    describe('spawning on planet you do not own', async function () {
      it('reverts', async function () {
        await expect(world.user2Core.giveSpaceShips(LVL2_PLANET_SPACE.id)).to.be.revertedWith(
          'player already claimed ships'
        );
      });
    });
  });

  describe('using the Titan', async function () {
    it('pauses energy regeneration on planets', async function () {
      const titan = (await world.user1Core.getArtifactsOnPlanet(SPAWN_PLANET_1.id)).find(
        (a) => a.artifact.artifactType === ArtifactType.ShipTitan
      )?.artifact;

      // Move Titan to planet
      await world.user1Core.move(
        ...makeMoveArgs(SPAWN_PLANET_1, LVL1_ASTEROID_1, 1000, 0, 0, titan?.id)
      );
      await increaseBlockchainTime();

      await conquerUnownedPlanet(world, world.user1Core, SPAWN_PLANET_1, LVL1_ASTEROID_1);
      await world.contract.setOwner(LVL1_ASTEROID_1.id, world.user1.address);
      await world.contract.adminFillPlanet(LVL1_ASTEROID_1.id);

      const previousPlanet = await world.contract.planets(LVL1_ASTEROID_1.id);
      const sendingPopulation = previousPlanet.population.sub(1);

      // Move energy off of planet and wait
      await world.user1Core.move(
        ...makeMoveArgs(LVL1_ASTEROID_1, SPAWN_PLANET_1, 100, sendingPopulation, 0)
      );
      await increaseBlockchainTime();

      const currentPlanetPopulation = (await world.contract.planets(LVL1_ASTEROID_1.id)).population;
      const expectedPopulation = previousPlanet.population.sub(sendingPopulation);
      // Population did not grow
      await world.contract.refreshPlanet(LVL1_ASTEROID_1.id);
      expect(currentPlanetPopulation).to.be.equal(expectedPopulation);

      await conquerUnownedPlanet(world, world.user1Core, SPAWN_PLANET_1, LVL1_PLANET_DEEP_SPACE);
      await world.contract.setOwner(LVL1_PLANET_DEEP_SPACE.id, world.user1.address);
      await increaseBlockchainTime();

      // DUMP energy onto the Titan-ed planet
      for (let i = 0; i < 30; i++) {
        await world.contract.adminFillPlanet(LVL1_PLANET_DEEP_SPACE.id);
        const sourcePlanet = await world.contract.planets(LVL1_PLANET_DEEP_SPACE.id);
        await world.user1Core.move(
          ...makeMoveArgs(
            LVL1_PLANET_DEEP_SPACE,
            LVL1_ASTEROID_1,
            100,
            sourcePlanet.population.sub(1),
            0
          )
        );
        await increaseBlockchainTime();
      }

      // It should not overflow
      await world.contract.refreshPlanet(LVL1_ASTEROID_1.id);
      const currentPlanet = await world.contract.planets(LVL1_ASTEROID_1.id);
      expect(currentPlanet.population).to.be.equal(currentPlanet.populationCap);
    });
  });

  describe('spawning on non-home planet', async function () {
    let world: World;

    async function worldFixture() {
      const world = await fixtureLoader(defaultWorldFixture);
      const initArgs = makeInitArgs(SPAWN_PLANET_2);
      await world.user2Core.initializePlayer(...initArgs);

      await conquerUnownedPlanet(world, world.user2Core, SPAWN_PLANET_2, LVL2_PLANET_SPACE);

      return world;
    }

    beforeEach(async function () {
      world = await fixtureLoader(worldFixture);
    });

    it('reverts', async function () {
      await expect(world.user2Core.giveSpaceShips(LVL2_PLANET_SPACE.id)).to.be.revertedWith(
        'player already claimed ships'
      );
    });
  });
});
