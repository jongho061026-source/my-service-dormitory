import React from 'react';
import { Menu, User, Sparkles } from 'lucide-react';
import { ScreenType, StudentUser } from '../types';

interface HeaderProps {
  currentScreen: ScreenType;
  user: StudentUser | null;
  onOpenDrawer: () => void;
  onNavigate: (screen: ScreenType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  user,
  onOpenDrawer,
  onNavigate,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between bg-[#014B43] px-4 text-white shadow-sm">
      <button
        id="btn-header-menu"
        type="button"
        onClick={onOpenDrawer}
        className="flex h-10 w-10 items-center justify-center rounded-full text-white/90 hover:bg-white/10 active:bg-white/20 transition-colors"
        aria-label="메뉴 열기"
      >
        <Menu className="h-6 w-6 stroke-[2.2]" />
      </button>

      <div
        className="flex items-center gap-1.5 cursor-pointer select-none"
        onClick={() => onNavigate('register')}
      >
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
          연근 마켓
        </h1>
        <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-[#A7F3D0] tracking-wide">
          연세 에코
        </span>
      </div>

      <button
        id="btn-header-profile"
        type="button"
        onClick={() => onNavigate('profile')}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          currentScreen === 'profile'
            ? 'bg-white/25 text-white ring-2 ring-white/40'
            : 'text-white/90 hover:bg-white/10'
        }`}
        aria-label="프로필"
      >
        <div className="relative">
          <User className="h-6 w-6 stroke-[2.2]" />
          {user?.isVerified && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#34D399] ring-2 ring-[#014B43]" />
          )}
        </div>
      </button>
    </header>
  );
};
