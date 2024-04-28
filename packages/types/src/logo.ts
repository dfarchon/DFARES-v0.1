import type { Abstract } from './utility';

export type LogoType = Abstract<number, 'LogoType'>;

/**
 * Enumeration of logo types.
 */
export const LogoType = {
  Unknown: 0 as LogoType,
  DarkForest: 1 as LogoType,
  Lattice: 2 as LogoType,
  Redstone: 3 as LogoType,
  Mud: 4 as LogoType,
  Biomes: 5 as LogoType,
  ThisCursedMachine: 6 as LogoType,
  SkyStrife: 7 as LogoType,
  SmallBrainGames: 8 as LogoType,
  DownStream: 9 as LogoType,
  Dear: 10 as LogoType,
  DFARES: 11 as LogoType,
  PixeLAW: 12 as LogoType,
  GGQuest: 13 as LogoType,
  DFArchon: 14 as LogoType,
  Mask: 15 as LogoType,
  AGLDDAO: 16 as LogoType,
  AWHouse: 17 as LogoType,
  OrdenGG: 18 as LogoType,
  DFDAO: 19 as LogoType,
  FunBlocks: 20 as LogoType,
  WASD: 21 as LogoType,
  FunCraft: 22 as LogoType,
  WorldExplorers: 23 as LogoType,
  AWResearch: 24 as LogoType,
  ComposableLabs: 25 as LogoType,
  MetaCat: 26 as LogoType,
  // Don't forget to update MIN_LOGO_TYPE and/or MAX_LOGO_TYPE in the `constants` package
};

/**
 * Mapping from LogoType to pretty-printed names.
 */
export const LogoTypeNames = {
  [LogoType.Unknown]: 'Unknown',
  [LogoType.DarkForest]: 'Dark Forest',
  [LogoType.Lattice]: 'Lattice',
  [LogoType.Redstone]: 'Redstone',
  [LogoType.Mud]: 'MUD',
  [LogoType.Biomes]: 'Biomes',
  [LogoType.ThisCursedMachine]: 'This Cursed Machine',
  [LogoType.SkyStrife]: 'Sky Strife',
  [LogoType.SmallBrainGames]: 'Small Brain Games',
  [LogoType.DownStream]: 'DownStream',
  [LogoType.Dear]: 'Dear',
  [LogoType.DFARES]: 'DFAres',
  [LogoType.PixeLAW]: 'PixeLAW',
  [LogoType.GGQuest]: 'GGQuest',
  [LogoType.DFArchon]: 'DFArchon',
  [LogoType.Mask]: 'Mask Network',
  [LogoType.AGLDDAO]: 'AGLD DAO',
  [LogoType.AWHouse]: 'AW House',
  [LogoType.OrdenGG]: 'Orden GG',
  [LogoType.DFDAO]: 'DFDAO',
  [LogoType.FunBlocks]: 'FunBlocks',
  [LogoType.WASD]: 'WASD',
  [LogoType.FunCraft]: 'FunCraft',
  [LogoType.WorldExplorers]: 'World Explorers',
  [LogoType.AWResearch]: 'AWResearch',
  [LogoType.ComposableLabs]: 'Composablelabs',
  [LogoType.MetaCat]: 'MetaCat',
} as const;
