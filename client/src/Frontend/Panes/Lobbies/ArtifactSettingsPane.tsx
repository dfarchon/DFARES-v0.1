import { Initializers } from '@dfares/settings';
import {
  ArtifactRarity,
  ArtifactRarityNames,
  ArtifactType,
  ArtifactTypeNames,
} from '@dfares/types';
import React from 'react';
import {
  Checkbox,
  DarkForestCheckbox,
  DarkForestNumberInput,
  NumberInput,
} from '../../Components/Input';
import { ArtifactRarityLabel } from '../../Components/Labels/ArtifactLabels';
import { Row } from '../../Components/Row';
import { LobbiesPaneProps, Warning } from './LobbiesUtils';

function ArtifactPointsPerRarity({
  value,
  index,
  onUpdate,
}: LobbiesPaneProps & { value: number | undefined; index: number }) {
  // We can skip Unknown
  if (index === 0) {
    return null;
  }

  return (
    <div>
      {/* TODO: We should have a utility that converts an integer into an ArtifactRarity safely  */}
      <ArtifactRarityLabel rarity={index as ArtifactRarity} />
      <NumberInput
        format='integer'
        value={value}
        onChange={(e: Event & React.ChangeEvent<DarkForestNumberInput>) => {
          onUpdate({ type: 'ARTIFACT_POINT_VALUES', value: e.target.value, index });
        }}
      />
    </div>
  );
}

const pointsRowStyle = { gap: '8px' } as CSSStyleDeclaration & React.CSSProperties;
const artifactToggleGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '4px 12px',
  marginBottom: '12px',
} as CSSStyleDeclaration & React.CSSProperties;

const CONFIGURABLE_ARTIFACT_TYPES = [
  ArtifactType.Monolith,
  ArtifactType.Colossus,
  ArtifactType.Spaceship,
  ArtifactType.Pyramid,
  ArtifactType.Wormhole,
  ArtifactType.PlanetaryShield,
  ArtifactType.PhotoidCannon,
  ArtifactType.BloomFilter,
  ArtifactType.BlackDomain,
  ArtifactType.IceLink,
  ArtifactType.FireLink,
  ArtifactType.Kardashev,
  ArtifactType.Bomb,
  ArtifactType.StellarShield,
  ArtifactType.BlindBox,
  ArtifactType.Avatar,
];

const CONFIGURABLE_ARTIFACT_RARITIES = [
  ArtifactRarity.Common,
  ArtifactRarity.Rare,
  ArtifactRarity.Epic,
  ArtifactRarity.Legendary,
  ArtifactRarity.Mythic,
];

function ToggleArtifactType({
  artifactType,
  config,
  onUpdate,
  rarity,
}: LobbiesPaneProps & { artifactType: ArtifactType; rarity: ArtifactRarity }) {
  const artifacts = config.ARTIFACTS.displayValue ?? config.ARTIFACTS.currentValue;

  return (
    <Checkbox
      label={ArtifactTypeNames[artifactType]}
      checked={Boolean(artifacts[rarity]?.[artifactType])}
      onChange={(e: Event & React.ChangeEvent<DarkForestCheckbox>) => {
        const nextArtifacts = config.ARTIFACTS.currentValue.map((row) => [
          ...row,
        ]) as Initializers['ARTIFACTS'];
        nextArtifacts[rarity][artifactType] = e.target.checked;
        onUpdate({
          type: 'ARTIFACTS',
          value: nextArtifacts,
        });
      }}
    />
  );
}

export function ArtifactSettingsPane({ config, onUpdate }: LobbiesPaneProps) {
  return (
    <>
      <Row>
        <span>Photoid Cannon activation delay (in seconds)</span>
        <NumberInput
          value={config.PHOTOID_ACTIVATION_DELAY.displayValue}
          onChange={(e: Event & React.ChangeEvent<DarkForestNumberInput>) => {
            onUpdate({ type: 'PHOTOID_ACTIVATION_DELAY', value: e.target.value });
          }}
        />
      </Row>
      <Row>
        <Warning>{config.PHOTOID_ACTIVATION_DELAY.warning}</Warning>
      </Row>
      <Row>
        <span>Artifact point values by rarity</span>
      </Row>
      <Row style={pointsRowStyle}>
        {(config.ARTIFACT_POINT_VALUES.displayValue ?? []).map((displayValue, idx) => (
          <ArtifactPointsPerRarity
            key={`artifact-points-row-${idx}`}
            config={config}
            value={displayValue}
            index={idx}
            onUpdate={onUpdate}
          />
        ))}
      </Row>
      <Row>
        <Warning>{config.ARTIFACT_POINT_VALUES.warning}</Warning>
      </Row>
      <Row>
        <span>Enabled artifact types by rarity</span>
      </Row>
      {CONFIGURABLE_ARTIFACT_RARITIES.map((rarity) => (
        <div key={`artifact-type-rarity-${rarity}`}>
          <div>{ArtifactRarityNames[rarity]}</div>
          <div style={artifactToggleGridStyle}>
            {CONFIGURABLE_ARTIFACT_TYPES.map((artifactType) => (
              <ToggleArtifactType
                key={`artifact-type-${rarity}-${artifactType}`}
                artifactType={artifactType}
                config={config}
                onUpdate={onUpdate}
                rarity={rarity}
              />
            ))}
          </div>
        </div>
      ))}
      <Row>
        <Warning>{config.ARTIFACTS.warning}</Warning>
      </Row>
    </>
  );
}
