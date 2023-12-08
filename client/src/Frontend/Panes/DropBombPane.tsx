import { isUnconfirmedBurnTx } from '@dfares/serde';
import { EthAddress, LocationId } from '@dfares/types';
import React, { useEffect, useState } from 'react';
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

export function DropBombPaneHelpContent() {
  return (
    <div>
      Reveal this planet's location to all other players on-chain!
      <Spacer height={8} />
      Broadcasting can be a potent offensive tactic! Reveal a powerful enemy's location, and maybe
      someone else will take care of them for you?
    </div>
  );
}

export function DropBombPane({
  initialPlanetId,
  modal: _modal,
}: {
  modal: ModalHandle;
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

  //mytodo: add limits to Pink Ship

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
      {planet?.owner === account && (
        <p>
          <Blue>INFO:</Blue> You own this planet! Dropping Bomb to this planet is not a good choice.
        </p>
      )}
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
    </div>
  );

  if (planet) {
    return (
      <DropBombWrapper>
        <div>
          You can only drop bomb to a planet once every{' '}
          <White>{formatDuration(uiManager.contractConstants.BURN_PLANET_COOLDOWN * 1000)}</White>.
        </div>

        <div>
          {' '}
          <button
            onClick={() => {
              console.log(uiManager.getNextBurnAvailableTimestamp());
              console.log(Date.now());
              console.log(burnLocationCooldownPassed);
            }}
          >
            {' '}
            show{' '}
          </button>
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
