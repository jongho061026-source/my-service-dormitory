import React from 'react';
import { LogIn, ShieldAlert, X, ArrowRight, Sparkles } from 'lucide-react';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToLogin: () => void;
  title?: string;
  description?: string;
}

export const LoginPromptModal: React.FC<LoginPromptModalProps> = ({
  isOpen,
  onClose,
  onGoToLogin,
  title = '연세 학우 로그인이 필요합니다',
  description = '물품 인계 등록 및 500P 마일리지 적립은 연세대학교 웹메일 인증(로그인) 후 이용하실 수 있습니다.',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-5 animate-scaleUp">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F7F5] text-[#6B7280] hover:bg-[#E5EAE7] hover:text-[#1E2923] transition-colors"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon & Title */}
        <div className="text-center space-y-2 pt-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EBF2EE] text-[#014B43] shadow-xs">
            <ShieldAlert className="h-7 w-7 stroke-[2.2]" />
          </div>
          <h3 className="text-lg font-black text-[#1E2923] tracking-tight">
            {title}
          </h3>
          <p className="text-xs leading-relaxed text-[#6B7280] px-2">
            {description}
          </p>
        </div>

        {/* Benefit Highlight Card */}
        <div className="rounded-2xl border border-[#DCE6E1] bg-[#F7FAF8] p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#014B43]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>학생 인증 시 제공되는 혜택</span>
          </div>
          <ul className="text-[11px] text-[#4B5563] space-y-1 pl-1">
            <li className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#014B43]" />
              기숙사 물품 무인 인계 등록 가능
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#014B43]" />
              인계 시 1건당 <strong className="text-[#014B43]">500P 마일리지</strong> 즉시 적립
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#014B43]" />
              교내 친환경 텀블러/카페 할인권 무료 교환
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            id="btn-modal-go-login"
            type="button"
            onClick={() => {
              onClose();
              onGoToLogin();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[#014B43] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#013B35] active:scale-[0.99] transition-all"
          >
            <LogIn className="h-4 w-4" />
            <span>연세 학우 로그인하기</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full border border-[#E5E9E7] bg-white py-2.5 text-xs font-semibold text-[#6B7280] hover:bg-[#F9FBFA] transition-colors"
          >
            둘러보기 계속하기
          </button>
        </div>
      </div>
    </div>
  );
};
