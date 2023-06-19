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
  Wojak: 12 as HatType,
  Mike: 13 as HatType,
  Panda: 14 as HatType,
  Pepe: 15 as HatType,
  Mask: 16 as HatType,
  Web3MQ: 17 as HatType,
  // Don't forget to update MIN_HAT_TYPE and/or MAX_HAT_TYPE in the `constants` package
};

/**
 * Mapping from ArtifactType to pretty-printed names.
 */
export const HatTypeNames = {
  [HatType.Unknown]: 'Unknown',
  [HatType.GraduationCap]: 'GraduationCap',
  [HatType.Fish]: 'Fish',
  [HatType.TopHat]: 'TopHat',
  [HatType.Fez]: 'Fez',
  [HatType.ChefHat]: 'ChefHat',
  [HatType.CowboyHat]: 'CoyboyHat',
  [HatType.PopeHat]: 'PopeHat',
  [HatType.Squid]: 'Squid',
  [HatType.SantaHat]: 'SantaHat',
  [HatType.Doge]: 'Doge',
  [HatType.Wojak]: 'Wojak',
  [HatType.Mike]: 'Mike',
  [HatType.Panda]: 'Panda',
  [HatType.Pepe]: 'Pepe',
  [HatType.Mask]: 'Mask',
  [HatType.Web3MQ]: 'Web3MQ',
} as const;
