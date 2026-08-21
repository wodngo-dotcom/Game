import { randInt, shuffle } from '../utils/random';

/** Coin denominations used for the coin-combination change stage (Lv.4+). */
export const COIN_DENOMINATIONS = [100, 10, 1] as const;

/** Builds a shuffled set of 3 numeric options (1 correct + 2 distractors). */
export function generateChangeOptions(correctChange: number): number[] {
  const options = new Set<number>([correctChange]);
  const deltas = [10, -10, 20, -20, 30, -30, 50];
  let guard = 0;
  while (options.size < 3 && guard < 50) {
    guard += 1;
    const delta = deltas[randInt(0, deltas.length - 1)];
    const candidate = correctChange + delta;
    if (candidate > 0 && candidate !== correctChange) {
      options.add(candidate);
    }
  }
  // fallback in the unlikely case we still don't have 3 distinct options
  let extra = 10;
  while (options.size < 3) {
    const candidate = correctChange + extra;
    if (candidate > 0) options.add(candidate);
    extra += 10;
  }
  return shuffle([...options]);
}

export function sumCoins(counts: Partial<Record<number, number>>): number {
  return Object.entries(counts).reduce((sum, [denom, count]) => sum + Number(denom) * (count ?? 0), 0);
}
