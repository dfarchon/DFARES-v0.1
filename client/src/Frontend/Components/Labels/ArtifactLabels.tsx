import { isAncient } from '@darkforest_eth/gamelogic';
import { artifactImageTypeToNum } from '@darkforest_eth/procedural';
import {
  Artifact,
  ArtifactRarity,
  ArtifactRarityNames,
  ArtifactType,
  ArtifactTypeNames,
  BiomeNames,
  HatTypeNames,
} from '@darkforest_eth/types';
import React from 'react';
import styled from 'styled-components';
import { RarityColors } from '../../Styles/Colors';
import { LegendaryLabel } from './LegendaryLabel';
import { MythicLabel } from './MythicLabel';

export const ArtifactRarityText = ({ rarity }: { rarity: ArtifactRarity }) => (
  <>{ArtifactRarityNames[rarity]}</>
);

export const ArtifactBiomeText = ({ artifact }: { artifact: Artifact }) => (
  <>{isAncient(artifact) ? 'Ancient' : BiomeNames[artifact.planetBiome]}</>
);

export const ArtifactTypeText = ({ artifact }: { artifact: Artifact }) => (
  <>
    {ArtifactTypeNames[artifact.artifactType]}
    {artifact.artifactType === ArtifactType.Avatar &&
      ':' + HatTypeNames[artifactImageTypeToNum(artifact.imageType)]}
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
