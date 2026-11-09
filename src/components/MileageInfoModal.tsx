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
          <div className="rounded-2xl bg-[#F9DDCE]/60 p-4 space-y-2.5">
            <div className="text-center">
              <span className="text-xs font-bold text-[#6D4A20]">카테고리별 마일리지 적립</span>
              <div className="text-2xl font-black text-[#014B43] mt-0.5">
                최대 500 P 적립
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-white/80 px-2.5 py-1.5 border border-[#F6D5C3]">
                <span className="font-semibold text-[#1E2923]">전자기기</span>
                <span className="font-bold text-[#014B43]">+500P</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/80 px-2.5 py-1.5 border border-[#F6D5C3]">
                <span className="font-semibold text-[#1E2923]">책/서적</span>
                <span className="font-bold text-[#014B43]">+300P</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/80 px-2.5 py-1.5 border border-[#F6D5C3]">
                <span className="font-semibold text-[#1E2923]">생활용품</span>
                <span className="font-bold text-[#014B43]">+250P</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/80 px-2.5 py-1.5 border border-[#F6D5C3]">
                <span className="font-semibold text-[#1E2923]">욕실용품</span>
                <span className="font-bold text-[#014B43]">+200P</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/80 px-2.5 py-1.5 border border-[#F6D5C3]">
                <span className="font-semibold text-[#1E2923]">문구류</span>
                <span className="font-bold text-[#014B43]">+150P</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/80 px-2.5 py-1.5 border border-[#F6D5C3]">
                <span className="font-semibold text-[#1E2923]">주방용품</span>
                <span className="font-bold text-[#014B43]">+100P</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/80 px-2.5 py-1.5 border border-[#F6D5C3]">
                <span className="font-semibold text-[#1E2923]">음식(미개봉)</span>
                <span className="font-bold text-[#014B43]">+50P</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/80 px-2.5 py-1.5 border border-[#F6D5C3]">
                <span className="font-semibold text-[#1E2923]">기타</span>
                <span className="font-bold text-[#014B43]">+50P</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-[#4B5563]">
            <h4 className="font-bold text-[#1E2923] flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#014B43]" />
              에코 마일리지 리워드 교환 안내 (총 5종)
            </h4>
            <div className="rounded-xl border border-[#F6D5C3] bg-[#FDF5F0] p-3 flex items-center gap-3">
              <img
                src="/assets/rewards/yeongeun_standing.png"
                alt="연근이 키링 & 키캡"
                className="h-12 w-12 rounded-full border border-white bg-white object-contain flex-shrink-0"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#014B43]">1,500P ~ 4,000P 교환</span>
                <p className="text-xs font-semibold text-[#1E2923]">연근이 키링 3종 & 키캡 2종</p>
                <p className="text-[10px] text-[#6D4A20]">마일리지를 모아 귀여운 연근이 굿즈로 바꿔가세요!</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#F4F7F5] p-3 text-[11px] text-[#6B7280] leading-relaxed space-y-1">
            <p>• <strong>한 학기 최대 3,000P</strong>까지 적립 가능합니다. (물품 등록을 계속하더라도 마일리지는 최대 3,000P까지만 보유됩니다)</p>
            <p>• 적립된 마일리지는 연세대학교 송도학사 행정실 또는 공지된 현장 거점에서 바로 교환 수령 가능합니다.</p>
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
