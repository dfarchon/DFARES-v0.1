import { isAncient } from '@darkforest_eth/gamelogic';
import {
  Artifact,
  ArtifactRarity,
  ArtifactRarityNames,
  ArtifactType,
  ArtifactTypeNames,
  BiomeNames,
  HatType,
} from '@darkforest_eth/types';
import React from 'react';
import styled from 'styled-components';
import { RarityColors } from '../../Styles/Colors';
import { LegendaryLabel } from './LegendaryLabel';
import { MythicLabel } from './MythicLabel';
const avatarFromId = (id: string): HatType => {
  const avatars = [
    HatType.Doge,
    HatType.Wojak,
    HatType.Mike,
    HatType.Panda,
    HatType.Pepe,
    HatType.Mask,
    HatType.Web3MQ,
  ];
  return avatars[parseInt(id.substring(id.length - 2), 16) % avatars.length];
};

export const ArtifactRarityText = ({ rarity }: { rarity: ArtifactRarity }) => (
  <>{ArtifactRarityNames[rarity]}</>
);

export const ArtifactBiomeText = ({ artifact }: { artifact: Artifact }) => (
  <>{isAncient(artifact) ? 'Ancient' : BiomeNames[artifact.planetBiome]}</>
);

export const ArtifactTypeText = ({ artifact }: { artifact: Artifact }) => (
  <>
    {ArtifactTypeNames[artifact.artifactType]}
    {artifact.artifactType === ArtifactType.Avatar && ':' + avatarFromId(artifact.id)}
  </>
);

// colored labels

export const StyledArtifactRarityLabel = styled.span<{ rarity: ArtifactRarity }>`
  color: ${({ rarity }) => RarityColors[rarity]};
`;

export const ArtifactRarityLabel = ({ rarity }: { rarity: ArtifactRarity }) => (
  <StyledArtifactRarityLabel rarity={rarity}>
    <ArtifactRarityText rarity={rarity} />
  </StyledArtifactRarityLabel>
);

export const ArtifactRarityLabelAnim = ({ rarity }: { rarity: ArtifactRarity }) =>
  rarity === ArtifactRarity.Mythic ? (
    <MythicLabel />
  ) : rarity === ArtifactRarity.Legendary ? (
    <LegendaryLabel />
  ) : (
    <ArtifactRarityLabel rarity={rarity} />
  );

// combined labels

export const ArtifactRarityBiomeTypeText = ({ artifact }: { artifact: Artifact }) => (
  <>
    <ArtifactRarityText rarity={artifact.rarity} /> <ArtifactBiomeText artifact={artifact} />{' '}
    <ArtifactTypeText artifact={artifact} />
  </>
);
