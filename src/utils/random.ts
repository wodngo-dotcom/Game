export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandom<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

export function pickDistinctRandom<T>(arr: readonly T[], n: number): T[] {
  const copy = [...arr];
  const count = Math.min(n, copy.length);
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    const idx = randInt(0, copy.length - 1);
    result.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return result;
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
