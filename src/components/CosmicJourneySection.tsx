import React, { useState } from 'react';
import { BADGE_CATALOG, PlayerProgress } from '../utils/challengeGenerator';
import {
  computeAllTopicsJourneySummary,
  computeJourneyTotals,
  JourneyTopicId,
} from '../utils/journeyProgress';
import { soundFX } from '../utils/soundEffects';

interface CosmicJourneySectionProps {
  progress: PlayerProgress;
  onNavigateScreen: (screenId: string, topicId: JourneyTopicId) => void;
  onChangeStudentInfo: (name: string, className: string) => void;
  onOpenCertificateModal: (target: JourneyTopicId | 'all') => void;
  onResetTopic: (topicId: JourneyTopicId) => void;
}

export const CosmicJourneySection: React.FC<CosmicJourneySectionProps> = ({
  progress,
  onNavigateScreen,
  onChangeStudentInfo,
  onOpenCertificateModal,
  onResetTopic,
}) => {
  const [showBadges, setShowBadges] = useState(true);
  const [confirmResetTopicId, setConfirmResetTopicId] = useState<JourneyTopicId | null>(null);
  const topicSummaries = computeAllTopicsJourneySummary(progress);
  const totals = computeJourneyTotals(progress);
  const unlockedBadgesCount = BADGE_CATALOG.filter((b) => b.unlocked(progress)).length;

  return (
    <section
      id="cosmic-journey-section"
      data-testid="cosmic-journey-section"
      className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 pb-8 space-y-5"
    >
      {/* Main Journey Header & Overall Progress Banner */}
      <div className="card-3d-cosmic rounded-3xl p-5 sm:p-6 border-2 border-yellow-400/70 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-wider text-yellow-300 uppercase">
              <span>🚀</span>
              <span>BẢNG THÀNH TÍCH CẢ 4 CHỦ ĐỀ HÌNH HỌC LỚP 4</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              HÀNH TRÌNH CHINH PHỤC VŨ TRỤ
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200">
              Tính Sao thưởng, tiến độ hoàn thành và Huy hiệu cho cả 4 chủ đề · Hoàn thành xong chủ đề nào sẽ xuất ngay Thông báo Khen thưởng dạng PDF!
            </p>
          </div>

          {/* 3 Compact Summary Counters */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
            <div className="bg-[#0B0826] border border-yellow-400/50 rounded-2xl px-3.5 py-2.5 text-center">
              <div className="text-[11px] font-bold text-indigo-300">TỔNG SAO</div>
              <div
                data-testid="journey-total-stars"
                className="text-xl sm:text-2xl font-extrabold font-mono-num text-yellow-300"
              >
                ★ {totals.totalStars}
              </div>
            </div>
            <div className="bg-[#0B0826] border border-emerald-400/50 rounded-2xl px-3.5 py-2.5 text-center">
              <div className="text-[11px] font-bold text-indigo-300">TIẾN ĐỘ CHUNG</div>
              <div
                data-testid="journey-overall-percent"
                className="text-xl sm:text-2xl font-extrabold font-mono-num text-emerald-400"
              >
                {totals.overallPercent}%
              </div>
            </div>
            <div className="bg-[#0B0826] border border-fuchsia-400/50 rounded-2xl px-3.5 py-2.5 text-center">
              <div className="text-[11px] font-bold text-indigo-300">CHỦ ĐỀ XONG</div>
              <div
                data-testid="journey-completed-topics"
                className="text-xl sm:text-2xl font-extrabold font-mono-num text-fuchsia-300"
              >
                {totals.completedTopicsCount}/{totals.totalTopicsCount}
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar across all 4 topics (16 milestones) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-200">
            <span>Tiến độ tổng hợp 4 chủ đề (16 nhiệm vụ)</span>
            <span className="font-mono-num text-yellow-300">{totals.overallPercent}%</span>
          </div>
          <div className="w-full h-4 rounded-full bg-[#090621] overflow-hidden border border-indigo-400/40 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-emerald-400 via-sky-400 to-fuchsia-400 transition-all duration-500"
              style={{ width: `${Math.max(totals.overallPercent > 0 ? 5 : 0, totals.overallPercent)}%` }}
            />
          </div>
        </div>

        {/* Student Name & Class Bar (Used for PDF Reward Certificates) */}
        <div className="bg-[#0B0826]/90 rounded-2xl p-3.5 border border-indigo-400/40 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-5">
            <label
              htmlFor="journey-student-name"
              className="block text-[11px] font-extrabold text-sky-300 mb-1"
            >
              ✍️ HỌ VÀ TÊN HỌC SINH (IN TRÊN THÔNG BÁO KHEN THƯỞNG PDF)
            </label>
            <input
              id="journey-student-name"
              type="text"
              value={progress.studentName || ''}
              onChange={(e) =>
                onChangeStudentInfo(e.target.value, progress.studentClass || '')
              }
              placeholder="Nhập họ và tên của em (VD: Nguyễn Minh Anh)"
              className="w-full px-3.5 py-2 rounded-xl bg-indigo-950/90 border border-indigo-400/50 text-sm font-bold text-white placeholder-indigo-300/60 focus:outline-none focus:border-yellow-400"
            />
          </div>
          <div className="md:col-span-3">
            <label
              htmlFor="journey-student-class"
              className="block text-[11px] font-extrabold text-sky-300 mb-1"
            >
              🏫 LỚP
            </label>
            <input
              id="journey-student-class"
              type="text"
              value={progress.studentClass || ''}
              onChange={(e) =>
                onChangeStudentInfo(progress.studentName || '', e.target.value)
              }
              placeholder="VD: 4A"
              className="w-full px-3.5 py-2 rounded-xl bg-indigo-950/90 border border-indigo-400/50 text-sm font-bold text-white placeholder-indigo-300/60 focus:outline-none focus:border-yellow-400"
            />
          </div>
          <div className="md:col-span-4 flex items-center justify-end">
            {totals.allTopicsCompleted ? (
              <button
                type="button"
                data-testid="btn-export-grand-pdf"
                onClick={() => {
                  soundFX.playVictory();
                  onOpenCertificateModal('all');
                }}
                className="btn-3d-gold w-full py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm text-slate-950 cursor-pointer"
              >
                👑 Xuất Bằng Khen Cả 4 Chủ Đề (PDF)
              </button>
            ) : (
              <div className="w-full rounded-xl bg-indigo-950/70 border border-indigo-400/35 px-3 py-2 text-[11px] sm:text-xs font-semibold text-indigo-200 text-center">
                📄 Hoàn thành đủ 4 mục ở bất kỳ chủ đề nào để nhận Thông báo Khen thưởng PDF!
              </div>
            )}
          </div>
        </div>

        {/* 4-Topic Progress & PDF Certificate Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topicSummaries.map((topic) => {
            const isConfirmingReset = confirmResetTopicId === topic.id;
            return (
              <div
                key={topic.id}
                data-testid={`journey-topic-card-${topic.id}`}
                className={`rounded-2xl p-4 bg-[#100B33]/95 border-2 flex flex-col justify-between gap-3.5 transition-all ${
                  topic.isCompleted
                    ? 'border-yellow-400 shadow-lg'
                    : topic.badgeBorderClass
                }`}
              >
                {/* Topic Header */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-indigo-950 border border-indigo-400/40 flex items-center justify-center text-xl shrink-0">
                      {topic.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                        {topic.titleVi}
                      </h3>
                      <div className="text-xs font-bold text-indigo-200 mt-0.5 flex items-center gap-2">
                        <span
                          data-testid={`journey-topic-stars-${topic.id}`}
                          className="text-yellow-300 font-mono-num"
                        >
                          ★ {topic.stars} Sao
                        </span>
                        <span className="text-indigo-500">·</span>
                        <span className="font-mono-num text-emerald-300">
                          {topic.completedCount}/{topic.totalCount} mục ({topic.percent}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Completion Status + Restart Course Button */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {topic.isCompleted && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[11px] font-extrabold shrink-0">
                        ✓ Hoàn thành
                      </span>
                    )}

                    {isConfirmingReset ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          data-testid={`btn-confirm-reset-topic-${topic.id}`}
                          onClick={() => {
                            soundFX.playClick(0.9);
                            onResetTopic(topic.id);
                            setConfirmResetTopicId(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-[11px] font-extrabold cursor-pointer shadow-sm"
                        >
                          Xác nhận
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setConfirmResetTopicId(null);
                          }}
                          className="px-2 py-1 rounded-lg bg-indigo-950 border border-indigo-400/40 text-indigo-200 hover:text-white text-[11px] font-bold cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        data-testid={`btn-reset-topic-${topic.id}`}
                        onClick={() => {
                          soundFX.playClick();
                          setConfirmResetTopicId(topic.id);
                        }}
                        title={`Khởi động lại và xáo mới câu hỏi ${topic.titleVi}`}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-colors flex items-center gap-1 bg-indigo-950/90 border-amber-400/60 text-amber-200 hover:bg-amber-500/20 hover:border-amber-300 cursor-pointer"
                      >
                        <span>↺</span>
                        <span>Khởi động lại</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Per-Topic Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-indigo-500/30">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${topic.barGradientClass} transition-all duration-300`}
                    style={{ width: `${topic.percent}%` }}
                  />
                </div>

                {/* 4 Unified Milestone Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {topic.milestones.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        onNavigateScreen(m.screenId, topic.id);
                      }}
                      className={`px-2.5 py-2 rounded-xl text-left text-[11px] sm:text-xs font-bold border transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                        m.done
                          ? 'bg-emerald-500/15 border-emerald-400/60 text-emerald-200 hover:bg-emerald-500/25'
                          : 'bg-indigo-950/75 border-indigo-400/30 text-indigo-200 hover:border-sky-400 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{m.labelVi}</span>
                      <span className="shrink-0">{m.done ? '✅' : '→'}</span>
                    </button>
                  ))}
                </div>

                {/* PDF Reward Action Bar */}
                <div className="pt-1 border-t border-indigo-500/25 flex items-center justify-between gap-2">
                  {topic.isCompleted ? (
                    <button
                      type="button"
                      data-testid={`btn-pdf-topic-${topic.id}`}
                      onClick={() => {
                        soundFX.playVictory();
                        onOpenCertificateModal(topic.id);
                      }}
                      className="btn-3d-gold w-full py-2 px-3.5 rounded-xl font-extrabold text-xs sm:text-sm text-slate-950 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>📄</span>
                      <span>Xem và Xuất Thông Báo Khen Thưởng (PDF)</span>
                    </button>
                  ) : (
                    <div className="w-full py-2 px-3 rounded-xl bg-slate-900/70 border border-indigo-500/25 text-[11px] sm:text-xs font-semibold text-indigo-300 flex items-center justify-between">
                      <span>🔒 Chưa mở khóa Thông báo Khen thưởng PDF</span>
                      <span className="font-mono-num text-yellow-300 font-bold">
                        Còn {topic.totalCount - topic.completedCount} mục
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Collapsible Universe Badges Grid for All 4 Topics */}
        <div className="pt-2 border-t border-indigo-500/30 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <span>🏅</span>
                <span>
                  BỘ SƯU TẬP HUY HIỆU VŨ TRỤ ({unlockedBadgesCount}/{BADGE_CATALOG.length})
                </span>
              </h3>
              <p className="text-xs text-indigo-200">
                Thu thập đủ huy hiệu danh giá ở cả 4 chủ đề Hình học Lớp 4
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setShowBadges((v) => !v);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-950 border border-indigo-400/50 text-xs font-extrabold text-indigo-200 hover:border-yellow-400 hover:text-white cursor-pointer"
            >
              {showBadges ? 'Thu gọn huy hiệu ▲' : 'Xem tất cả huy hiệu ▼'}
            </button>
          </div>

          {showBadges && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {BADGE_CATALOG.map((badge) => {
                const isUnlocked = badge.unlocked(progress);
                return (
                  <div
                    key={badge.id}
                    className={`rounded-2xl p-3.5 flex items-center gap-3.5 border-2 bg-[#0E0A2C]/95 ${
                      isUnlocked
                        ? 'border-yellow-400 shadow-md'
                        : 'border-slate-700/60 opacity-75'
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl font-extrabold border-2"
                      style={{
                        backgroundColor: isUnlocked
                          ? 'rgba(250, 204, 21, 0.2)'
                          : '#0F172A',
                        borderColor: isUnlocked ? badge.color : '#334155',
                        color: isUnlocked ? badge.color : '#64748B',
                      }}
                    >
                      {isUnlocked ? '🏅' : '🔒'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-extrabold uppercase text-sky-300">
                        {badge.topicTag}
                      </div>
                      <h4 className="font-extrabold text-sm text-white truncate">
                        {badge.titleVi}
                      </h4>
                      <p className="text-[11px] text-indigo-200 mt-0.5 leading-snug">
                        {badge.descVi}
                      </p>
                      <div
                        className={`text-[11px] font-bold mt-1 ${
                          isUnlocked ? 'text-emerald-400' : 'text-amber-300'
                        }`}
                      >
                        {isUnlocked ? '✓ Đã nhận huy hiệu' : 'Chưa mở khóa'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
