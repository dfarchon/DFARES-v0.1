import { weiToEth } from '@dfares/network';
import { EthAddress, Union, UnionId } from '@dfares/types';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Btn } from '../Components/Btn';
import { LoadingSpinner } from '../Components/LoadingSpinner';
import { Blue, Green } from '../Components/Text';
import { formatDuration, TimeUntil } from '../Components/TimeUntil';
import { useAccount, usePlayer, useUIManager } from '../Utils/AppHooks';
import { UnionInfoPane } from './UnionInfoPane';

const UnionDetailContent = styled.div`
  width: 600px;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  /* text-align: justify; */
  margin-left: 1em;
  margin-right: 1em;
  margin-top: 1em;
  margin-bottom: 1em;
`;

export const UnionDetailSection = styled.div`
  padding: 0.5em 0;

  &:first-child {
    margin-top: -8px;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px; /* Set the spacing between buttons */
  margin-top: 0.5em;
`;

type SetStateFunction = (value: string) => void;

export function UnionDetailPane({
  _unionId,
  setActiveFrame,
}: {
  _unionId: UnionId;
  setActiveFrame: SetStateFunction;
}) {
  const uiManager = useUIManager();
  const gameManager = uiManager.getGameManager();
  const account = useAccount(uiManager);
  const player = usePlayer(uiManager).value;

  const [union, setUnion] = useState<Union>();
  const [isProcessing, setIsProcessing] = useState(false);

  const [unionRejoinCooldown, setUnionRejoinCooldown] = useState<number>();
  const [levelupUnionFee, setLevelupUnionFee] = useState<number>();
  const [nextApplyUnionAvailableTimestamp, setNextApplyUnionAvailableTimestamp] =
    useState<number>();

  useEffect(() => {
    if (!uiManager) return;
    const unionId = _unionId;
    const union = uiManager.getUnion(unionId);
    setUnion(union);
  }, [_unionId, uiManager]);

  // fetch configs
  useEffect(() => {
    const fetchConfig = async () => {
      if (!union) return;
      const rawCooldown = await gameManager.getContractAPI().getUnionRejoinCooldown();
      const cooldown = rawCooldown.toNumber();
      setUnionRejoinCooldown(cooldown);
      const rawFee = await gameManager.getContractAPI().getLevelUpUnionFee(union.level + 1);
      const fee = weiToEth(rawFee);
      setLevelupUnionFee(fee);
      const rawTimestamp = await uiManager.getNextApplyUnionAvailableTimestamp();
      setNextApplyUnionAvailableTimestamp(rawTimestamp);
    };

    fetchConfig();
  }, [union, gameManager, uiManager]);

  // refresh unions every 10 seconds
  useEffect(() => {
    if (!uiManager) return;

    const refreshUnion = () => {
      const unionId = _unionId;
      const union = uiManager.getUnion(unionId);
      setUnion(union);
    };

    const intervalId = setInterval(refreshUnion, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, [_unionId, uiManager]);

  const validUnion = (union: Union | undefined): boolean => {
    if (!union) return false;
    return union.unionId !== '0';
  };

  const isPlayerInUnion = (address: EthAddress): boolean => {
    const player = uiManager.getPlayer(address);
    if (!player) return false;
    return player.unionId !== '0';
  };

  const isLeader = (union: Union, address: EthAddress): boolean => {
    return union.leader === address;
  };

  const isMember = (union: Union, address: EthAddress): boolean => {
    return union.members.includes(address);
  };

  const isInvitee = (union: Union, address: EthAddress): boolean => {
    return union.invitees.includes(address);
  };

  const isApplicant = (union: Union, address: EthAddress): boolean => {
    return union.applicants.includes(address);
  };

  // utils functions
  const handleLeaveUnion = async () => {
    if (!union || !account) return;
    if (!validUnion(union)) return;
    if (!isMember(union, account)) return;
    setIsProcessing(true);
    try {
      await gameManager.leaveUnion(union.unionId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!union || !account) return;
    if (!validUnion(union)) return;
    if (!isInvitee(union, account)) return;
    setIsProcessing(true);
    try {
      await gameManager.acceptInvite(union.unionId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const leaveUnionCooldownPassed =
    nextApplyUnionAvailableTimestamp && Date.now() >= nextApplyUnionAvailableTimestamp;

  const handleSendApplication = async () => {
    if (!account || !union || !validUnion(union)) return;
    setIsProcessing(true);
    try {
      await gameManager.sendApplication(union.unionId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!account || !player || !union)
    return (
      <UnionDetailContent>
        <LoadingSpinner initialText={"You haven't joined a union yet... "} />
      </UnionDetailContent>
    );
  if (!validUnion(union))
    return (
      <UnionDetailContent>
        <LoadingSpinner initialText={"You haven't joined a union yet... "} />
      </UnionDetailContent>
    );

  if (!unionRejoinCooldown || !levelupUnionFee || !nextApplyUnionAvailableTimestamp)
    return <LoadingSpinner initialText={'Loading...'} />;

  return (
    <>
      <ButtonContainer>
        <Btn onClick={() => setActiveFrame('list')}>Back To List</Btn>

        {!isMember(union, account) && isPlayerInUnion(account) && (
          <Btn
            onClick={() => {
              const player = uiManager.getPlayer(account);
              if (!player) return;
              const union = uiManager.getUnion(player.unionId);
              if (!union) return;
              setUnion(union);
            }}
          >
            Jump To My Union
          </Btn>
        )}

        {isLeader(union, account) && (
          <Btn
            onClick={() => {
              setActiveFrame('manage');
            }}
          >
            Jump To Manage
          </Btn>
        )}
      </ButtonContainer>

      <UnionDetailContent>
        {/* Basic Union Info */}
        <UnionInfoPane union={union} uiManager={uiManager} />

        {/* If you are in member list */}
        {isMember(union, account) && !isLeader(union, account) && (
          <UnionDetailContent>
            <p> You are a member of this union.</p>

            <div>
              <Green>NOTE:</Green> After you leave one union, you need to wait{' '}
              {formatDuration(unionRejoinCooldown * 1000)} before you can join a new union again.{' '}
            </div>

            <Btn disabled={isProcessing} onClick={handleLeaveUnion}>
              Leave Union
            </Btn>
          </UnionDetailContent>
        )}
        {/* If you are in invitee list */}
        {isInvitee(union, account) && (
          <UnionDetailContent>
            <p>
              <Blue>INFO: </Blue> Congratulations, you have been invited to join this union!
            </p>

            {!leaveUnionCooldownPassed && (
              <p>
                <Blue>INFO: </Blue>
                You must wait{' '}
                <TimeUntil timestamp={nextApplyUnionAvailableTimestamp} ifPassed={'now!'} />
                &amp;nbsp; to rejoin another union
              </p>
            )}

            <Btn disabled={!leaveUnionCooldownPassed || isProcessing} onClick={handleAcceptInvite}>
              Accept Invition
            </Btn>
          </UnionDetailContent>
        )}
        {/* If you are in applicant list */}
        {isApplicant(union, account) && (
          <UnionDetailContent>
            <p>
              <Blue>INFO: </Blue>You have applied to join this union. Please wait patiently or
              contact the union leader.
            </p>
          </UnionDetailContent>
        )}

        {/* Player not in union */}
        {!isApplicant(union, account) && !isPlayerInUnion(account) && (
          <UnionDetailContent>
            <p>
              <Blue>INFO: </Blue>You are not currently in a union.
            </p>
            {!leaveUnionCooldownPassed && (
              <p>
                <Blue>INFO: </Blue> You must wait{' '}
                <TimeUntil timestamp={nextApplyUnionAvailableTimestamp} ifPassed={'now!'} />
                to rejoin another union
              </p>
            )}
            <Btn
              disabled={!leaveUnionCooldownPassed || isProcessing}
              onClick={handleSendApplication}
            >
              Send Application to this union
            </Btn>
          </UnionDetailContent>
        )}
      </UnionDetailContent>
    </>
  );
}
