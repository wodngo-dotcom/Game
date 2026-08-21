export interface Customer {
  id: string;
  name: string;
  emoji: string;
  /** personality-flavored quips, one is shown at random each time this customer appears */
  lines: string[];
  /** replaces the generic "주세요!" to match the character's way of speaking */
  closing: string;
}

// 어느 가게에서나 등장하는 공통 손님
export const COMMON_CUSTOMERS: Customer[] = [
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

// 문방구에서만 등장 — 대사가 학용품을 직접 언급하므로 이 가게 전용으로 둔다.
export const STATIONERY_CUSTOMERS: Customer[] = [
  {
    id: 'rushing-student',
    name: '급한 학생',
    emoji: '🏃',
    lines: [
      '헉헉… 연필이 딱 부러졌어요!',
      '큰일났어요! 지우개를 깜빡했어요!',
      '선생님이 기다리셔서 빨리 사야 해요!',
      '숙제 끝내려면 이게 꼭 필요해요!',
      '헉… 학교 종 치기 전에 가야 해요!',
      '공책이 다 떨어졌어요! 얼른요!',
    ],
    closing: '빨리 주세요, 학교 늦겠어요!',
  },
  {
    id: 'homework-kid',
    name: '숙제하던 학생',
    emoji: '🧑‍🎓',
    lines: [
      '숙제하다가 뛰쳐나왔어요! 헉헉!',
      '그림 숙제에 크레파스가 모자라요!',
      '가위가 없어서 못 오리고 있었어요!',
      '엄마가 빨리 오라고 하셨어요!',
      '공책 한 장도 안 남았어요, 큰일이에요!',
      '숙제 마감이 코앞이에요! 도와주세요!',
    ],
    closing: '얼른 주세요, 숙제해야 해요!',
  },
];

const VIP_CHANCE = 0.12;

export interface CustomerSpawn {
  customer: Customer;
  line: string;
  isVip: boolean;
}

/** Picks a random customer from the given pool, one of their lines, and whether this visit is a VIP occasion. */
export function spawnCustomer(pool: Customer[]): CustomerSpawn {
  const customer = pool[Math.floor(Math.random() * pool.length)];
  const line = customer.lines[Math.floor(Math.random() * customer.lines.length)];
  const isVip = Math.random() < VIP_CHANCE;
  return { customer, line, isVip };
}
