import React, { useEffect, useState } from 'react';
import { ChallengeGameView } from './components/ChallengeGameView';
import { ExploreAnglesView } from './components/ExploreAnglesView';
import { KnowledgeLibraryView } from './components/KnowledgeLibraryView';
import { ParallelChallengeView } from './components/ParallelChallengeView';
import { ParallelExploreView } from './components/ParallelExploreView';
import { ParallelGuideView } from './components/ParallelGuideView';
import { ParallelLabView } from './components/ParallelLabView';
import { PerpendicularChallengeView } from './components/PerpendicularChallengeView';
import { PerpendicularExploreView } from './components/PerpendicularExploreView';
import { PerpendicularGuideView } from './components/PerpendicularGuideView';
import { PerpendicularLabView } from './components/PerpendicularLabView';
import { ProtractorLabView } from './components/ProtractorLabView';
import { ShapesChallengeView } from './components/ShapesChallengeView';
import { ShapesExploreView } from './components/ShapesExploreView';
import { ShapesGuideView } from './components/ShapesGuideView';
import { ShapesLabView } from './components/ShapesLabView';
import { Space3DStage } from './components/Space3DStage';
import { Tutorial3StepsView } from './components/Tutorial3StepsView';
import {
  ChallengeLevel,
  computeOverallProgressPercent,
  INITIAL_PROGRESS,
  PlayerProgress,
} from './utils/challengeGenerator';
import { soundFX } from './utils/soundEffects';

export type ScreenId =
  | 'home'
  | 'explore'
  | 'lab'
  | 'tutorial'
  | 'challenge'
  | 'library'
  | 'perp-explore'
  | 'perp-lab'
  | 'perp-challenge'
  | 'perp-guide'
  | 'par-explore'
  | 'par-lab'
  | 'par-challenge'
  | 'par-guide'
  | 'shapes-explore'
  | 'shapes-lab'
  | 'shapes-challenge'
  | 'shapes-guide';

export type TopicId = 'angles' | 'perpendicular' | 'parallel' | 'shapes';

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

  const [activeTopic, setActiveTopic] = useState<TopicId>('angles');
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
          perpendicularSections: {
            explore: false,
            lab: false,
            challenge: false,
            guide: false,
            ...(parsed.perpendicularSections || {}),
          },
          parallelSections: {
            explore: false,
            lab: false,
            challenge: false,
            guide: false,
            ...(parsed.parallelSections || {}),
          },
          shapesSections: {
            explore: false,
            lab: false,
            challenge: false,
            guide: false,
            ...(parsed.shapesSections || {}),
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

  // Keyboard shortcuts on Title Screen (Enter or Space starts the active topic's Lab)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeScreen === 'home' && (e.key === 'Enter' || e.key === ' ')) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'button' && activeTag !== 'input') {
          e.preventDefault();
          soundFX.playClick(1.15);
          if (activeTopic === 'perpendicular') {
            setActiveScreen('perp-lab');
          } else if (activeTopic === 'parallel') {
            setActiveScreen('par-lab');
          } else if (activeTopic === 'shapes') {
            setActiveScreen('shapes-lab');
          } else {
            setActiveScreen('lab');
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeScreen, activeTopic]);

  const handleSelectTopic = (topic: TopicId) => {
    soundFX.playClick(
      topic === 'shapes'
        ? 1.32
        : topic === 'parallel'
          ? 1.22
          : topic === 'perpendicular'
            ? 1.12
            : 1
    );
    setActiveTopic(topic);
    if (topic === 'perpendicular') {
      setActiveAngleDeg(90);
    }
  };

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
    } else if (screen === 'perp-explore') {
      setActiveAngleDeg(90);
      setProgress((p) => ({
        ...p,
        perpendicularSections: {
          explore: true,
          lab: p.perpendicularSections?.lab ?? false,
          challenge: p.perpendicularSections?.challenge ?? false,
          guide: p.perpendicularSections?.guide ?? false,
        },
      }));
    } else if (screen === 'perp-lab' || screen === 'perp-challenge' || screen === 'perp-guide') {
      setActiveAngleDeg(90);
    } else if (screen === 'par-explore') {
      setProgress((p) => ({
        ...p,
        parallelSections: {
          explore: true,
          lab: p.parallelSections?.lab ?? false,
          challenge: p.parallelSections?.challenge ?? false,
          guide: p.parallelSections?.guide ?? false,
        },
      }));
    } else if (screen === 'shapes-explore') {
      setProgress((p) => ({
        ...p,
        shapesSections: {
          explore: true,
          lab: p.shapesSections?.lab ?? false,
          challenge: p.shapesSections?.challenge ?? false,
          guide: p.shapesSections?.guide ?? false,
        },
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

  const handleRecordPerpLabSuccess = () => {
    setProgress((p) => ({
      ...p,
      stars: p.stars + 1,
      perpendicularSections: {
        explore: p.perpendicularSections?.explore ?? false,
        lab: true,
        challenge: p.perpendicularSections?.challenge ?? false,
        guide: p.perpendicularSections?.guide ?? false,
      },
    }));
  };

  const handleCompletePerpGuide = () => {
    setProgress((p) => ({
      ...p,
      stars: p.perpendicularSections?.guide ? p.stars : p.stars + 2,
      perpendicularSections: {
        explore: p.perpendicularSections?.explore ?? false,
        lab: p.perpendicularSections?.lab ?? false,
        challenge: p.perpendicularSections?.challenge ?? false,
        guide: true,
      },
    }));
  };

  const handleFinishPerpChallengeLevel = (
    _level: 1 | 2 | 3,
    _score: number,
    starsEarned: number
  ) => {
    setProgress((p) => ({
      ...p,
      stars: p.stars + starsEarned,
      perpendicularSections: {
        explore: p.perpendicularSections?.explore ?? false,
        lab: p.perpendicularSections?.lab ?? false,
        challenge: true,
        guide: p.perpendicularSections?.guide ?? false,
      },
    }));
  };

  const handleCompleteParExplore = () => {
    setProgress((p) => ({
      ...p,
      stars: p.parallelSections?.explore ? p.stars : p.stars + 1,
      parallelSections: {
        explore: true,
        lab: p.parallelSections?.lab ?? false,
        challenge: p.parallelSections?.challenge ?? false,
        guide: p.parallelSections?.guide ?? false,
      },
    }));
  };

  const handleRecordParLabSuccess = () => {
    setProgress((p) => ({
      ...p,
      stars: p.stars + 1,
      parallelSections: {
        explore: p.parallelSections?.explore ?? false,
        lab: true,
        challenge: p.parallelSections?.challenge ?? false,
        guide: p.parallelSections?.guide ?? false,
      },
    }));
  };

  const handleCompleteParGuide = () => {
    setProgress((p) => ({
      ...p,
      stars: p.parallelSections?.guide ? p.stars : p.stars + 2,
      parallelSections: {
        explore: p.parallelSections?.explore ?? false,
        lab: p.parallelSections?.lab ?? false,
        challenge: p.parallelSections?.challenge ?? false,
        guide: true,
      },
    }));
  };

  const handleFinishParChallengeLevel = (
    _level: 1 | 2 | 3,
    _score: number,
    starsEarned: number
  ) => {
    setProgress((p) => ({
      ...p,
      stars: p.stars + starsEarned,
      parallelSections: {
        explore: p.parallelSections?.explore ?? false,
        lab: p.parallelSections?.lab ?? false,
        challenge: true,
        guide: p.parallelSections?.guide ?? false,
      },
    }));
  };

  const handleCompleteShapesExplore = () => {
    setProgress((p) => ({
      ...p,
      stars: p.shapesSections?.explore ? p.stars : p.stars + 1,
      shapesSections: {
        explore: true,
        lab: p.shapesSections?.lab ?? false,
        challenge: p.shapesSections?.challenge ?? false,
        guide: p.shapesSections?.guide ?? false,
      },
    }));
  };

  const handleRecordShapesLabSuccess = () => {
    setProgress((p) => ({
      ...p,
      stars: p.stars + 1,
      shapesSections: {
        explore: p.shapesSections?.explore ?? false,
        lab: true,
        challenge: p.shapesSections?.challenge ?? false,
        guide: p.shapesSections?.guide ?? false,
      },
    }));
  };

  const handleCompleteShapesGuide = () => {
    setProgress((p) => ({
      ...p,
      stars: p.shapesSections?.guide ? p.stars : p.stars + 2,
      shapesSections: {
        explore: p.shapesSections?.explore ?? false,
        lab: p.shapesSections?.lab ?? false,
        challenge: p.shapesSections?.challenge ?? false,
        guide: true,
      },
    }));
  };

  const handleFinishShapesChallengeLevel = (
    _level: 1 | 2 | 3,
    _score: number,
    starsEarned: number
  ) => {
    setProgress((p) => ({
      ...p,
      stars: p.stars + starsEarned,
      shapesSections: {
        explore: p.shapesSections?.explore ?? false,
        lab: p.shapesSections?.lab ?? false,
        challenge: true,
        guide: p.shapesSections?.guide ?? false,
      },
    }));
  };

  const overallPercent = computeOverallProgressPercent(progress);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex flex-col justify-between select-none">
      {/* Persistent 3D Cosmic Background & Holographic Stage (Angles vs Perpendicular) */}
      <Space3DStage
        activeScreen={activeScreen}
        activeAngleDeg={activeAngleDeg}
        activeTopic={activeTopic}
      />

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
            alt="Ảnh đại diện Vũ Trụ Hình Học Lớp 4"
            className="w-11 h-11 rounded-full object-cover border-2 border-yellow-400 shadow-md shrink-0"
          />
          <div className="text-left pr-1">
            <div className="text-sm sm:text-base font-extrabold text-white leading-tight tracking-tight">
              VŨ TRỤ HÌNH HỌC LỚP 4
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
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-3 flex flex-col justify-between gap-5">
            {/* Title Hero Header + 4-Topic Switcher */}
            <div className="text-center max-w-6xl mx-auto space-y-2.5">
              <div className="inline-block text-xs sm:text-sm font-extrabold tracking-wider text-yellow-300 uppercase">
                HỌC TOÁN THẬT VUI – KHÁM PHÁ THẾ GIỚI HÌNH HỌC LỚP 4!
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
                VŨ TRỤ HÌNH HỌC LỚP 4
              </h1>
              <p className="inline-block bg-[#0B0726]/80 border border-indigo-400/30 rounded-xl px-4 py-1 text-sm sm:text-base font-semibold text-indigo-100 shadow-md">
                {activeTopic === 'angles'
                  ? 'Khám phá thế giới góc – Đo lường thật vui cùng thước đo góc!'
                  : activeTopic === 'perpendicular'
                    ? 'Khám phá hai đường thẳng góc vuông - Thực hành vẽ hai đường thẳng vuông góc'
                    : activeTopic === 'parallel'
                      ? 'Khám phá và thực hành vẽ hai đường thẳng song song'
                      : 'Khám phá về Hình bình hành và Hình thoi'}
              </p>

              {/* Clean 4-Topic Switcher */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-[#110C32]/95 border-2 border-indigo-400/50 shadow-xl mt-1">
                <button
                  type="button"
                  data-testid="topic-tab-angles"
                  onClick={() => handleSelectTopic('angles')}
                  className={`px-3 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    activeTopic === 'angles'
                      ? 'bg-yellow-400 text-slate-950 shadow-md'
                      : 'text-indigo-200 hover:text-white hover:bg-indigo-900/50'
                  }`}
                >
                  <span>📐</span>
                  <span>Chủ đề 1: Góc và Đo Góc</span>
                </button>
                <button
                  type="button"
                  data-testid="topic-tab-perpendicular"
                  onClick={() => handleSelectTopic('perpendicular')}
                  className={`px-3 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    activeTopic === 'perpendicular'
                      ? 'bg-emerald-400 text-slate-950 shadow-md'
                      : 'text-indigo-200 hover:text-white hover:bg-indigo-900/50'
                  }`}
                >
                  <span>➕</span>
                  <span>Chủ đề 2: Hai Đường Thẳng Vuông Góc</span>
                </button>
                <button
                  type="button"
                  data-testid="topic-tab-parallel"
                  onClick={() => handleSelectTopic('parallel')}
                  className={`px-3 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    activeTopic === 'parallel'
                      ? 'bg-sky-400 text-slate-950 shadow-md'
                      : 'text-indigo-200 hover:text-white hover:bg-indigo-900/50'
                  }`}
                >
                  <span>🛤️</span>
                  <span>Chủ đề 3: Hai Đường Thẳng Song Song</span>
                </button>
                <button
                  type="button"
                  data-testid="topic-tab-shapes"
                  onClick={() => handleSelectTopic('shapes')}
                  className={`px-3 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    activeTopic === 'shapes'
                      ? 'bg-fuchsia-400 text-slate-950 shadow-md'
                      : 'text-indigo-200 hover:text-white hover:bg-indigo-900/50'
                  }`}
                >
                  <span>🔷</span>
                  <span>Chủ đề 4: Hình Thoi, Hình Bình Hành</span>
                </button>
              </div>
            </div>

            {/* 3-Zone Home Layout per Specification */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* LEFT ZONE: 3D Math Robot Guide Speech Card */}
              <div className="lg:col-span-4 card-3d-cosmic rounded-3xl p-5 flex flex-col gap-3.5 border-2 border-sky-400/60">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 border-2 border-yellow-400 flex items-center justify-center overflow-hidden shadow-md shrink-0">
                    <img
                      src="/assets/aistudio/Th_m_ti_u____9352a9ad.png"
                      alt="Robot Toán Học"
                      className="w-full h-full object-cover scale-[1.35] drop-shadow-md"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-yellow-300">
                      BẠN ĐỒNG HÀNH TOÀN ỨNG DỤNG
                    </div>
                    <h2 className="text-lg font-extrabold text-white">
                      Robot Toán Học
                    </h2>
                  </div>
                </div>

                {activeTopic === 'angles' ? (
                  <>
                    <div className="bg-[#090621] rounded-2xl p-3.5 border border-indigo-500/40 text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
                      &ldquo;Xin chào các nhà Toán học nhí! Mình là{' '}
                      <span className="font-bold text-yellow-300">Robot Toán Học</span> — người bạn đồng hành cùng em khám phá cả Vũ Trụ Hình Học Lớp 4! Ở giữa vũ trụ là mô hình góc 3D đang mở{' '}
                      <span className="font-mono-num font-bold text-yellow-300">
                        {activeAngleDeg}°
                      </span>
                      . Hãy bấm xoay thử hoặc vào ngay Phòng Thí Nghiệm Đo Góc nhé!&rdquo;
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
                  </>
                ) : activeTopic === 'perpendicular' ? (
                  <>
                    <div className="bg-[#090621] rounded-2xl p-3.5 border border-emerald-400/40 text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
                      &ldquo;Chào em! Tớ là <span className="font-bold text-yellow-300">Robot Toán Học</span>! Xung quanh ta từ bảng lớp, khung cửa sổ đến con diều đều có{' '}
                      <span className="font-bold text-emerald-300">hai đường thẳng vuông góc (90°)</span>. Hãy cùng tớ khám phá cách đọc tên và cầm chiếc{' '}
                      <span className="font-bold text-yellow-300">Ê Ke</span> thực hành nhé!&rdquo;
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-indigo-950/80 border border-indigo-400/40 rounded-xl p-2.5 text-center">
                        <div className="text-[11px] font-bold text-sky-300">Kĩ năng trọng tâm</div>
                        <div className="text-xs font-extrabold text-white mt-0.5">Nhận biết · Đọc · Vẽ</div>
                      </div>
                      <div className="bg-indigo-950/80 border border-emerald-400/40 rounded-xl p-2.5 text-center">
                        <div className="text-[11px] font-bold text-emerald-300">Dụng cụ thực hành</div>
                        <div className="text-xs font-extrabold text-white mt-0.5">Thước Ê Ke 90°</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigateTo('perp-guide')}
                      className="btn-3d-gold w-full py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer"
                    >
                      ✨ Bài học 2 bước vẽ vuông góc bằng Ê Ke
                    </button>
                  </>
                ) : activeTopic === 'parallel' ? (
                  <>
                    <div className="bg-[#090621] rounded-2xl p-3.5 border border-sky-400/40 text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
                      &ldquo;Chào em! Tớ là <span className="font-bold text-yellow-300">Robot Toán Học</span>! Như hai thanh ray tàu hỏa thẳng tắp,{' '}
                      <span className="font-bold text-sky-300">hai đường thẳng song song không bao giờ cắt nhau</span>. Em còn sẽ khám phá bí kíp tìm{' '}
                      <span className="font-bold text-emerald-300">1 cạnh song song với nhiều cạnh</span> và vẽ song song bằng 2 bước Ê Ke!&rdquo;
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-indigo-950/80 border border-sky-400/40 rounded-xl p-2.5 text-center">
                        <div className="text-[11px] font-bold text-sky-300">Kiến thức mở rộng</div>
                        <div className="text-xs font-extrabold text-white mt-0.5">Nhiều cạnh song song</div>
                      </div>
                      <div className="bg-indigo-950/80 border border-emerald-400/40 rounded-xl p-2.5 text-center">
                        <div className="text-[11px] font-bold text-emerald-300">Kĩ thuật vẽ chuẩn</div>
                        <div className="text-xs font-extrabold text-white mt-0.5">2 bước với Ê Ke</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigateTo('par-guide')}
                      className="btn-3d-gold w-full py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer"
                    >
                      ✨ Bài học 2 bước vẽ song song bằng Ê Ke
                    </button>
                  </>
                ) : (
                  <>
                    <div className="bg-[#090621] rounded-2xl p-3.5 border border-fuchsia-400/40 text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
                      &ldquo;Chào em! Tớ là <span className="font-bold text-yellow-300">Robot Toán Học</span>! Cùng tớ khám phá{' '}
                      <span className="font-bold text-sky-300">Hình bình hành</span> (đuôi chú gà xếp hình) và{' '}
                      <span className="font-bold text-fuchsia-300">Hình thoi</span> (kim nam châm la bàn), kéo thanh trượt độ dài cạnh và làm chủ công thức{' '}
                      <span className="font-bold text-yellow-300">Chu vi Lớp 4</span> nhé!&rdquo;
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-indigo-950/80 border border-sky-400/40 rounded-xl p-2.5 text-center">
                        <div className="text-[11px] font-bold text-sky-300">Chu vi Hình bình hành</div>
                        <div className="text-xs font-mono-num font-extrabold text-white mt-0.5">P = (a + b) × 2</div>
                      </div>
                      <div className="bg-indigo-950/80 border border-fuchsia-400/40 rounded-xl p-2.5 text-center">
                        <div className="text-[11px] font-bold text-fuchsia-300">Chu vi Hình thoi</div>
                        <div className="text-xs font-mono-num font-extrabold text-white mt-0.5">P = a × 4</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigateTo('shapes-guide')}
                      className="btn-3d-gold w-full py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer"
                    >
                      ✨ Cẩm nang đặc điểm và Chu vi Lớp 4
                    </button>
                  </>
                )}
              </div>

              {/* CENTER ZONE: Open Negative Space Viewport for 3D Robot, Planets & 3D Hologram */}
              <div className="lg:col-span-4 min-h-[210px] sm:min-h-[270px] flex flex-col items-center justify-end pointer-events-none">
                <div className="pointer-events-auto bg-[#0B0726]/90 border border-indigo-400/40 rounded-2xl px-4 py-2 text-center shadow-xl">
                  <div className="text-xs font-bold text-indigo-200">
                    {activeTopic === 'angles'
                      ? 'ĐÀI QUAN SÁT GÓC 3D TRUNG TÂM'
                      : activeTopic === 'perpendicular'
                        ? 'MÔ HÌNH 3D · HAI ĐƯỜNG THẲNG VUÔNG GÓC'
                        : activeTopic === 'parallel'
                          ? 'MÔ HÌNH 3D · HAI ĐƯỜNG THẲNG SONG SONG'
                          : 'MÔ HÌNH 3D · HÌNH THOI, HÌNH BÌNH HÀNH'}
                  </div>
                  <div className="text-lg font-extrabold font-mono-num text-yellow-300">
                    {activeTopic === 'angles'
                      ? `Góc hiện tại: ${activeAngleDeg}°`
                      : activeTopic === 'perpendicular'
                        ? '4 góc vuông (90°) · Thước Ê Ke'
                        : activeTopic === 'parallel'
                          ? 'Không bao giờ cắt nhau · Đường ray 3D'
                          : 'Cạnh đối song song · Chu vi Lớp 4'}
                  </div>
                </div>
              </div>

              {/* RIGHT ZONE: 4 Large 3D Feature Buttons for the Active Topic */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                {activeTopic === 'angles' ? (
                  <>
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
                          Đơn vị độ (°), cấu tạo thước đo góc, lỗi thường gặp và Huy hiệu
                        </div>
                      </div>
                    </button>
                  </>
                ) : activeTopic === 'perpendicular' ? (
                  <>
                    <button
                      type="button"
                      data-testid="btn-perp-explore"
                      onClick={() => navigateTo('perp-explore')}
                      className="btn-3d-cobalt w-full p-4 rounded-2xl text-left flex items-center gap-3.5 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl shrink-0">
                        🪁
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-extrabold text-white">
                          1. KHÁM PHÁ VUÔNG GÓC
                        </div>
                        <div className="text-xs text-indigo-100">
                          Tìm góc vuông quanh em, hiểu 4 góc vuông và cách đọc tên hai cạnh vuông góc
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      data-testid="btn-perp-lab"
                      data-start="true"
                      onClick={() => navigateTo('perp-lab')}
                      className="btn-3d-pink w-full p-4 rounded-2xl text-left flex items-center gap-3.5 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl shrink-0">
                        📐
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-extrabold text-white">
                          2. PHÒNG THÍ NGHIỆM Ê KE
                        </div>
                        <div className="text-xs text-pink-100">
                          Kéo xoay Ê Ke: Kiểm tra góc vuông trên hình và Vẽ đường thẳng vuông góc
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      data-testid="btn-perp-challenge"
                      onClick={() => navigateTo('perp-challenge')}
                      className="btn-3d-emerald w-full p-4 rounded-2xl text-left flex items-center gap-3.5 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl shrink-0">
                        🏆
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-extrabold text-white">
                          3. THỬ THÁCH VUÔNG GÓC
                        </div>
                        <div className="text-xs text-emerald-100">
                          Chinh phục 3 hành tinh · 26 bài tập nhận biết, đọc tên và thực hành Ê Ke
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      data-testid="btn-perp-guide"
                      onClick={() => navigateTo('perp-guide')}
                      className="btn-3d-gold w-full p-4 rounded-2xl text-left flex items-center gap-3.5 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-900/15 flex items-center justify-center text-2xl shrink-0">
                        📖
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-extrabold text-slate-950">
                          4. BÀI HỌC 2 BƯỚC VẼ Ê KE
                        </div>
                        <div className="text-xs font-semibold text-slate-800">
                          Hướng dẫn vẽ đường vuông góc, công thức đọc tên, ghi nhớ và lỗi cần tránh
                        </div>
                      </div>
                    </button>
                  </>
                ) : activeTopic === 'parallel' ? (
                  <>
                    <button
                      type="button"
                      data-testid="btn-par-explore"
                      onClick={() => navigateTo('par-explore')}
                      className="btn-3d-cobalt w-full p-4 rounded-2xl text-left flex items-center gap-3.5 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl shrink-0">
                        🛤️
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-extrabold text-white">
                          1. KHÁM PHÁ SONG SONG
                        </div>
                        <div className="text-xs text-indigo-100">
                          Tìm đường song song quanh em, cách đọc tên và 1 cạnh song song với nhiều cạnh
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      data-testid="btn-par-lab"
                      data-start="true"
                      onClick={() => navigateTo('par-lab')}
                      className="btn-3d-pink w-full p-4 rounded-2xl text-left flex items-center gap-3.5 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl shrink-0">
                        📐
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-extrabold text-white">
                          2. THÍ NGHIỆM SONG SONG
                        </div>
                        <div className="text-xs text-pink-100">
                          Vẽ đường song song 2 bước bằng Ê Ke và tìm tất cả cạnh song song trong hình
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      data-testid="btn-par-challenge"
                      onClick={() => navigateTo('par-challenge')}
                      className="btn-3d-emerald w-full p-4 rounded-2xl text-left flex items-center gap-3.5 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl shrink-0">
                        🏆
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-extrabold text-white">
                          3. THỬ THÁCH SONG SONG
                        </div>
                        <div className="text-xs text-emerald-100">
                          Chinh phục 3 hành tinh · 29 bài tập đồ vật, hình bình hành, hình thang, hình thoi và vẽ Ê Ke
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      data-testid="btn-par-guide"
                      onClick={() => navigateTo('par-guide')}
                      className="btn-3d-gold w-full p-4 rounded-2xl text-left flex items-center gap-3.5 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-900/15 flex items-center justify-center text-2xl shrink-0">
                        📖
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-extrabold text-slate-950">
                          4. BÀI HỌC VẼ SONG SONG
                        </div>
                        <div className="text-xs font-semibold text-slate-800">
                          Hướng dẫn vẽ CD song song AB bằng Ê Ke, công thức đọc tên và lỗi cần tránh
                        </div>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      data-testid="btn-shapes-explore"
                      onClick={() => navigateTo('shapes-explore')}
                      className="btn-3d-cobalt w-full p-4 rounded-2xl text-left flex items-center gap-3.5 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl shrink-0">
                        🔷
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-extrabold text-white">
                          1. KHÁM PHÁ HAI HÌNH
                        </div>
                        <div className="text-xs text-indigo-100">
                          Chú gà xếp hình, kim la bàn, đặc điểm hai hình và công thức Chu vi Lớp 4
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      data-testid="btn-shapes-lab"
                      data-start="true"
                      onClick={() => navigateTo('shapes-lab')}
                      className="btn-3d-pink w-full p-4 rounded-2xl text-left flex items-center gap-3.5 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl shrink-0">
                        🎚️
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-extrabold text-white">
                          2. THÍ NGHIỆM KÉO CẠNH VÀ XOAY
                        </div>
                        <div className="text-xs text-pink-100">
                          Kéo thanh trượt cạnh, xoay hình 360° nhiều hướng và xem chu vi cập nhật tức thì
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      data-testid="btn-shapes-challenge"
                      onClick={() => navigateTo('shapes-challenge')}
                      className="btn-3d-emerald w-full p-4 rounded-2xl text-left flex items-center gap-3.5 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl shrink-0">
                        🏆
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-extrabold text-white">
                          3. THỬ THÁCH HAI HÌNH
                        </div>
                        <div className="text-xs text-emerald-100">
                          Chinh phục 3 hành tinh · 26 bài tập nhận biết, tính Chu vi và dựng hình kéo cạnh
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      data-testid="btn-shapes-guide"
                      onClick={() => navigateTo('shapes-guide')}
                      className="btn-3d-gold w-full p-4 rounded-2xl text-left flex items-center gap-3.5 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-900/15 flex items-center justify-center text-2xl shrink-0">
                        📖
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-extrabold text-slate-950">
                          4. KIẾN THỨC VÀ CHU VI
                        </div>
                        <div className="text-xs font-semibold text-slate-800">
                          Tổng hợp đặc điểm, công thức Chu vi Hình bình hành, Hình thoi và ví dụ mẫu
                        </div>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Flat Bottom Control Hint Line */}
            <div className="text-center text-xs font-semibold text-indigo-300/90 pt-1">
              {activeTopic === 'angles'
                ? 'Kéo thả chuột / chạm cảm ứng để di chuyển thước đo góc · Nhấn Enter hoặc Space để vào nhanh Phòng Thí Nghiệm'
                : 'Chọn Chủ đề 1, 2, 3 hoặc 4 phía trên để chuyển đổi linh hoạt giữa Đo Góc, Vuông Góc, Song Song và Hình Thoi, Hình Bình Hành'}
            </div>
          </div>
        )}

        {/* CHỦ ĐỀ 1: GÓC VÀ ĐO GÓC */}
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

        {/* CHỦ ĐỀ 2: HAI ĐƯỜNG THẲNG VUÔNG GÓC */}
        {activeScreen === 'perp-explore' && (
          <PerpendicularExploreView
            onOpenLab={() => navigateTo('perp-lab')}
            onOpenGuide={() => navigateTo('perp-guide')}
            onBackHome={() => {
              setActiveTopic('perpendicular');
              navigateTo('home');
            }}
          />
        )}

        {activeScreen === 'perp-lab' && (
          <PerpendicularLabView
            onRecordSuccess={handleRecordPerpLabSuccess}
            onOpenGuide={() => navigateTo('perp-guide')}
            onBackHome={() => {
              setActiveTopic('perpendicular');
              navigateTo('home');
            }}
          />
        )}

        {activeScreen === 'perp-challenge' && (
          <PerpendicularChallengeView
            onFinishChallengeLevel={handleFinishPerpChallengeLevel}
            onBackHome={() => {
              setActiveTopic('perpendicular');
              navigateTo('home');
            }}
          />
        )}

        {activeScreen === 'perp-guide' && (
          <PerpendicularGuideView
            onCompleteGuide={handleCompletePerpGuide}
            onOpenLab={() => navigateTo('perp-lab')}
            onBackHome={() => {
              setActiveTopic('perpendicular');
              navigateTo('home');
            }}
          />
        )}

        {/* CHỦ ĐỀ 3: HAI ĐƯỜNG THẲNG SONG SONG */}
        {activeScreen === 'par-explore' && (
          <ParallelExploreView
            onCompleteExplore={handleCompleteParExplore}
            onGoLab={() => navigateTo('par-lab')}
            onBackHome={() => {
              setActiveTopic('parallel');
              navigateTo('home');
            }}
          />
        )}

        {activeScreen === 'par-lab' && (
          <ParallelLabView
            onCompleteLabAction={handleRecordParLabSuccess}
            onBackHome={() => {
              setActiveTopic('parallel');
              navigateTo('home');
            }}
          />
        )}

        {activeScreen === 'par-challenge' && (
          <ParallelChallengeView
            onFinishChallengeLevel={handleFinishParChallengeLevel}
            onBackHome={() => {
              setActiveTopic('parallel');
              navigateTo('home');
            }}
          />
        )}

        {activeScreen === 'par-guide' && (
          <ParallelGuideView
            onCompleteGuide={handleCompleteParGuide}
            onGoLab={() => navigateTo('par-lab')}
            onBackHome={() => {
              setActiveTopic('parallel');
              navigateTo('home');
            }}
          />
        )}

        {/* CHỦ ĐỀ 4: HÌNH THOI, HÌNH BÌNH HÀNH */}
        {activeScreen === 'shapes-explore' && (
          <ShapesExploreView
            onCompleteExplore={handleCompleteShapesExplore}
            onGoLab={() => navigateTo('shapes-lab')}
            onBackHome={() => {
              setActiveTopic('shapes');
              navigateTo('home');
            }}
          />
        )}

        {activeScreen === 'shapes-lab' && (
          <ShapesLabView
            onCompleteLabAction={handleRecordShapesLabSuccess}
            onBackHome={() => {
              setActiveTopic('shapes');
              navigateTo('home');
            }}
          />
        )}

        {activeScreen === 'shapes-challenge' && (
          <ShapesChallengeView
            onFinishChallengeLevel={handleFinishShapesChallengeLevel}
            onBackHome={() => {
              setActiveTopic('shapes');
              navigateTo('home');
            }}
          />
        )}

        {activeScreen === 'shapes-guide' && (
          <ShapesGuideView
            onCompleteGuide={handleCompleteShapesGuide}
            onGoLab={() => navigateTo('shapes-lab')}
            onBackHome={() => {
              setActiveTopic('shapes');
              navigateTo('home');
            }}
          />
        )}
      </main>
    </div>
  );
}

