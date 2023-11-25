import { newDateFormat, type Client, type FollowOperationApiParams, type FollowOperationParams, type ServiceResponse } from '@web3mq/client';
import { Button, Modal, useChatContext } from '@web3mq/react-components';
import { ethers } from 'ethers';
import { sha3_224 } from 'js-sha3';
import React, { useState } from 'react';
import { Request, request } from '../core/request';
import { ExclamationCircleIcon } from '../icons';
import useToggle from '../utils/useToggle';
import { AddFriends } from './AddFriends';
import './index.css';

type FollowRequestButtonGroupProps = {
  client: Client;
  containerId?: string;
  followDisabled?: boolean;
  warnText?: string;
  showFollow?: boolean;
  showBlockBtn?: boolean;
  userId?: string;
  onFollow?: () => void;
  onCancel?: () => void;
};
const timeIdObject: Record<string, NodeJS.Timeout> = {};

export const FollowRequestButtonGroup: React.FC<FollowRequestButtonGroupProps> = (props) => {
  const {
    client,
    containerId = '',
    followDisabled,
    warnText,
    showFollow = false,
    showBlockBtn = false,
    userId = '',
    onCancel,
    onFollow,
  } = props;
  const { loginUserInfo } = useChatContext();
  const { visible, show, hide } = useToggle();
  const [isFollow, setIsFollow] = useState<boolean>(false);
  const [isRequest, setIsRequest] = useState<boolean>(false);

  const followOperationRequest = async (payload: FollowOperationApiParams) => {
    return await request.post('/api/following/', payload);
  };

  async function followOperation(params: FollowOperationParams): Promise<ServiceResponse> {
    const { address, targetUserid, action, didType } = params;
    const userid  = localStorage.getItem('userid') || null;
    const timestamp = Date.now();
    const nonce = sha3_224(userid + action + targetUserid + timestamp);
    const sign_content = `
    Web3MQ wants you to sign in with your ${didType} account:
    ${address}

    For follow signature

    Nonce: ${nonce}
    Issued At: ${newDateFormat(timestamp, 'Y/m/d h:i')}`;
    // const { sign: did_signature, publicKey: did_pubkey = '' } = await
    // Client.register.sign(sign_content, address, didType);
    const privateKey = df.getPrivateKey() || ''
    const wallet = new ethers.Wallet(privateKey);

    const did_signature = await wallet.signMessage(sign_content);
    const fastUrl = localStorage.getItem('FAST_URL') || '';
    const tempPubkey = localStorage.getItem('PUBLIC_KEY') || '';
    const didKey = localStorage.getItem('DID_KEY') || '';
    new Request(fastUrl, tempPubkey, didKey);
    const data = await followOperationRequest({
      did_pubkey: localStorage.getItem('MAIN_PUBLIC_KEY') || '',
      did_signature,
      sign_content,
      userid: userid || '',
      timestamp,
      address,
      action,
      did_type: didType,
      target_userid: targetUserid
    });
    if (client.listeners.events['contact.updateList']) {
      client.emit('contact.updateList', { type: 'contact.updateList' });
    };
    return data as any;
  }

  const handleFollow = async (callback?: () => void) => {
    try {
      if (loginUserInfo) {
        await followOperation({
          targetUserid: userId,
          action: 'follow',
          address: loginUserInfo.address,
          didType: loginUserInfo.wallet_type as any,
        });
        setIsFollow(true);
        callback && callback();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFollowOrRequest = async (type: boolean) => {
    if (type) {
      try {
        await handleFollow(onFollow);
      } catch (error) {
        console.log(error);
      }
    } else {
      show();
    }
  };
  const handleCancel = () => {
    onCancel && onCancel();
  };
  const addFriendCallback = () => {
    if (userId) {
      timeIdObject[userId] && clearTimeout(timeIdObject[userId]);
      hide();
      setIsRequest(true);
      timeIdObject[userId] = setTimeout(() => {
        setIsRequest(false);
      }, 60000);
    }
  };

  return (
    <div className="operateFollowRequestBar">
      {warnText && (
        <div className="warning">
          <ExclamationCircleIcon className="warnIcon"/>
          {warnText}
        </div>
      )}
      {userId && (
        <>
          {showBlockBtn && !showFollow && (
            <Button
              block
              disabled={isFollow}
              size='large'
              style={{ marginBottom: '16px' }}
              type='primary'
              onClick={() => handleFollow()}
            >
              {!isFollow ? 'Follow' : 'Following'}
            </Button>
          )}
          <Button className="cancelBtn" size='large' onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            className="operateBtn"
            disabled={showFollow ? followDisabled || isFollow : isRequest}
            size='large'
            type={showBlockBtn ? 'ghost' : 'primary'}
            onClick={() => handleFollowOrRequest(showFollow)}
          >
            {showFollow
              ? !isFollow
                ? 'Follow'
                : 'Following'
              : !isRequest
              ? 'Request'
              : 'Requesting'}
          </Button>
        </>
      )}
      <Modal
        containerId={containerId}
        dialogClassName="dialogContent"
        title='Request'
        visible={visible}
        closeModal={hide}
      >
        <AddFriends client={client} disabled={true} userId={userId} onSubmit={addFriendCallback} />
      </Modal>
    </div>
  );
};
