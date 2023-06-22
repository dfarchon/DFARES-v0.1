import {
  MAX_LOGO_HAT_TYPE,
  MAX_MEME_HAT_TYPE,
  MAX_NORMAL_HAT_TYPE,
  MIN_LOGO_HAT_TYPE,
  MIN_MEME_HAT_TYPE,
  MIN_NORMAL_HAT_TYPE,
  TOKEN_NAME,
} from '@darkforest_eth/constants';
import { weiToEth } from '@darkforest_eth/network';
import { getHatSizeName, getPlanetCosmetic } from '@darkforest_eth/procedural';
import { isUnconfirmedBuyHatTx } from '@darkforest_eth/serde';
import { HatType, HatTypeNames, LocationId, Planet } from '@darkforest_eth/types';
import { BigNumber } from 'ethers';
import React, { useState } from 'react';
import styled from 'styled-components';
import { Btn } from '../Components/Btn';
import { CenterBackgroundSubtext, EmSpacer, Link, SelectFrom } from '../Components/CoreUI';
import { Sub } from '../Components/Text';
import { useAccount, usePlanet, useUIManager } from '../Utils/AppHooks';
import { useEmitterValue } from '../Utils/EmitterHooks';
import { ModalHandle } from '../Views/ModalPane';

const StyledHatPane = styled.div`
  & > div {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    &:last-child > span {
      margin-top: 1em;
      text-align: center;
      flex-grow: 1;
    }

    &.margin-top {
      margin-top: 0.5em;
    }
  }
`;

const getHatCostEth = (planet: Planet) => {
  return 2 ** planet.hatLevel;
};

export function HatPane({
  initialPlanetId,
  modal: _modal,
}: {
  modal: ModalHandle;
  initialPlanetId?: LocationId;
}) {
  const uiManager = useUIManager();
  const account = useAccount(uiManager);
  const planetId = useEmitterValue(uiManager.selectedPlanetId$, initialPlanetId);
  const planetWrapper = usePlanet(uiManager, planetId);
  const planet = planetWrapper.value;
  const balanceEth = weiToEth(
    useEmitterValue(uiManager.getEthConnection().myBalance$, BigNumber.from('0'))
  );
  const enabled = (planet: Planet): boolean =>
    !planet.transactions?.hasTransaction(isUnconfirmedBuyHatTx) &&
    planet?.owner === account &&
    balanceEth > getHatCostEth(planet);

  const [hatType, setHatType] = useState(HatType.Mask.toString());

  const values = [];
  const labels = [];
  for (let i = MIN_NORMAL_HAT_TYPE; i <= MAX_NORMAL_HAT_TYPE; i++) {
    values.push(i.toString());
    labels.push(HatTypeNames[i]);
  }

  for (let i = MIN_MEME_HAT_TYPE; i <= MAX_MEME_HAT_TYPE; i++) {
    values.push(i.toString());
    labels.push(HatTypeNames[i]);
  }

  for (let i = MIN_LOGO_HAT_TYPE; i <= MAX_LOGO_HAT_TYPE; i++) {
    values.push(i.toString());
    labels.push(HatTypeNames[i]);
  }

  if (planet && planet.owner === account) {
    return (
      <StyledHatPane>
        <div>
          <Sub>HAT</Sub>
          <span>{getPlanetCosmetic(planet).hatType}</span>
        </div>
        <div>
          <Sub>HAT Level</Sub>
          <span>{getHatSizeName(planet)}</span>
        </div>
        <div className='margin-top'>
          <Sub>Next Level Cost</Sub>
          <span>
            {getHatCostEth(planet)} USD <Sub>/</Sub> {getHatCostEth(planet)} ${TOKEN_NAME}
          </span>
        </div>
        <div>
          <Sub>Current Balance</Sub>
          <span>
            {balanceEth} ${TOKEN_NAME}
          </span>
        </div>

        <EmSpacer height={1} />
        <Link to={'https://blog.zkga.me/df-04-faq'}>Get More ${TOKEN_NAME}</Link>
        <EmSpacer height={0.5} />

        <div>
          <div>Hat Type</div>
          <SelectFrom
            values={values}
            labels={labels}
            value={hatType.toString()}
            setValue={setHatType}
          />
        </div>

        <Btn
          onClick={() => {
            if (!enabled(planet) || !uiManager || !planet) return;
            uiManager.buyHat(planet, Number(hatType));
          }}
          disabled={!enabled(planet)}
        >
          {planet && planet.hatLevel > 0 ? 'Upgrade' : 'Buy'} HAT
        </Btn>
      </StyledHatPane>
    );
  } else {
    return (
      <CenterBackgroundSubtext width='100%' height='75px'>
        Select a Planet <br /> You Own
      </CenterBackgroundSubtext>
    );
  }
}
