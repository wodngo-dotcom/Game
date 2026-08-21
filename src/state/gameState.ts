export interface PersistedGameState {
  stars: number;
  soundOn: boolean;
}

const STORAGE_KEY = 'store-play-game-state-v1';
export const STARS_PER_LEVEL = 5;

const DEFAULT_STATE: PersistedGameState = {
  stars: 0,
  soundOn: true,
};

export function loadState(): PersistedGameState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<PersistedGameState>;
    return {
      stars: typeof parsed.stars === 'number' && parsed.stars >= 0 ? parsed.stars : 0,
      soundOn: typeof parsed.soundOn === 'boolean' ? parsed.soundOn : true,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: PersistedGameState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (private mode etc.) — progress just won't persist.
  }
}

export function levelForStars(stars: number): number {
  return 1 + Math.floor(stars / STARS_PER_LEVEL);
}
