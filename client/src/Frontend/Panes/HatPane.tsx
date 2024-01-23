import { MAX_LOGO_TYPE, MIN_LOGO_TYPE, TOKEN_NAME } from '@dfares/constants';
import { weiToEth } from '@dfares/network';
import { getHatSizeName, logoTypeToNum } from '@dfares/procedural';
import { isUnconfirmedBuyHatTx } from '@dfares/serde';
import { LocationId, LogoType, LogoTypeNames, Planet } from '@dfares/types';
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
  return 0.1 + 0 * planet.hatLevel;
  // return 2 ** planet.hatLevel;
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

  const defaultHatType =
    planet && planet.hatLevel > 0 ? planet.hatType : logoTypeToNum(LogoType.DFARES);

  const [hatType, setHatType] = useState(defaultHatType.toString());

  const values = [];
  const labels = [];

  // for (let i = MIN_HAT_TYPE; i <= MAX_HAT_TYPE; i++) {
  //   values.push(hatTypeToNum(Number(i) as HatType).toString());
  //   labels.push(HatTypeNames[i]);
  // }

  // for (let i = MIN_MEME_TYPE; i <= MAX_MEME_TYPE; i++) {
  //   values.push(memeTypeToNum(Number(i) as MemeType).toString());
  //   labels.push(MemeTypeNames[i]);
  // }

  for (let i = MIN_LOGO_TYPE; i <= MAX_LOGO_TYPE; i++) {
    values.push(logoTypeToNum(Number(i) as LogoType).toString());
    labels.push(LogoTypeNames[i]);
  }

  // for (let i = MIN_AVATAR_TYPE; i <= MAX_AVATAR_TYPE; i++) {
  //   values.push(avatarTypeToNum(Number(i) as AvatarType).toString());
  //   labels.push(AvatarTypeNames[i]);
  // }

  if (planet && planet.owner === account) {
    return (
      <StyledHatPane>
        <div>
          <Sub>HAT Type</Sub>
          {/* <span>{getPlanetCosmetic(planet).hatType}</span> */}
          <span> {planet.hatType}</span>
        </div>
        <div>
          <Sub>HAT Level</Sub>
          <span>{getHatSizeName(planet)}</span>
        </div>
        <div className='margin-top'>
          {/* <Sub>Next Level HAT Cost</Sub> */}
          <Sub>{planet && planet.hatLevel > 0 ? 'Take Off' : 'Buy'} HAT Cost</Sub>
          <span>
            {getHatCostEth(planet)} ${TOKEN_NAME}
          </span>
        </div>
        <div>
          <Sub>Current Balance</Sub>
          <span>
            {balanceEth} ${TOKEN_NAME}
          </span>
        </div>

        <EmSpacer height={1} />
        <div>
          <Link to={'https://holesky-faucet.pk910.de/'}>Get More HoleskyETH</Link>
        </div>

        <div>
          {' '}
          <Link to={'https://redstone.xyz/deposit'}>Deposit To Redstone</Link>
        </div>

        {/* <Link to={'https://blog.zkga.me/df-04-faq'}>Get More ${TOKEN_NAME}</Link> */}

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
          {planet && planet.hatLevel > 0 ? 'Take Off' : 'Buy'} HAT
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
