import styled from 'styled-components';

export const TradeSectionContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const TradeRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;

  & > span:first-child {
    flex-shrink: 0;
  }

  & > span:last-child {
    flex: 1;
    min-width: 0;
    text-align: right;
    word-break: break-word;
  }
`;

export const TradeButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;
