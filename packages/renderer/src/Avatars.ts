import { PICTURE_URL } from '@dfares/constants';
import { AvatarType } from '@dfares/types';
export type Avatar = {
  legacy: boolean;
  topLayer: Array<string>;
  bottomLayer: Array<string>;
  // image?: () => Promise<HTMLImageElement>;
};

const URL = PICTURE_URL;

// const Picture = {
//   legacy: false,
//   topLayer: [URL + '/img/avatar/Picture.png'],
//   bottomLayer: [],
//   // image: () =>
//   //   new Promise<HTMLImageElement>((resolve) => {
//   //     const img = new Image();
//   //     img.src = 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=025';
//   //     img.onload = () => resolve(img);
//   //   }),
// };

const Cathy = {
  legacy: false,
  topLayer: [URL + '/img/avatar/Cathy.png'],
  bottomLayer: [],
};

const BaliGee = {
  legacy: false,
  topLayer: [URL + '/img/avatar/BaliGee.png'],
  bottomLayer: [],
};

const Christine = {
  legacy: false,
  topLayer: [URL + '/img/avatar/Christine.png'],
  bottomLayer: [],
};

const Ddy = {
  legacy: false,
  topLayer: [URL + '/img/avatar/ddy.png'],
  bottomLayer: [],
};

const Flicka = {
  legacy: false,
  topLayer: [URL + '/img/avatar/Flicka.png'],
  bottomLayer: [],
};

const Gink = {
  legacy: false,
  topLayer: [URL + '/img/avatar/gink.png'],
  bottomLayer: [],
};

const Hope = {
  legacy: false,
  topLayer: [URL + '/img/avatar/Hope.png'],
  bottomLayer: [],
};

const Modukon = {
  legacy: false,
  topLayer: [URL + '/img/avatar/modukon.png'],
  bottomLayer: [],
};

const Wesely = {
  legacy: false,
  topLayer: [URL + '/img/avatar/wesely.png'],
  bottomLayer: [],
};

const Zeroxlau = {
  legacy: false,
  topLayer: [URL + '/img/avatar/0xlau.png'],
  bottomLayer: [],
};

const Hooks = {
  legacy: false,
  topLayer: [URL + '/img/avatar/hooks.png'],
  bottomLayer: [],
};

const k1ic = {
  legacy: false,
  topLayer: [URL + '/img/avatar/k1ic.png'],
  bottomLayer: [],
};

const zknevermore = {
  legacy: false,
  topLayer: [URL + '/img/avatar/zknevermore.png'],
  bottomLayer: [],
};

const ZOOJOO = {
  legacy: false,
  topLayer: [URL + '/img/avatar/ZOOJOO.png'],
  bottomLayer: [],
};

const ZT = {
  legacy: false,
  topLayer: [URL + '/img/avatar/ZT.png'],
  bottomLayer: [],
};

const Skoon = {
  legacy: false,
  topLayer: [URL + '/img/avatar/skooh.png'],
  bottomLayer: [],
};

const MUDAI = {
  legacy: false,
  topLayer: [URL + '/img/avatar/MUDAI.png'],
  bottomLayer: [],
};

const Xiaoyifu = {
  legacy: false,
  topLayer: [URL + '/img/avatar/xiaoyifu.png'],
  bottomLayer: [],
};

const Yuppie = {
  legacy: false,
  topLayer: [URL + '/img/avatar/yuppie.png'],
  bottomLayer: [],
};

export const avatarFromType = (type: AvatarType): Avatar => avatars[type];

export const avatars: Record<AvatarType, Avatar> = {
  [AvatarType.Cathy]: Cathy,
  [AvatarType.BaliGee]: BaliGee,
  [AvatarType.Christine]: Christine,
  [AvatarType.Ddy]: Ddy,
  [AvatarType.Flicka]: Flicka,
  [AvatarType.Gink]: Gink,
  [AvatarType.Hope]: Hope,
  [AvatarType.Modukon]: Modukon,
  [AvatarType.Wesely]: Wesely,
  [AvatarType.Zeroxlau]: Zeroxlau,
  [AvatarType.Hooks]: Hooks,
  [AvatarType.k1ic]: k1ic,
  [AvatarType.zknevermore]: zknevermore,
  [AvatarType.ZOOJOO]: ZOOJOO,
  [AvatarType.ZT]: ZT,
  [AvatarType.Skoon]: Skoon,
  [AvatarType.MUDAI]: MUDAI,
  [AvatarType.Xiaoyifu]: Xiaoyifu,
  [AvatarType.Yuppie]: Yuppie,
};
