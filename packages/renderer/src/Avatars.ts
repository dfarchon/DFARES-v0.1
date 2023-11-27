import { PICTURE_URL } from '@dfares/constants';
import { AvatarType } from '@dfares/types';
export type Avatar = {
  legacy: boolean;
  topLayer: Array<string>;
  bottomLayer: Array<string>;
  // image?: () => Promise<HTMLImageElement>;
};

const URL = PICTURE_URL;

const Jasonlool = {
  legacy: false,
  topLayer: [URL + '/img/avatar/Jasonlool.png'],
  bottomLayer: [],
  // image: () =>
  //   new Promise<HTMLImageElement>((resolve) => {
  //     const img = new Image();
  //     img.src = 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=025';
  //     img.onload = () => resolve(img);
  //   }),
};

const Santagnel = {
  legacy: false,
  topLayer: [URL + '/img/avatar/Santagnel.png'],
  bottomLayer: [],
};

const OriginTiger = {
  legacy: false,
  topLayer: [URL + '/img/avatar/OriginTiger.png'],
  bottomLayer: [],
};

const zeroxviviyorg = {
  legacy: false,
  topLayer: [URL + '/img/avatar/zeroxviviyorg.png'],
  bottomLayer: [],
};

const ikun = {
  legacy: false,
  topLayer: [URL + '/img/avatar/ikun.png'],
  bottomLayer: [],
};

const BaliGee = {
  legacy: false,
  topLayer: [URL + '/img/avatar/BaliGee.png'],
  bottomLayer: [],
};

const DDY = {
  legacy: false,
  topLayer: [URL + '/img/avatar/ddy.png'],
  bottomLayer: [],
};

const Blue = {
  legacy: false,
  topLayer: [URL + '/img/avatar/Blue.png'],
  bottomLayer: [],
};

const DeFi3 = {
  legacy: false,
  topLayer: [URL + '/img/avatar/defi3.png'],
  bottomLayer: [],
};

export const avatarFromType = (type: AvatarType): Avatar => avatars[type];

export const avatars: Record<AvatarType, Avatar> = {
  [AvatarType.Jasonlool]: Jasonlool,
  [AvatarType.Santagnel]: Santagnel,
  [AvatarType.OriginTiger]: OriginTiger,
  [AvatarType.Zeroxviviyorg]: zeroxviviyorg,
  [AvatarType.Ikun]: ikun,
  [AvatarType.BaliGee]: BaliGee,
  [AvatarType.DDY]: DDY,
  [AvatarType.Blue]: Blue,
  [AvatarType.DeFi3]: DeFi3,
};
