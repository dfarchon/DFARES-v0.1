import { ArtifactRarity } from '@dfares/types';
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { RarityColors } from '../../../Styles/Colors';

const color = keyframes`
  0% {
    color: ${RarityColors[ArtifactRarity.Rare]};
  }
  70% {
    color: ${RarityColors[ArtifactRarity.Rare]};
  }
  100% {
    color: #ffffff;
  }
`;

const AnimDelay = styled.span<{ i: number }>`
  animation: ${color} 1s linear infinite alternate;
  ${({ i }) => `animation-delay: ${-i * 0.04}s;`}
`;

const Anim = styled.span`
  color: ${RarityColors[ArtifactRarity.Legendary]};
`;

export function LegendaryLabelText({ text }: { text: string }) {
  return (
    <Anim>
      {text.split('').map((c, i) => (
        <AnimDelay i={i} key={i}>
          {c === ' ' ? <>&nbsp;</> : c}
        </AnimDelay>
      ))}
    </Anim>
  );
}

function ChatFusionLabelRaw() {
  return <LegendaryLabelText text={'DFARES CHAT'} />;
}

export const ChatFusionLabel = React.memo(ChatFusionLabelRaw);
