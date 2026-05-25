import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ENTER_TRANSITION_DURATION_MS } from '../Views/UniverseEnterTransition';

/** Starts the universe entry transition, then navigates to the play route. */
export function useEnterUniverse(playPath: string): {
  isEntering: boolean;
  enterUniverse: () => void;
} {
  const history = useHistory();
  const [isEntering, setIsEntering] = useState(false);
  const phaseTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (phaseTimeoutRef.current !== null) {
        window.clearTimeout(phaseTimeoutRef.current);
      }
    };
  }, []);

  const enterUniverse = useCallback((): void => {
    if (isEntering) return;
    setIsEntering(true);
    phaseTimeoutRef.current = window.setTimeout(() => {
      history.push(playPath);
      phaseTimeoutRef.current = null;
    }, ENTER_TRANSITION_DURATION_MS);
  }, [history, isEntering, playPath]);

  return { isEntering, enterUniverse };
}
