export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  category: 'fruit' | 'vegetable';
}

export interface StoreConfig {
  id: string;
  name: string;
  /** unlocks when the player's level is >= this value */
  unlockLevel: number;
  colors: {
    primary: string;
    primaryDark: string;
    accent: string;
    background: string;
    backgroundSoft: string;
  };
  items: ShopItem[];
}

// 과일·채소가게 (1차 구현 - 완성도 있게)
export const FRUIT_VEGGIE_STORE: StoreConfig = {
  id: 'fruit-veggie',
  name: '과일·채소가게',
  unlockLevel: 1,
  colors: {
    primary: '#4caf50',
    primaryDark: '#2e7d32',
    accent: '#ff9800',
    background: '#fff8e7',
    backgroundSoft: '#f1f9ee',
  },
  items: [
    { id: 'apple', name: '사과', emoji: '🍎', price: 30, category: 'fruit' },
    { id: 'banana', name: '바나나', emoji: '🍌', price: 40, category: 'fruit' },
    { id: 'strawberry', name: '딸기', emoji: '🍓', price: 20, category: 'fruit' },
    { id: 'grape', name: '포도', emoji: '🍇', price: 50, category: 'fruit' },
    { id: 'watermelon', name: '수박', emoji: '🍉', price: 90, category: 'fruit' },
    { id: 'carrot', name: '당근', emoji: '🥕', price: 15, category: 'vegetable' },
    { id: 'cucumber', name: '오이', emoji: '🥒', price: 25, category: 'vegetable' },
    { id: 'potato', name: '감자', emoji: '🥔', price: 10, category: 'vegetable' },
    { id: 'tomato', name: '토마토', emoji: '🍅', price: 35, category: 'vegetable' },
    { id: 'corn', name: '옥수수', emoji: '🌽', price: 45, category: 'vegetable' },
  ],
};

// 이후 확장: 문방구, 분식집 등. 레벨이 오르면 STORES 배열에 추가하고
// unlockLevel 만 지정하면 getStoreForLevel 이 자동으로 전환해준다.
export const STORES: StoreConfig[] = [FRUIT_VEGGIE_STORE];

export function getStoreForLevel(level: number): StoreConfig {
  let chosen = STORES[0];
  for (const store of STORES) {
    if (store.unlockLevel <= level) {
      chosen = store;
    }
  }
  return chosen;
}
