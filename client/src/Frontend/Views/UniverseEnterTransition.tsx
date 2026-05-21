import React from 'react';
import styled, { keyframes } from 'styled-components';

export const ENTER_TRANSITION_DURATION_MS = 1100;

type UniverseEnterTransitionProps = {
  active: boolean;
};

/** Black-hole warp overlay when entering the game universe. */
export function UniverseEnterTransition({
  active,
}: UniverseEnterTransitionProps): React.ReactElement | null {
  if (!active) return null;

  return <BlackHoleTransition aria-hidden='true' />;
}

const blackHoleCore = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0);
    box-shadow: 0 0 0 0 transparent;
  }
  4% {
    transform: translate(-50%, -50%) scale(1);
    box-shadow:
      0 0 0 2px rgba(255, 255, 255, 0.9),
      0 0 60px 20px rgba(255, 180, 193, 0.85),
      0 0 120px 40px rgba(255, 59, 59, 0.28);
  }
  15% {
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.6),
      0 0 40px 10px rgba(255, 180, 193, 0.65),
      0 0 80px 20px rgba(255, 59, 59, 0.18);
  }
  60% {
    transform: translate(-50%, -50%) scale(1.4);
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.4),
      0 0 80px 20px rgba(255, 180, 193, 0.9),
      0 0 160px 40px rgba(255, 59, 59, 0.22);
  }
  100% {
    transform: translate(-50%, -50%) scale(150);
    box-shadow: 0 0 0 0 transparent;
  }
`;

const BlackHoleTransition = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10000;
  pointer-events: none;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 4vmin;
    height: 4vmin;
    border-radius: 50%;
    background: #000;
    transform: translate(-50%, -50%) scale(0);
    animation: ${blackHoleCore} ${ENTER_TRANSITION_DURATION_MS}ms forwards;
  }
`;
