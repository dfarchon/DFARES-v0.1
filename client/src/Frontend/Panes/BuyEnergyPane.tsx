import { isLocatable } from '@dfares/gamelogic';
import { weiToEth } from '@dfares/network';
import { getPlanetName } from '@dfares/procedural';
import { BigNumber } from 'ethers';
import React, { useState } from 'react';
import { getBuyEnergyFeeWei } from '../../Backend/GameLogic/BuyEnergyUtils';
import { Btn } from '../Components/Btn';
import { EmSpacer, Section, SectionHeader } from '../Components/CoreUI';
import { MythicLabelText } from '../Components/Labels/MythicLabel';
import { LoadingSpinner } from '../Components/LoadingSpinner';
import { Blue } from '../Components/Text';
import { TimeUntil } from '../Components/TimeUntil';
import {
  useAccount,
  useHalfPrice,
  usePlayer,
  useSelectedPlanet,
  useUIManager,
} from '../Utils/AppHooks';
import { useEmitterValue } from '../Utils/EmitterHooks';
import { PlanetLink } from '../Views/PlanetLink';
import BuyEnergyBar from './BuyEnergyBar';
import { PlanetThumb } from './PlanetDexPane';
import { TradeRow, TradeSectionContent } from './TradePaneStyles';

export function BuyEnergyPane(): React.ReactElement {
  const uiManager = useUIManager();
  const account = useAccount(uiManager);
  const player = usePlayer(uiManager).value;
  const selectedPlanet = useSelectedPlanet(uiManager).value;
  const balanceEth = weiToEth(
    useEmitterValue(uiManager.getEthConnection().myBalance$, BigNumber.from('0'))
  );
  const halfPrice = useHalfPrice();

  const [durationToBuy, setDurationToBuy] = useState(0);

  if (!account || !player) return <></>;

  // planet checks
  const planet = selectedPlanet;
  const planetLocatable = planet && isLocatable(planet);
  const planetOwnerCheckPassed = planet && planet.owner === account;
  const planetCanBuyEnergy =
    planet && planet.energyGrowth > 0 && planet.energy > 0 && planet.energy < planet.energyCap;

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

  // disable button if any check fails
  const disableBuyButton =
    !planetLocatable ||
    !planetOwnerCheckPassed ||
    !planetCanBuyEnergy ||
    !balanceCheckPassed ||
    !buyEnergyCooldownPassed ||
    currentlyBuyingEnergy;

  // Callback to handle block period updates from BuyEnergyBar
  const handleDurationChange = (newDuration: number) => {
    setDurationToBuy(newDuration);
  };

  // function to handle energy purchase
  const buyEnergy = async () => {
    if (disableBuyButton || !planet || !durationToBuy) return;
    uiManager.buyEnergy(planet, durationToBuy); // Assume `buyEnergy` method exists in uiManager
  };

  // UI content for button
  let buttonContent = <></>;

  if (!planetLocatable) {
    buttonContent = <>No Planet Selected</>;
  } else if (!planetOwnerCheckPassed) {
    buttonContent = <>You should choose a planet that belongs to you</>;
  } else if (!planetCanBuyEnergy) {
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
    <TradeSectionContent>
      <Section>
        <SectionHeader>Buy Energy</SectionHeader>
        {halfPrice && <MythicLabelText text={'Energy is currently half price!'} />}

        <TradeRow>
          <span>Selected Planet</span>
          <span>
            {selectedPlanet ? (
              <span style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <PlanetThumb planet={selectedPlanet} />
                <PlanetLink planet={selectedPlanet}>{getPlanetName(selectedPlanet)}</PlanetLink>
              </span>
            ) : (
              <span>{'(none)'}</span>
            )}
          </span>
        </TradeRow>

        {planet && planetCanBuyEnergy && (
          <BuyEnergyBar
            planet={planet}
            halfPrice={halfPrice}
            baseFeePerSecondGwei={baseFeePerSecondGwei}
            onDurationChange={handleDurationChange}
          />
        )}

        {cooldownContent}
        <Btn disabled={disableBuyButton} onClick={buyEnergy}>
          {buttonContent}
        </Btn>
      </Section>
    </TradeSectionContent>
  );
}
