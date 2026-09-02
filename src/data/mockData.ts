import { EcoReward } from '../types';

export interface DormOption {
  id: string;
  name: string;
  group: '제1기숙사' | '제2기숙사';
  code: string;
}

export const SONGDO_DORM_GROUPS = [
  {
    groupName: '송도학사 제1기숙사',
    shortGroup: '제1기숙사',
    buildings: [
      { id: 'songdo-1-a', name: '송도학사 제1기숙사 A동', group: '제1기숙사', code: 'A동' } as DormOption,
      { id: 'songdo-1-b', name: '송도학사 제1기숙사 B동', group: '제1기숙사', code: 'B동' } as DormOption,
      { id: 'songdo-1-c', name: '송도학사 제1기숙사 C동', group: '제1기숙사', code: 'C동' } as DormOption,
    ],
  },
  {
    groupName: '송도학사 제2기숙사',
    shortGroup: '제2기숙사',
    buildings: [
      { id: 'songdo-2-d', name: '송도학사 제2기숙사 D동', group: '제2기숙사', code: 'D동' } as DormOption,
      { id: 'songdo-2-e', name: '송도학사 제2기숙사 E동', group: '제2기숙사', code: 'E동' } as DormOption,
      { id: 'songdo-2-f', name: '송도학사 제2기숙사 F동', group: '제2기숙사', code: 'F동' } as DormOption,
      { id: 'songdo-2-g', name: '송도학사 제2기숙사 G동', group: '제2기숙사', code: 'G동' } as DormOption,
    ],
  },
];

export const YONSEI_DORMS: DormOption[] = SONGDO_DORM_GROUPS.flatMap((g) => g.buildings);

export const ITEM_CATEGORIES = [
  '침구/수건/생활잡화',
  '소형가전/스탠드/드라이기',
  '수납/옷걸이/바구니',
  '주방/식기/보온병',
  '도서/학용품/기타',
];

export const ECO_REWARDS: EcoReward[] = [
  {
    id: 'eco-sticker',
    name: '친환경 스티커',
    category: '문구/스티커 팩',
    pointsRequired: 1000,
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80',
    badge: '1,000 P',
    description: '방수 코팅 친환경 콩기름 잉크 스티커 팩 (지구 & 독수리 캐릭터 4종 세트)',
    details: [
      '무염소 표백 친환경 재생지 사용',
      '콩기름(Soy Ink) 인쇄로 화학물질 배출 최소화',
      '노트북, 텀블러 등에 부착 가능한 생활 방수 코팅',
      '연세대학교 친환경 에코 캠페인 한정판 디자인',
    ],
  },
  {
    id: 'eco-keyring',
    name: '친환경 키링',
    category: '업사이클링 굿즈',
    pointsRequired: 2000,
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&auto=format&fit=crop&q=80',
    badge: '2,000 P',
    description: '교내 수거 폐플라스틱 100% 업사이클링 에코 카라비너 키링',
    details: [
      '연세대 송도학사에서 분리수거된 플라스틱 병뚜껑 재가공',
      '튼튼한 황동 카라비너 고리 및 에코 각인',
      '고유의 마블링 패턴으로 세상에 단 하나뿐인 디자인',
      '에코 마일리지 후원 인증 QR 코드 포함',
    ],
  },
];

export const PICKUP_LOCATIONS = [
  { id: 'songdo-office', name: '송도학사 종합행정실 (제1기숙사 A동 1층)', hours: '평일 09:00 ~ 18:00' },
  { id: 'songdo-lounge', name: '송도학사 제2기숙사 D동 커뮤니티 라운지', hours: '평일 09:00 ~ 18:00' },
  { id: 'dorm-pickup-box', name: '송도학사 각 동 1층 무인 연근 수거함', hours: '24시간 상시 운영' },
];
