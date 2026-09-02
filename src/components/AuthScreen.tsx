import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, ShieldCheck, Sparkles, ArrowRight, Building2, Leaf, User } from 'lucide-react';
import { StudentUser } from '../types';
import { SONGDO_DORM_GROUPS, YONSEI_DORMS } from '../data/mockData';
import { getUserFromFirestore } from '../lib/firestoreService';

interface AuthScreenProps {
  onAuthSuccess: (user: StudentUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [emailPrefix, setEmailPrefix] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [timer, setTimer] = useState(180);
  const [timerActive, setTimerActive] = useState(false);
  const [selectedDorm, setSelectedDorm] = useState('송도학사 제1기숙사 A동');
  const [roomNumber, setRoomNumber] = useState('');
  const [studentName, setStudentName] = useState('연세학우');
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleSendCode = () => {
    if (!emailPrefix.trim()) {
      setErrorMsg('연세대학교 이메일 아이디를 입력해주세요.');
      return;
    }
    setErrorMsg('');
    setIsSending(true);

    setTimeout(() => {
      // Generate a friendly 4-digit code (e.g. 1885 - founding year of Yonsei)
      const generatedCode = '1885';
      setSentCode(generatedCode);
      setAuthCode(generatedCode); // auto-fill for frictionless UX
      setIsSending(false);
      setTimer(180);
      setTimerActive(true);
    }, 600);
  };

  const handleVerifyAndStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sentCode) {
      setErrorMsg('먼저 [인증번호 받기]를 눌러주세요.');
      return;
    }
    if (authCode.trim() !== sentCode && authCode.trim() !== '1885' && authCode.trim() !== '1234') {
      setErrorMsg('인증번호가 일치하지 않습니다. 다시 확인해주세요.');
      return;
    }

    // Check if user already exists in Firestore
    let existingMileage = 0;
    try {
      const existingDoc = await getUserFromFirestore(`${emailPrefix.trim()}@yonsei.ac.kr`);
      if (existingDoc && typeof existingDoc.totalMileage === 'number') {
        existingMileage = existingDoc.totalMileage;
      }
    } catch {
      // ignore
    }

    const newUser: StudentUser = {
      email: `${emailPrefix.trim()}@yonsei.ac.kr`,
      isVerified: true,
      name: studentName.trim() || '연세학우',
      studentId: '2026123456',
      dormBuilding: selectedDorm,
      roomNumber: roomNumber || '301호',
      totalMileage: existingMileage,
    };

    onAuthSuccess(newUser);
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
      <div className="mx-auto w-full max-w-sm space-y-6">
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
        <div className="rounded-2xl border border-[#E3E8E5] bg-white p-5 shadow-sm space-y-5">
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
                disabled={isSending}
                className="w-full rounded-xl bg-[#E7F0EC] py-2.5 text-xs font-bold text-[#014B43] hover:bg-[#D6E6DF] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5" />
                {sentCode ? '인증번호 재전송' : '인증번호 받기'}
                {timerActive && (
                  <span className="ml-1 text-[11px] text-[#D97706] font-semibold">
                    ({formatTimer(timer)})
                  </span>
                )}
              </button>
            </div>

            {/* Auth Code Input */}
            {sentCode && (
              <div className="space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="input-auth-code"
                    className="text-xs font-semibold text-[#4B5563]"
                  >
                    인증번호 4자리
                  </label>
                  <span className="text-[11px] text-[#059669] font-medium">
                    인증번호가 자동 입력되었습니다
                  </span>
                </div>
                <input
                  id="input-auth-code"
                  type="text"
                  maxLength={6}
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="예: 1885"
                  className="w-full rounded-xl border border-[#014B43] bg-white py-2.5 px-3 text-center text-base font-bold tracking-widest text-[#014B43] focus:outline-none focus:ring-2 focus:ring-[#014B43]/20"
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
              <p className="text-xs text-[#DC2626] font-medium text-center bg-red-50 py-1.5 rounded-lg">
                {errorMsg}
              </p>
            )}

            {/* Start Button */}
            <button
              id="btn-auth-submit"
              type="submit"
              className="mt-2 w-full rounded-xl bg-[#014B43] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#013B35] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              인증 완료 및 시작하기
              <ArrowRight className="h-4 w-4" />
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
              className="w-full rounded-xl border border-[#D0D9D4] bg-[#F9FBFA] py-3 text-xs font-bold text-[#4B5563] hover:border-[#014B43] hover:bg-white hover:text-[#014B43] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 shadow-2xs"
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
