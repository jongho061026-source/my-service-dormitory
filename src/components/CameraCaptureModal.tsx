import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, Sparkles, SwitchCamera, Image as ImageIcon } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapturePhoto: (photoDataUrl: string) => void;
  currentPhotoCount: number;
  maxPhotoCount: number;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapturePhoto,
  currentPhotoCount,
  maxPhotoCount,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [flashAnimation, setFlashAnimation] = useState(false);

  // Start Camera Stream
  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    setIsInitializing(true);
    setCameraError(null);

    // Stop existing stream if running
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('이 브라우저/환경에서는 카메라 API를 직접 지원하지 않습니다.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access failed:', err);
      setCameraError(
        '카메라 장치에 직접 접근할 수 없거나 권한이 필요합니다. 아래 [기기 카메라 실행] 버튼을 눌러 촬영해주세요.'
      );
    } finally {
      setIsInitializing(false);
    }
  }, [stream]);

  // Handle open/close lifecycle
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      startCamera(facingMode);
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  // Switch between front / back camera
  const handleToggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Capture snapshot from video feed
  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Flash effect
    setFlashAnimation(true);
    setTimeout(() => setFlashAnimation(false), 200);

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // If user facing mode, flip horizontally for natural mirror look
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedImage(dataUrl);
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
  };

  // Confirm and use captured photo
  const handleUsePhoto = () => {
    if (capturedImage) {
      onCapturePhoto(capturedImage);
      setCapturedImage(null);
      
      // If reached max count, close modal; otherwise stay in camera for next photo
      if (currentPhotoCount + 1 >= maxPhotoCount) {
        onClose();
      }
    }
  };

  // Native mobile camera input fallback handler
  const handleNativeCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onCapturePhoto(event.target.result as string);
          if (currentPhotoCount + 1 >= maxPhotoCount) {
            onClose();
          } else {
            setCapturedImage(null);
          }
        }
      };
      reader.readAsDataURL(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-0 sm:p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative flex h-full w-full max-w-md flex-col justify-between overflow-hidden bg-zinc-950 sm:h-[88vh] sm:rounded-3xl shadow-2xl text-white">
        
        {/* Top Header */}
        <div className="flex h-14 items-center justify-between px-4 z-10 bg-zinc-950/80 backdrop-blur-sm border-b border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all"
            aria-label="카메라 닫기"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <h3 className="text-sm font-bold tracking-tight">물품 사진 직접 촬영</h3>
            <span className="text-[11px] font-semibold text-[#6EE7B7]">
              등록 현황: {currentPhotoCount} / {maxPhotoCount}장
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleFacingMode}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all"
            aria-label="카메라 전환"
            title="전면/후면 카메라 전환"
          >
            <SwitchCamera className="h-5 w-5" />
          </button>
        </div>

        {/* Viewfinder / Video Canvas Area */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black">
          {/* Flash animation */}
          {flashAnimation && (
            <div className="absolute inset-0 z-30 bg-white animate-fadeOut pointer-events-none" />
          )}

          {/* Captured Preview vs Live Feed */}
          {capturedImage ? (
            <div className="relative h-full w-full flex items-center justify-center bg-black">
              <img
                src={capturedImage}
                alt="촬영된 사진 미리보기"
                className="max-h-full max-w-full object-contain"
              />
              <div className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 border border-white/20">
                <Sparkles className="h-3.5 w-3.5 text-[#6EE7B7]" />
                <span>촬영 완료 (미리보기)</span>
              </div>
            </div>
          ) : cameraError ? (
            /* Error & Native Camera Fallback UI */
            <div className="p-6 text-center space-y-4 max-w-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertCircle className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">카메라 실행 안내</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {cameraError}
                </p>
              </div>
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#014B43] py-3 text-xs font-bold text-white shadow-lg hover:bg-[#013B35] transition-all"
              >
                <Camera className="h-4 w-4" />
                <span>기기 카메라로 바로 촬영하기</span>
              </button>
            </div>
          ) : (
            /* Live Video Feed */
            <div className="relative h-full w-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Viewfinder Target Reticle / Guide Overlay */}
              <div className="absolute inset-8 pointer-events-none flex flex-col justify-between border border-white/25 rounded-2xl">
                <div className="flex justify-between p-2">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-[#6EE7B7]" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-[#6EE7B7]" />
                </div>
                <div className="text-center">
                  <span className="rounded-full bg-black/40 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-xs border border-white/10">
                    물품이 화면 중앙에 오도록 맞춰주세요
                  </span>
                </div>
                <div className="flex justify-between p-2">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-[#6EE7B7]" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-[#6EE7B7]" />
                </div>
              </div>

              {isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <RefreshCw className="h-4 w-4 animate-spin text-[#6EE7B7]" />
                    카메라 준비 중...
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hidden Canvas & Native Camera Input */}
          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={nativeCameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleNativeCameraChange}
          />
        </div>

        {/* Bottom Shutter & Action Controls */}
        <div className="p-5 bg-zinc-950/95 border-t border-white/10">
          {capturedImage ? (
            /* Confirm or Retake Bar */
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-zinc-800 py-3.5 text-xs font-bold text-zinc-200 hover:bg-zinc-700 active:scale-98 transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                <span>다시 촬영</span>
              </button>
              <button
                type="button"
                onClick={handleUsePhoto}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-[#014B43] py-3.5 text-xs font-bold text-white hover:bg-[#013B35] shadow-lg active:scale-98 transition-all"
              >
                <Check className="h-4 w-4 stroke-[2.5]" />
                <span>이 사진 추가하기</span>
              </button>
            </div>
          ) : (
            /* Live Camera Shutter Controls */
            <div className="flex items-center justify-around">
              {/* Native Camera Direct Button */}
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                title="기기 기본 카메라 실행"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-medium">기기 카메라</span>
              </button>

              {/* Big Circular Shutter Button */}
              <button
                id="btn-camera-shutter"
                type="button"
                onClick={handleTakeSnapshot}
                disabled={isInitializing || Boolean(cameraError)}
                className="group relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/90 bg-white/20 p-1.5 shadow-2xl active:scale-90 transition-all disabled:opacity-40"
                aria-label="사진 촬영"
              >
                <div className="h-full w-full rounded-full bg-white group-hover:scale-95 group-active:scale-90 transition-all flex items-center justify-center">
                  <Camera className="h-6 w-6 text-[#014B43] stroke-[2.5]" />
                </div>
              </button>

              {/* Switch Facing Mode Button */}
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                title="카메라 전/후면 전환"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                  <SwitchCamera className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-medium">전환</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
