import React, { useEffect, useState } from 'react';
import { Check, Leaf, MapPin, ArrowRight, Home, Sparkles, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ItemRegistration, StudentUser } from '../types';
import { MaxMileageAlertModal } from './MaxMileageAlertModal';

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
  const earned = latestRegistration?.mileageEarned ?? 0;
  const isZeroMileage = earned === 0;
  const [isAlertOpen, setIsAlertOpen] = useState(isZeroMileage);

  useEffect(() => {
    if (!isZeroMileage) {
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
    }
  }, [isZeroMileage]);

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

        {/* Card 1: 에코 마일리지 적립 or 한도 초과 안내 */}
        {isZeroMileage ? (
          <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-5 text-center shadow-xs space-y-2.5">
            <div className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-bold text-[#B45309]">
              <AlertTriangle className="h-3.5 w-3.5" />
              학기 최대 마일리지(3,000P) 달성 완료
            </div>
            <p className="text-xs font-bold text-[#92400E]">
              {latestRegistration?.category ? `[${latestRegistration.category}] 나눔 물품 등록 완료` : '나눔 물품 등록 완료'}
            </p>
            <div className="flex items-center justify-center gap-2 py-1">
              <span className="text-3xl font-black tracking-tight text-[#B45309]">
                0P (추가 적립 불가)
              </span>
            </div>
            <p className="text-xs font-medium text-[#78350F] leading-relaxed px-2">
              이번 학기 최대 적립 한도(3,000P)를 이미 모두 달성하여 마일리지가 추가 적립되지 않았습니다.<br />
              마일리지는 지급되지 않지만, 학우를 위한 소중한 나눔에 진심으로 감사드립니다!
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#92400E] border border-[#FDE68A]">
                <Sparkles className="h-3 w-3 text-[#D97706]" />
                현재 총 보유 마일리지: <strong className="font-extrabold">{user.totalMileage.toLocaleString()}P</strong> (최대 한도)
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#E3E8E5] bg-white p-5 text-center shadow-xs space-y-2">
            <p className="text-xs font-semibold text-[#6B7280]">
              {latestRegistration?.category ? `[${latestRegistration.category}] 에코 마일리지 적립` : '에코 마일리지 적립'}
            </p>
            <div className="flex items-center justify-center gap-2 py-1">
              <Leaf className="h-7 w-7 fill-[#6D4A20] text-[#6D4A20]" />
              <span className="text-3xl font-black tracking-tight text-[#6D4A20]">
                +{earned}P
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
        )}

        {/* Card 2: 기숙사 나눔 안내 */}
        <div className="rounded-2xl border border-[#E3E8E5] bg-white p-5 shadow-xs space-y-2.5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#EBF2EE] text-[#014B43]">
              <MapPin className="h-5 w-5 fill-[#014B43] text-[#014B43]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#1E2923]">
                기숙사 나눔 안내
              </h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                공지된 기숙사 현장 거점 및 1층 로비에서 안전하게 물품을 나눔해주세요.
              </p>
            </div>
          </div>

          <div className="mt-2 rounded-xl bg-[#F9FBFA] border border-[#E5E9E7] p-2.5 text-xs text-[#4B5563] flex items-center justify-between">
            <span className="font-semibold text-[#014B43]">나눔 등록 정보</span>
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

      {/* Maximum Mileage Warning Popup Modal */}
      <MaxMileageAlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title="학기 최대 마일리지(3,000P) 한도 도달 안내"
        message="이번 학기 최대 적립 한도인 3,000P를 이미 모두 달성하여, 이번 물품 나눔 등록에 대해서는 마일리지가 추가 적립되지 않았습니다 (0P 적립)."
        currentMileage={user.totalMileage}
        confirmText="확인 완료"
      />
    </div>
  );
};
