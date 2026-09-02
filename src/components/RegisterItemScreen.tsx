import React, { useState } from 'react';
import { Camera, ChevronRight, Gift, ChevronDown, Plus, Sparkles, Check, Info, Lock, ShieldAlert, Image as ImageIcon } from 'lucide-react';
import { ItemRegistration, StudentUser } from '../types';
import { SONGDO_DORM_GROUPS, YONSEI_DORMS } from '../data/mockData';
import { PhotoUploadModal } from './PhotoUploadModal';
import { CameraCaptureModal } from './CameraCaptureModal';
import { LoginPromptModal } from './LoginPromptModal';

interface RegisterItemScreenProps {
  user: StudentUser;
  onSubmitRegistration: (registration: Omit<ItemRegistration, 'id' | 'createdAt'>) => void;
  onOpenMileageInfo: () => void;
  onNavigateToAuth: () => void;
}

export const RegisterItemScreen: React.FC<RegisterItemScreenProps> = ({
  user,
  onSubmitRegistration,
  onOpenMileageInfo,
  onNavigateToAuth,
}) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isDirectCameraOpen, setIsDirectCameraOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [selectedDorm, setSelectedDorm] = useState(user.dormBuilding || '송도학사 제1기숙사 A동');
  const [roomNumber, setRoomNumber] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPhoto = (url: string) => {
    if (photos.length < 5) {
      setPhotos((prev) => [...prev, url]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Guest users cannot register items - show login requirement popup
    if (user.isGuest) {
      setIsLoginPromptOpen(true);
      return;
    }

    if (photos.length === 0) {
      setErrorMsg('물품 사진을 1장 이상 첨부해주세요.');
      setIsPhotoModalOpen(true);
      return;
    }
    if (!selectedDorm) {
      setErrorMsg('기숙사 동을 선택해주세요.');
      return;
    }
    if (!roomNumber.trim()) {
      setErrorMsg('호수를 입력해주세요 (예: 301호).');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      onSubmitRegistration({
        dormBuilding: selectedDorm,
        roomNumber: roomNumber.trim(),
        description: description.trim() || '생활용품 인계 물품',
        category: '기숙사 생활용품',
        photos,
        mileageEarned: 500,
        status: 'PENDING_DROPOFF',
      });
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] bg-[#F4F7F5] pb-24 pt-3 px-4">
      <div className="mx-auto max-w-md space-y-4">
        {/* Top Peach Banner matching Image 2 */}
        <div
          id="banner-mileage-notice"
          onClick={onOpenMileageInfo}
          role="button"
          tabIndex={0}
          className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#F6D5C3] bg-[#F9DDCE] px-4 py-3.5 shadow-xs transition-all hover:bg-[#F5D2BF] active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#014B43] text-white shadow-xs">
              <Gift className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#014B43] tracking-tight">
                물품 등록 시 500P 적립 예정
              </h2>
              <p className="text-xs font-medium text-[#6D4A20]">
                자원 순환에 동참해주셔서 감사합니다.
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-[#6D4A20]/80 stroke-[2.5]" />
        </div>

        {/* Card 1: 물품 사진 첨부하기 matching Image 2 */}
        <div className="rounded-2xl border border-[#E3E8E5] bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1E2923]">
                물품 사진 첨부하기
              </h3>
              <p className="text-[11px] text-[#6B7280]">
                카메라로 직접 찍거나 앨범에서 선택할 수 있습니다.
              </p>
            </div>
            <span className="text-xs text-[#014B43] font-bold bg-[#EAF2EE] px-2.5 py-1 rounded-full">
              {photos.length}/5장 등록됨
            </span>
          </div>

          {/* Quick Action Buttons: Live Camera vs Album/Manage */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              id="btn-main-direct-shoot"
              type="button"
              onClick={() => {
                if (photos.length < 5) {
                  setIsDirectCameraOpen(true);
                } else {
                  setIsPhotoModalOpen(true);
                }
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#014B43] py-2.5 px-3 text-xs font-bold text-white shadow-xs hover:bg-[#013B35] active:scale-98 transition-all"
            >
              <Camera className="h-4 w-4" />
              <span>카메라로 직접 촬영</span>
            </button>
            <button
              id="btn-main-photo-manage"
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#D0D9D4] bg-[#F9FBFA] py-2.5 px-3 text-xs font-bold text-[#014B43] hover:bg-[#EBF2EE] active:scale-98 transition-all"
            >
              <ImageIcon className="h-4 w-4" />
              <span>사진 관리 및 선택</span>
            </button>
          </div>

          {/* Photo Preview Slots */}
          <div className="flex items-center gap-3 overflow-x-auto py-1 no-scrollbar">
            {/* Camera Upload Trigger Box */}
            <button
              id="btn-trigger-photo-modal"
              type="button"
              onClick={() => setIsDirectCameraOpen(true)}
              className="flex h-24 w-24 flex-shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#014B43]/60 bg-[#F0FDF4] text-[#014B43] hover:border-[#014B43] hover:bg-[#DCFCE7] active:scale-95 transition-all"
            >
              <Camera className="h-6 w-6 stroke-[2.2]" />
              <span className="mt-1 text-xs font-bold">직접 촬영</span>
              <span className="text-[10px] text-[#014B43]/80">{photos.length}/5장</span>
            </button>

            {/* Uploaded Photos */}
            {photos.map((photo, index) => (
              <div
                key={index}
                onClick={() => setIsPhotoModalOpen(true)}
                className="relative h-24 w-24 flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-[#D5DDD8] shadow-xs group"
              >
                <img
                  src={photo}
                  alt={`등록 물품 사진 ${index + 1}`}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                {index === 0 && (
                  <span className="absolute top-1.5 left-1.5 rounded-md bg-[#014B43] px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                    대표
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: 인계 장소 matching Image 2 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl border border-[#E3E8E5] bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#1E2923]">
              인계 장소
            </h3>

            {/* Dorm Building Select */}
            <div className="space-y-1.5">
              <label
                htmlFor="select-dorm-building"
                className="text-xs font-semibold text-[#4B5563]"
              >
                기숙사 동 선택
              </label>
              <div className="relative">
                <select
                  id="select-dorm-building"
                  value={selectedDorm}
                  onChange={(e) => setSelectedDorm(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#D0D9D4] bg-[#F9FBFA] py-3 pl-3.5 pr-10 text-sm font-medium text-[#1E2923] focus:border-[#014B43] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#014B43]"
                >
                  <option value="" disabled>기숙사 동을 선택해주세요</option>
                  {SONGDO_DORM_GROUPS.map((group) => (
                    <optgroup key={group.groupName} label={group.groupName}>
                      {group.buildings.map((dorm) => (
                        <option key={dorm.id} value={dorm.name}>
                          {dorm.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#014B43]">
                  <ChevronDown className="h-5 w-5 stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Room Number Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="input-room-number"
                className="text-xs font-semibold text-[#4B5563]"
              >
                호수
              </label>
              <input
                id="input-room-number"
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="예: 301호"
                className="w-full rounded-xl border border-[#D0D9D4] bg-[#F9FBFA] py-3 px-3.5 text-sm font-medium text-[#4B5563] placeholder:text-[#9CA3AF] focus:border-[#014B43] focus:bg-white focus:text-[#1E2923] focus:outline-none focus:ring-1 focus:ring-[#014B43]"
              />
            </div>

            {/* Description (Optional) */}
            <div className="space-y-1.5">
              <label
                htmlFor="textarea-item-description"
                className="text-xs font-semibold text-[#4B5563]"
              >
                상세 설명 (선택)
              </label>
              <textarea
                id="textarea-item-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="예: 깨끗하게 세탁/소독 완료했습니다. 후배님 편하게 사용하세요! (선택)"
                className="w-full resize-none rounded-xl border border-[#D0D9D4] bg-[#F9FBFA] py-2.5 px-3.5 text-sm text-[#4B5563] placeholder:text-[#9CA3AF] focus:border-[#014B43] focus:bg-white focus:text-[#1E2923] focus:outline-none focus:ring-1 focus:ring-[#014B43]"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-red-50 p-3 text-center text-xs font-medium text-red-600">
              {errorMsg}
            </div>
          )}

          {/* Guest User Notification Banner */}
          {user.isGuest && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#FDE68A] bg-[#FEF3C7] p-3.5 text-xs text-[#92400E]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 flex-shrink-0 text-[#B45309]" />
                <span className="leading-snug">
                  현재 <strong>비회원(게스트)</strong> 모드입니다. 물품을 등록하려면 연세대 학우 로그인이 필요합니다.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsLoginPromptOpen(true)}
                className="flex-shrink-0 rounded-lg bg-[#92400E] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#78350F] transition-colors"
              >
                로그인
              </button>
            </div>
          )}

          {/* Submit Button matching Image 2 */}
          <div className="pt-1">
            <button
              id="btn-submit-item-register"
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-full py-4 text-base font-bold shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 ${
                user.isGuest
                  ? 'bg-[#014B43] text-white hover:bg-[#013B35]'
                  : 'bg-[#014B43] text-white hover:bg-[#013B35]'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  물품 등록 중...
                </span>
              ) : user.isGuest ? (
                <span className="flex items-center gap-1.5">
                  <Lock className="h-4 w-4 stroke-[2.5]" />
                  <span>물품 등록하기 (학우 로그인 필요)</span>
                </span>
              ) : (
                '물품 등록하기'
              )}
            </button>
          </div>
        </form>

        {/* Drop-off Guide Reminder */}
        <div className="rounded-xl bg-[#EAF2EE] p-3 text-xs text-[#014B43] flex items-start gap-2">
          <Info className="h-4 w-4 text-[#014B43] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-[#014B43]/90">
            등록 후 <span className="font-bold">기숙사 1층 무인 택배함 옆 '연근 수거함'</span>에 물품을 두시면 비대면 인계가 완료됩니다.
          </p>
        </div>
      </div>

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        photos={photos}
        onAddPhoto={handleAddPhoto}
        onRemovePhoto={handleRemovePhoto}
        onConfirm={() => setIsPhotoModalOpen(false)}
      />

      {/* Direct Live Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isDirectCameraOpen}
        onClose={() => setIsDirectCameraOpen(false)}
        onCapturePhoto={handleAddPhoto}
        currentPhotoCount={photos.length}
        maxPhotoCount={5}
      />

      {/* Login Required Prompt Modal for Guests */}
      <LoginPromptModal
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
        onGoToLogin={onNavigateToAuth}
        title="연세 학우 로그인이 필요합니다"
        description="물품 인계 등록 및 500P 마일리지 적립은 연세대학교 학우 인증(웹메일 로그인) 후 이용하실 수 있습니다."
      />
    </div>
  );
};
