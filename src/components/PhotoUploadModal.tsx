import React, { useRef, useState } from 'react';
import { X, Camera, Lightbulb, Plus, Image as ImageIcon } from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: string[];
  onAddPhoto: (photoUrl: string) => void;
  onRemovePhoto: (index: number) => void;
  onConfirm: () => void;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  photos,
  onAddPhoto,
  onRemovePhoto,
  onConfirm,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  if (!isOpen) return null;

  const totalSlots = 5;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const availableSpace = totalSlots - photos.length;
      const fileList = Array.from(files) as File[];
      const filesToProcess = fileList.slice(0, availableSpace);
      
      filesToProcess.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            onAddPhoto(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset file input value so selecting the same file again triggers onChange
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleCapturedPhoto = (photoDataUrl: string) => {
    if (photos.length < totalSlots) {
      onAddPhoto(photoDataUrl);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs animate-fadeIn">
        <div className="relative flex h-full sm:h-auto sm:max-h-[92vh] w-full max-w-md flex-col justify-between overflow-hidden bg-white sm:rounded-2xl shadow-2xl">
          {/* Top Dark Teal Header */}
          <div className="flex h-14 items-center justify-between bg-[#014B43] px-4 text-white">
            <button
              id="btn-close-photo-modal"
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
              aria-label="닫기"
            >
              <X className="h-6 w-6 stroke-[2.2]" />
            </button>
            <h2 className="text-base font-bold text-white tracking-tight">
              물품 사진 등록 (최대 5장)
            </h2>
            <div className="w-10" />
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Title & Description */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#014B43] tracking-tight">
                  물품 사진 등록
                </h3>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  직접 촬영하거나 앨범에서 최대 5장까지 첨부하세요.
                </p>
              </div>
              <span className="rounded-full bg-[#EBF2EE] px-2.5 py-1 text-xs font-bold text-[#014B43]">
                {photos.length} / 5장
              </span>
            </div>

            {/* Direct Action Buttons: Camera Shoot vs Album Select */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                id="btn-direct-camera-shoot"
                type="button"
                onClick={() => {
                  if (photos.length < totalSlots) {
                    setIsCameraOpen(true);
                  }
                }}
                disabled={photos.length >= totalSlots}
                className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-[#014B43] bg-[#014B43] p-3.5 text-white shadow-md hover:bg-[#013B35] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                  <Camera className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-extrabold block">카메라로 직접 촬영</span>
                  <span className="text-[10px] text-white/80 font-medium">실시간 촬영 후 즉시 첨부</span>
                </div>
              </button>

              <button
                id="btn-direct-album-select"
                type="button"
                onClick={() => {
                  if (photos.length < totalSlots) {
                    fileInputRef.current?.click();
                  }
                }}
                disabled={photos.length >= totalSlots}
                className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-[#D0D9D4] bg-[#F9FBFA] p-3.5 text-[#1E2923] hover:border-[#014B43] hover:bg-[#EBF2EE] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-[#D0D9D4]">
                  <ImageIcon className="h-5 w-5 text-[#014B43] stroke-[2.2]" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-extrabold block text-[#014B43]">앨범에서 사진 선택</span>
                  <span className="text-[10px] text-[#6B7280] font-medium">여러 장 다중 선택 가능</span>
                </div>
              </button>
            </div>

            {/* 5 Photo Slots Grid */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#374151]">
                등록된 사진 목록 ({photos.length}/5)
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {/* 5 Photo Slots (1 to 5) */}
                {Array.from({ length: totalSlots }).map((_, slotIndex) => {
                  const photo = photos[slotIndex];
                  const isFilled = Boolean(photo);
                  const isNextSlot = slotIndex === photos.length;

                  if (isFilled) {
                    return (
                      <div
                        key={`slot-filled-${slotIndex}`}
                        className="relative aspect-square overflow-hidden rounded-xl border border-[#D0D9D4] bg-zinc-900 shadow-xs group"
                      >
                        <img
                          src={photo}
                          alt={`등록 사진 ${slotIndex + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => onRemovePhoto(slotIndex)}
                          className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-white hover:bg-red-600 transition-colors shadow-sm"
                          aria-label={`사진 ${slotIndex + 1} 삭제`}
                        >
                          <X className="h-3.5 w-3.5 stroke-[2.5]" />
                        </button>
                        <span className="absolute bottom-1 left-1 text-[10px] font-semibold text-white/90 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                          {slotIndex === 0 ? '대표' : `사진 ${slotIndex + 1}`}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`slot-empty-${slotIndex}`}
                      onClick={() => {
                        if (photos.length < totalSlots) {
                          setIsCameraOpen(true);
                        }
                      }}
                      className={`flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-1 transition-all ${
                        isNextSlot
                          ? 'border-[#014B43] bg-[#F0FDF4] hover:bg-[#DCFCE7] active:scale-95'
                          : 'border-[#D1D5DB] bg-[#F9FAFB] hover:border-[#014B43]/50'
                      }`}
                    >
                      {isNextSlot ? (
                        <>
                          <Camera className="h-5 w-5 text-[#014B43] stroke-[2.2]" />
                          <span className="mt-1 text-[11px] font-bold text-[#014B43]">
                            {slotIndex === 0 ? '대표 촬영' : `사진 ${slotIndex + 1}`}
                          </span>
                          <span className="text-[9px] text-[#014B43]/70">+ 직접 촬영</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 text-[#9CA3AF]" />
                          <span className="mt-0.5 text-[10px] font-medium text-[#9CA3AF]">
                            사진 {slotIndex + 1}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}

                {/* 6th Slot: Quick Camera / Add Action Button */}
                <button
                  id="btn-camera-upload-slot"
                  type="button"
                  onClick={() => {
                    if (photos.length < totalSlots) {
                      setIsCameraOpen(true);
                    }
                  }}
                  disabled={photos.length >= totalSlots}
                  className={`flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-[#014B43] bg-[#EBF2EE] p-2 transition-all ${
                    photos.length >= totalSlots
                      ? 'opacity-40 cursor-not-allowed border-[#D0D9D4] bg-[#F4F7F5]'
                      : 'hover:bg-[#DDEAE3] active:scale-95'
                  }`}
                >
                  <Camera className="h-6 w-6 text-[#014B43] stroke-[2.2]" />
                  <span className="mt-1 text-[11px] font-extrabold text-[#014B43]">
                    {photos.length >= totalSlots ? '5장 완료' : '촬영하기'}
                  </span>
                  <span className="text-[9px] font-semibold text-[#014B43]/80">
                    {photos.length}/5장
                  </span>
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Photo Tips Box matching Image 3 */}
            <div className="rounded-2xl border border-[#F5DACB] bg-[#F9DDCE]/50 p-4 text-xs text-[#6D4A20] space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#6D4A20]">
                <Lightbulb className="h-4 w-4 text-[#D97706]" />
                <span>사진 등록 팁</span>
              </div>
              <ul className="space-y-1 text-[11px] text-[#5C3E1B] leading-relaxed pl-1">
                <li className="flex items-start gap-1.5">
                  <span className="text-xs leading-tight">•</span>
                  <span>밝은 곳에서 흔들림 없이 찍어주세요.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-xs leading-tight">•</span>
                  <span>하자나 오염이 있다면 그 부분을 확대해서 찍어주세요.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-xs leading-tight">•</span>
                  <span>브랜드 로고나 태그가 잘 보이게 찍으면 신뢰도가 올라갑니다.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Action Button */}
          <div className="border-t border-[#E5E9E7] bg-white p-4">
            <button
              id="btn-confirm-photos"
              type="button"
              onClick={onConfirm}
              className="w-full rounded-full bg-[#014B43] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#013B35] active:scale-[0.99] transition-all text-center"
            >
              첨부 완료 ({photos.length}장)
            </button>
          </div>
        </div>
      </div>

      {/* Live Camera Viewfinder Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapturePhoto={handleCapturedPhoto}
        currentPhotoCount={photos.length}
        maxPhotoCount={totalSlots}
      />
    </>
  );
};
