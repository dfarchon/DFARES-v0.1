import { ModalName } from '@darkforest_eth/types';
import { Client, KeyPairsType, SignClientCallBackType } from '@web3mq/client';
import {
  AppTypeEnum,
  Button,
  Channel,
  Chat,
  ChatAutoComplete,
  ConnectMessage,
  DashBoard,
  LoginModal,
  MessageConsole,
  MessageHeader,
  MessageInput,
  MessageList,
  Notification,
  Notify,
  useChatContext,
  Window,
} from '@web3mq/react-components';
import '@web3mq/react-components/dist/css/index.css';
import cx from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Section } from '../Components/CoreUI';
import { ModalPane } from '../Views/ModalPane';
import './chatfusion-pane.css';
import {
  ConnectWalletIcon,
  LoginBgcIcon,
  LoginCenterIcon,
  OpenModalIcon,
  WarningIcon,
} from './icons';
declare type MainKeysType = {
  publicKey: string;
  privateKey: string;
  walletAddress: string;
};
const useLogin = () => {
  const hasKeys = useMemo(() => {
    const PrivateKey = localStorage.getItem('PRIVATE_KEY') || '';
    const PublicKey = localStorage.getItem('PUBLIC_KEY') || '';
    const userid = localStorage.getItem('userid') || '';
    if (PrivateKey && PublicKey && userid) {
      return { PrivateKey, PublicKey, userid };
    }
    return null;
  }, []);

  const [keys, setKeys] = useState<KeyPairsType | null>(hasKeys);
  const [fastestUrl, setFastUrl] = useState<string | null>(null);

  const init = async () => {
    const tempPubkey = localStorage.getItem('PUBLIC_KEY') || '';
    const didKey = localStorage.getItem('DID_KEY') || '';
    const fastUrl = await Client.init({
      connectUrl: localStorage.getItem('FAST_URL'),
      app_key: 'SDrulLdGJGQSOkkK',
      didKey,
      tempPubkey,
    });
    localStorage.setItem('FAST_URL', fastUrl);
    setFastUrl(fastUrl);
  };

  const logout = () => {
    localStorage.setItem('PRIVATE_KEY', '');
    localStorage.setItem('PUBLIC_KEY', '');
    localStorage.setItem('DID_KEY', '');
    localStorage.setItem('userid', '');
    setKeys(null);
  };

  const handleEvent = (options: SignClientCallBackType) => {
    const { type, data } = options;
    console.log(`${type} ====>`, data);
    if (type === 'keys') {
      const { private_key: PrivateKey, pubkey: PublicKey, userid } = data;
      localStorage.setItem('PRIVATE_KEY', PrivateKey);
      localStorage.setItem('PUBLICKEY', PublicKey);
      localStorage.setItem('USERID', userid);
      setKeys({ PrivateKey, PublicKey, userid });

      // message.success('login success', 2).then(() => {
      // });
    }
  };

  const handleLoginEvent = (eventData: any) => {
    if (eventData.data) {
      if (eventData.type === 'login') {
        const {
          privateKey,
          publicKey,
          tempPrivateKey,
          tempPublicKey,
          didKey,
          userid,
          address,
          pubkeyExpiredTimestamp,
        } = eventData.data;
        localStorage.setItem('userid', userid);
        localStorage.setItem('PRIVATE_KEY', tempPrivateKey);
        localStorage.setItem('PUBLIC_KEY', tempPublicKey);
        localStorage.setItem('WALLET_ADDRESS', address);
        localStorage.setItem(`MAIN_PRIVATE_KEY`, privateKey);
        localStorage.setItem(`MAIN_PUBLIC_KEY`, publicKey);
        localStorage.setItem(`DID_KEY`, didKey);
        localStorage.setItem('PUBKEY_EXPIRED_TIMESTAMP', String(pubkeyExpiredTimestamp));
        setKeys({
          PrivateKey: tempPrivateKey,
          PublicKey: tempPublicKey,
          userid,
        });
      }
      if (eventData.type === 'register') {
        const { privateKey, publicKey, address } = eventData.data;
        localStorage.setItem('WALLET_ADDRESS', address);
        localStorage.setItem(`MAIN_PRIVATE_KEY`, privateKey);
        localStorage.setItem(`MAIN_PUBLIC_KEY`, publicKey);
      }
    }
  };

  return {
    keys,
    fastestUrl,
    init,
    handleLoginEvent,
    logout,
    handleEvent,
    setKeys,
  };
};

const MsgInput: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  // const { appType } = useChatContext('MsgInput');
  const RenderOperation = useCallback(() => {
    return (
      <div className='operationContainer'>
        <div className='operation'>
          <Notify />
        </div>
        <div className='warning'>
          <WarningIcon className='icon' />
          General smart contract support is coming soon
        </div>
      </div>
    );
  }, []);

  return (
    <>
      <div className='inputBox'>
        <OpenModalIcon className='auditBox' onClick={() => setVisible(!visible)} />
        <ChatAutoComplete />
      </div>
      {visible && <RenderOperation />}
    </>
  );
};

const Main = () => {
  const { activeNotification } = useChatContext('Main');

  return (
    <div style={{ height: '100%' }}>
      <Channel
        className={cx({
          hide: activeNotification,
        })}
      >
        <Window>
          <MessageHeader avatarSize={40} />
          <MessageList />
          {/* <MessageInput Input={MsgInput} /> */}
          <MessageConsole Input={<MessageInput Input={MsgInput} />} />
        </Window>
      </Channel>
      <Notification />
    </div>
  );
};

const ChatFusionContent = styled.div`
  width: 1000px;
  height: 800px;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  text-align: justify;
`;

export function ChatFusionPane({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const {
    keys,
    fastestUrl,
    init,
    logout,
    // setKeys,
    // handleEvent,
    handleLoginEvent,
  } = useLogin();

  const appType = AppTypeEnum['pc'];
  //get df info from browser

  useEffect(() => {
    init();
    document.getElementsByTagName('body')[0].setAttribute('data-theme', 'dark');
  }, []);

  if (!keys) {
    let mainKeys: MainKeysType = {
      publicKey: '',
      privateKey: '',
      walletAddress: '',
    };
    const mainPrivateKey = localStorage.getItem(`MAIN_PRIVATE_KEY`);
    const mainPublicKey = localStorage.getItem(`MAIN_PUBLIC_KEY`);
    const address = localStorage.getItem('WALLET_ADDRESS');
    if (mainPublicKey && mainPrivateKey && address) {
      mainKeys = {
        publicKey: mainPublicKey,
        privateKey: mainPrivateKey,
        walletAddress: address,
      };
    }
    return (
      <ModalPane id={ModalName.ChatFusion} title='ChatFusion' visible={visible} onClose={onClose}>
        <ChatFusionContent>
          <Section>
            <div className='login_container'>
              <div className='test-bgc'>
                <LoginBgcIcon />
              </div>
              <div className={'connectBtnBox'}>
                <LoginCenterIcon />
                <div className='connectBtnBoxTitle'>Welcome to Web3MQ</div>
                <div className='connectBtnBoxText'>
                  Let's get started with your decentralized trip now!
                </div>
                <div className='walletConnect-btnBox'>
                  <LoginModal
                    env={'dev'}
                    containerId={''}
                    keys={mainKeys}
                    handleOperationEvent={handleLoginEvent}
                    appType={appType}
                    styles={{
                      addressBox: {
                        width: '281px',
                      },
                    }}
                    customBtnNode={
                      <Button
                        icon={<ConnectWalletIcon />}
                        type={'primary'}
                        className='walletConnect-btn'
                        disabled={!fastestUrl}
                      >
                        {fastestUrl ? 'Connect' : 'Initializing'}
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>
          </Section>
        </ChatFusionContent>
      </ModalPane>
    );
  }

  if (!fastestUrl) {
    return null;
  }

  const client = Client.getInstance(keys);
  return (
    <ModalPane id={ModalName.ChatFusion} title='ChatFusion' visible={visible} onClose={onClose}>
      <ChatFusionContent>
        <Chat client={client} appType={appType} logout={logout}>
          <ConnectMessage />
          <DashBoard />
          <Main />
        </Chat>
      </ChatFusionContent>
    </ModalPane>
  );
}
