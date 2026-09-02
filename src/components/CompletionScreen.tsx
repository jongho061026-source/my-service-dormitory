import React, { useEffect } from 'react';
import { Check, Leaf, MapPin, ArrowRight, Home, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ItemRegistration, StudentUser } from '../types';

interface CompletionScreenProps {
  user: StudentUser;
  latestRegistration: ItemRegistration | null;
  onGoToRewards: () => void;
  onGoToHome: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  user,
  latestRegistration,
  onGoToRewards,
  onGoToHome,
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.35 },
        colors: ['#014B43', '#6D4A20', '#F9DDCE', '#34D399'],
      });
    } catch {
      // ignore
    }
  }, []);

  const dormName = latestRegistration?.dormBuilding || user.dormBuilding || '기숙사';
  const room = latestRegistration?.roomNumber || user.roomNumber || '301호';

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col justify-between bg-[#F4F7F5] px-4 py-8 pb-24">
      <div className="mx-auto w-full max-w-md space-y-6">
        {/* Top Checkmark & Title matching Image 5/6 */}
        <div className="flex flex-col items-center justify-center text-center space-y-3 pt-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#A7F3D0] shadow-sm animate-bounce-subtle">
            <Check className="h-10 w-10 text-[#014B43] stroke-[3.5]" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-[#1E2923]">
            물품 등록 완료
          </h2>
        </div>

        {/* Card 1: 에코 마일리지 적립 matching Image 5/6 */}
        <div className="rounded-2xl border border-[#E3E8E5] bg-white p-5 text-center shadow-xs space-y-2">
          <p className="text-xs font-semibold text-[#6B7280]">
            에코 마일리지 적립
          </p>
          <div className="flex items-center justify-center gap-2 py-1">
            <Leaf className="h-7 w-7 fill-[#6D4A20] text-[#6D4A20]" />
            <span className="text-3xl font-black tracking-tight text-[#6D4A20]">
              +500P
            </span>
          </div>
          <p className="text-xs font-medium text-[#4B5563]">
            지구와 학우를 위한 따뜻한 나눔, 감사합니다.
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F4F7F5] px-3 py-1 text-[11px] font-semibold text-[#014B43]">
              <Sparkles className="h-3 w-3" />
              현재 총 보유 마일리지: <strong className="font-extrabold">{user.totalMileage.toLocaleString()}P</strong>
            </span>
          </div>
        </div>

        {/* Card 2: 기숙사 지정 반납 장소 matching Image 5/6 */}
        <div className="rounded-2xl border border-[#E3E8E5] bg-white p-5 shadow-xs space-y-2.5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#EBF2EE] text-[#014B43]">
              <MapPin className="h-5 w-5 fill-[#014B43] text-[#014B43]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#1E2923]">
                기숙사 지정 반납 장소
              </h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                각 동 1층 무인 택배함 옆 <span className="font-bold text-[#014B43]">'연근 수거함'</span>에 물품을 안전하게 넣어주세요.
              </p>
            </div>
          </div>

          <div className="mt-2 rounded-xl bg-[#F9FBFA] border border-[#E5E9E7] p-2.5 text-xs text-[#4B5563] flex items-center justify-between">
            <span className="font-semibold text-[#014B43]">인계 등록 정보</span>
            <span className="font-medium text-[#1E2923]">
              {dormName} {room}
            </span>
          </div>
        </div>
      </div>

      {/* Buttons matching Image 5/6 */}
      <div className="mx-auto w-full max-w-md space-y-3 pt-6">
        <button
          id="btn-completion-rewards"
          type="button"
          onClick={onGoToRewards}
          className="w-full rounded-full bg-[#014B43] py-4 text-base font-bold text-white shadow-md hover:bg-[#013B35] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <span>보상받기</span>
          <ArrowRight className="h-5 w-5 stroke-[2.5]" />
        </button>

        <button
          id="btn-completion-home"
          type="button"
          onClick={onGoToHome}
          className="w-full rounded-full border-2 border-[#6D4A20] bg-white py-3.5 text-sm font-bold text-[#6D4A20] hover:bg-[#FAF6F3] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
        >
          <Home className="h-4 w-4" />
          <span>홈으로 돌아가기</span>
        </button>
      </div>
    </div>
  );
};
