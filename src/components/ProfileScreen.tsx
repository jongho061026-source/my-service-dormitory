import React from 'react';
import { User, ShieldCheck, Leaf, Award, LogOut } from 'lucide-react';
import { ItemRegistration, RewardRedemption, StudentUser } from '../types';

interface ProfileScreenProps {
  user: StudentUser;
  registrations: ItemRegistration[];
  redemptions: RewardRedemption[];
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  registrations,
  redemptions,
  onLogout,
}) => {
  // Calculate eco impact
  const totalItems = registrations.length;
  const co2SavedKg = (totalItems * 2.8).toFixed(1);

  return (
    <div className="min-h-[calc(100vh-7rem)] bg-[#F4F7F5] pb-28 pt-4 px-4">
      <div className="mx-auto max-w-md space-y-4">
        {/* Student Profile Card */}
        <div className="rounded-3xl border border-[#E3E8E5] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#014B43] text-white shadow-xs">
              <User className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-black text-[#1E2923]">{user.name}</h3>
                {user.isGuest ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-bold text-[#92400E]">
                    비회원 게스트
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F0EC] px-2 py-0.5 text-[10px] font-bold text-[#014B43]">
                    <ShieldCheck className="h-3 w-3" />
                    연세대 인증
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280]">{user.isGuest ? '게스트 모드로 이용 중' : user.email}</p>
            </div>
          </div>

          {user.isGuest && (
            <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] p-3 text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-[#014B43]">연세대학생 인증하기</p>
                <p className="text-[11px] text-[#4B5563]">웹메일 인증으로 마일리지 혜택을 연동하세요</p>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-xl bg-[#014B43] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#013B35] transition-colors cursor-pointer"
              >
                인증하기
              </button>
            </div>
          )}

          {/* Dormitory Badge */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#F9FBFA] border border-[#E5E9E7] p-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold text-[#6B7280]">기숙사</span>
              <p className="font-bold text-[#1E2923]">{user.dormBuilding}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold text-[#6B7280]">호수</span>
              <p className="font-bold text-[#1E2923]">{user.roomNumber}</p>
            </div>
          </div>
        </div>

        {/* Eco Impact Stats */}
        <div className="rounded-3xl border border-[#E3E8E5] bg-white p-5 shadow-xs space-y-3">
          <h4 className="text-sm font-bold text-[#1E2923] flex items-center gap-1.5">
            <Leaf className="h-4 w-4 text-[#014B43]" />
            나의 에코 임팩트 기여도
          </h4>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-[#F0F7F4] p-3 space-y-1">
              <span className="text-[10px] font-semibold text-[#014B43]">인계 물품</span>
              <p className="text-lg font-black text-[#014B43]">{totalItems}개</p>
            </div>
            <div className="rounded-2xl bg-[#FDF5F0] p-3 space-y-1">
              <span className="text-[10px] font-semibold text-[#6D4A20]">CO2 절감</span>
              <p className="text-lg font-black text-[#6D4A20]">{co2SavedKg}kg</p>
            </div>
            <div className="rounded-2xl bg-[#F3F4F6] p-3 space-y-1">
              <span className="text-[10px] font-semibold text-[#4B5563]">누적 마일리지</span>
              <p className="text-lg font-black text-[#1E2923]">{user.totalMileage.toLocaleString()}P</p>
            </div>
          </div>
        </div>

        {/* Eco Campaign Badge */}
        <div className="rounded-2xl bg-[#F9DDCE]/70 border border-[#F6D5C3] p-4 text-xs text-[#6D4A20] space-y-1.5">
          <p className="font-bold flex items-center gap-1.5">
            <Award className="h-4 w-4" />
            2026 연세 에코 캠퍼스 챌린지 참여 중
          </p>
          <p className="text-[11px] leading-relaxed text-[#6D4A20]/90">
            기숙사 퇴소 기간 동안 자원 순환에 동참한 연세인에게 총장 명의 에코 마일리지 기여 인증서가 발급됩니다.
          </p>
        </div>

        {/* Action Options */}
        <div className="rounded-2xl border border-[#E3E8E5] bg-white p-2 text-xs font-semibold text-[#4B5563]">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-[#F4F7F5] text-left transition-colors text-[#DC2626] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4 text-[#DC2626]" />
              <span className="font-bold">로그아웃</span>
            </div>
            <span className="text-[11px] text-[#9CA3AF]">인증 화면으로 이동</span>
          </button>
        </div>
      </div>
    </div>
  );
};
