import { weiToEth } from '@dfares/network';
import { BigNumber } from 'ethers';
import React from 'react';
import { Btn } from '../Components/Btn';
import { EmSpacer, Section, SectionHeader } from '../Components/CoreUI';
import { MythicLabelText } from '../Components/Labels/MythicLabel';
import { useAccount, usePlayer, useUIManager } from '../Utils/AppHooks';
import { useEmitterValue } from '../Utils/EmitterHooks';
import { TradeButtonGroup, TradeRow, TradeSectionContent } from './TradePaneStyles';

export function DonationPane() {
  const uiManager = useUIManager();

  const account = useAccount(uiManager);
  const player = usePlayer(uiManager).value;
  const balanceEth = weiToEth(
    useEmitterValue(uiManager.getEthConnection().myBalance$, BigNumber.from('0'))
  );

  if (!account || !player) return <></>;

  const disabled_1 = balanceEth < 0.001;
  const disabled_2 = balanceEth < 0.01;
  const disabled_3 = balanceEth < 0.1;
  const disabled_4 = balanceEth < 1;
  const disabled_5 = balanceEth < 10;
  const disabled_6 = balanceEth < 100;

  return (
    <TradeSectionContent>
      <Section>
        <SectionHeader>Donation </SectionHeader>
        <TradeRow>
          <MythicLabelText text={'Thanks for supporting our development!'} />
        </TradeRow>
        {/* <TradeRow>
            <span>My Balance </span>
            <span>
              {balanceEth} ${TOKEN_NAME}
            </span>
          </TradeRow> */}
        <EmSpacer height={1} />
        <TradeButtonGroup>
          <Btn disabled={disabled_1} onClick={() => uiManager.donate(1)}>
            donate 0.001 ETH
          </Btn>
          <Btn disabled={disabled_2} onClick={() => uiManager.donate(10)}>
            donate 0.01 ETH
          </Btn>
          <Btn disabled={disabled_3} onClick={() => uiManager.donate(100)}>
            donate 0.1 ETH
          </Btn>
          <Btn disabled={disabled_4} onClick={() => uiManager.donate(1000)}>
            donate 1 ETH
          </Btn>
          <Btn disabled={disabled_5} onClick={() => uiManager.donate(10000)}>
            donate 10 ETH
          </Btn>
          <Btn disabled={disabled_6} onClick={() => uiManager.donate(100000)}>
            donate 100 ETH
          </Btn>
        </TradeButtonGroup>
      </Section>
    </TradeSectionContent>
  );
}
