import { Client, KeyPairsType, SignClientCallBackType } from '@web3mq/client';
import '@web3mq/react-components/dist/css/index.css';
import { useMemo, useState } from 'react';

export const useLogin = () => {
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
    const appKey = process.env.WEB3MQ_APP_KEY!;

    const fastUrl = await Client.init({
      connectUrl: localStorage.getItem('FAST_URL'),
      app_key: appKey.toString(),
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
