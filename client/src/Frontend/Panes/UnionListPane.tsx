import { formatNumber } from '@dfares/gamelogic';
import { Union } from '@dfares/types';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Btn } from '../Components/Btn';
import { CenterBackgroundSubtext, Spacer } from '../Components/CoreUI';
import { Sub } from '../Components/Text';
import { TextPreview } from '../Components/TextPreview';
import dfstyles from '../Styles/dfstyles';
import { useUIManager } from '../Utils/AppHooks';
import { SortableTable } from '../Views/SortableTable';

const UnionListContent = styled.div`
  width: 600px;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  /* text-align: justify; */
  margin-top: 1em;
  margin-left: 1em;
  margin-right: 1em;
`;

const TableContainer = styled.div`
  overflow-y: scroll;
`;

type SetStateFunction = (value: string) => void;

export function UnionListPane({
  setSelectedUnionId,
  setActiveFrame,
}: {
  setSelectedUnionId: SetStateFunction;
  setActiveFrame: SetStateFunction;
}) {
  const uiManager = useUIManager();
  const [unions, setUnions] = useState<Union[]>([]);

  useEffect(() => {
    if (!uiManager) return;
    const unions = uiManager.getAllUnions().filter((union) => union.unionId !== '0');
    setUnions(unions);
  }, [uiManager]);

  //refresh unions every 10 seconds
  useEffect(() => {
    if (!uiManager) return;

    const refreshUnions = () => {
      if (!uiManager) return;
      const unions = uiManager.getAllUnions().filter((union) => union.unionId !== '0');
      setUnions(unions);
    };

    const intervalId = setInterval(refreshUnions, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, [uiManager]);

  const headers = ['Id', 'Name', 'Leader', 'Level', 'Amount', 'Details'];
  const alignments: Array<'r' | 'c' | 'l'> = ['r', 'r', 'r', 'r', 'r', 'r'];

  const columns = [
    //Id
    (union: Union) => <span style={{ width: '25px' }}> {union.unionId} </span>,
    //Name
    (union: Union) => (
      <TextPreview
        style={{ color: dfstyles.colors.text }}
        text={union.name}
        focusedWidth={'75px'}
        unFocusedWidth={'75px'}
      />
    ),
    //Leader
    (union: Union) => (
      <TextPreview
        style={{ color: dfstyles.colors.text }}
        text={union.leader}
        focusedWidth={'100px'}
        unFocusedWidth={'100px'}
      />
    ),
    //Level
    (union: Union) => <Sub> {formatNumber(union.level)}</Sub>,

    //Amount
    (union: Union) => <Sub> {formatNumber(union.members.length)}</Sub>,

    //Details
    (union: Union) => (
      <span>
        <Btn
          onClick={() => {
            setSelectedUnionId(union.unionId);
            setActiveFrame('detail');
          }}
        >
          Detail
        </Btn>
      </span>
    ),
  ];

  const sortingFunctions = [
    //Id
    (_a: Union, _b: Union): number => Number(_a.unionId) - Number(_b.unionId),
    //Name
    (_a: Union, _b: Union): number => {
      const [nameA, nameB] = [_a.name, _b.name];
      return nameA.localeCompare(nameB);
    },
    //Leader
    (_a: Union, _b: Union): number => {
      const [leaderA, leaderB] = [_a.leader, _b.leader];
      return leaderA.localeCompare(leaderB);
    },
    //Level
    (_a: Union, _b: Union): number => Number(_a.level) - Number(_b.level),
    //Amount
    (_a: Union, _b: Union): number => _a.members.length - _b.members.length,
    //Details
    (_a: Union, _b: Union): number => 0,
  ];

  let content;
  if (unions.length === 0) {
    content = (
      <CenterBackgroundSubtext width='600px' height='100px'>
        There is no union right now.
      </CenterBackgroundSubtext>
    );
  } else {
    content = (
      <TableContainer>
        <SortableTable
          paginated={true}
          rows={unions}
          headers={headers}
          columns={columns}
          sortFunctions={sortingFunctions}
          alignments={alignments}
        />
      </TableContainer>
    );
  }

  return (
    <UnionListContent>
      {content}
      <Spacer height={8} />
    </UnionListContent>
  );
}
