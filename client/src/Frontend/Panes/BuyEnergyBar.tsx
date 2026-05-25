import { TOKEN_NAME } from '@dfares/constants';
import { Planet } from '@dfares/types';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getEnergyAtTime } from '../../Backend/GameLogic/ArrivalUtils';
import { formatBuyEnergyFeeEth } from '../../Backend/GameLogic/BuyEnergyUtils';
import { Row } from '../Components/Row';
import { useUIManager } from '../Utils/AppHooks';

const EnergyBarContainer = styled.div`
  width: 100%;
  word-break: break-word;
`;
interface BuyEnergyBarProps {
  planet: Planet;
  halfPrice: boolean;
  baseFeePerSecondGwei: number;
  onDurationChange: (duration: number) => void; // Callback for output
}

const BuyEnergyBar: React.FC<BuyEnergyBarProps> = ({
  planet,
  halfPrice,
  baseFeePerSecondGwei,
  onDurationChange,
}) => {
  const uiManager = useUIManager();
  const contractConstants = uiManager.contractConstants;
  const [selectedDuration, setSelectedDuration] = useState<number>(0);

  const aimPlanetEnergy = getEnergyAtTime(planet, selectedDuration * 1000 + Date.now());

  const steps = [10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 99.99];

  const energyLevels = steps.map((percent) => {
    if (planet.energyGrowth <= 0) {
      return { percent, leftTimestamp: 0, rightTimestamp: 0, duration: 0, ethCost: '0' };
    }
    const leftTimestamp = Math.floor(Date.now() / 1000);
    const rightTimestamp = Math.ceil(uiManager.getEnergyCurveAtPercent(planet, percent));
    const duration =
      rightTimestamp - leftTimestamp > 0
        ? Math.ceil(1000 * (rightTimestamp - leftTimestamp)) / 1000
        : 0;
    const ethCost = formatBuyEnergyFeeEth(
      planet.planetLevel,
      duration,
      contractConstants,
      halfPrice
    );
    return { percent, leftTimestamp, rightTimestamp, duration, ethCost };
  });

  const durationNeedForFull = Math.ceil(energyLevels[energyLevels.length - 1].duration);

  // Trigger the callback whenever the slider value changes
  useEffect(() => {
    onDurationChange(selectedDuration);
  }, [selectedDuration, onDurationChange]);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setSelectedDuration(value);
  };

  return (
    <EnergyBarContainer>
      <div>
        <div> Energy: {planet.energy} </div>
        <div> Energy Cap: {planet.energyCap} </div>
        <div>
          Fee rate: {baseFeePerSecondGwei} gwei/s (level {planet.planetLevel})
        </div>
        {energyLevels.map(({ percent, leftTimestamp, rightTimestamp, duration, ethCost }) => (
          <div key={percent}>
            need {duration.toFixed(3)} seconds (cost {ethCost} {TOKEN_NAME}) to reach {percent}%
            energy
          </div>
        ))}
      </div>

      <div className='slider-container'>
        <Row>
          <label htmlFor='blockPeriodSlider'>Set duration for Purchase:</label>
          <input
            type='range'
            id='blockPeriodSlider'
            min='0'
            max={durationNeedForFull}
            value={selectedDuration}
            onChange={handleSliderChange}
          />
        </Row>
        <Row>
          To Purchase: {selectedDuration} seconds for{' '}
          {formatBuyEnergyFeeEth(
            planet.planetLevel,
            selectedDuration,
            contractConstants,
            halfPrice
          )}{' '}
          ${TOKEN_NAME}
        </Row>
        This planet Energy will be {aimPlanetEnergy} !<Row></Row>
      </div>
    </EnergyBarContainer>
  );
};

export default BuyEnergyBar;
