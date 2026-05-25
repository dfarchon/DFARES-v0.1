import { TOKEN_NAME } from '@dfares/constants';
import { formatNumber } from '@dfares/gamelogic';
import { Planet } from '@dfares/types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { getEnergyAtTime } from '../../Backend/GameLogic/ArrivalUtils';
import { formatBuyEnergyFeeEth } from '../../Backend/GameLogic/BuyEnergyUtils';
import { Gold, Green, Sub } from '../Components/Text';
import dfstyles from '../Styles/dfstyles';
import { useUIManager } from '../Utils/AppHooks';

const EnergyBarContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StatsBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: ${dfstyles.fontSizeXS};
  color: ${dfstyles.colors.subtext};
`;

const PriceTableFrame = styled.div`
  display: flex;
  flex-direction: row;
  height: 280px;
  flex-shrink: 0;
  border: 1px solid ${dfstyles.colors.borderDarker};
  border-radius: 2px;
  overflow: hidden;
`;

const PriceTableContent = styled.div`
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow-y: auto;
  font-size: ${dfstyles.fontSizeXS};
  font-family: monospace;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
    width: 0;
  }
`;

const ScrollbarTrack = styled.div`
  width: 10px;
  flex-shrink: 0;
  background: ${dfstyles.colors.backgrounddark};
  border-left: 1px solid ${dfstyles.colors.borderDarker};
  position: relative;
  cursor: pointer;
`;

const ScrollbarThumb = styled.div`
  position: absolute;
  left: 1px;
  right: 1px;
  background: ${dfstyles.colors.border};
  border-radius: 4px;
  min-height: 24px;
  cursor: grab;

  &:hover {
    background: ${dfstyles.colors.subtext};
  }

  &:active {
    cursor: grabbing;
  }
`;

function ScrollablePriceTable({ children }: { children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startScrollTop: number } | null>(null);
  const [metrics, setMetrics] = useState({ scrollTop: 0, scrollHeight: 1, clientHeight: 1 });

  const updateMetrics = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    setMetrics({
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    });
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    updateMetrics();
    el.addEventListener('scroll', updateMetrics);
    const observer = new ResizeObserver(updateMetrics);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', updateMetrics);
      observer.disconnect();
    };
  }, [updateMetrics, children]);

  const { scrollTop, scrollHeight, clientHeight } = metrics;
  const scrollable = scrollHeight > clientHeight + 1;
  const thumbHeight = scrollable
    ? Math.max(24, (clientHeight / scrollHeight) * clientHeight)
    : clientHeight;
  const maxThumbTop = Math.max(0, clientHeight - thumbHeight);
  const maxScrollTop = Math.max(1, scrollHeight - clientHeight);
  const thumbTop = scrollable ? (scrollTop / maxScrollTop) * maxThumbTop : 0;

  const handleTrackClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const content = contentRef.current;
    const track = trackRef.current;
    if (!content || !track || !scrollable) return;
    if ((event.target as HTMLElement).dataset.thumb === 'true') return;

    const rect = track.getBoundingClientRect();
    const clickY = event.clientY - rect.top;
    const targetTop = clickY - thumbHeight / 2;
    const ratio = Math.min(1, Math.max(0, targetTop / maxThumbTop));
    content.scrollTop = ratio * maxScrollTop;
  };

  const handleThumbMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const content = contentRef.current;
    if (!content) return;

    dragRef.current = { startY: event.clientY, startScrollTop: content.scrollTop };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const drag = dragRef.current;
      const track = trackRef.current;
      if (!drag || !content || !track || !scrollable) return;

      const deltaY = moveEvent.clientY - drag.startY;
      const scrollDelta = (deltaY / maxThumbTop) * maxScrollTop;
      content.scrollTop = drag.startScrollTop + scrollDelta;
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <PriceTableFrame>
      <PriceTableContent ref={contentRef}>{children}</PriceTableContent>
      <ScrollbarTrack ref={trackRef} onClick={handleTrackClick}>
        <ScrollbarThumb
          data-thumb='true'
          style={{ height: thumbHeight, top: thumbTop }}
          onMouseDown={handleThumbMouseDown}
        />
      </ScrollbarTrack>
    </PriceTableFrame>
  );
}

const priceTableColumns = '5.5rem 6.5rem 7.5rem';

const PriceTableHeader = styled.div`
  display: grid;
  grid-template-columns: ${priceTableColumns};
  gap: 12px;
  padding: 6px 10px;
  color: ${dfstyles.colors.subbertext};
  border-bottom: 1px solid ${dfstyles.colors.borderDarker};
  position: sticky;
  top: 0;
  background: ${dfstyles.colors.background};

  & > span:last-child {
    text-align: right;
  }
`;

const PriceTableRow = styled.div<{ $reached?: boolean }>`
  display: grid;
  grid-template-columns: ${priceTableColumns};
  gap: 12px;
  padding: 4px 10px;
  color: ${({ $reached }) =>
    $reached ? dfstyles.colors.subbertext : dfstyles.colors.subtext};

  & > span:last-child {
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:nth-child(even) {
    background: ${dfstyles.colors.backgrounddark};
  }
`;

const DurationSlider = styled.input`
  flex: 1;
  min-width: 0;

  &:focus,
  &:focus-visible {
    outline: none;
  }
`;

const SliderSection = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const SliderRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  width: 100%;
  font-size: ${dfstyles.fontSizeXS};

  label {
    flex-shrink: 0;
    color: ${dfstyles.colors.subtext};
  }
`;

const DurationValue = styled.span`
  flex-shrink: 0;
  min-width: 3.5rem;
  text-align: right;
  color: ${dfstyles.colors.subtext};
  font-family: monospace;
`;

const PurchaseSummary = styled.div`
  margin-top: 4px;
  padding: 8px 10px;
  border: 1px solid ${dfstyles.colors.border};
  border-radius: 2px;
  background: ${dfstyles.colors.backgrounddark};
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SummaryRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  font-size: ${dfstyles.fontSizeS};
  min-height: 1.5em;
`;

const SummaryLabel = styled.span`
  color: ${dfstyles.colors.text};
  flex-shrink: 0;
`;

const SummaryValue = styled.span`
  text-align: right;
  word-break: break-word;
`;

function formatEnergyExact(energy: number): string {
  if (!Number.isFinite(energy)) return '0';
  if (Math.abs(energy - Math.round(energy)) < 1e-6) {
    return Math.round(energy).toLocaleString();
  }
  return energy.toLocaleString(undefined, { maximumFractionDigits: 3 });
}

function formatEnergyPercent(energy: number, energyCap: number): string {
  if (!energyCap || energyCap <= 0 || !Number.isFinite(energy)) return '—';
  const pct = (100 * energy) / energyCap;
  if (pct >= 100) return '100%';
  return `${pct.toFixed(2)}%`;
}

function formatEnergyWithContext(energy: number, energyCap: number): React.ReactNode {
  return (
    <>
      <Green>{formatEnergyExact(energy)}</Green>
      <Sub>
        {' '}
        ({formatNumber(energy)} · {formatEnergyPercent(energy, energyCap)})
      </Sub>
    </>
  );
}

function formatEnergyAfterDisplay(energy: number, energyCap: number): React.ReactNode {
  return (
    <>
      <Green>{formatEnergyExact(energy)}</Green>
      <Sub>
        {' '}
        ({formatNumber(energy)} · {formatEnergyPercent(energy, energyCap)} of cap)
      </Sub>
    </>
  );
}

interface BuyEnergyBarProps {
  planet: Planet;
  halfPrice: boolean;
  baseFeePerSecondGwei: number;
  onDurationChange: (duration: number) => void;
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
      return { percent, duration: 0, ethCost: '0' };
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
    return { percent, duration, ethCost };
  });

  const durationNeedForFull = Math.ceil(energyLevels[energyLevels.length - 1].duration);

  useEffect(() => {
    onDurationChange(selectedDuration);
  }, [selectedDuration, onDurationChange]);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setSelectedDuration(value);
  };

  const purchaseFee = formatBuyEnergyFeeEth(
    planet.planetLevel,
    selectedDuration,
    contractConstants,
    halfPrice
  );

  return (
    <EnergyBarContainer>
      <StatsBlock>
        <div>
          Energy {formatEnergyWithContext(planet.energy, planet.energyCap)} /{' '}
          {formatEnergyExact(planet.energyCap)} <Sub>({formatNumber(planet.energyCap)} cap)</Sub>
        </div>
        <div>
          {baseFeePerSecondGwei} gwei/s (Lv{planet.planetLevel})
        </div>
      </StatsBlock>

      <ScrollablePriceTable>
        <PriceTableHeader>
          <span>%</span>
          <span>sec</span>
          <span>{TOKEN_NAME}</span>
        </PriceTableHeader>
        {energyLevels.map(({ percent, duration, ethCost }) => {
          const reached = duration <= 0;
          return (
            <PriceTableRow key={percent} $reached={reached}>
              <span>{percent}%</span>
              <span>{reached ? 0 : Math.ceil(duration)}</span>
              <span>{reached ? 0 : ethCost}</span>
            </PriceTableRow>
          );
        })}
      </ScrollablePriceTable>

      <SliderSection>
        <SliderRow>
          <label htmlFor='blockPeriodSlider'>Duration:</label>
          <DurationSlider
            type='range'
            id='blockPeriodSlider'
            min='0'
            max={durationNeedForFull}
            value={selectedDuration}
            onChange={handleSliderChange}
          />
          <DurationValue>{selectedDuration}s</DurationValue>
        </SliderRow>
        <PurchaseSummary>
          <SummaryRow>
            <SummaryLabel>You will pay</SummaryLabel>
            <SummaryValue>
              {selectedDuration > 0 ? (
                <Gold>
                  {purchaseFee} {TOKEN_NAME}
                </Gold>
              ) : (
                <Sub>—</Sub>
              )}
            </SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>Energy after</SummaryLabel>
            <SummaryValue>
              {selectedDuration > 0
                ? formatEnergyAfterDisplay(aimPlanetEnergy, planet.energyCap)
                : formatEnergyAfterDisplay(planet.energy, planet.energyCap)}
            </SummaryValue>
          </SummaryRow>
        </PurchaseSummary>
      </SliderSection>
    </EnergyBarContainer>
  );
};

export default BuyEnergyBar;
