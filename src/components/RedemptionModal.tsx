import React, { useState } from 'react';
import { X, Gift, Check, MapPin, Sparkles, CheckCircle2, Ticket } from 'lucide-react';
import confetti from 'canvas-confetti';
import { EcoReward, RewardRedemption, StudentUser } from '../types';
import { PICKUP_LOCATIONS } from '../data/mockData';

interface RedemptionModalProps {
  isOpen: boolean;
  reward: EcoReward | null;
  user: StudentUser;
  onClose: () => void;
  onConfirmRedeem: (redemption: Omit<RewardRedemption, 'id' | 'redeemedAt'>) => void;
}

export const RedemptionModal: React.FC<RedemptionModalProps> = ({
  isOpen,
  reward,
  user,
  onClose,
  onConfirmRedeem,
}) => {
  const [selectedPickup, setSelectedPickup] = useState(PICKUP_LOCATIONS[0].name);
  const [studentContact, setStudentContact] = useState('010-1885-2026');
  const [isSuccess, setIsSuccess] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');

  if (!isOpen || !reward) return null;

  const handleRedeem = () => {
    const code = `ECO-${Math.floor(100000 + Math.random() * 900000)}`;
    setVoucherCode(code);

    onConfirmRedeem({
      rewardId: reward.id,
      rewardName: reward.name,
      pointsSpent: reward.pointsRequired,
      status: 'READY_FOR_PICKUP',
      pickupLocation: selectedPickup,
      voucherCode: code,
    });

    setIsSuccess(true);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.4 },
        colors: ['#014B43', '#6D4A20', '#F9DDCE', '#10B981'],
      });
    } catch {
      // ignore
    }
  };

  const handleFinish = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex h-14 items-center justify-between bg-[#014B43] px-4 text-white">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            <h3 className="text-base font-bold text-white">
              {isSuccess ? '교환 신청 완료' : '친환경 리워드 교환 신청'}
            </h3>
          </div>
          <button
            type="button"
            onClick={isSuccess ? handleFinish : onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {!isSuccess ? (
          <div className="p-5 space-y-4">
            {/* Selected Reward Summary */}
            <div className="flex items-center gap-3 rounded-2xl border border-[#E5E9E7] bg-[#F9FBFA] p-3">
              <img
                src={reward.image}
                alt={reward.name}
                className="h-16 w-16 rounded-xl object-cover"
              />
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-[#014B43] bg-[#E7F0EC] px-2 py-0.5 rounded-md">
                  {reward.category}
                </span>
                <h4 className="text-sm font-extrabold text-[#1E2923]">
                  {reward.name}
                </h4>
                <p className="text-xs font-bold text-[#6D4A20]">
                  차감 마일리지: {reward.pointsRequired.toLocaleString()} P
                </p>
              </div>
            </div>

            {/* Pickup Location Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4B5563] flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-[#014B43]" />
                수령 장소 선택
              </label>
              <div className="space-y-1.5">
                {PICKUP_LOCATIONS.map((loc) => (
                  <label
                    key={loc.id}
                    onClick={() => setSelectedPickup(loc.name)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 text-xs transition-all ${
                      selectedPickup === loc.name
                        ? 'border-[#014B43] bg-[#F0F7F4] font-bold text-[#014B43]'
                        : 'border-[#E5E9E7] text-[#4B5563] hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{loc.name}</p>
                      <p className="text-[10px] text-[#6B7280] font-normal">{loc.hours}</p>
                    </div>
                    {selectedPickup === loc.name && (
                      <Check className="h-4 w-4 text-[#014B43]" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Remaining Mileage Calculation */}
            <div className="rounded-xl bg-[#F9DDCE]/50 p-3 text-xs text-[#6D4A20] flex items-center justify-between">
              <span>교환 후 잔여 마일리지</span>
              <strong className="text-sm font-extrabold">
                {(user.totalMileage - reward.pointsRequired).toLocaleString()} P
              </strong>
            </div>

            {/* Submit Button */}
            <button
              id="btn-confirm-redeem"
              type="button"
              onClick={handleRedeem}
              className="w-full rounded-full bg-[#014B43] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#013B35] active:scale-[0.99] transition-all"
            >
              교환 신청 확정하기
            </button>
          </div>
        ) : (
          /* Success View */
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#A7F3D0]">
              <CheckCircle2 className="h-9 w-9 text-[#014B43]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-[#1E2923]">
                교환 신청이 완료되었습니다!
              </h4>
              <p className="text-xs text-[#4B5563]">
                지정하신 수령처에서 바우처 코드를 제시해주세요.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-[#014B43] bg-[#F4F9F6] p-4 text-center space-y-1">
              <span className="text-[11px] font-semibold text-[#014B43] flex items-center justify-center gap-1">
                <Ticket className="h-3.5 w-3.5" />
                수령 인증 코드
              </span>
              <p className="text-xl font-mono font-black text-[#014B43] tracking-wider">
                {voucherCode}
              </p>
              <p className="text-[10px] text-[#6B7280]">
                수령처: {selectedPickup}
              </p>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="w-full rounded-full bg-[#014B43] py-3 text-sm font-bold text-white shadow-md hover:bg-[#013B35]"
            >
              확인 완료
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
