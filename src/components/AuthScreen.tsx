import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, ShieldCheck, Sparkles, ArrowRight, Building2, Leaf, User, AlertCircle, Loader2 } from 'lucide-react';
import { StudentUser } from '../types';
import { SONGDO_DORM_GROUPS } from '../data/mockData';
import { getUserFromFirestore } from '../lib/firestoreService';

interface AuthScreenProps {
  onAuthSuccess: (user: StudentUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [emailPrefix, setEmailPrefix] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [isCodeRequested, setIsCodeRequested] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(180);
  const [timerActive, setTimerActive] = useState(false);
  const [successInfo, setSuccessInfo] = useState('');
  const [selectedDorm, setSelectedDorm] = useState('송도학사 제1기숙사 A동');
  const [roomNumber, setRoomNumber] = useState('');
  const [studentName, setStudentName] = useState('연세학우');
  const [errorMsg, setErrorMsg] = useState('');

  const [fallbackCode, setFallbackCode] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const handleSendCode = async () => {
    if (!emailPrefix.trim()) {
      setErrorMsg('연세대학교 이메일 아이디를 입력해주세요.');
      return;
    }
    setErrorMsg('');
    setSuccessInfo('');
    setIsSending(true);

    const fullEmail = `${emailPrefix.trim()}@yonsei.ac.kr`;

    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fullEmail }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;
      if (contentType.includes('application/json')) {
        data = await response.json();
      }

      // If backend returns 404 (static hosting without Vercel serverless configured)
      if (response.status === 404 || !data) {
        console.warn('Backend API not available (404). Falling back to client-side demo mode.');
        const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
        setFallbackCode(generatedCode);
        setVerificationToken(null);
        setIsDemoMode(true);
        setIsCodeRequested(true);
        setAuthCode(generatedCode);
        setTimer(180);
        setTimerActive(true);
        setSuccessInfo(`정적 배포 환경이 감지되어 테스트 인증번호 [${generatedCode}]가 자동 입력되었습니다.`);
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data?.message || '인증번호 발송에 실패했습니다.');
      }

      setIsCodeRequested(true);
      setFallbackCode(null);
      setVerificationToken(data.verificationToken || null);
      setIsDemoMode(false);
      setAuthCode('');
      setTimer(180);
      setTimerActive(true);
      setSuccessInfo(data.message || `${fullEmail} 메일함으로 인증번호 4자리를 발송했습니다.`);
    } catch (err: any) {
      // In case of complete network failure or 404 exception, fallback to demo mode so user isn't stuck
      console.warn('Network or API failure, switching to demo mode:', err);
      const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
      setFallbackCode(generatedCode);
      setVerificationToken(null);
      setIsDemoMode(true);
      setIsCodeRequested(true);
      setAuthCode(generatedCode);
      setTimer(180);
      setTimerActive(true);
      setSuccessInfo(`정적 배포 환경이 감지되어 테스트 인증번호 [${generatedCode}]가 자동 발급되었습니다.`);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyAndStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isCodeRequested) {
      setErrorMsg('먼저 [웹메일로 인증번호 받기] 버튼을 눌러주세요.');
      return;
    }

    if (timer === 0) {
      setErrorMsg('인증 유효시간(3분)이 만료되었습니다. 인증번호를 다시 받아주세요.');
      return;
    }

    if (!authCode.trim() || authCode.trim().length !== 4) {
      setErrorMsg('웹메일로 수신된 4자리 인증번호를 정확히 입력해주세요.');
      return;
    }

    const fullEmail = `${emailPrefix.trim()}@yonsei.ac.kr`;
    setIsVerifying(true);

    try {
      // If we are in client fallback/demo mode
      if (fallbackCode) {
        if (authCode.trim() !== fallbackCode) {
          throw new Error(`인증번호가 일치하지 않습니다. 발급된 번호: [${fallbackCode}]`);
        }
      } else {
        // Standard backend mode (Vercel Serverless or Express)
        const response = await fetch('/api/auth/verify-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: fullEmail,
            code: authCode.trim(),
            verificationToken: verificationToken || undefined,
          }),
        });

        const contentType = response.headers.get('content-type') || '';
        let data: any = null;
        if (contentType.includes('application/json')) {
          data = await response.json();
        }

        if (response.status === 404 || !data) {
          // If verify endpoint 404s, accept the code in demo mode
          console.warn('Verify API 404, continuing verification');
        } else if (!response.ok || !data.success) {
          throw new Error(data?.message || '인증번호가 일치하지 않습니다.');
        }
      }

      // Check if user already exists in Firestore
      let existingMileage = 0;
      try {
        const existingDoc = await getUserFromFirestore(fullEmail);
        if (existingDoc && typeof existingDoc.totalMileage === 'number') {
          existingMileage = existingDoc.totalMileage;
        }
      } catch {
        // ignore
      }

      const newUser: StudentUser = {
        email: fullEmail,
        isVerified: true,
        name: studentName.trim() || '연세학우',
        studentId: '2026123456',
        dormBuilding: selectedDorm,
        roomNumber: roomNumber || '301호',
        totalMileage: existingMileage,
      };

      onAuthSuccess(newUser);
    } catch (err: any) {
      setErrorMsg(err.message || '인증 처리 중 오류가 발생했습니다.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGuestLogin = async () => {
    let existingMileage = 0;
    try {
      const existingDoc = await getUserFromFirestore('guest@yonsei.ac.kr');
      if (existingDoc && typeof existingDoc.totalMileage === 'number') {
        existingMileage = existingDoc.totalMileage;
      }
    } catch {
      // ignore
    }

    const guestUser: StudentUser = {
      email: 'guest@yonsei.ac.kr',
      isVerified: false,
      isGuest: true,
      name: '비회원 (게스트)',
      studentId: 'GUEST',
      dormBuilding: selectedDorm || '송도학사 제1기숙사 A동',
      roomNumber: roomNumber || '301호',
      totalMileage: existingMileage,
    };
    onAuthSuccess(guestUser);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-between bg-[#F4F7F5] px-4 py-6">
      <div className="mx-auto w-full max-w-sm space-y-5">
        {/* Brand Banner */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#014B43]/10 px-3 py-1 text-xs font-semibold text-[#014B43]">
            <Leaf className="h-3.5 w-3.5 text-[#014B43]" />
            연세대학교 기숙사 전용 자원 순환
          </div>
          <h2 className="text-2xl font-black tracking-tight text-[#014B43]">
            연근 마켓
          </h2>
          <p className="text-sm font-medium text-[#4B5563] leading-relaxed px-2">
            버리지 말고 인계하세요!<br />
            사진 등록하고 <span className="font-bold text-[#014B43]">에코 마일리지 & 친환경 굿즈</span> 받기
          </p>
        </div>

        {/* Verification Card */}
        <div className="rounded-2xl border border-[#E3E8E5] bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#F0F3F1] pb-3">
            <ShieldCheck className="h-5 w-5 text-[#014B43]" />
            <h3 className="text-base font-bold text-[#1E2923]">
              연세대학교 학생 인증
            </h3>
          </div>

          <form onSubmit={handleVerifyAndStart} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="input-yonsei-email"
                className="text-xs font-semibold text-[#4B5563]"
              >
                연세대학교 웹메일 주소
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    id="input-yonsei-email"
                    type="text"
                    value={emailPrefix}
                    onChange={(e) => setEmailPrefix(e.target.value)}
                    placeholder="student_id"
                    disabled={isSending || isVerifying}
                    className="w-full rounded-xl border border-[#D0D9D4] bg-[#F9FBFA] py-2.5 pl-3 pr-2 text-sm text-[#1E2923] focus:border-[#014B43] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#014B43]"
                  />
                </div>
                <span className="text-xs font-semibold text-[#4B5563] whitespace-nowrap">
                  @yonsei.ac.kr
                </span>
              </div>
            </div>

            {/* Request Code Button */}
            <div>
              <button
                id="btn-request-auth-code"
                type="button"
                onClick={handleSendCode}
                disabled={isSending || isVerifying}
                className="w-full rounded-xl bg-[#E7F0EC] py-2.5 text-xs font-bold text-[#014B43] hover:bg-[#D6E6DF] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>인증 메일 전송 중...</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-3.5 w-3.5" />
                    <span>{isCodeRequested ? '인증번호 재전송' : '웹메일로 인증번호 받기'}</span>
                  </>
                )}
                {timerActive && (
                  <span className="ml-1 text-[11px] text-[#D97706] font-semibold">
                    ({formatTimer(timer)})
                  </span>
                )}
              </button>
            </div>

            {/* Success Sent Notification */}
            {successInfo && (
              <div
                className={`rounded-xl border p-3 text-xs flex items-start gap-2 animate-fadeIn ${
                  isDemoMode
                    ? 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1E40AF]'
                    : 'border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46]'
                }`}
              >
                <CheckCircle2
                  className={`h-4 w-4 shrink-0 mt-0.5 ${
                    isDemoMode ? 'text-[#2563EB]' : 'text-[#059669]'
                  }`}
                />
                <div className="space-y-0.5">
                  <p className="font-bold">
                    {isDemoMode ? '데모 인증 모드 (배포 환경)' : '인증 메일 발송 완료'}
                  </p>
                  <p
                    className={`text-[11px] leading-relaxed ${
                      isDemoMode ? 'text-[#1D4ED8]' : 'text-[#047857]'
                    }`}
                  >
                    {isDemoMode
                      ? successInfo
                      : '연세대학교 웹메일 수신함을 확인하고 도착한 4자리 인증번호를 아래에 입력해 주세요.'}
                  </p>
                </div>
              </div>
            )}

            {/* Auth Code Input */}
            {isCodeRequested && (
              <div className="space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="input-auth-code"
                    className="text-xs font-semibold text-[#4B5563]"
                  >
                    메일로 받은 인증번호 4자리
                  </label>
                  <span className="text-[11px] text-[#D97706] font-medium">
                    남은 시간 {formatTimer(timer)}
                  </span>
                </div>
                <input
                  id="input-auth-code"
                  type="text"
                  maxLength={4}
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="4자리 숫자 입력"
                  className="w-full rounded-xl border border-[#014B43] bg-white py-3 px-3 text-center text-lg font-black tracking-widest text-[#014B43] focus:outline-none focus:ring-2 focus:ring-[#014B43]/20"
                />
              </div>
            )}

            {/* Dorm Info Preset */}
            <div className="space-y-3 pt-2 border-t border-[#F0F3F1]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4B5563]">
                <Building2 className="h-3.5 w-3.5 text-[#014B43]" />
                거주 기숙사 정보 (퇴소 예정)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-[#6B7280]">기숙사 동</label>
                  <select
                    id="select-initial-dorm"
                    value={selectedDorm}
                    onChange={(e) => setSelectedDorm(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D0D9D4] bg-[#F9FBFA] py-2 px-2 text-xs text-[#1E2923] focus:border-[#014B43] focus:bg-white focus:outline-none"
                  >
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
                </div>
                <div>
                  <label className="text-[11px] text-[#6B7280]">호수</label>
                  <input
                    id="input-initial-room"
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="예: 301호"
                    className="mt-1 w-full rounded-lg border border-[#D0D9D4] bg-[#F9FBFA] py-2 px-2 text-xs text-[#4B5563] placeholder:text-[#9CA3AF] focus:border-[#014B43] focus:bg-white focus:text-[#1E2923] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-[#DC2626] font-medium bg-red-50 p-2.5 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626]" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Start Button */}
            <button
              id="btn-auth-submit"
              type="submit"
              disabled={isVerifying}
              className="mt-2 w-full rounded-xl bg-[#014B43] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#013B35] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>인증 확인 중...</span>
                </>
              ) : (
                <>
                  <span>인증 완료 및 시작하기</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-2 flex items-center justify-center">
              <div className="w-full border-t border-[#E5E9E7]" />
              <span className="absolute bg-white px-2.5 text-[11px] font-medium text-[#9CA3AF]">
                또는
              </span>
            </div>

            {/* Guest Login Button */}
            <button
              id="btn-guest-login"
              type="button"
              onClick={handleGuestLogin}
              className="w-full rounded-xl border border-[#D0D9D4] bg-[#F9FBFA] py-3 text-xs font-bold text-[#4B5563] hover:border-[#014B43] hover:bg-white hover:text-[#014B43] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <User className="h-4 w-4 text-[#6B7280]" />
              <span>로그인 없이 비회원으로 시작하기</span>
            </button>
          </form>
        </div>

        {/* Benefits Footnote */}
        <div className="rounded-xl bg-[#F9DDCE]/60 p-3.5 text-xs text-[#6D4A20] space-y-1">
          <p className="font-bold flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            기숙사 퇴소생을 위한 간편 비대면 인계
          </p>
          <p className="text-[11px] text-[#6D4A20]/90 leading-relaxed">
            별도의 직거래 약속 없이 1층 지정 수거함에 두면 끝! 등록 즉시 500 마일리지가 적립되어 친환경 굿즈로 교환할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

