import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadState, saveState, levelForStars, STARS_PER_LEVEL } from './gameState';
import { setSoundEnabled, playLevelUp } from '../utils/sound';

interface GameStateContextValue {
  stars: number;
  level: number;
  soundOn: boolean;
  starsIntoLevel: number;
  starsPerLevel: number;
  addStars: (n: number) => void;
  toggleSound: () => void;
  resetProgress: () => void;
}

const GameStateContext = createContext<GameStateContextValue | null>(null);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [stars, setStars] = useState(() => loadState().stars);
  const [soundOn, setSoundOn] = useState(() => loadState().soundOn);

  useEffect(() => {
    setSoundEnabled(soundOn);
  }, [soundOn]);

  useEffect(() => {
    saveState({ stars, soundOn });
  }, [stars, soundOn]);

  const level = levelForStars(stars);
  const starsIntoLevel = stars % STARS_PER_LEVEL;

  const value = useMemo<GameStateContextValue>(
    () => ({
      stars,
      level,
      soundOn,
      starsIntoLevel,
      starsPerLevel: STARS_PER_LEVEL,
      addStars: (n: number) => {
        setStars((prev) => {
          const prevLevel = levelForStars(prev);
          const next = prev + n;
          if (levelForStars(next) > prevLevel) {
            // fire after this tick so it doesn't clash with the star sound
            window.setTimeout(playLevelUp, 500);
          }
          return next;
        });
      },
      toggleSound: () => setSoundOn((v) => !v),
      resetProgress: () => setStars(0),
    }),
    [stars, level, soundOn, starsIntoLevel],
  );

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
}

export function useGameState(): GameStateContextValue {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error('useGameState must be used within GameStateProvider');
  return ctx;
}
