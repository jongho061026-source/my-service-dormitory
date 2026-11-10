import React from 'react';
import { AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';

interface MaxMileageAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  currentMileage?: number;
  confirmText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

export const MaxMileageAlertModal: React.FC<MaxMileageAlertModalProps> = ({
  isOpen,
  onClose,
  title = '학기 최대 마일리지(3,000P) 한도 도달 안내',
  message = '이번 학기 최대 적립 한도인 3,000P를 이미 모두 달성하여 더 이상 추가 마일리지가 적립되지 않습니다 (0P 적립).',
  currentMileage = 3000,
  confirmText = '확인',
  onConfirm,
  showCancel = false,
}) => {
  if (!isOpen) return null;

  const handleAction = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4 animate-scaleUp">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F7F5] text-[#6B7280] hover:bg-[#E5EAE7] hover:text-[#1E2923] transition-colors"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Warning Icon & Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FEF3C7] text-[#D97706] ring-4 ring-[#FEF3C7]/60 shadow-xs">
            <AlertTriangle className="h-7 w-7 stroke-[2.3]" />
          </div>
          <h3 className="text-base font-black text-[#1E2923] tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-[#6B7280] leading-relaxed px-1">
            {message}
          </p>
        </div>

        {/* Status Box */}
        <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#92400E] font-bold">
            <span>이번 학기 적립 현황</span>
            <span className="rounded-full bg-[#F59E0B] px-2 py-0.5 text-[10px] text-white">
              한도 100% 도달
            </span>
          </div>
          <div className="flex items-center justify-between text-[#78350F]">
            <span className="text-[11px]">현재 보유 마일리지</span>
            <span className="font-extrabold text-sm">{currentMileage.toLocaleString()}P / 3,000P</span>
          </div>
          <div className="border-t border-[#FDE68A]/80 pt-2 text-[11px] text-[#92400E] leading-relaxed">
            💡 마일리지는 추가 지급되지 않지만 물품 나눔 등록은 정상 진행되어 기숙사 학우들에게 소중하게 전달됩니다.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {showCancel && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-[#D1DCD6] py-3 text-xs font-bold text-[#4B5563] hover:bg-[#F4F7F5] transition-colors"
            >
              취소
            </button>
          )}
          <button
            type="button"
            onClick={handleAction}
            className="flex-1 rounded-full bg-[#D97706] py-3 text-xs font-bold text-white shadow-md hover:bg-[#B45309] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="h-4 w-4 stroke-[2.5]" />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
