import { ModalName } from '@dfares/types';
import { Client } from '@web3mq/client';
import {
  AppTypeEnum,
  Button,
  Channel,
  ChannelList,
  Chat,
  ChatAutoComplete,
  ConnectMessage,
  ContactList,
  DashBoard,
  Loading,
  MessageConsole,
  MessageHeader,
  MessageInput,
  MessageList,
  NotificationList,
  NotificationModal,
  Notify,
  useChatContext,
  Window,
} from '@web3mq/react-components';
import '@web3mq/react-components/dist/css/index.css';
import { Button as AntdBtn, Form, Input, message, Space } from 'antd';
import cx from 'classnames';
import { ethers } from 'ethers';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Btn } from '../Components/Btn';
import { TextInput } from '../Components/Input';
import { ModalPane } from '../Views/ModalPane';
// import './chatfusion-pane.css';
import {
  ChatsIcon,
  ConnectWalletIcon,
  LoginCenterIcon,
  NotificationIcon,
  OpenModalIcon,
  RoomsIcon,
  WarningIcon,
} from './ChatFusionComponent/icons';
import { Notification } from './ChatFusionComponent/Notification/Notification';
import { useLogin } from './ChatFusionComponent/utils/useLogin';
declare type MainKeysType = {
  publicKey: string;
  privateKey: string;
  walletAddress: string;
};

type TabType = {
  title: string;
  icon: React.ReactNode;
  type: string;
  component: React.ReactNode;
};

enum showTypeEnum {
  'list' = 'list',
  'modal' = 'modal',
}
const showNotificationType: showTypeEnum = showTypeEnum['list'];
const PCTabs: TabType[] = [
  {
    title: 'Rooms',
    icon: <RoomsIcon />,
    type: 'room',
    component: <ChannelList />,
  },
  {
    title: 'Contact',
    icon: <ChatsIcon />,
    type: 'chat',
    component: <ContactList />,
  },
  {
    title: 'Notification',
    icon:
      showNotificationType === showTypeEnum['list'] ? <NotificationIcon /> : <NotificationModal />,
    type: 'Notification',
    component: <NotificationList style={{ width: '360px' }} />,
  },
];

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
  const [loading, setLoading] = useState(false);
  const [formRef] = Form.useForm();

  const handleLogin = async () => {
    // The public-private key pair returned after registration
    try {
      setLoading(true);
      const values = formRef.getFieldsValue(true);
      debugger;
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
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      message.error('Login failed!');
    }
  };

  const backToLastStep = () => {
    setStep(0);
  };

  const getSimpleId = (userId: string) => {
    if (!userId) {
      return 'user not exist';
    } else {
      const simpleStr = userId.substring(0, 8) + '***' + userId.substring(userId.length - 5);
      return simpleStr;
    }
  };

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className='reg-form'>
            LoginUser:
            {getSimpleId(userInfo.userid)}
          </div>
          <div>
            <Form
              name='basic'
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              style={{ maxWidth: 600 }}
              onFinish={handleLogin}
              autoComplete='off'
              form={formRef}
              initialValues={{ password: '' }}
            >
              <Form.Item
                label='Password'
                name='password'
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <TextInput placeholder='input your password' />
              </Form.Item>

              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Space style={{ display: 'flex' }}>
                  <Btn size='stretch' onClick={handleLogin}>
                    Login
                  </Btn>
                  <Btn onClick={backToLastStep}>Back to connecting</Btn>
                </Space>
              </Form.Item>
            </Form>
          </div>
          <div>Powered by Web3MQ</div>
        </>
      )}
    </div>
  );
};

type WalletType = 'eth' | 'starknet' | 'qrcode';

const RegistModule = (props: any) => {
  const { wallet, handleLoginEvent, userInfo, address, setStep } = props;
  const walletType: WalletType = 'eth';

  const handleRegist = async (values: any) => {
    try {
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
        // avatar_url: '/public/img/chat-user-icon.png',
        signature: registerSignature,
      };
      debugger;
      const registerRes = await Client.register.register(params);
      // reset password
      // const resetRes = await Client.register.resetPassword(params);
      console.log('注册结果' + registerRes);
      setStep(0);
      handleLoginEvent({
        type: 'register',
        data: {
          privateKey: mainPrivateKey,
          publicKey: mainPublicKey,
          address,
        },
      });
    } catch (error) {
      setStep(0);
      message.error('Register failed:' + JSON.stringify(error));
      console.log('Register failed' + JSON.stringify(error));
    }
  };
  return (
    <div>
      <div style={{ padding: '20px 10px' }}>
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
            label='NickName:'
            name='nickName'
            rules={[{ required: true, message: 'Please input your NickName!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label='Password:'
            name='password'
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label='PasswordConfirm:'
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

      <AntdBtn onClick={() => setStep(0)}>Back</AntdBtn>
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
      console.log(mainKeys);
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
          <DashBoard PCTabMaps={PCTabs} />
          <Main />
        </Chat>
      </ChatFusionContent>
    </ModalPane>
  );
}
