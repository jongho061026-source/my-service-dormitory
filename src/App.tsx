import React, { useState, useEffect } from 'react';
import { ScreenType, StudentUser, ItemRegistration, RewardRedemption } from './types';
import { SAMPLE_PRESETS } from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Drawer } from './components/Drawer';
import { AuthScreen } from './components/AuthScreen';
import { RegisterItemScreen } from './components/RegisterItemScreen';
import { CompletionScreen } from './components/CompletionScreen';
import { MileageRewardScreen } from './components/MileageRewardScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { MileageInfoModal } from './components/MileageInfoModal';
import {
  syncUserToFirestore,
  saveRegistrationToFirestore,
  saveRedemptionToFirestore,
  subscribeUserRedemptions,
  subscribeUserRegistrations,
} from './lib/firestoreService';

const DEFAULT_USER: StudentUser = {
  email: 'student26@yonsei.ac.kr',
  isVerified: true,
  name: '연세학우',
  studentId: '2026123456',
  dormBuilding: '송도학사 제1기숙사 A동',
  roomNumber: '301호',
  totalMileage: 2500,
};

const INITIAL_REGISTRATIONS: ItemRegistration[] = [
  {
    id: 'reg-demo-1',
    dormBuilding: '송도학사 제1기숙사 A동',
    roomNumber: '301호',
    description: '세탁 및 건조 완료 수건 4장 & 침구 세트',
    category: '침구/수건/생활잡화',
    photos: [SAMPLE_PRESETS[0].url],
    mileageEarned: 500,
    createdAt: '2026. 09. 01 09:30',
    status: 'COMPLETED',
  },
];

export default function App() {
  const [user, setUser] = useState<StudentUser | null>(() => {
    const saved = localStorage.getItem('yonsei_eco_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    const saved = localStorage.getItem('yonsei_eco_user');
    const parsedUser = saved ? JSON.parse(saved) : null;
    return parsedUser?.isVerified || parsedUser?.isGuest ? 'register' : 'auth';
  });

  const [registrations, setRegistrations] = useState<ItemRegistration[]>(() => {
    const saved = localStorage.getItem('yonsei_eco_registrations');
    return saved ? JSON.parse(saved) : INITIAL_REGISTRATIONS;
  });

  const [redemptions, setRedemptions] = useState<RewardRedemption[]>(() => {
    const saved = localStorage.getItem('yonsei_eco_redemptions');
    return saved ? JSON.parse(saved) : [];
  });

  const [latestRegistration, setLatestRegistration] = useState<ItemRegistration | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMileageInfoOpen, setIsMileageInfoOpen] = useState(false);

  // Sync to local storage & Firestore
  useEffect(() => {
    if (user) {
      localStorage.setItem('yonsei_eco_user', JSON.stringify(user));
      syncUserToFirestore(user);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('yonsei_eco_registrations', JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem('yonsei_eco_redemptions', JSON.stringify(redemptions));
  }, [redemptions]);

  // Subscribe to real-time Firestore updates for redemptions and registrations when logged in
  useEffect(() => {
    if (!user || user.isGuest) return;

    const unsubscribeRedemptions = subscribeUserRedemptions(user.email, (cloudRedemptions) => {
      if (cloudRedemptions.length > 0) {
        setRedemptions(cloudRedemptions);
      }
    });

    const unsubscribeRegistrations = subscribeUserRegistrations(user.email, (cloudRegs) => {
      if (cloudRegs.length > 0) {
        setRegistrations(cloudRegs);
      }
    });

    return () => {
      unsubscribeRedemptions();
      unsubscribeRegistrations();
    };
  }, [user?.email, user?.isGuest]);

  // Handle Authentication Completion
  const handleAuthSuccess = (verifiedUser: StudentUser) => {
    setUser(verifiedUser);
    syncUserToFirestore(verifiedUser);
    setCurrentScreen('register');
  };

  // Handle Item Registration Submission
  const handleSubmitRegistration = async (
    newReg: Omit<ItemRegistration, 'id' | 'createdAt'>
  ) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}. ${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}. ${now.getDate().toString().padStart(2, '0')} ${now
      .getHours()
      .toString()
      .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const created: ItemRegistration = {
      ...newReg,
      id: `reg-${Date.now()}`,
      createdAt: formattedDate,
    };

    setRegistrations((prev) => [created, ...prev]);
    setLatestRegistration(created);

    // Save to Firestore Database
    if (user) {
      const updatedUser: StudentUser = {
        ...user,
        totalMileage: user.totalMileage + created.mileageEarned,
        dormBuilding: created.dormBuilding,
        roomNumber: created.roomNumber,
      };
      setUser(updatedUser);
      await saveRegistrationToFirestore(created, user.email);
      await syncUserToFirestore(updatedUser);
    }

    setCurrentScreen('completion');
  };

  // Handle Reward Redemption (Deduct mileage + Persist to Firestore)
  const handleConfirmRedemption = async (
    redemptionData: Omit<RewardRedemption, 'id' | 'redeemedAt'>
  ) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}. ${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}. ${now.getDate().toString().padStart(2, '0')} ${now
      .getHours()
      .toString()
      .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newRedemption: RewardRedemption = {
      ...redemptionData,
      id: `rdm-${Date.now()}`,
      redeemedAt: formattedDate,
    };

    // Update local state first for immediate UI responsiveness
    setRedemptions((prev) => [newRedemption, ...prev]);

    // Deduct mileage points and sync to Firestore
    if (user) {
      const updatedUser: StudentUser = {
        ...user,
        totalMileage: Math.max(0, user.totalMileage - newRedemption.pointsSpent),
      };
      setUser(updatedUser);

      // Persist redemption and new mileage balance in Firestore
      try {
        await saveRedemptionToFirestore(newRedemption, user.email);
        await syncUserToFirestore(updatedUser);
      } catch (err) {
        console.warn('Firestore save redemption failed:', err);
      }
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('yonsei_eco_user');
    setCurrentScreen('auth');
  };

  // Reset to initial state
  const handleResetData = () => {
    if (window.confirm('모든 인계 및 마일리지 데이터를 초기화하시겠습니까? (로그인 상태도 해제됩니다)')) {
      setUser(null);
      setRegistrations(INITIAL_REGISTRATIONS);
      setRedemptions([]);
      setCurrentScreen('auth');
      localStorage.clear();
    }
  };

  const handleReAuth = () => {
    handleLogout();
  };

  const handleNavigate = (screen: ScreenType) => {
    if (!user && screen !== 'auth') {
      setCurrentScreen('auth');
      return;
    }
    setCurrentScreen(screen);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F7F5] font-sans antialiased text-[#1E2923]">
      {/* Top Header */}
      <div className="mx-auto w-full max-w-md">
        <Header
          currentScreen={currentScreen}
          user={user}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Main Screen Content */}
      <main className="mx-auto w-full max-w-md flex-1">
        {currentScreen === 'auth' && (
          <AuthScreen onAuthSuccess={handleAuthSuccess} />
        )}

        {currentScreen === 'register' && user && (
          <RegisterItemScreen
            user={user}
            onSubmitRegistration={handleSubmitRegistration}
            onOpenMileageInfo={() => setIsMileageInfoOpen(true)}
            onNavigateToAuth={() => setCurrentScreen('auth')}
          />
        )}

        {currentScreen === 'completion' && user && (
          <CompletionScreen
            user={user}
            latestRegistration={latestRegistration}
            onGoToRewards={() => handleNavigate('mileage')}
            onGoToHome={() => handleNavigate('register')}
          />
        )}

        {currentScreen === 'mileage' && user && (
          <MileageRewardScreen
            user={user}
            onConfirmRedemption={handleConfirmRedemption}
            onNavigateToHistory={() => handleNavigate('history')}
          />
        )}

        {currentScreen === 'history' && user && (
          <HistoryScreen
            user={user}
            registrations={registrations}
            redemptions={redemptions}
            onNavigateToRegister={() => handleNavigate('register')}
            onNavigateToMileage={() => handleNavigate('mileage')}
          />
        )}

        {currentScreen === 'profile' && user && (
          <ProfileScreen
            user={user}
            registrations={registrations}
            redemptions={redemptions}
            onResetData={handleResetData}
            onReAuth={handleReAuth}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Bottom Navigation (shown on main screens when authenticated) */}
      {currentScreen !== 'auth' && user && (
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
        />
      )}

      {/* Side Navigation Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        user={user}
      />

      {/* Mileage Rule Info Modal */}
      <MileageInfoModal
        isOpen={isMileageInfoOpen}
        onClose={() => setIsMileageInfoOpen(false)}
        onGoToRewards={() => handleNavigate('mileage')}
      />
    </div>
  );
}
