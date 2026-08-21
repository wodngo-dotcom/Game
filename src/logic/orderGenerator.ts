import type { ShopItem } from '../data/stores';
import { getLevelConfig, type PaymentMode } from '../data/levels';
import { randInt, pickDistinctRandom } from '../utils/random';

export interface OrderLine {
  itemId: string;
  qty: number;
}

export interface GeneratedOrder {
  lines: OrderLine[];
  totalPrice: number;
  payment: number;
  change: number;
}

function generatePayment(total: number, mode: PaymentMode): number {
  if (mode === 'exact') return total;
  if (mode === 'mixed' && Math.random() < 0.35) return total;

  const denominations = [10, 50, 100, 500, 1000];
  const candidates: number[] = [];
  for (const unit of denominations) {
    const candidate = Math.ceil((total + 1) / unit) * unit;
    if (candidate > total) candidates.push(candidate);
  }
  const reasonable = candidates.filter((c) => c - total <= Math.max(50, total));
  const pool = reasonable.length > 0 ? reasonable : candidates;
  return pool[randInt(0, pool.length - 1)];
}

/** Generates one customer order using the shop's currently stocked items. */
export function generateOrder(level: number, availableItems: ShopItem[]): GeneratedOrder {
  const config = getLevelConfig(level);

  let pool = availableItems;
  if (!config.allowMixedUnits) {
    const tensOnly = availableItems.filter((item) => item.price % 10 === 0);
    if (tensOnly.length > 0) pool = tensOnly;
  }

  const wantedDistinct = randInt(config.itemCountRange[0], config.itemCountRange[1]);
  const chosenItems = pickDistinctRandom(pool, Math.max(1, wantedDistinct));

  const lines: OrderLine[] = chosenItems.map((item) => ({
    itemId: item.id,
    qty: chosenItems.length === 1 ? randInt(config.qtyRange[0], config.qtyRange[1]) : 1,
  }));

  const totalPrice = lines.reduce((sum, line) => {
    const item = availableItems.find((it) => it.id === line.itemId);
    return sum + (item ? item.price * line.qty : 0);
  }, 0);

  const payment = generatePayment(totalPrice, config.paymentMode);
  const change = payment - totalPrice;

  return { lines, totalPrice, payment, change };
}
