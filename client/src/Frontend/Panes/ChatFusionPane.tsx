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
  Loading,
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
import { Button as AntdBtn, Form, Input, message } from 'antd';
import cx from 'classnames';
import { ethers } from 'ethers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ModalPane } from '../Views/ModalPane';
import './chatfusion-pane.css';
import { ConnectWalletIcon, LoginCenterIcon, OpenModalIcon, WarningIcon } from './icons';
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
    <div style={{ height: '100%', width: '100%' }}>
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

const LoginModule = (props: any) => {
  const { wallet, handleLoginEvent, userInfo, address, setStep } = props;
  const walletType = 'eth';

  const handleLogin = async (values: any) => {
    // The public-private key pair returned after registration
    let localMainPrivateKey = localStorage.getItem('MAIN_PRIVATE_KEY') || '';
    let localMainPublicKey = localStorage.getItem('MAIN_PUBLIC_KEY') || '';
    const tempTime = Number(localStorage.getItem('PUBKEY_EXPIRED_TIMESTAMP')) || undefined;
    const password = values.password;
    if (!localMainPublicKey) {
      const { signContent } = await Client.register.getMainKeypairSignContent({
        password,
        did_value: address,
        did_type: walletType,
      });
      const signature = await wallet.signMessage(signContent);
      const { publicKey, secretKey } = await Client.register.getMainKeypairBySignature(
        signature,
        password
      );
      localMainPublicKey = publicKey;
      localMainPrivateKey = secretKey;
    }

    const options = await Client.register.login({
      mainPrivateKey: localMainPrivateKey,
      mainPublicKey: localMainPublicKey,
      didType: walletType,
      didValue: address,
      userid: userInfo.userid,
      password,
      pubkeyExpiredTimestamp: tempTime,
    });
    message.success('Login successfully!');
    handleLoginEvent({
      type: 'login',
      data: {
        privateKey: options.mainPrivateKey,
        publicKey: options.mainPublicKey,
        tempPrivateKey: options.tempPrivateKey,
        tempPublicKey: options.tempPublicKey,
        didKey: walletType + ':' + address,
        userid: userInfo.userid,
        address,
        pubkeyExpiredTimestamp: options.pubkeyExpiredTimestamp,
      },
    });
  };

  const backToLastStep = () => {
    setStep(0);
  };

  return (
    <div>
      <AntdBtn onClick={backToLastStep}>Back</AntdBtn>
      <div>Current user account:{userInfo.userid}</div>
      <div>
        <Form
          name='basic'
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={handleLogin}
          autoComplete='off'
        >
          <Form.Item
            label='Password'
            name='password'
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <AntdBtn type='primary' htmlType='submit'>
              Login
            </AntdBtn>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

type WalletType = 'eth' | 'starknet' | 'qrcode';

const RegistModule = (props: any) => {
  const { wallet, handleLoginEvent, userInfo, address, setStep } = props;
  const walletType: WalletType = 'eth';

  const handleRegist = async (values: any) => {
    const { password, passwordConfirm, nickName } = values;
    if (password !== passwordConfirm) {
      message.warning('The input passwords do not match');
      return;
    }
    const { signContent: mainKeysSignContent } = await Client.register.getMainKeypairSignContent({
      password,
      did_value: address,
      did_type: walletType,
    });
    const mainKeySignature = await wallet.signMessage(mainKeysSignContent);
    //获取web3mq的publicKey
    const { publicKey: mainPublicKey, secretKey: mainPrivateKey } =
      await Client.register.getMainKeypairBySignature(mainKeySignature, password);

    // const registerSignContent = aw Client.register.
    const { signContent: registerSignContent } = await Client.register.getRegisterSignContent({
      userid: userInfo.userid,
      mainPublicKey,
      didType: walletType,
      didValue: address,
    });

    const registerSignature = await wallet.signMessage(registerSignContent);
    const params = {
      userid: userInfo.userid,
      didValue: address,
      mainPublicKey: mainPublicKey,
      did_pubkey: '',
      didType: walletType,
      nickname: nickName,
      avatar_url: '',
      signature: registerSignature,
    };
    const registerRes = await Client.register.register(params);
    // reset password
    // const resetRes = await Client.register.resetPassword(params);
    console.log('注册结果' + registerRes);
    handleLoginEvent({
      type: 'register',
      data: {
        privateKey: mainPrivateKey,
        publicKey: mainPublicKey,
        address,
      },
    });
  };
  return (
    <div>
      <AntdBtn onClick={() => setStep(0)}>Back</AntdBtn>
      <Form
        name='basic'
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={handleRegist}
        autoComplete='off'
      >
        <Form.Item
          label='NickName'
          name='nickName'
          rules={[{ required: true, message: 'Please input your NickName!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label='Password'
          name='password'
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label='PasswordConfirm'
          name='passwordConfirm'
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <AntdBtn type='primary' htmlType='submit'>
            Register
          </AntdBtn>
        </Form.Item>
      </Form>
    </div>
  );
};

const ChatFusionContent = styled.div`
  width: 900px;
  height: 700px;
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
  const address = df.getAddress() || '';
  const privateKey = df.getPrivateKey() || '';
  const walletType = 'eth';
  const wallet = new ethers.Wallet(privateKey);

  const [userInfo, setUserInfo] = useState({ userid: '', userExist: false });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    init();
    document.getElementsByTagName('body')[0].setAttribute('data-theme', 'dark');
  }, []);

  const getAccount = async () => {
    setLoading(true);
    const { userid, userExist } = await Client.register.getUserInfo({
      did_value: address,
      did_type: walletType,
    });
    setLoading(false);
    setStep(1);
    setUserInfo({
      userid,
      userExist,
    });
  };

  if (!keys) {
    let mainKeys: MainKeysType = {
      publicKey: '',
      privateKey: '',
      walletAddress: '',
    };
    const mainPrivateKey = localStorage.getItem(`MAIN_PRIVATE_KEY`);
    const mainPublicKey = localStorage.getItem(`MAIN_PUBLIC_KEY`);
    // const address = localStorage.getItem('WALLET_ADDRESS');
    if (mainPublicKey && mainPrivateKey && address) {
      mainKeys = {
        publicKey: mainPublicKey,
        privateKey: mainPrivateKey,
        walletAddress: address,
      };
    }
    //如果keys不存在，mainKeys也不存在 判断是否存在此账号，存在进入登陆，不存在
    //进入注册

    return (
      <ModalPane id={ModalName.ChatFusion} title='ChatFusion' visible={visible} onClose={onClose}>
        <ChatFusionContent>
          {loading ? (
            <Loading />
          ) : (
            <div className='login_container'>
              <div className={'connectBtnBox'}>
                <LoginCenterIcon />
                <div className='connectBtnBoxTitle'>Welcome to Web3MQ</div>
                <div className='connectBtnBoxText'>
                  Let's get started with your decentralized trip now!
                </div>
                {step === 1 && (
                  <>
                    {userInfo.userExist ? (
                      <LoginModule
                        wallet={wallet}
                        userInfo={userInfo}
                        handleLoginEvent={handleLoginEvent}
                        address={address}
                        setStep={setStep}
                      />
                    ) : (
                      <RegistModule
                        wallet={wallet}
                        userInfo={userInfo}
                        handleLoginEvent={handleLoginEvent}
                        address={address}
                        setStep={setStep}
                      />
                    )}
                  </>
                )}
                {step === 0 && (
                  <div className='walletConnect-btnBox'>
                    <Button
                      icon={<ConnectWalletIcon />}
                      type={'primary'}
                      className='walletConnect-btn'
                      disabled={!fastestUrl}
                      onClick={getAccount}
                    >
                      {fastestUrl ? 'Connect' : 'Initializing'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
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
