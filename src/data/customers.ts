export interface Customer {
  id: string;
  name: string;
  emoji: string;
  /** personality-flavored quips, one is shown at random each time this customer appears */
  lines: string[];
  /** replaces the generic "주세요!" to match the character's way of speaking */
  closing: string;
}

export const CUSTOMERS: Customer[] = [
  {
    id: 'hungry-dog',
    name: '배고픈 강아지',
    emoji: '🐶',
    lines: [
      '배고파요!!! 빨리요!!!',
      '꼬르륵… 배가 너무 고파요!!!',
      '얼른요!!! 배에서 소리가 나요!!!',
      '빨리빨리요!!! 너무 배고파요!!!',
      '멍멍!!! 배고파 죽겠어요!!!',
      '오늘 하나도 못 먹었어요!!! 얼른요!!!',
    ],
    closing: '주세요!!!',
  },
  {
    id: 'hasty-rabbit',
    name: '급한 토끼',
    emoji: '🐰',
    lines: [
      '깡충깡충! 빨리빨리, 시간이 없어요!',
      '저 지금 엄청 바빠요! 깡충!',
      '깡충깡충… 빨리 좀 해주실래요?',
      '얼른요! 다음 약속에 늦었어요!',
      '깡충! 깡충! 서둘러 주세요!',
      '빨리요, 빨리! 깡충깡충 뛰고 있잖아요!',
    ],
    closing: '빨리 주세요!',
  },
  {
    id: 'haughty-duck',
    name: '거만한 오리',
    emoji: '🦆',
    lines: [
      '흠, 이 가게가 그나마 괜찮다고 들었소.',
      '본인은 시간이 금이니 서둘러 주시게.',
      '그대의 가게에서 물건을 좀 사 가겠소.',
      '품질이 좋아야 할 것이오. 기대하겠소.',
      '꽥꽥, 격식을 갖춰 대해주시게나.',
      '내 오늘 특별히 이곳을 찾아주었소.',
    ],
    closing: '주시게.',
  },
  {
    id: 'sleepy-bear',
    name: '졸린 곰',
    emoji: '🐻',
    lines: [
      '하아암… 저기… 그거 좀…',
      '졸려서… 뭘 사려고 했더라…',
      '음… 하품… 잠깐만요…',
      '하아암… 천천히 골라도 되죠…?',
      '꾸벅꾸벅… 아, 저… 이거요…',
      '너무 졸려요… 얼른 사고 자야지…',
    ],
    closing: '주세요…',
  },
  {
    id: 'chatty-sparrow',
    name: '수다쟁이 참새',
    emoji: '🐦',
    lines: [
      '안녕하세요! 오늘 날씨 정말 좋죠? 그런데 말이에요,',
      '저기, 사장님 오늘 되게 부지런하시네요! 아 맞다,',
      '짹짹! 어제 나무에서 엄청 재밌는 일이 있었어요! 근데,',
      '사장님, 가게가 참 예쁘게 꾸며졌어요! 아참,',
      '저 오늘 친구를 만났는데요, 아무튼 그건 나중에 얘기하고,',
      '짹짹짹, 오랜만이에요! 그나저나,',
    ],
    closing: '주세요!',
  },
];

const VIP_CHANCE = 0.12;

export interface CustomerSpawn {
  customer: Customer;
  line: string;
  isVip: boolean;
}

/** Picks a random customer, one of their personality lines, and whether this visit is a VIP occasion. */
export function spawnCustomer(): CustomerSpawn {
  const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
  const line = customer.lines[Math.floor(Math.random() * customer.lines.length)];
  const isVip = Math.random() < VIP_CHANCE;
  return { customer, line, isVip };
}
