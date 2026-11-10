import React from 'react';
import { Home, ReceiptText, User, Gift } from 'lucide-react';
import { ScreenType } from '../types';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
}) => {
  const navItems: { id: ScreenType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'register', label: '홈', icon: Home },
    { id: 'mileage', label: '마일리지', icon: Gift },
    { id: 'history', label: '내역', icon: ReceiptText },
    { id: 'profile', label: '프로필', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-md border-x border-t border-[#D0DAD4] bg-white px-4 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            item.id === currentScreen ||
            (item.id === 'register' && currentScreen === 'completion');
          const Icon = item.icon;

          return (
            <button
              id={`nav-item-${item.id}`}
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-1 flex-col items-center justify-center py-1 text-center transition-all ${
                isActive
                  ? 'text-[#014B43] font-bold'
                  : 'text-[#757876] hover:text-[#014B43] font-medium'
              }`}
            >
              <div
                className={`flex h-8 w-12 items-center justify-center rounded-full transition-all ${
                  isActive ? 'bg-[#E7F0EC] text-[#014B43]' : ''
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
              </div>
              <span className="mt-0.5 text-xs tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
