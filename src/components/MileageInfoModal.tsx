import React from 'react';
import { X, Gift, Leaf, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface MileageInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToRewards: () => void;
}

export const MileageInfoModal: React.FC<MileageInfoModalProps> = ({
  isOpen,
  onClose,
  onGoToRewards,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex h-14 items-center justify-between bg-[#014B43] px-4 text-white">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            <h3 className="text-base font-bold text-white">
              에코 마일리지 적립 안내
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <div className="rounded-2xl bg-[#F9DDCE]/60 p-4 text-center space-y-1.5">
            <span className="text-xs font-bold text-[#6D4A20]">물품 1개 등록 시</span>
            <div className="text-3xl font-black text-[#014B43]">
              +500 P 적립
            </div>
            <p className="text-xs text-[#6D4A20]/90">
              퇴소 시 버려지는 생활용품을 인계 등록하면 마일리지가 즉시 적립됩니다.
            </p>
          </div>

          <div className="space-y-2.5 text-xs text-[#4B5563]">
            <h4 className="font-bold text-[#1E2923] flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#014B43]" />
              에코 마일리지 활용 방법
            </h4>
            <div className="space-y-2 pl-1">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#014B43] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1E2923]">1,000P:</strong> 친환경 콩기름 잉크 스티커 팩 (4종 세트)
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#014B43] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1E2923]">2,000P:</strong> 폐플라스틱 100% 업사이클링 에코 키링
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#F4F7F5] p-3 text-[11px] text-[#6B7280] leading-relaxed">
            • 적립된 마일리지는 연세대학교 기숙사 에코 리워드 수령처(송도학사 행정실 등)에서 바로 교환 가능합니다.
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onGoToRewards();
            }}
            className="w-full rounded-full bg-[#014B43] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#013B35]"
          >
            리워드 교환소 보러가기
          </button>
        </div>
      </div>
    </div>
  );
};
