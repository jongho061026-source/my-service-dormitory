import React from 'react';
import { X, Home, Leaf, ReceiptText, User, MapPin, HelpCircle, ShieldCheck, ChevronRight, Sparkles, LogIn, LogOut } from 'lucide-react';
import { ScreenType, StudentUser } from '../types';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onLogout: () => void;
  user: StudentUser | null;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  currentScreen,
  onNavigate,
  onLogout,
  user,
}) => {
  if (!isOpen) return null;

  const handleNav = (screen: ScreenType) => {
    onNavigate(screen);
    onClose();
  };

  const handleLogoutAction = () => {
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative z-10 flex h-full w-[85%] max-w-xs flex-col justify-between bg-white shadow-2xl animate-slideRight">
        <div>
          {/* Header */}
          <div className="bg-[#014B43] p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#A7F3D0]">
                연세대학교 에코 MVP
              </span>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-1">
              <h3 className="text-xl font-black tracking-tight">연근 마켓</h3>
              <p className="text-xs text-white/80">
                연세대 기숙사 물품 인계 & 에코 마일리지
              </p>
            </div>

            {user ? (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between gap-2 rounded-xl bg-white/10 p-2.5 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    {user.isGuest ? (
                      <User className="h-4 w-4 text-[#A7F3D0] flex-shrink-0" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-[#A7F3D0] flex-shrink-0" />
                    )}
                    <span className="font-medium text-white/95 truncate">
                      {user.name} ({user.dormBuilding})
                    </span>
                  </div>
                </div>
                {user.isGuest && (
                  <button
                    type="button"
                    onClick={() => handleNav('auth')}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#A7F3D0] py-1.5 px-2.5 text-[11px] font-bold text-[#014B43] hover:bg-[#6EE7B7] transition-colors"
                  >
                    <LogIn className="h-3 w-3" />
                    <span>학생 인증하고 계정 연동</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleNav('auth')}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#A7F3D0] py-2 px-3 text-xs font-bold text-[#014B43] hover:bg-[#6EE7B7] transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>연세 학우 인증하기</span>
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1">
            <button
              type="button"
              onClick={() => handleNav('register')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-colors ${
                currentScreen === 'register' || currentScreen === 'completion'
                  ? 'bg-[#E7F0EC] text-[#014B43]'
                  : 'text-[#374151] hover:bg-[#F4F7F5]'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>물품 인계 등록</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('mileage')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-colors ${
                currentScreen === 'mileage'
                  ? 'bg-[#E7F0EC] text-[#014B43]'
                  : 'text-[#374151] hover:bg-[#F4F7F5]'
              }`}
            >
              <Leaf className="h-5 w-5" />
              <span>에코 마일리지 & 리워드</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('history')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-colors ${
                currentScreen === 'history'
                  ? 'bg-[#E7F0EC] text-[#014B43]'
                  : 'text-[#374151] hover:bg-[#F4F7F5]'
              }`}
            >
              <ReceiptText className="h-5 w-5" />
              <span>나의 인계 및 교환 내역</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('profile')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-colors ${
                currentScreen === 'profile'
                  ? 'bg-[#E7F0EC] text-[#014B43]'
                  : 'text-[#374151] hover:bg-[#F4F7F5]'
              }`}
            >
              <User className="h-5 w-5" />
              <span>학우 정보 & 에코 통계</span>
            </button>
          </div>

          {/* Quick Info Box */}
          <div className="mx-4 mt-2 rounded-2xl bg-[#F9FBFA] border border-[#E5E9E7] p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#014B43]">
              <MapPin className="h-4 w-4" />
              <span>연근 수거함 위치</span>
            </div>
            <p className="text-[11px] text-[#4B5563] leading-relaxed">
              송도학사 제1기숙사(A~C동) 및 제2기숙사(D~G동) 각 동 1층 무인 택배함 옆 연근 수거함에 안전하게 두시면 됩니다.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E5E9E7] p-4 text-[11px] text-[#9CA3AF] space-y-2">
          {user && (
            <button
              type="button"
              onClick={handleLogoutAction}
              className="flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold text-[#DC2626] hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>로그아웃</span>
            </button>
          )}
          <div className="space-y-0.5">
            <p className="font-semibold text-[#6B7280]">연세대학교 1학년 기숙사 에코 캠페인</p>
            <p>© 2026 연근 마켓 MVP Project</p>
          </div>
        </div>
      </div>
    </div>
  );
};
