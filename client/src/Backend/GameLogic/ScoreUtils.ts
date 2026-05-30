import type { Player } from '@dfares/types';

export type ScoreSource = 'withdrawArtifact' | 'claimDistance';

export const DEFAULT_SCORE_SOURCE: ScoreSource = 'withdrawArtifact';

export function getEffectiveScore(
  player: Player | undefined,
  scoreSource: ScoreSource = DEFAULT_SCORE_SOURCE
): number | undefined {
  if (!player) return undefined;

  return scoreSource === 'claimDistance' ? player.claimDistanceScore : player.score;
}

export function comparePlayersByScore(
  a: Player,
  b: Player,
  scoreSource: ScoreSource = DEFAULT_SCORE_SOURCE
): number {
  const scoreA = getEffectiveScore(a, scoreSource);
  const scoreB = getEffectiveScore(b, scoreSource);

  if (typeof scoreA !== 'number' && typeof scoreB !== 'number') return 0;
  if (typeof scoreA !== 'number') return 1;
  if (typeof scoreB !== 'number') return -1;

  if (scoreSource === 'claimDistance') return scoreA - scoreB;
  return scoreB - scoreA;
}
