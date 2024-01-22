import { isUnconfirmedPinkTx } from '@dfares/serde';
import { ArtifactType, EthAddress, LocationId } from '@dfares/types';
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

const PinkWrapper = styled.div`
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

// export function PinkPaneHelpContent() {
//   return (
//     <div>
//       Reveal this planet's location to all other players on-chain!
//       <Spacer height={8} />
//       Broadcasting can be a potent offensive tactic! Reveal a powerful enemy's location, and maybe
//       someone else will take care of them for you?
//     </div>
//   );
// }

export function PinkPane({
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

  const pinkLocation = () => {
    if (!planet || !uiManager) return;
    const loc = uiManager.getLocationOfPlanet(planet.locationId);
    if (!loc) return;

    uiManager.pinkLocation(loc.hash);
  };

  const [account, setAccount] = useState<EthAddress | undefined>(undefined); // consider moving this one to parent
  const isDestoryedOrFrozen = planet?.destroyed || planet?.frozen;

  const checkPlanetCanPink = () => {
    if (!planetId) return false;
    return uiManager.checkPlanetCanPink(planetId);
  };

  const pinkZonePassed = checkPlanetCanPink();

  const getRes = () => {
    if (!planetId) return 0;
    return ui.getNextPinkAvailableTimestamp(planetId);
  };

  const res = getRes();
  const pinkLocationIdCooldownPassed = res !== 0 ? res <= Date.now() : false;

  const getStellarShieldPassed = () => {
    if (!planetId) return false;
    const planet = uiManager.getPlanetWithId(planetId);
    if (!planet) return false;
    const artifact = uiManager.getActiveArtifact(planet);
    if (artifact === undefined) return true;

    return artifact.artifactType !== ArtifactType.StellarShield;
  };
  const stellarShieldPassed = getStellarShieldPassed();

  const levelPassed = planet ? planet.planetLevel >= 3 : false;

  useEffect(() => {
    if (!uiManager) return;
    setAccount(uiManager.getAccount());
  }, [uiManager]);

  let pinkBtn = undefined;

  if (isDestoryedOrFrozen) {
    pinkBtn = <Btn disabled={true}>Pink It </Btn>;
  } else if (planet?.transactions?.hasTransaction(isUnconfirmedPinkTx)) {
    pinkBtn = (
      <Btn disabled={true}>
        <LoadingSpinner initialText={'Pinking It...'} />
      </Btn>
    );
  } else if (!pinkLocationIdCooldownPassed) {
    pinkBtn = <Btn disabled={true}>Pink It </Btn>;
  } else if (!pinkZonePassed) {
    pinkBtn = <Btn disabled={true}>Pink It </Btn>;
  } else if (!stellarShieldPassed) {
    pinkBtn = <Btn disabled={true}>Pink It </Btn>;
  } else if (!levelPassed) {
    pinkBtn = <Btn disabled={true}>Pink It </Btn>;
  } else {
    pinkBtn = (
      <Btn disabled={false} onClick={pinkLocation}>
        Pink It
      </Btn>
    );
  }

  const warningsSection = (
    <div>
      {isDestoryedOrFrozen && (
        <p>
          <Blue>INFO:</Blue> You can't drop bomb to a destoryed/frozen planet.
        </p>
      )}
      {!pinkZonePassed && (
        <p>
          <Blue>INFO:</Blue> You only can pink planets in your pink circle.
        </p>
      )}

      {!stellarShieldPassed && (
        <p>
          <Blue>INFO:</Blue> You can't pink a planet with active StellarShield.
        </p>
      )}

      {!levelPassed && (
        <p>
          <Blue>INFO:</Blue> Planet level need {'>='} 3.
        </p>
      )}
      {pinkZonePassed && !pinkLocationIdCooldownPassed && planetId && (
        <p>
          <Blue>INFO:</Blue> You must wait{' '}
          <TimeUntil
            timestamp={uiManager.getNextPinkAvailableTimestamp(planetId)}
            ifPassed={'now!'}
          />{' '}
          to pink this planet.
        </p>
      )}
    </div>
  );

  if (planet) {
    return (
      <PinkWrapper>
        <div>
          You need to wait{' '}
          <White>{formatDuration(uiManager.contractConstants.PINK_PLANET_COOLDOWN * 1000)}</White>{' '}
          after dropping bomb.
        </div>
        <div className='message'>{warningsSection}</div>
        <div className='row'>
          <span>Coordinates</span>
          <span>{`(${getLoc().x}, ${getLoc().y})`}</span>
        </div>
        <Spacer height={8} />
        <p style={{ textAlign: 'right' }}>{pinkBtn}</p>
      </PinkWrapper>
    );
  } else {
    return (
      <CenterBackgroundSubtext width='100%' height='75px'>
        Select a Planet
      </CenterBackgroundSubtext>
    );
  }
}
