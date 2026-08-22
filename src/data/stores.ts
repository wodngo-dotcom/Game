import type { Customer } from './customers';
import { COMMON_CUSTOMERS, STATIONERY_CUSTOMERS } from './customers';

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  category: string;
}

export interface StoreConfig {
  id: string;
  name: string;
  /** unlocks when the player's level is >= this value */
  unlockLevel: number;
  /** smallest price increment considered "round" for this store's currency scale
   *  (10원 for a 1~100원 store, 100원 for a 100~1000원 store, etc.) */
  roundingUnit: number;
  colors: {
    primary: string;
    primaryDark: string;
    accent: string;
    background: string;
    backgroundSoft: string;
  };
  items: ShopItem[];
  customers: Customer[];
}

// 과일·채소가게 (1차 구현 - 완성도 있게)
// 가격은 1~9원 범위로 뒀다 — 아직 두 자리 덧셈(예: 50+50)이 버거운 나이라
// 받아올림 없는 한 자리 숫자 덧셈으로 계산 연습이 이어지도록 한 것.
export const FRUIT_VEGGIE_STORE: StoreConfig = {
  id: 'fruit-veggie',
  name: '과일·채소가게',
  unlockLevel: 1,
  roundingUnit: 1,
  colors: {
    primary: '#4caf50',
    primaryDark: '#2e7d32',
    accent: '#ff9800',
    background: '#fff8e7',
    backgroundSoft: '#f1f9ee',
  },
  items: [
    { id: 'potato', name: '감자', emoji: '🥔', price: 1, category: 'vegetable' },
    { id: 'carrot', name: '당근', emoji: '🥕', price: 2, category: 'vegetable' },
    { id: 'cucumber', name: '오이', emoji: '🥒', price: 3, category: 'vegetable' },
    { id: 'strawberry', name: '딸기', emoji: '🍓', price: 4, category: 'fruit' },
    { id: 'tomato', name: '토마토', emoji: '🍅', price: 5, category: 'vegetable' },
    { id: 'apple', name: '사과', emoji: '🍎', price: 6, category: 'fruit' },
    { id: 'corn', name: '옥수수', emoji: '🌽', price: 7, category: 'vegetable' },
    { id: 'banana', name: '바나나', emoji: '🍌', price: 8, category: 'fruit' },
    { id: 'grape', name: '포도', emoji: '🍇', price: 9, category: 'fruit' },
    { id: 'watermelon', name: '수박', emoji: '🍉', price: 9, category: 'fruit' },
  ],
  customers: COMMON_CUSTOMERS,
};

// 문방구 (레벨 3부터 전환) — 가격 단위가 100원~1000원으로 한 자리 올라가면서
// 화폐 감각(동전 → 지폐)이 자연스럽게 확장되도록 설계.
export const STATIONERY_STORE: StoreConfig = {
  id: 'stationery',
  name: '문방구',
  unlockLevel: 3,
  roundingUnit: 100,
  colors: {
    primary: '#3f7fd6',
    primaryDark: '#2451a0',
    accent: '#ff7a59',
    background: '#eef4ff',
    backgroundSoft: '#e2ecff',
  },
  items: [
    { id: 'pencil', name: '연필', emoji: '✏️', price: 100, category: 'writing' },
    { id: 'eraser', name: '지우개', emoji: '🧽', price: 250, category: 'writing' },
    { id: 'notebook', name: '공책', emoji: '📓', price: 500, category: 'paper' },
    { id: 'crayon', name: '크레파스', emoji: '🖍️', price: 850, category: 'craft' },
    { id: 'scissors', name: '가위', emoji: '✂️', price: 700, category: 'craft' },
  ],
  customers: [...COMMON_CUSTOMERS, ...STATIONERY_CUSTOMERS],
};

// 이후 확장: 분식집 등. STORES 배열에 추가하고 unlockLevel만 지정하면
// getStoreForLevel이 자동으로 전환해준다.
export const STORES: StoreConfig[] = [FRUIT_VEGGIE_STORE, STATIONERY_STORE];

export function getStoreForLevel(level: number): StoreConfig {
  let chosen = STORES[0];
  for (const store of STORES) {
    if (store.unlockLevel <= level) {
      chosen = store;
    }
  }
  return chosen;
}
