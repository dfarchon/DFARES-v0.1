import { isUnconfirmedBurnTx } from '@dfares/serde';
import { ArtifactType, EthAddress, LocationId } from '@dfares/types';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Btn } from '../Components/Btn';
import { CenterBackgroundSubtext, Spacer } from '../Components/CoreUI';
import { LoadingSpinner } from '../Components/LoadingSpinner';
import { Blue, White } from '../Components/Text';
import { formatDuration, TimeUntil } from '../Components/TimeUntil';
import dfstyles from '../Styles/dfstyles';
import { usePlanet, useUIManager } from '../Utils/AppHooks';
import { useEmitterValue } from '../Utils/EmitterHooks';
import { ModalHandle } from '../Views/ModalPane';

const DropBombWrapper = styled.div`
  & .row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    & > span {
      &:first-child {
        color: ${dfstyles.colors.subtext};
        padding-right: 1em;
      }
    }
  }
  & .message {
    margin: 1em 0;

    & p {
      margin: 0.5em 0;

      &:last-child {
        margin-bottom: 1em;
      }
    }
  }
`;

// export function DropBombPaneHelpContent() {
//   return (
//     <div>
//       Reveal this planet's location to all other players on-chain!
//       <Spacer height={8} />
//       Broadcasting can be a potent offensive tactic! Reveal a powerful enemy's location, and maybe
//       someone else will take care of them for you?
//     </div>
//   );
// }

export function DropBombPane({
  initialPlanetId,
  modal: _modal,
}: {
  modal?: ModalHandle;
  initialPlanetId: LocationId | undefined;
}) {
  const uiManager = useUIManager();
  const planetId = useEmitterValue(uiManager.selectedPlanetId$, initialPlanetId);
  const planet = usePlanet(uiManager, planetId).value;

  const getLoc = () => {
    if (!planet || !uiManager) return { x: 0, y: 0 };
    const loc = uiManager.getLocationOfPlanet(planet.locationId);
    if (!loc) return { x: 0, y: 0 };
    return loc.coords;
  };

  const dropBomb = () => {
    if (!planet || !uiManager) return;
    const loc = uiManager.getLocationOfPlanet(planet.locationId);
    if (!loc) return;

    uiManager.burnLocation(loc.hash);
  };

  const [account, setAccount] = useState<EthAddress | undefined>(undefined); // consider moving this one to parent
  const isDestoryedOrFrozen = planet?.destroyed || planet?.frozen;
  const burnLocationCooldownPassed = uiManager.getNextBurnAvailableTimestamp() <= Date.now();
  const currentlyBurningAnyPlanet = uiManager.isCurrentlyBurning();

  const getDropBombTime = () => {
    const player = uiManager.getPlayer(account);
    if (!player) return 0;
    return player.dropBombAmount;
  };

  const getSilverPassed = () => {
    if (!planet) return false;
    if (!account) return false;
    const playerSilver = uiManager.getPlayerSilver(account);
    if (playerSilver === undefined) return false;
    const requireSilver = uiManager.getSilverOfBurnPlanet(account, planet.planetLevel);
    if (!requireSilver) return false;

    return Math.floor(playerSilver) >= Math.ceil(requireSilver);
  };

  const getFormatSilverAmount = () => {
    if (!planet) return 'n/a';
    if (!account) return 'n/a';
    const res = uiManager.getSilverOfBurnPlanet(account, planet.planetLevel);
    // console.log(res);
    if (res === undefined) return 'n/a';
    else return res.toLocaleString();
  };
  const formatSilverAmount = getFormatSilverAmount();

  const silverPassed = getSilverPassed();
  const hasOwnedShipPink = useMemo(
    () =>
      planet?.heldArtifactIds
        .map((id) => uiManager.getArtifactWithId(id))
        .find(
          (artifact) =>
            artifact?.artifactType === ArtifactType.ShipPink && artifact.controller === account
        ),
    [account, planet, uiManager]
  );

  const levelPassed = planet ? planet.planetLevel >= 1 : false;

  useEffect(() => {
    if (!uiManager) return;
    setAccount(uiManager.getAccount());
  }, [uiManager]);

  let burnBtn = undefined;

  if (isDestoryedOrFrozen) {
    burnBtn = <Btn disabled={true}>Drop Bomb</Btn>;
  } else if (planet?.transactions?.hasTransaction(isUnconfirmedBurnTx)) {
    burnBtn = (
      <Btn disabled={true}>
        <LoadingSpinner initialText={'Dropping Bomb...'} />
      </Btn>
    );
  } else if (!burnLocationCooldownPassed) {
    burnBtn = <Btn disabled={true}>Drop Bomb</Btn>;
  } else if (!hasOwnedShipPink) {
    burnBtn = <Btn disabled={true}>Drop Bomb</Btn>;
  } else if (!silverPassed) {
    burnBtn = <Btn disabled={true}>Drop Bomb</Btn>;
  } else if (!levelPassed) {
    burnBtn = <Btn disabled={true}>Drop Bomb</Btn>;
  } else {
    burnBtn = (
      <Btn disabled={currentlyBurningAnyPlanet} onClick={dropBomb}>
        Drop Bomb
      </Btn>
    );
  }

  const warningsSection = (
    <div>
      {currentlyBurningAnyPlanet && (
        <p>
          <Blue>INFO:</Blue> Dropping Bomb...
        </p>
      )}
      {/* {planet?.owner === account && (
        <p>
          <Blue>INFO:</Blue> You own this planet! Dropping Bomb to this planet is not a good choice.
        </p>
      )} */}
      {/* {planet?.owner !== account && (
        <p>
          <Blue>INFO:</Blue> You can only drop bomb to your own planet.
        </p>
      )} */}

      {isDestoryedOrFrozen && (
        <p>
          <Blue>INFO:</Blue> You can't drop bomb to a destoryed/frozen planet.
        </p>
      )}
      {!burnLocationCooldownPassed && (
        <p>
          <Blue>INFO:</Blue> You must wait{' '}
          <TimeUntil timestamp={uiManager.getNextBurnAvailableTimestamp()} ifPassed={'now!'} /> to
          burn another planet.
        </p>
      )}
      {!hasOwnedShipPink && (
        <p>
          <Blue>INFO:</Blue> Your pink Ship needs to be above this planet.
        </p>
      )}

      {!silverPassed && (
        <p>
          <Blue>INFO:</Blue> You need at least {formatSilverAmount} silver.
        </p>
      )}

      {!levelPassed && (
        <p>
          <Blue>INFO: </Blue> Planet level can't be 0.
        </p>
      )}
    </div>
  );

  if (planet) {
    return (
      <DropBombWrapper>
        <div>
          You can only drop bomb to a planet once every{' '}
          <White>{formatDuration(uiManager.contractConstants.BURN_PLANET_COOLDOWN * 1000)}</White>.
        </div>

        <div className='row'>
          <span>Your dropped bomb amount:</span>
          <span>{getDropBombTime()}</span>
        </div>

        <div className='row'>
          <span>Require silver amount: </span>
          <span>{formatSilverAmount}</span>
        </div>
        <div className='message'>{warningsSection}</div>
        <div className='row'>
          <span>Coordinates</span>
          <span>{`(${getLoc().x}, ${getLoc().y})`}</span>
        </div>
        <Spacer height={8} />
        <p style={{ textAlign: 'right' }}>{burnBtn}</p>
      </DropBombWrapper>
    );
  } else {
    return (
      <CenterBackgroundSubtext width='100%' height='75px'>
        Select a Planet
      </CenterBackgroundSubtext>
    );
  }
}
