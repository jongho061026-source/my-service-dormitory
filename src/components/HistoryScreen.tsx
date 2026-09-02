import React, { useState } from 'react';
import { ReceiptText, Gift, Leaf, MapPin, Calendar, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { ItemRegistration, RewardRedemption, StudentUser } from '../types';

interface HistoryScreenProps {
  user: StudentUser;
  registrations: ItemRegistration[];
  redemptions: RewardRedemption[];
  onNavigateToRegister: () => void;
  onNavigateToMileage: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  user,
  registrations,
  redemptions,
  onNavigateToRegister,
  onNavigateToMileage,
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'rewards'>('items');

  return (
    <div className="min-h-[calc(100vh-7rem)] bg-[#F4F7F5] pb-28 pt-4 px-4">
      <div className="mx-auto max-w-md space-y-4">
        {/* Screen Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#1E2923]">나의 이용 내역</h2>
          <span className="text-xs font-semibold text-[#014B43] bg-[#E7F0EC] px-2.5 py-1 rounded-full">
            총 {registrations.length}건 인계 / {redemptions.length}건 교환
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-[#E5EBE8] p-1 text-xs font-bold text-[#4B5563]">
          <button
            type="button"
            onClick={() => setActiveTab('items')}
            className={`flex-1 rounded-xl py-2.5 transition-all ${
              activeTab === 'items'
                ? 'bg-white text-[#014B43] shadow-xs'
                : 'hover:text-[#014B43]'
            }`}
          >
            물품 인계 등록 ({registrations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 rounded-xl py-2.5 transition-all ${
              activeTab === 'rewards'
                ? 'bg-white text-[#014B43] shadow-xs'
                : 'hover:text-[#014B43]'
            }`}
          >
            리워드 교환 내역 ({redemptions.length})
          </button>
        </div>

        {/* Tab Content: Item Registrations */}
        {activeTab === 'items' && (
          <div className="space-y-3">
            {registrations.length === 0 ? (
              <div className="rounded-3xl border border-[#E3E8E5] bg-white p-8 text-center space-y-3">
                <Leaf className="mx-auto h-10 w-10 text-[#A7BDB3]" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#1E2923]">
                    아직 등록된 물품이 없습니다.
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    기숙사 퇴소 시 생활용품을 등록하고 500P를 적립받아보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="rounded-full bg-[#014B43] px-5 py-2 text-xs font-bold text-white shadow-xs"
                >
                  물품 등록하러 가기
                </button>
              </div>
            ) : (
              registrations.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#E3E8E5] bg-white p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {item.photos[0] ? (
                        <img
                          src={item.photos[0]}
                          alt={item.description}
                          className="h-16 w-16 rounded-xl object-cover border border-[#E5E9E7]"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                          사진 없음
                        </div>
                      )}
                      <div className="space-y-1">
                        <span className="inline-block rounded-md bg-[#F4F7F5] px-2 py-0.5 text-[10px] font-semibold text-[#014B43]">
                          {item.dormBuilding} {item.roomNumber}
                        </span>
                        <h4 className="text-sm font-bold text-[#1E2923] line-clamp-1">
                          {item.description || '기숙사 인계 물품'}
                        </h4>
                        <p className="text-[11px] text-[#6B7280]">
                          {item.createdAt}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-sm font-extrabold text-[#6D4A20]">
                        <Leaf className="h-3.5 w-3.5 fill-[#6D4A20]" />
                        +{item.mileageEarned}P
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#F0F3F1] pt-2.5 text-xs">
                    <span className="flex items-center gap-1 text-[11px] text-[#059669] font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      1층 연근 수거함 인계 완료
                    </span>
                    <span className="text-[10px] text-[#9CA3AF]">
                      사진 {item.photos.length}장 첨부됨
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content: Redemptions */}
        {activeTab === 'rewards' && (
          <div className="space-y-3">
            {redemptions.length === 0 ? (
              <div className="rounded-3xl border border-[#E3E8E5] bg-white p-8 text-center space-y-3">
                <Gift className="mx-auto h-10 w-10 text-[#A7BDB3]" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#1E2923]">
                    교환한 친환경 리워드가 없습니다.
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    누적된 에코 마일리지를 스티커나 키링으로 교환해보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToMileage}
                  className="rounded-full bg-[#014B43] px-5 py-2 text-xs font-bold text-white shadow-xs"
                >
                  리워드 교환하러 가기
                </button>
              </div>
            ) : (
              redemptions.map((redemption) => (
                <div
                  key={redemption.id}
                  className="rounded-2xl border border-[#E3E8E5] bg-white p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Gift className="h-4 w-4 text-[#014B43]" />
                        <h4 className="text-sm font-extrabold text-[#1E2923]">
                          {redemption.rewardName}
                        </h4>
                      </div>
                      <p className="text-xs text-[#6B7280]">
                        신청 일시: {redemption.redeemedAt}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-[#DC2626]">
                      -{redemption.pointsSpent.toLocaleString()} P
                    </span>
                  </div>

                  <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#64748B]">수령 인증 코드</span>
                      <span className="font-mono font-bold text-[#014B43]">
                        {redemption.voucherCode}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                      <span>수령 장소</span>
                      <span className="font-medium text-[#1E2923]">
                        {redemption.pickupLocation}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
