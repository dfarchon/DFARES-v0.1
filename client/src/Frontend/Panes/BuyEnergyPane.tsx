import { isLocatable } from '@dfares/gamelogic';
import { weiToEth } from '@dfares/network';
import { getPlanetName } from '@dfares/procedural';
import { LocationId } from '@dfares/types';
import { BigNumber } from 'ethers';
import React, { useState } from 'react';
import styled from 'styled-components';
import {
  getBuyEnergyFeeWei,
  planetCanBuyEnergy,
} from '../../Backend/GameLogic/BuyEnergyUtils';
import { Btn } from '../Components/Btn';
import { EmSpacer, Spacer } from '../Components/CoreUI';
import { MythicLabelText } from '../Components/Labels/MythicLabel';
import { LoadingSpinner } from '../Components/LoadingSpinner';
import { Blue } from '../Components/Text';
import { TimeUntil } from '../Components/TimeUntil';
import { useAccount, useHalfPrice, usePlanet, usePlayer, useUIManager } from '../Utils/AppHooks';
import { useEmitterValue } from '../Utils/EmitterHooks';
import { ModalHandle } from '../Views/ModalPane';
import { PlanetLink } from '../Views/PlanetLink';
import BuyEnergyBar from './BuyEnergyBar';
import { PlanetThumb } from './PlanetDexPane';
import { TradeRow } from './TradePaneStyles';

const StyledBuyEnergyPane = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const BuyEnergyContent = styled.div`
  padding-top: 4px;
`;

const BuyEnergyActions = styled.div`
  flex-shrink: 0;
  width: 100%;
  margin-top: 5px;

  df-button {
    display: block;
    width: 100%;
  }
`;

const CooldownSlot = styled.div<{ $active: boolean }>`
  min-height: ${({ $active }) => ($active ? '2.6em' : '0')};
`;

export function BuyEnergyPaneHelpContent() {
  return (
    <div>
      <p>
        Spend ETH to accelerate energy growth on a planet you own. Select a duration with the slider;
        the fee depends on planet level and duration. A cooldown applies between purchases.
      </p>
      <Spacer height={8} />
      <p>Energy must be above zero and below the cap for a purchase to be available.</p>
    </div>
  );
}

export function BuyEnergyPane({
  initialPlanetId,
  modal: _modal,
}: {
  modal: ModalHandle;
  initialPlanetId?: LocationId;
}): React.ReactElement {
  const uiManager = useUIManager();
  const account = useAccount(uiManager);
  const player = usePlayer(uiManager).value;
  const planetId = useEmitterValue(uiManager.selectedPlanetId$, initialPlanetId);
  const planet = usePlanet(uiManager, planetId).value;
  const balanceEth = weiToEth(
    useEmitterValue(uiManager.getEthConnection().myBalance$, BigNumber.from('0'))
  );
  const halfPrice = useHalfPrice();

  const [durationToBuy, setDurationToBuy] = useState(0);

  if (!account || !player) return <></>;

  const planetLocatable = planet && isLocatable(planet);
  const planetOwnerCheckPassed = planet && planet.owner === account;
  const canBuyEnergy = planetCanBuyEnergy(planet, account);

  const contractConstants = uiManager.contractConstants;
  const baseFeePerSecondGwei =
    contractConstants.BUY_ENERGY_LEVEL_FEES[planet?.planetLevel ?? 0] ?? 0;
  const energyPurchaseFee = weiToEth(
    BigNumber.from(
      getBuyEnergyFeeWei(planet?.planetLevel ?? 0, durationToBuy, contractConstants, halfPrice)
    )
  );
  const balanceCheckPassed = balanceEth >= energyPurchaseFee;

  const nextAvailableBuyEnergy = uiManager.getGameManager().getNextBuyEnergyAvailableTimestamp();
  const buyEnergyCooldownPassed = uiManager.getNextBuyEnergyAvailableTimestamp() <= Date.now();
  const currentlyBuyingEnergy = uiManager.isCurrentlyBuyingEnergy();

  const disableBuyButton =
    !planetLocatable ||
    !planetOwnerCheckPassed ||
    !canBuyEnergy ||
    !balanceCheckPassed ||
    !buyEnergyCooldownPassed ||
    currentlyBuyingEnergy ||
    durationToBuy <= 0;

  const handleDurationChange = (newDuration: number) => {
    setDurationToBuy(newDuration);
  };

  const buyEnergy = async () => {
    if (disableBuyButton || !planet) return;
    uiManager.buyEnergy(planet, durationToBuy);
  };

  let buttonContent = <></>;

  if (!planetLocatable) {
    buttonContent = <>No Planet Selected</>;
  } else if (!planetOwnerCheckPassed) {
    buttonContent = <>You should choose a planet that belongs to you</>;
  } else if (!canBuyEnergy) {
    buttonContent = <>This planet cannot buy energy</>;
  } else if (!balanceCheckPassed) {
    buttonContent = <>Your balance is too low</>;
  } else if (!buyEnergyCooldownPassed) {
    buttonContent = <>Wait !</>;
  } else if (currentlyBuyingEnergy) {
    buttonContent = <LoadingSpinner initialText={'Claiming...'} />;
  } else {
    buttonContent = <>Buy Energy</>;
  }

  let cooldownContent = <></>;
  if (!buyEnergyCooldownPassed) {
    cooldownContent = (
      <>
        <Blue> INFO:</Blue> You need to wait{' '}
        <TimeUntil timestamp={nextAvailableBuyEnergy} ifPassed={'now!'} />
        <EmSpacer height={1} />
      </>
    );
  }

  return (
    <StyledBuyEnergyPane>
      <BuyEnergyContent>
        {halfPrice && <MythicLabelText text={'Energy is currently half price!'} />}

        <TradeRow>
          <span>Selected Planet</span>
          <span>
            {planet ? (
              <span style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <PlanetThumb planet={planet} />
                <PlanetLink planet={planet}>{getPlanetName(planet)}</PlanetLink>
              </span>
            ) : (
              <span>{'(none)'}</span>
            )}
          </span>
        </TradeRow>

        {planet && canBuyEnergy && (
          <BuyEnergyBar
            planet={planet}
            halfPrice={halfPrice}
            baseFeePerSecondGwei={baseFeePerSecondGwei}
            onDurationChange={handleDurationChange}
          />
        )}
      </BuyEnergyContent>

      <BuyEnergyActions>
        <CooldownSlot $active={!buyEnergyCooldownPassed}>
          {cooldownContent}
        </CooldownSlot>
        <Btn size='stretch' disabled={disableBuyButton} onClick={buyEnergy}>
          {buttonContent}
        </Btn>
      </BuyEnergyActions>
    </StyledBuyEnergyPane>
  );
}
