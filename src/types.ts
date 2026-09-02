export type ScreenType = 
  | 'auth'
  | 'register'
  | 'completion'
  | 'mileage'
  | 'history'
  | 'profile';

export interface StudentUser {
  email: string;
  isVerified: boolean;
  isGuest?: boolean;
  name: string;
  studentId: string;
  dormBuilding: string;
  roomNumber: string;
  totalMileage: number;
}

export interface ItemRegistration {
  id: string;
  dormBuilding: string;
  roomNumber: string;
  description: string;
  category: string;
  photos: string[];
  mileageEarned: number;
  createdAt: string;
  status: 'PENDING_DROPOFF' | 'COMPLETED';
}

export interface EcoReward {
  id: string;
  name: string;
  category: string;
  pointsRequired: number;
  image: string;
  description: string;
  badge: string;
  details: string[];
}

export interface RewardRedemption {
  id: string;
  rewardId: string;
  rewardName: string;
  pointsSpent: number;
  redeemedAt: string;
  status: 'READY_FOR_PICKUP' | 'COMPLETED';
  pickupLocation: string;
  voucherCode: string;
}

export interface SamplePhotoPreset {
  id: string;
  title: string;
  category: string;
  url: string;
}
