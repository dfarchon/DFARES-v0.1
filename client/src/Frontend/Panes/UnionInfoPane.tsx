import { EthAddress, Union } from '@dfares/types';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import GameUIManager from '../../Backend/GameLogic/GameUIManager';
import { AlignCenterHorizontally, EmSpacer, SpreadApart } from '../Components/CoreUI';
import dfstyles, { snips } from '../Styles/dfstyles';
import { SortableTable } from '../Views/SortableTable';

export const UnionDetailSection = styled.div`
  padding: 0.5em 0;

  &:first-child {
    margin-top: -8px;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const UnionInfoContent = styled.div`
  margin-left: 1em;
  margin-right: 1em;
`;

const InfoHead = styled.div`
  text-align: left;
  font-size: 120%;
  font-weight: bold;
  color: yellow;
`;

const ElevatedContainer = styled.div`
  ${snips.roundedBordersWithEdge}
  border-color: ${dfstyles.colors.borderDarker};
  background-color: ${dfstyles.colors.backgroundlight};
  margin-top: 8px;
  margin-bottom: 8px;
  font-size: 100%;
`;

const StatRow = styled(AlignCenterHorizontally)`
  ${snips.roundedBorders}
  display: inline-block;
  box-sizing: border-box;
  width: 100%;

  /* Set the Icon color to something a little dimmer */
  --df-icon-color: ${dfstyles.colors.subtext};
`;

const HalfRow = styled.div`
  border: 1px solid ${dfstyles.colors.borderDarker};
  border-top: none;
  border-left: none;
  width: 50%;
`;

const LeaderRow = styled.div`
  border: 1px solid ${dfstyles.colors.borderDarker};
  border-top: none;
  display: flex;
  /* flex-direction: row;
  justify-content: space-between; */
  align-items: center;
  width: 100%;
`;

type UnionMemberInfo = {
  address: EthAddress;
  role: string; // 'leader' or ''
  rank: number | undefined;
  score: number | undefined;
  contributionScore: number;
};

export const UnionInfoPane: React.FC<{ union: Union; uiManager: GameUIManager }> = ({
  union,
  uiManager,
}) => {
  const gameManager = uiManager.getGameManager();
  const [unionMemberInfos, setUnionMemberInfos] = useState<UnionMemberInfo[]>([]);

  useEffect(() => {
    if (!uiManager || !gameManager) return;

    let isMounted = true;

    const refreshData = async () => {
      const infoArrays: UnionMemberInfo[] = [];
      for (let i = 0; i < union.members.length; i++) {
        const address = union.members[i];
        const player = gameManager.getPlayer(address);
        if (!player) continue;
        const role = address === union.leader ? 'leader' : '';
        const rank = player.rank;
        const score = player.score;
        const info: UnionMemberInfo = {
          address: address,
          role: role,
          rank: rank,
          score: score,
          contributionScore: rank ? gameManager.playerRankToPointConversion(rank) : 0,
        };
        infoArrays.push(info);
      }

      if (isMounted) {
        setUnionMemberInfos(infoArrays);
      }
    };
    refreshData();
    return () => {
      isMounted = false;
    };
  }, [union, uiManager, gameManager]);

  // refresh infos every 10 seconds

  useEffect(() => {
    if (!uiManager || !gameManager) return;

    const refreshData = async () => {
      const infoArrays: UnionMemberInfo[] = [];
      for (let i = 0; i < union.members.length; i++) {
        const address = union.members[i];
        const player = gameManager.getPlayer(address);
        if (!player) continue;
        const role = address === union.leader ? 'leader' : '';
        const rank = player.rank;
        const score = player.score;
        const info: UnionMemberInfo = {
          address: address,
          role: role,
          rank: rank,
          score: score,
          contributionScore: rank ? gameManager.playerRankToPointConversion(rank) : 0,
        };
        infoArrays.push(info);
      }
      setUnionMemberInfos(infoArrays);
    };

    const intervalId = setInterval(refreshData, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, [union, uiManager, gameManager]);

  const headers = ['address', 'role', 'rank', 'contri'];
  const alignments: Array<'r' | 'c' | 'l'> = ['l', 'r', 'r', 'r'];
  const columns = [
    //address
    (unionMemberInfo: UnionMemberInfo) => <span> {unionMemberInfo.address}</span>,
    (unionMemberInfo: UnionMemberInfo) => <span> {unionMemberInfo.role}</span>,
    (unionMemberInfo: UnionMemberInfo) => (
      <span>{unionMemberInfo.rank ? '#' + unionMemberInfo.rank : 'n/a'}</span>
    ),
    (unionMemberInfo: UnionMemberInfo) => <span> {unionMemberInfo.contributionScore}</span>,
  ];

  const sortingFunctions = [
    //address
    (_a: UnionMemberInfo, _b: UnionMemberInfo) => (_a < _b ? 1 : -1),
    (_a: UnionMemberInfo, _b: UnionMemberInfo) =>
      _a.role === 'leader' ? -1 : _b.role === 'leader' ? -1 : 0,
    (_a: UnionMemberInfo, _b: UnionMemberInfo) => {
      if (_a.rank === undefined) return 1;
      if (_b.rank === undefined) return -1;
      return _a.rank - _b.rank;
    },
    (_a: UnionMemberInfo, _b: UnionMemberInfo) => _b.contributionScore - _a.contributionScore,
  ];

  return (
    <UnionInfoContent>
      <InfoHead>
        {union.name && union.name.length !== 0
          ? '✨✨✨ ' + union.name.toUpperCase() + ' UNION (ID:' + union.unionId + ') ✨✨✨'
          : '✨✨✨ ANONYMOUS UNION (ID:' + union.unionId + ') ✨✨✨'}
      </InfoHead>

      <ElevatedContainer>
        <StatRow>
          <SpreadApart>
            <HalfRow>
              <SpreadApart>
                <AlignCenterHorizontally>
                  <EmSpacer width={1} />
                  Level
                </AlignCenterHorizontally>
                <AlignCenterHorizontally>
                  {union.level}
                  <EmSpacer width={1} />
                </AlignCenterHorizontally>
              </SpreadApart>
            </HalfRow>
            <HalfRow>
              <SpreadApart>
                <AlignCenterHorizontally>
                  <EmSpacer width={1} />
                  Max Level
                </AlignCenterHorizontally>
                <AlignCenterHorizontally>
                  3
                  <EmSpacer width={1} />
                </AlignCenterHorizontally>
              </SpreadApart>
            </HalfRow>
          </SpreadApart>
        </StatRow>

        <StatRow>
          <SpreadApart>
            <HalfRow>
              <SpreadApart>
                <AlignCenterHorizontally>
                  <EmSpacer width={1} />
                  Members Total
                </AlignCenterHorizontally>
                <AlignCenterHorizontally>
                  {union.members.length}
                  <EmSpacer width={1} />
                </AlignCenterHorizontally>
              </SpreadApart>
            </HalfRow>
            <HalfRow>
              <SpreadApart>
                <AlignCenterHorizontally>
                  <EmSpacer width={1} />
                  Memebers Max
                </AlignCenterHorizontally>
                <AlignCenterHorizontally>
                  {uiManager.getMaxMembers(union.level)}
                  <EmSpacer width={1} />
                </AlignCenterHorizontally>
              </SpreadApart>
            </HalfRow>
          </SpreadApart>
        </StatRow>

        <StatRow>
          <SpreadApart>
            <HalfRow>
              <SpreadApart>
                <AlignCenterHorizontally>
                  <EmSpacer width={1} />
                  Top Player
                </AlignCenterHorizontally>
                <AlignCenterHorizontally>
                  {union.highestRank ? 'rank #' + union.highestRank : 'n/a'}
                  <EmSpacer width={1} />
                </AlignCenterHorizontally>
              </SpreadApart>
            </HalfRow>
            <HalfRow>
              <SpreadApart>
                <AlignCenterHorizontally>
                  <EmSpacer width={1} />
                  Union Score
                </AlignCenterHorizontally>
                <AlignCenterHorizontally>
                  {union.score}
                  <EmSpacer width={1} />
                </AlignCenterHorizontally>
              </SpreadApart>
            </HalfRow>
          </SpreadApart>
        </StatRow>

        <SortableTable
          paginated={true}
          rows={unionMemberInfos}
          headers={headers}
          columns={columns}
          sortFunctions={sortingFunctions}
          alignments={alignments}
        ></SortableTable>
      </ElevatedContainer>
    </UnionInfoContent>
  );
};
