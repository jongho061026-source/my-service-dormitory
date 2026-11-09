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
  '전자기기',
  '책/서적',
  '생활용품',
  '욕실용품',
  '문구류',
  '주방용품',
  '음식(미개봉)',
  '기타',
] as const;

export const CATEGORY_MILEAGE_MAP: Record<string, number> = {
  '전자기기': 500,
  '책/서적': 300,
  '생활용품': 250,
  '욕실용품': 200,
  '문구류': 150,
  '주방용품': 100,
  '음식(미개봉)': 50,
  '기타': 50,
};

export const getMileageByCategory = (category: string): number => {
  return CATEGORY_MILEAGE_MAP[category] ?? 50;
};

export const MAX_SEMESTER_MILEAGE = 3000;

export const ECO_REWARDS: EcoReward[] = [
  {
    id: 'keyring-standing',
    name: '서있는 연근이 키링',
    category: '마스코트 키링',
    pointsRequired: 3000,
    image: '/assets/rewards/yeongeun_standing.png',
    badge: '3,000 P',
    description: '연근 마켓 대표 마스코트, 늠름하게 서 있는 연근이 아크릴 키링',
    details: [
      '연근 마켓 캐릭터 연근이 아크릴 키링',
      '3,000 마일리지 포인트로 교환 가능',
      '신청 완료 후 송도학사 행정실 또는 지정 거점에서 수령',
    ],
  },
  {
    id: 'keyring-v',
    name: '브이하는 연근이 키링',
    category: '마스코트 키링',
    pointsRequired: 4000,
    image: '/assets/rewards/yeongeun_v.png',
    badge: '4,000 P',
    description: '승리의 브이 포즈를 취하고 있는 한정판 연근이 키링',
    details: [
      '연근 마켓 캐릭터 연근이 아크릴 키링',
      '4,000 마일리지 포인트로 교환 가능',
      '신청 완료 후 송도학사 행정실 또는 지정 거점에서 수령',
    ],
  },
  {
    id: 'keyring-thumbsup',
    name: '따봉하는 연근이 키링',
    category: '마스코트 키링',
    pointsRequired: 3500,
    image: '/assets/rewards/yeongeun_thumbsup.png',
    badge: '3,500 P',
    description: '엄지를 척! 학우들을 격려하고 응원하는 따봉 연근이 키링',
    details: [
      '연근 마켓 캐릭터 연근이 아크릴 키링',
      '3,500 마일리지 포인트로 교환 가능',
      '신청 완료 후 송도학사 행정실 또는 지정 거점에서 수령',
    ],
  },
  {
    id: 'keycap-confused',
    name: '당황하는 연근이 키캡',
    category: '기계식 키보드 키캡',
    pointsRequired: 1500,
    image: '/assets/rewards/yeongeun_confused.png',
    badge: '1,500 P',
    description: '귀여운 땀방울이 돋보이는 당황하는 표정의 연근이 3D 키캡',
    details: [
      '체리 MX 호환 기계식 키보드 포인트 키캡',
      '1,500 마일리지 포인트로 교환 가능',
      '신청 완료 후 송도학사 행정실 또는 지정 거점에서 수령',
    ],
  },
  {
    id: 'keycap-bow',
    name: '인사하는 연근이 키캡',
    category: '기계식 키보드 키캡',
    pointsRequired: 1500,
    image: '/assets/rewards/yeongeun_bow.png',
    badge: '1,500 P',
    description: '공손하게 양손을 모으고 인사하는 사랑스러운 연근이 3D 키캡',
    details: [
      '체리 MX 호환 기계식 키보드 포인트 키캡',
      '1,500 마일리지 포인트로 교환 가능',
      '신청 완료 후 송도학사 행정실 또는 지정 거점에서 수령',
    ],
  },
];

export const PICKUP_LOCATIONS = [
  { id: 'songdo-office', name: '송도학사 종합행정실 (제1기숙사 A동 1층)', hours: '평일 09:00 ~ 18:00' },
  { id: 'songdo-lounge', name: '송도학사 제2기숙사 D동 커뮤니티 라운지', hours: '평일 09:00 ~ 18:00' },
  { id: 'songdo-dorm-meeting', name: '송도학사 기숙사 1층 지정 현장 거점', hours: '공지된 인계 시간 운영' },
];
