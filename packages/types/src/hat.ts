import type { Abstract } from './utility';

export type HatType = Abstract<number, 'HatType'>;

/**
 * Enumeration of artifact types.
 */
export const HatType = {
  Unknown: 0 as HatType,
  GraduationCap: 1 as HatType,
  PartyHat: 2 as HatType,
  Fish: 3 as HatType,
  TopHat: 4 as HatType,
  Fez: 5 as HatType,
  ChefHat: 6 as HatType,
  CowboyHat: 7 as HatType,
  PopeHat: 8 as HatType,
  Squid: 9 as HatType,
  SantaHat: 10 as HatType,
  Doge: 11 as HatType,
  Cat: 12 as HatType,
  ChunZhen: 13 as HatType,
  IKunBird: 14 as HatType,
  Mike: 15 as HatType,
  Panda: 16 as HatType,
  Pepe: 17 as HatType,
  PigMan: 18 as HatType,
  RobotCat: 19 as HatType,
  TaiKuLa: 20 as HatType,
  Wojak1: 21 as HatType,
  Wojak2: 22 as HatType,
  Wojak3: 23 as HatType,
  Wojak4: 24 as HatType,
  Mask: 25 as HatType,
  Web3MQ: 26 as HatType,
  DFARES: 27 as HatType,
  // Don't forget to update MIN_HAT_TYPE and/or MAX_HAT_TYPE in the `constants` package
};

/**
 * Mapping from ArtifactType to pretty-printed names.
 */
export const HatTypeNames = {
  [HatType.Unknown]: 'Unknown',
  [HatType.GraduationCap]: 'GraduationCap',
  [HatType.PartyHat]: 'PartyHat',
  [HatType.Fish]: 'Fish',
  [HatType.TopHat]: 'TopHat',
  [HatType.Fez]: 'Fez',
  [HatType.ChefHat]: 'ChefHat',
  [HatType.CowboyHat]: 'CoyboyHat',
  [HatType.PopeHat]: 'PopeHat',
  [HatType.Squid]: 'Squid',
  [HatType.SantaHat]: 'SantaHat',
  [HatType.Doge]: 'Doge',
  [HatType.Cat]: 'Cat',
  [HatType.ChunZhen]: 'ChunZhen',
  [HatType.IKunBird]: 'IKunBird',
  [HatType.Mike]: 'Mike',
  [HatType.Panda]: 'Panda',
  [HatType.Pepe]: 'Pepe',
  [HatType.PigMan]: 'PigMan',
  [HatType.RobotCat]: 'RobotCat',
  [HatType.TaiKuLa]: 'TaiKuLa',
  [HatType.Wojak1]: 'Wojak1',
  [HatType.Wojak2]: 'Wojak2',
  [HatType.Wojak3]: 'Wojak3',
  [HatType.Wojak4]: 'Wojak4',
  [HatType.Mask]: 'Mask',
  [HatType.Web3MQ]: 'Web3MQ',
  [HatType.DFARES]: 'DF ARES',
} as const;

// export const HatType = {
//   GraduationCap: 'GraduationCap' as HatType,
//   PartyHat: 'PartyHat' as HatType,
//   Fish: 'Fish' as HatType,
//   TopHat: 'TopHat' as HatType,
//   Fez: 'Fez' as HatType,
//   ChefHat: 'ChefHat' as HatType,
//   CowboyHat: 'CowboyHat' as HatType,
//   PopeHat: 'PopeHat' as HatType,
//   Squid: 'Squid' as HatType,
//   SantaHat: 'SantaHat' as HatType,
//   Doge: 'Doge' as HatType,
//   Wojak: 'Wojak' as HatType,
//   Mike: 'Mike' as HatType,
//   Panda: 'Panda' as HatType,
//   Pepe: 'Pepe' as HatType,
//   Mask: 'Mask' as HatType,
//   Web3MQ: 'Web3MQ' as HatType,
// };

// export const HatTypeToId = {
//   [HatType.GraduationCap]: 1,
//   [HatType.Fish]: 2,
//   [HatType.TopHat]: 3,
//   [HatType.Fez]: 4,
//   [HatType.ChefHat]: 5,
//   [HatType.CowboyHat]: 6,
//   [HatType.PopeHat]: 7,
//   [HatType.Squid]: 8,
//   [HatType.SantaHat]: 9,
//   [HatType.Doge]: 10,
//   [HatType.Wojak]: 11,
//   [HatType.Mike]: 12,
//   [HatType.Panda]: 13,
//   [HatType.Pepe]: 14,
//   [HatType.Mask]: 15,
//   [HatType.Web3MQ]: 16,
//   // Don't forget to update MIN_HAT_TYPE and/or MAX_HAT_TYPE in the `constants` package
// };

// export const HatIdToType = {
//   [1]: HatType.GraduationCap,
//   [2]: HatType.Fish,
//   [3]: HatType.TopHat,
//   [4]: HatType.Fez,
//   [5]: HatType.ChefHat,
//   [6]: HatType.CowboyHat,
//   [7]: HatType.PopeHat,
//   [8]: HatType.Squid,
//   [9]: HatType.SantaHat,
//   [10]: HatType.Doge,
//   [11]: HatType.Wojak,
//   [12]: HatType.Mike,
//   [13]: HatType.Panda,
//   [14]: HatType.Pepe,
//   [15]: HatType.Mask,
//   [16]: HatType.Web3MQ,
//   // Don't forget to update MIN_HAT_TYPE and/or MAX_HAT_TYPE in the `constants` package
// };

// /**
//  * Enumeration of artifact types.
//  */
// export const HatType = {
//   Unknown: 0 as HatType,
//   GraduationCap: 1 as HatType,
//   PartyHat: 2 as HatType,
//   Fish: 3 as HatType,
//   TopHat: 4 as HatType,
//   Fez: 5 as HatType,
//   ChefHat: 6 as HatType,
//   CowboyHat: 7 as HatType,
//   PopeHat: 8 as HatType,
//   Squid: 9 as HatType,
//   SantaHat: 10 as HatType,
//   Doge: 11 as HatType,
//   Wojak: 12 as HatType,
//   Mike: 13 as HatType,
//   Panda: 14 as HatType,
//   Pepe: 15 as HatType,
//   Mask: 16 as HatType,
//   Web3MQ: 17 as HatType,
//   // Don't forget to update MIN_HAT_TYPE and/or MAX_HAT_TYPE in the `constants` package
// };

// /**
//  * Mapping from ArtifactType to pretty-printed names.
//  */
// export const HatTypeToName = {
//   [HatType.Unknown]: 'Unknown',
//   [HatType.GraduationCap]: 'GraduationCap',
//   [HatType.Fish]: 'Fish',
//   [HatType.TopHat]: 'TopHat',
//   [HatType.Fez]: 'Fez',
//   [HatType.ChefHat]: 'ChefHat',
//   [HatType.CowboyHat]: 'CoyboyHat',
//   [HatType.PopeHat]: 'PopeHat',
//   [HatType.Squid]: 'Squid',
//   [HatType.SantaHat]: 'SantaHat',
//   [HatType.Doge]: 'Doge',
//   [HatType.Wojak]: 'Wojak',
//   [HatType.Mike]: 'Mike',
//   [HatType.Panda]: 'Panda',
//   [HatType.Pepe]: 'Pepe',
//   [HatType.Mask]: 'Mask',
//   [HatType.Web3MQ]: 'Web3MQ',
// } as const;

// export const HatNameToType = {
//   ['Unknown']: HatType.Unknown,
//   ['GraduationCap']: HatType.GraduationCap,
//   ['Fish']: HatType.Fish,
//   ['TopHat']: HatType.TopHat,
//   ['Fez']: HatType.Fez,
//   ['ChefHat']: HatType.ChefHat,
//   ['CowboyHat']: HatType.CowboyHat,
//   ['PopeHat']: HatType.PopeHat,
//   ['Squid']: HatType.Squid,
//   ['SantaHat']: HatType.SantaHat,
//   ['Doge']: HatType.Doge,
//   ['Wojak']: HatType.Wojak,
//   ['Mike']: HatType.Mike,
//   ['Panda']: HatType.Panda,
//   ['Pepe']: HatType.Pepe,
//   ['Mask']: HatType.Mask,
//   ['Web3MQ']: HatType.Web3MQ,
// } as const;
