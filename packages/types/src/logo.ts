import type { Abstract } from './utility';

export type LogoType = Abstract<number, 'LogoType'>;

/**
 * Enumeration of logo types.
 */
export const LogoType = {
  Unknown: 0 as LogoType,
  DF: 1 as LogoType,
  Lattice: 2 as LogoType,
  Redstone: 3 as LogoType,
  DFARES: 4 as LogoType,
  DFArchon: 5 as LogoType,
  AGLDDAO: 6 as LogoType,
  Mask: 7 as LogoType,
  Web3MQ: 8 as LogoType,
  AltLayer: 9 as LogoType,
  FunBlocks: 10 as LogoType,
  GamePhylum: 11 as LogoType,
  OrdenGG: 12 as LogoType,
  DFDAO: 13 as LogoType,
  MarrowDAO: 14 as LogoType,
  Two77DAO: 15 as LogoType,
  WeirdaoGhostGang: 16 as LogoType,
  Overlords: 17 as LogoType,
  WASD: 18 as LogoType,
  WorldExplorers: 19 as LogoType,
  AWHouse: 20 as LogoType,
  GGQuest: 21 as LogoType,
  ComposableLabs: 22 as LogoType,
  AWResearch: 23 as LogoType,
  LXDAO: 24 as LogoType,
  CryptoChasers: 25 as LogoType,
  MetaCat: 26 as LogoType,
  BlockPi: 27 as LogoType,
  BlockBeats: 28 as LogoType,
  ChainCatcher: 29 as LogoType,
  NetherScape: 30 as LogoType,
  SeeDAO: 31 as LogoType,
  Gametaverse: 32 as LogoType,
  GWGDAO: 33 as LogoType,
  Web3Games: 34 as LogoType,

  // Don't forget to update MIN_LOGO_TYPE and/or MAX_LOGO_TYPE in the `constants` package
};

/**
 * Mapping from LogoType to pretty-printed names.
 */
export const LogoTypeNames = {
  [LogoType.Unknown]: 'Unknown',
  [LogoType.DF]: 'Dark Forest',
  [LogoType.Lattice]: 'Lattice',
  [LogoType.Redstone]: 'Redstone',
  [LogoType.DFARES]: 'DF ARES',
  [LogoType.DFArchon]: 'DF Archon',
  [LogoType.AGLDDAO]: 'AGLD DAO',
  [LogoType.Mask]: 'Mask Network',
  [LogoType.Web3MQ]: 'Web3MQ',
  [LogoType.AltLayer]: 'AltLayer',
  [LogoType.FunBlocks]: 'Fun Blocks',
  [LogoType.GamePhylum]: 'GamePhylum',
  [LogoType.OrdenGG]: 'Orden GG',
  [LogoType.DFDAO]: 'DFDAO',
  [LogoType.MarrowDAO]: 'MarrowDAO | Guild W',
  [LogoType.Two77DAO]: '277 DAO',
  [LogoType.WeirdaoGhostGang]: 'Weirdao Ghost Gang',
  [LogoType.Overlords]: 'OVERLORDS',
  [LogoType.WASD]: 'WASD',
  [LogoType.WorldExplorers]: 'World Explorers',
  [LogoType.AWHouse]: 'AWHouse',
  [LogoType.GGQuest]: 'GGQuest',
  [LogoType.ComposableLabs]: 'Composable Labs',
  [LogoType.AWResearch]: 'AW Research',
  [LogoType.LXDAO]: 'LXDAO',
  [LogoType.CryptoChasers]: 'Crypto Chasers',
  [LogoType.MetaCat]: 'MetaCat',
  [LogoType.BlockPi]: 'BlockPi',
  [LogoType.BlockBeats]: 'BlockBeats',
  [LogoType.ChainCatcher]: 'ChainCatcher',
  [LogoType.NetherScape]: 'NetherScape',
  [LogoType.SeeDAO]: 'SeeDAO',
  [LogoType.Gametaverse]: 'Gametaverse',
  [LogoType.GWGDAO]: 'GWGDAO',
  [LogoType.Web3Games]: 'Web3Games',
} as const;
