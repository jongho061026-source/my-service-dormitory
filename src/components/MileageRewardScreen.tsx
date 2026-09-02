import React, { useState } from 'react';
import { Leaf, Gift, Check, Sparkles, AlertCircle, Info } from 'lucide-react';
import { EcoReward, RewardRedemption, StudentUser } from '../types';
import { ECO_REWARDS } from '../data/mockData';
import { RedemptionModal } from './RedemptionModal';

interface MileageRewardScreenProps {
  user: StudentUser;
  onConfirmRedemption: (redemption: Omit<RewardRedemption, 'id' | 'redeemedAt'>) => void;
  onNavigateToHistory: () => void;
}

export const MileageRewardScreen: React.FC<MileageRewardScreenProps> = ({
  user,
  onConfirmRedemption,
  onNavigateToHistory,
}) => {
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(ECO_REWARDS[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');

  const selectedReward = ECO_REWARDS.find((r) => r.id === selectedRewardId) || null;

  const handleOpenRedemption = () => {
    if (!selectedReward) {
      setErrorNotice('교환하실 친환경 리워드를 선택해주세요.');
      return;
    }
    if (user.totalMileage < selectedReward.pointsRequired) {
      setErrorNotice(
        `마일리지가 부족합니다. (필요: ${selectedReward.pointsRequired.toLocaleString()}P / 현재: ${user.totalMileage.toLocaleString()}P)`
      );
      return;
    }
    setErrorNotice('');
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] bg-[#F4F7F5] pb-28 pt-4 px-4">
      <div className="mx-auto max-w-md space-y-6">
        {/* Mileage Display Header matching Image 4 */}
        <div className="text-center space-y-1.5 pt-2">
          <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[#6D4A20]">
            <Leaf className="h-4 w-4 fill-[#6D4A20] text-[#6D4A20]" />
            <span>현재 보유 마일리지</span>
          </div>
          <div className="flex items-baseline justify-center gap-1 text-[#014B43]">
            <span className="text-4xl font-black tracking-tight">
              {user.totalMileage.toLocaleString()}
            </span>
            <span className="text-2xl font-black">P</span>
          </div>
          <p className="text-[11px] text-[#757876]">
            물품 인계 등록 1회당 500P 적립
          </p>
        </div>

        {/* Section Title matching Image 4 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1E2923]">
              리워드 선택
            </h3>
            <span className="text-xs text-[#757876]">
              선택 시 상세 정보 확인 가능
            </span>
          </div>

          {/* Reward Cards matching Image 4 */}
          <div className="space-y-3">
            {ECO_REWARDS.map((reward) => {
              const isSelected = selectedRewardId === reward.id;
              const canAfford = user.totalMileage >= reward.pointsRequired;

              return (
                <div
                  id={`reward-card-${reward.id}`}
                  key={reward.id}
                  onClick={() => {
                    setSelectedRewardId(reward.id);
                    setErrorNotice('');
                  }}
                  className={`group relative flex cursor-pointer items-center gap-4 rounded-3xl border-2 bg-white p-4 shadow-xs transition-all ${
                    isSelected
                      ? 'border-[#014B43] ring-2 ring-[#014B43]/15 shadow-sm'
                      : 'border-[#E5E9E7] hover:border-[#B7C7BF]'
                  }`}
                >
                  {/* Reward Thumbnail Image */}
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-[#EAF0EC]">
                    <img
                      src={reward.image}
                      alt={reward.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#014B43] text-white shadow-xs">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Reward Info */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="text-base font-extrabold text-[#1E2923]">
                        {reward.name}
                      </h4>
                      <p className="text-xs text-[#4B5563] line-clamp-1">
                        {reward.description}
                      </p>
                    </div>

                    {/* Badge Pill matching Image 4 */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F9DDCE] px-3 py-1 text-xs font-bold text-[#6D4A20]">
                        <Leaf className="h-3 w-3 fill-[#6D4A20] text-[#6D4A20]" />
                        {reward.badge}
                      </span>

                      {!canAfford && (
                        <span className="text-[10px] font-semibold text-[#DC2626]">
                          {reward.pointsRequired - user.totalMileage}P 부족
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Reward Details */}
        {selectedReward && (
          <div className="rounded-2xl border border-[#E3E8E5] bg-white p-4 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#014B43]">
              <Sparkles className="h-4 w-4" />
              <span>{selectedReward.name} 제작 스토리 & 특징</span>
            </div>
            <ul className="space-y-1 text-[#4B5563] pl-1 text-[11px] leading-relaxed">
              {selectedReward.details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#014B43] font-bold">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {errorNotice && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-800 border border-amber-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Bottom CTA Button matching Image 4 */}
        <div className="pt-2">
          <button
            id="btn-exchange-rewards"
            type="button"
            onClick={handleOpenRedemption}
            className={`w-full rounded-full py-4 text-base font-bold text-white shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 ${
              selectedReward && user.totalMileage >= selectedReward.pointsRequired
                ? 'bg-[#014B43] hover:bg-[#013B35]'
                : 'bg-[#6D8A80] hover:bg-[#5C7970]'
            }`}
          >
            <Gift className="h-5 w-5" />
            <span>친환경 리워드 교환 신청하기</span>
          </button>
        </div>

        {/* Info Guide */}
        <div className="rounded-xl bg-[#F4F7F5] p-3 text-center text-xs text-[#757876]">
          신청 완료 후 송도학사 행정실 또는 무인 수거함에서 수령 가능합니다.
        </div>
      </div>

      {/* Redemption Modal */}
      <RedemptionModal
        isOpen={isModalOpen}
        reward={selectedReward}
        user={user}
        onClose={() => setIsModalOpen(false)}
        onConfirmRedeem={(redemption) => {
          onConfirmRedemption(redemption);
        }}
      />
    </div>
  );
};
