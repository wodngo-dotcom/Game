import type { StoreConfig, ShopItem } from '../data/stores';
import { pickDistinctRandom, randInt } from '../utils/random';

/** Picks the 3-5 items that will be stocked on the shelves for one round. */
export function pickTodaysItems(store: StoreConfig, level: number): ShopItem[] {
  const count = level <= 2 ? randInt(3, 4) : randInt(4, 5);
  return pickDistinctRandom(store.items, Math.min(count, store.items.length));
}
