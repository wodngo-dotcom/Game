export interface Customer {
  id: string;
  name: string;
  emoji: string;
  vip?: boolean;
}

export const CUSTOMERS: Customer[] = [
  { id: 'rabbit', name: '토끼', emoji: '🐰' },
  { id: 'bear', name: '곰돌이', emoji: '🐻' },
  { id: 'kid', name: '어린이', emoji: '🧒' },
  { id: 'cat', name: '고양이', emoji: '🐱' },
  { id: 'dog', name: '강아지', emoji: '🐶' },
  { id: 'chick', name: '병아리', emoji: '🐥' },
  { id: 'penguin', name: '펭귄', emoji: '🐧' },
];

export const VIP_CUSTOMER: Customer = {
  id: 'vip',
  name: '멋쟁이 손님',
  emoji: '👑',
  vip: true,
};

const VIP_CHANCE = 0.12;

export function pickRandomCustomer(): Customer {
  if (Math.random() < VIP_CHANCE) return VIP_CUSTOMER;
  return CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
}
