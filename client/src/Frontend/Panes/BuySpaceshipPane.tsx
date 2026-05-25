import { TOKEN_NAME } from '@dfares/constants';
import { isLocatable } from '@dfares/gamelogic';
import { weiToEth } from '@dfares/network';
import { getPlanetName } from '@dfares/procedural';
import { isUnconfirmedBuySpaceshipTx } from '@dfares/serde';
import { BigNumber } from 'ethers';
import React from 'react';
import { Btn } from '../Components/Btn';
import { EmSpacer, Section, SectionHeader } from '../Components/CoreUI';
import { MythicLabelText } from '../Components/Labels/MythicLabel';
import { LoadingSpinner } from '../Components/LoadingSpinner';
import {
  useAccount,
  useHalfPrice,
  usePlayer,
  useSelectedPlanet,
  useUIManager,
} from '../Utils/AppHooks';
import { useEmitterValue } from '../Utils/EmitterHooks';
import { PlanetLink } from '../Views/PlanetLink';
import { PlanetThumb } from './PlanetDexPane';
import { TradeRow, TradeSectionContent } from './TradePaneStyles';

export function BuySpaceshipPane(): React.ReactElement {
  const uiManager = useUIManager();
  const gameManager = uiManager.getGameManager();

  const account = useAccount(uiManager);
  const player = usePlayer(uiManager).value;
  const selectedPlanet = useSelectedPlanet(uiManager).value;
  const balanceEth = weiToEth(
    useEmitterValue(uiManager.getEthConnection().myBalance$, BigNumber.from('0'))
  );
  const halfPrice = useHalfPrice();
  if (!account || !player) return <></>;

  //planet
  const planet = selectedPlanet;
  const planetLocatable = planet && isLocatable(planet);
  const planetNotDestoryedOrFrozen = planetLocatable && !planet.destroyed && !planet.frozen;
  const planetOwnerCheckPassed = planet && planet.owner === account;

  //player
  const currentBuySpaceshipAmount = player.buySpaceshipAmount;
  const amountCheckPassed = currentBuySpaceshipAmount < 3;
  const buySpaceshipFee = halfPrice ? 0.0005 : 0.001;

  // balance
  const balanceCheckPassed = balanceEth >= buySpaceshipFee;

  //state
  const isBuyingThisPlanetNow = !!selectedPlanet?.transactions?.hasTransaction(
    isUnconfirmedBuySpaceshipTx
  );

  const isBuyingNow =
    isBuyingThisPlanetNow ||
    !!gameManager.getGameObjects().transactions.hasTransaction(isUnconfirmedBuySpaceshipTx);

  const disableBuyButton =
    !planetLocatable ||
    !planetNotDestoryedOrFrozen ||
    !planetOwnerCheckPassed ||
    !amountCheckPassed ||
    !balanceCheckPassed ||
    isBuyingNow;

  const buySpaceship = async () => {
    if (!planet) return;
    if (!uiManager) return;
    if (disableBuyButton) return;
    uiManager.buySpaceship(selectedPlanet);
  };

  let buttonContent = <></>;

  if (!planetLocatable) {
    buttonContent = <>planet is not locatable</>;
  } else if (!planetNotDestoryedOrFrozen) {
    buttonContent = <>Planet can't be destoryed or frozen</>;
  } else if (!planetOwnerCheckPassed) {
    buttonContent = <>you should choose a planet belong to you</>;
  } else if (!amountCheckPassed) {
    buttonContent = <>1 player can only buy 3 Whale</>;
  } else if (!balanceCheckPassed) {
    buttonContent = <> You balance is too low</>;
  } else if (isBuyingNow) {
    buttonContent = <LoadingSpinner initialText={'Buying...'} />;
  } else {
    buttonContent = <>Buy One Whale Spaceship</>;
  }
  return (
    <TradeSectionContent>
      <Section>
        <SectionHeader>Buy Whale Spaceship</SectionHeader>
        {halfPrice && <MythicLabelText text={'Everything is half price !!!'} />}

        <TradeRow>
          <span> Selected Planet</span>
          <span>
            {selectedPlanet ? (
              <span
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <PlanetThumb planet={selectedPlanet} />
                <PlanetLink planet={selectedPlanet}>{getPlanetName(selectedPlanet)}</PlanetLink>
              </span>
            ) : (
              <span>{'(none)'}</span>
            )}
          </span>
        </TradeRow>

        <TradeRow>
          <span>Cost / My Balance </span>
          <span>
            {buySpaceshipFee} ${TOKEN_NAME} / {balanceEth} ${TOKEN_NAME}
          </span>
        </TradeRow>

        <TradeRow>
          <span>My Amount / Max Amount </span>
          <span>{currentBuySpaceshipAmount} / 3</span>
        </TradeRow>
      </Section>

      <Btn disabled={disableBuyButton} onClick={buySpaceship}>
        {buttonContent}
      </Btn>
      <EmSpacer height={1} />
    </TradeSectionContent>
  );
}
