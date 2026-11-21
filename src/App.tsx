import React, { useEffect, useState } from 'react';
import { ChallengeGameView } from './components/ChallengeGameView';
import { ExploreAnglesView } from './components/ExploreAnglesView';
import { KnowledgeLibraryView } from './components/KnowledgeLibraryView';
import { ProtractorLabView } from './components/ProtractorLabView';
import { Space3DStage } from './components/Space3DStage';
import { Tutorial3StepsView } from './components/Tutorial3StepsView';
import {
  ChallengeLevel,
  computeOverallProgressPercent,
  INITIAL_PROGRESS,
  PlayerProgress,
} from './utils/challengeGenerator';
import { soundFX } from './utils/soundEffects';

export type ScreenId = 'home' | 'explore' | 'lab' | 'tutorial' | 'challenge' | 'library';

const STORAGE_KEY = 'vu_tru_goc_hoc_progress_v1';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return 'lab';
      }
    }
    return 'home';
  });

  const [activeAngleDeg, setActiveAngleDeg] = useState<number>(60);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundFX.isMuted());

  const [progress, setProgress] = useState<PlayerProgress>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...INITIAL_PROGRESS,
          ...parsed,
          completedSections: {
            ...INITIAL_PROGRESS.completedSections,
            ...(parsed.completedSections || {}),
          },
          highScores: {
            ...INITIAL_PROGRESS.highScores,
            ...(parsed.highScores || {}),
          },
        };
      }
    } catch {
      // ignore storage parse error
    }
    return INITIAL_PROGRESS;
  });

  // Sync progress to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  // Sync document.body.dataset.state for game shell & automated verification
  useEffect(() => {
    document.body.dataset.state = activeScreen === 'home' ? 'title' : 'playing';
  }, [activeScreen]);

  // Keyboard shortcuts on Title Screen (Enter or Space starts the Protractor Lab)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeScreen === 'home' && (e.key === 'Enter' || e.key === ' ')) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'button' && activeTag !== 'input') {
          e.preventDefault();
          soundFX.playClick(1.15);
          setActiveScreen('lab');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeScreen]);

  const navigateTo = (screen: ScreenId) => {
    soundFX.playClick();
    setActiveScreen(screen);
    if (screen === 'explore') {
      setProgress((p) => ({
        ...p,
        completedSections: { ...p.completedSections, explore: true },
      }));
    } else if (screen === 'library') {
      setProgress((p) => ({
        ...p,
        completedSections: { ...p.completedSections, library: true },
      }));
    }
  };

  const handleSelectAngleForLab = (deg: number) => {
    setActiveAngleDeg(deg);
    setActiveScreen('lab');
    setProgress((p) => ({
      ...p,
      completedSections: { ...p.completedSections, explore: true },
    }));
  };

  const handleRecordSuccessfulLabMeasurement = () => {
    setProgress((p) => ({
      ...p,
      stars: p.stars + 1,
      measuredAnglesCount: p.measuredAnglesCount + 1,
      completedSections: { ...p.completedSections, lab: true },
    }));
  };

  const handleCompleteTutorial = () => {
    setProgress((p) => ({
      ...p,
      stars: p.completedSections.tutorial ? p.stars : p.stars + 2,
      completedSections: { ...p.completedSections, tutorial: true },
    }));
  };

  const handleFinishChallengeLevel = (
    level: ChallengeLevel,
    score: number,
    starsEarned: number
  ) => {
    setProgress((p) => {
      const levelKey = `level${level}` as 'level1' | 'level2' | 'level3';
      return {
        ...p,
        stars: p.stars + starsEarned,
        completedSections: {
          ...p.completedSections,
          [levelKey]: starsEarned > 0 || p.completedSections[levelKey],
        },
        highScores: {
          ...p.highScores,
          [levelKey]: Math.max(p.highScores[levelKey], score),
        },
      };
    });
  };

  const overallPercent = computeOverallProgressPercent(progress);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex flex-col justify-between select-none">
      {/* Persistent 3D Cosmic Background & Holographic Angle Stage */}
      <Space3DStage activeScreen={activeScreen} activeAngleDeg={activeAngleDeg} />

      {/* Top Perimeter Status Strip (World-Matched Cosmic HUD) */}
      <div className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-3 flex items-start justify-between gap-3 pointer-events-none">
        {/* Left: Brand Emblem Lockup */}
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="pointer-events-auto flex items-center gap-3 bg-[#130E38]/95 border-2 border-indigo-400/50 rounded-2xl px-3 py-1.5 shadow-lg cursor-pointer hover:border-yellow-400 transition-colors"
        >
          <img
            src="/assets/aistudio/ava_04065f25.png"
            alt="Ảnh đại diện Vũ Trụ Góc 3D"
            className="w-11 h-11 rounded-full object-cover border-2 border-yellow-400 shadow-md shrink-0"
          />
          <div className="text-left">
            <div className="text-sm sm:text-base font-extrabold text-white leading-none tracking-tight">
              VŨ TRỤ GÓC 3D
            </div>
            <div className="text-[11px] font-bold text-yellow-300 mt-0.5">
              ANGLE EXPLORER · TOÁN TIỂU HỌC
            </div>
          </div>
        </button>

        {/* Right: Stars, Progress, Audio Mute Toggle & Authors/School */}
        <div className="pointer-events-auto flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigateTo('library')}
              className="bg-[#130E38]/95 border-2 border-yellow-400/60 rounded-2xl px-3.5 py-1.5 flex items-center gap-2.5 cursor-pointer hover:border-yellow-300"
              title="Xem Bảng Thành Tích và Huy Hiệu"
            >
              <span className="text-yellow-400 text-lg leading-none">★</span>
              <span
                data-testid="hud-stars-count"
                className="font-mono-num font-extrabold text-sm sm:text-base text-white"
              >
                {progress.stars} Sao
              </span>
              <span className="text-indigo-400">·</span>
              <span className="font-mono-num text-xs font-bold text-emerald-300">
                Tiến độ {overallPercent}%
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                const nextMuted = soundFX.toggleMute();
                setIsMuted(nextMuted);
              }}
              aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              className="bg-[#130E38]/95 border-2 border-indigo-400/50 rounded-2xl w-10 h-10 flex items-center justify-center text-white cursor-pointer hover:border-pink-400"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
          <div className="bg-[#130E38]/90 border border-indigo-400/40 rounded-xl px-3 py-1 text-[11px] sm:text-xs font-bold text-indigo-100 shadow-md text-right">
            Lê Thị Hải Vân - Doãn Thị Phượng - Trường TH Trần Quang Diệu
          </div>
        </div>
      </div>

      {/* Main Content Area by Active Screen */}
      <main className="relative z-10 flex-1 flex flex-col justify-center py-2">
        {activeScreen === 'home' && (
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col justify-between gap-6">
            {/* Title Hero Header */}
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <div className="inline-block text-xs sm:text-sm font-extrabold tracking-wider text-yellow-300 uppercase">
                HỌC TOÁN THẬT VUI – KHÁM PHÁ THẾ GIỚI GÓC!
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
                VŨ TRỤ GÓC 3D
              </h1>
              <p className="text-sm sm:text-lg font-semibold text-indigo-100">
                Khám phá thế giới góc – Đo lường thật vui cùng thước đo góc!
              </p>
            </div>

            {/* 3-Zone Home Layout per Specification */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* LEFT ZONE: 3D Math Robot Guide Speech Card */}
              <div className="lg:col-span-4 card-3d-cosmic rounded-3xl p-5 flex flex-col gap-3.5 border-2 border-sky-400/60">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 border-2 border-yellow-400 flex items-center justify-center overflow-hidden shadow-md shrink-0">
                    <img
                      src="/assets/aistudio/Th_m_ti_u____9352a9ad.png"
                      alt="Robot Toán Học ROBO-GÓC"
                      className="w-full h-full object-cover scale-[1.35] drop-shadow-md"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-yellow-300">
                      NHÂN VẬT ĐỒNG HÀNH 3D
                    </div>
                    <h2 className="text-lg font-extrabold text-white">
                      Robot Toán Học ROBO-GÓC
                    </h2>
                  </div>
                </div>

                <div className="bg-[#090621] rounded-2xl p-3.5 border border-indigo-500/40 text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
                  &ldquo;Xin chào các nhà Toán học nhí! Cùng mình khám phá thế giới các góc nhé! Ở giữa vũ trụ là mô hình góc 3D đang mở{' '}
                  <span className="font-mono-num font-bold text-yellow-300">
                    {activeAngleDeg}°
                  </span>
                  . Em có thể bấm chọn nhanh các góc mẫu hoặc vào ngay Phòng Thí Nghiệm Đo Góc 180°!&rdquo;
                </div>

                {/* Live 3D Hologram Angle Switcher on Home */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-sky-300">
                    Xoay thử mô hình góc 3D trung tâm:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { deg: 45, label: '45° Nhọn' },
                      { deg: 90, label: '90° Vuông' },
                      { deg: 120, label: '120° Tù' },
                      { deg: 180, label: '180° Bẹt' },
                    ].map((item) => (
                      <button
                        key={item.deg}
                        type="button"
                        onClick={() => {
                          soundFX.playTick(item.deg);
                          setActiveAngleDeg(item.deg);
                        }}
                        className={`py-2 px-1.5 rounded-xl font-mono-num text-xs font-extrabold cursor-pointer transition-transform ${
                          activeAngleDeg === item.deg
                            ? 'bg-yellow-400 text-slate-950 scale-105'
                            : 'bg-indigo-950 text-white border border-indigo-500/40 hover:bg-indigo-900'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigateTo('tutorial')}
                  className="btn-3d-gold w-full py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer"
                >
                  ✨ Bài học 3 bước cách đặt thước đo góc
                </button>
              </div>

              {/* CENTER ZONE: Open Negative Space Viewport for 3D Robot, Planets & 3D Angle Hologram */}
              <div className="lg:col-span-4 min-h-[220px] sm:min-h-[280px] flex flex-col items-center justify-end pointer-events-none">
                <div className="pointer-events-auto bg-[#0B0726]/90 border border-indigo-400/40 rounded-2xl px-4 py-2 text-center shadow-xl">
                  <div className="text-xs font-bold text-indigo-200">
                    ĐÀI QUAN SÁT GÓC 3D TRUNG TÂM
                  </div>
                  <div className="text-lg font-extrabold font-mono-num text-yellow-300">
                    Góc hiện tại: {activeAngleDeg}°
                  </div>
                </div>
              </div>

              {/* RIGHT ZONE: 4 Large 3D Feature Buttons */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => navigateTo('explore')}
                  className="btn-3d-cobalt w-full p-4 rounded-2xl text-left flex items-center gap-3.5 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl shrink-0">
                    🪐
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-extrabold text-white">
                      1. KHÁM PHÁ CÁC LOẠI GÓC
                    </div>
                    <div className="text-xs text-indigo-100">
                      Bảo tàng 3D: Góc nhọn, góc vuông, góc tù và góc bẹt
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  data-start="true"
                  onClick={() => navigateTo('lab')}
                  className="btn-3d-pink w-full p-4 rounded-2xl text-left flex items-center gap-3.5 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl shrink-0">
                    📐
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-extrabold text-white">
                      2. PHÒNG THÍ NGHIỆM ĐO GÓC
                    </div>
                    <div className="text-xs text-pink-100">
                      Thực hành kéo và xoay thước đo góc
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('challenge')}
                  className="btn-3d-emerald w-full p-4 rounded-2xl text-left flex items-center gap-3.5 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl shrink-0">
                    🏆
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-extrabold text-white">
                      3. THỬ THÁCH NHÀ TOÁN HỌC
                    </div>
                    <div className="text-xs text-emerald-100">
                      Chinh phục 3 hành tinh · 45 bài tập đa dạng nhận Sao Vàng
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('library')}
                  className="btn-3d-gold w-full p-4 rounded-2xl text-left flex items-center gap-3.5 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-900/15 flex items-center justify-center text-2xl shrink-0">
                    📚
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-extrabold text-slate-950">
                      4. THƯ VIỆN KIẾN THỨC
                    </div>
                    <div className="text-xs font-semibold text-slate-800">
                      Đơn vị độ (°), cấu tạo thước 180°, lỗi thường gặp và Huy hiệu
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Flat Bottom Control Hint Line */}
            <div className="text-center text-xs font-semibold text-indigo-300/90 pt-1">
              Kéo thả chuột / chạm cảm ứng để di chuyển thước đo góc 180° · Nhấn Enter hoặc Space để vào nhanh Phòng Thí Nghiệm
            </div>
          </div>
        )}

        {activeScreen === 'explore' && (
          <ExploreAnglesView
            onSelectAngleForLab={handleSelectAngleForLab}
            onAnglePreviewChange={setActiveAngleDeg}
            onBackHome={() => navigateTo('home')}
          />
        )}

        {activeScreen === 'lab' && (
          <ProtractorLabView
            initialAngleDeg={activeAngleDeg}
            onAngleChangeFor3D={setActiveAngleDeg}
            onRecordSuccessfulMeasurement={handleRecordSuccessfulLabMeasurement}
            onOpenTutorial={() => navigateTo('tutorial')}
            onBackHome={() => navigateTo('home')}
          />
        )}

        {activeScreen === 'tutorial' && (
          <Tutorial3StepsView
            onCompleteTutorial={handleCompleteTutorial}
            onGoToLab={() => navigateTo('lab')}
            onBackHome={() => navigateTo('home')}
          />
        )}

        {activeScreen === 'challenge' && (
          <ChallengeGameView
            onFinishChallengeLevel={handleFinishChallengeLevel}
            onAngleChangeFor3D={setActiveAngleDeg}
            onBackHome={() => navigateTo('home')}
          />
        )}

        {activeScreen === 'library' && (
          <KnowledgeLibraryView
            progress={progress}
            onMarkLibraryRead={() =>
              setProgress((p) => ({
                ...p,
                completedSections: { ...p.completedSections, library: true },
              }))
            }
            onOpenTutorial={() => navigateTo('tutorial')}
            onOpenLab={() => navigateTo('lab')}
            onBackHome={() => navigateTo('home')}
          />
        )}
      </main>
    </div>
  );
}
