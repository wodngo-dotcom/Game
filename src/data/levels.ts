export type PaymentMode = 'exact' | 'generous' | 'mixed';

export interface LevelConfig {
  level: number;
  /** how many distinct items appear in one order */
  itemCountRange: [number, number];
  /** when only one distinct item is ordered, how many of it */
  qtyRange: [number, number];
  /** false: prices must be multiples of 10 (10원 단위만) */
  allowMixedUnits: boolean;
  paymentMode: PaymentMode;
  /** low levels show icon+text for order items, higher levels show text only */
  showOrderIcons: boolean;
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    level: 1,
    itemCountRange: [1, 1],
    qtyRange: [1, 3],
    allowMixedUnits: false,
    paymentMode: 'exact',
    showOrderIcons: true,
  },
  {
    level: 2,
    itemCountRange: [1, 2],
    qtyRange: [1, 2],
    allowMixedUnits: false,
    paymentMode: 'generous',
    showOrderIcons: true,
  },
  {
    level: 3,
    itemCountRange: [2, 2],
    qtyRange: [1, 1],
    allowMixedUnits: true,
    paymentMode: 'generous',
    showOrderIcons: true,
  },
  {
    level: 4,
    itemCountRange: [2, 3],
    qtyRange: [1, 1],
    allowMixedUnits: true,
    paymentMode: 'generous',
    showOrderIcons: false,
  },
  {
    level: 5,
    itemCountRange: [3, 3],
    qtyRange: [1, 1],
    allowMixedUnits: true,
    paymentMode: 'mixed',
    showOrderIcons: false,
  },
];

export function getLevelConfig(level: number): LevelConfig {
  const idx = Math.min(level, LEVEL_CONFIGS.length) - 1;
  return LEVEL_CONFIGS[Math.max(0, idx)];
}
