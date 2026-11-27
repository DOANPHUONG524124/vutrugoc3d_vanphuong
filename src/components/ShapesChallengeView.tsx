import React, { useMemo, useState } from 'react';
import { calculateStarReward } from '../utils/challengeGenerator';
import {
  calculateParallelogramPerimeter,
  calculateRhombusPerimeter,
  computeParallelogramVertices,
  computeRhombusVertices,
  computeSafePxPerCm,
  evaluateShapesLabMission,
  getOutwardVertexLabelPos,
  getShapesQuestionsByLevel,
  rotateQuadVertices,
  SHAPES_LAB_MISSIONS,
  ShapesChallengeLevel,
  ShapesChallengeQuestion,
  ShapesDiagramPreset,
} from '../utils/shapesMath';
import { computeQuizSeed, shuffleQuizQuestions } from '../utils/quizShuffle';
import { soundFX } from '../utils/soundEffects';

interface ShapesChallengeViewProps {
  quizSeed?: number;
  onBackHome: () => void;
  onFinishChallengeLevel: (
    level: ShapesChallengeLevel,
    score: number,
    starsEarned: number
  ) => void;
}

const ShapesDiagramSVG: React.FC<{ preset: ShapesDiagramPreset }> = ({ preset }) => {
  switch (preset) {
    case 'tangram_rooster_para':
      return (
        <svg viewBox="0 0 380 220" className="w-full h-auto block">
          <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
          <polygon points="108,82 134,58 160,82" fill="#EF4444" stroke="#0F172A" strokeWidth="2" />
          <polygon points="124,82 158,82 158,116 124,116" fill="#F97316" stroke="#0F172A" strokeWidth="2" />
          <polygon points="124,116 236,116 180,172" fill="#10B981" stroke="#0F172A" strokeWidth="2" />
          <polygon points="154,146 180,172 142,172" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
          <polygon points="180,172 180,202 148,202" fill="#0284C7" stroke="#0F172A" strokeWidth="2" />
          {/* Red tail highlighted neutrally with yellow dashed pointer */}
          <polygon points="210,116 242,84 294,84 262,116" fill="#F43F5E" stroke="#FACC15" strokeWidth="3.5" />
          <line x1="274" y1="68" x2="256" y2="90" stroke="#FACC15" strokeWidth="2.5" strokeDasharray="4 3" />
          <text x="292" y="64" textAnchor="middle" fill="#FDE047" fontSize="13" fontWeight="900">
            Đuôi chú gà (?)
          </text>
        </svg>
      );

    case 'compass_needle_rhombus':
      return (
        <svg viewBox="0 0 380 220" className="w-full h-auto block">
          <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
          <circle cx="190" cy="110" r="84" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="8" />
          <circle cx="190" cy="110" r="74" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <text x="190" y="54" textAnchor="middle" fill="#0F172A" fontSize="15" fontWeight="900">N</text>
          <text x="190" y="176" textAnchor="middle" fill="#0F172A" fontSize="15" fontWeight="900">S</text>
          <text x="130" y="115" textAnchor="middle" fill="#0F172A" fontSize="14" fontWeight="900">W</text>
          <text x="250" y="115" textAnchor="middle" fill="#0F172A" fontSize="14" fontWeight="900">E</text>
          <g transform="rotate(-16 190 110)">
            <polygon points="190,40 205,110 190,110 175,110" fill="#2563EB" />
            <polygon points="190,180 205,110 190,110 175,110" fill="#EF4444" />
            <polygon points="190,40 205,110 190,180 175,110" fill="none" stroke="#10B981" strokeWidth="3.5" />
            <circle cx="190" cy="110" r="4.5" fill="#FACC15" stroke="#0F172A" strokeWidth="1.5" />
          </g>
        </svg>
      );

    case 'grid_parallelogram_abcd':
      return (
        <svg viewBox="0 0 380 220" className="w-full h-auto block">
          <defs>
            <pattern id="q-para-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
          <rect x="24" y="16" width="332" height="168" fill="url(#q-para-grid)" stroke="rgba(148,163,184,0.3)" />
          <polygon points="120,40 312,40 264,160 72,160" fill="rgba(56,189,248,0.16)" stroke="#38BDF8" strokeWidth="4" />
          {[
            { l: 'A', x: 120, y: 40, tx: 108, ty: 32 },
            { l: 'B', x: 312, y: 40, tx: 322, ty: 34 },
            { l: 'C', x: 264, y: 160, tx: 274, ty: 176 },
            { l: 'D', x: 72, y: 160, tx: 56, ty: 176 },
          ].map((v) => (
            <g key={v.l}>
              <circle cx={v.x} cy={v.y} r="4.5" fill="#FACC15" />
              <text x={v.tx} y={v.ty} fill="#FFFFFF" fontSize="18" fontWeight="900">{v.l}</text>
            </g>
          ))}
          <text x="190" y="206" textAnchor="middle" fill="#BAE6FD" fontSize="13" fontWeight="800">
            Hình bình hành ABCD
          </text>
        </svg>
      );

    case 'grid_rhombus_abcd':
      return (
        <svg viewBox="0 0 380 220" className="w-full h-auto block">
          <defs>
            <pattern id="q-rhom-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
          <rect x="24" y="16" width="332" height="168" fill="url(#q-rhom-grid)" stroke="rgba(148,163,184,0.3)" />
          <polygon points="72,100 190,40 308,100 190,160" fill="rgba(232,121,249,0.16)" stroke="#E879F9" strokeWidth="4" />
          {[
            { l: 'A', x: 72, y: 100, tx: 52, ty: 106 },
            { l: 'B', x: 190, y: 40, tx: 184, ty: 32 },
            { l: 'C', x: 308, y: 100, tx: 318, ty: 106 },
            { l: 'D', x: 190, y: 160, tx: 184, ty: 180 },
          ].map((v) => (
            <g key={v.l}>
              <circle cx={v.x} cy={v.y} r="4.5" fill="#FACC15" />
              <text x={v.tx} y={v.ty} fill="#FFFFFF" fontSize="18" fontWeight="900">{v.l}</text>
            </g>
          ))}
          <text x="190" y="206" textAnchor="middle" fill="#F5D0FE" fontSize="13" fontWeight="800">
            Hình thoi ABCD
          </text>
        </svg>
      );

    case 'compare_para_vs_rhombus':
      return (
        <svg viewBox="0 0 380 220" className="w-full h-auto block">
          <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
          <polygon points="56,66 168,66 144,148 32,148" fill="rgba(56,189,248,0.18)" stroke="#38BDF8" strokeWidth="4" />
          <text x="100" y="182" textAnchor="middle" fill="#7DD3FC" fontSize="13" fontWeight="800">
            Hình bình hành
          </text>
          <polygon points="222,108 286,58 350,108 286,158" fill="rgba(232,121,249,0.18)" stroke="#E879F9" strokeWidth="4" />
          <text x="286" y="182" textAnchor="middle" fill="#F5D0FE" fontSize="13" fontWeight="800">
            Hình thoi
          </text>
        </svg>
      );

    case 'real_lattice_fence_rhombus':
      return (
        <svg viewBox="0 0 380 220" className="w-full h-auto block">
          <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
          <rect x="44" y="24" width="292" height="168" rx="8" fill="#1E293B" stroke="#94A3B8" strokeWidth="5" />
          {[0, 1, 2, 3].map((col) =>
            [0, 1].map((row) => {
              const cx = 92 + col * 64;
              const cy = 70 + row * 74;
              return (
                <polygon
                  key={`${col}-${row}`}
                  points={`${cx},${cy - 34} ${cx + 28},${cy} ${cx},${cy + 34} ${cx - 28},${cy}`}
                  fill={col === 1 && row === 0 ? 'rgba(250,204,21,0.22)' : 'none'}
                  stroke={col === 1 && row === 0 ? '#FACC15' : '#38BDF8'}
                  strokeWidth={col === 1 && row === 0 ? '4' : '2.5'}
                />
              );
            })
          )}
          <text x="190" y="210" textAnchor="middle" fill="#E2E8F0" fontSize="12" fontWeight="800">
            Ô lưới sắt mắt cáo trên cánh cổng
          </text>
        </svg>
      );

    case 'real_traffic_sign_rhombus':
      return (
        <svg viewBox="0 0 380 220" className="w-full h-auto block">
          <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
          <rect x="184" y="152" width="12" height="58" fill="#94A3B8" />
          <polygon points="190,22 256,88 190,154 124,88" fill="#FACC15" stroke="#0F172A" strokeWidth="5" />
          <polygon points="190,34 244,88 190,142 136,88" fill="none" stroke="#0F172A" strokeWidth="2.5" />
          <text x="190" y="99" textAnchor="middle" fill="#0F172A" fontSize="34" fontWeight="900">!</text>
        </svg>
      );

    case 'four_quads_identify':
      return (
        <svg viewBox="0 0 380 220" className="w-full h-auto block">
          <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
          {/* Neutral uniform cyan borders so color never gives away the answer */}
          {/* 1: Parallelogram */}
          <polygon points="44,34 150,34 126,90 20,90" fill="rgba(148,163,184,0.14)" stroke="#E2E8F0" strokeWidth="3" />
          <text x="85" y="68" textAnchor="middle" fill="#FACC15" fontSize="16" fontWeight="900">1</text>

          {/* 2: Trapezoid */}
          <polygon points="240,34 320,34 352,90 208,90" fill="rgba(148,163,184,0.14)" stroke="#E2E8F0" strokeWidth="3" />
          <text x="280" y="68" textAnchor="middle" fill="#FACC15" fontSize="16" fontWeight="900">2</text>

          {/* 3: Rhombus */}
          <polygon points="36,158 92,118 148,158 92,198" fill="rgba(148,163,184,0.14)" stroke="#E2E8F0" strokeWidth="3" />
          <text x="92" y="164" textAnchor="middle" fill="#FACC15" fontSize="16" fontWeight="900">3</text>

          {/* 4: Irregular Quadrilateral */}
          <polygon points="224,132 336,120 348,194 212,184" fill="rgba(148,163,184,0.14)" stroke="#E2E8F0" strokeWidth="3" />
          <text x="282" y="164" textAnchor="middle" fill="#FACC15" fontSize="16" fontWeight="900">4</text>
        </svg>
      );

    case 'para_perimeter_6_4':
    case 'para_perimeter_9_5':
    case 'para_unit_convert_dm_cm':
    case 'para_inverse_perimeter_30': {
      const topLabel =
        preset === 'para_perimeter_6_4'
          ? '6 cm'
          : preset === 'para_perimeter_9_5'
            ? '9 cm'
            : preset === 'para_unit_convert_dm_cm'
              ? '2 dm'
              : '10 cm';
      const sideLabel =
        preset === 'para_perimeter_6_4'
          ? '4 cm'
          : preset === 'para_perimeter_9_5'
            ? '5 cm'
            : preset === 'para_unit_convert_dm_cm'
              ? '15 cm'
              : '? cm';
      const subText =
        preset === 'para_inverse_perimeter_30'
          ? 'Biết Chu vi P = 30 cm · Tìm cạnh bên AD'
          : 'Tính Chu vi Hình bình hành ABCD';

      return (
        <svg viewBox="0 0 380 220" className="w-full h-auto block">
          <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
          <polygon points="116,50 304,50 264,158 76,158" fill="rgba(56,189,248,0.18)" stroke="#38BDF8" strokeWidth="4.5" />
          <text x="104" y="42" fill="#FFFFFF" fontSize="16" fontWeight="900">A</text>
          <text x="312" y="44" fill="#FFFFFF" fontSize="16" fontWeight="900">B</text>
          <text x="272" y="174" fill="#FFFFFF" fontSize="16" fontWeight="900">C</text>
          <text x="58" y="174" fill="#FFFFFF" fontSize="16" fontWeight="900">D</text>

          <rect x="178" y="20" width="64" height="24" rx="7" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
          <text x="210" y="37" textAnchor="middle" fill="#7DD3FC" fontSize="14" fontWeight="900">{topLabel}</text>

          <rect x="28" y="92" width="60" height="24" rx="7" fill="#0F172A" stroke="#F472B6" strokeWidth="1.5" />
          <text x="58" y="109" textAnchor="middle" fill="#F9A8D4" fontSize="14" fontWeight="900">{sideLabel}</text>

          <text x="190" y="204" textAnchor="middle" fill="#FDE047" fontSize="13" fontWeight="800">
            {subText}
          </text>
        </svg>
      );
    }

    case 'rhombus_perimeter_7':
    case 'rhombus_inverse_32':
    case 'rhombus_kite_ribbon_15':
    case 'rhombus_garden_fence_12': {
      const sideLabel =
        preset === 'rhombus_perimeter_7'
          ? '7 cm'
          : preset === 'rhombus_kite_ribbon_15'
            ? '15 cm'
            : preset === 'rhombus_garden_fence_12'
              ? '12 m'
              : '? cm';
      const footer =
        preset === 'rhombus_inverse_32'
          ? 'Khung hình thoi có Chu vi P = 32 cm'
          : preset === 'rhombus_kite_ribbon_15'
            ? 'Con diều hình thoi cạnh 15 cm'
            : preset === 'rhombus_garden_fence_12'
              ? 'Bồn hoa hình thoi cạnh 12 m'
              : 'Hình thoi MNPQ · 4 cạnh bằng nhau';

      return (
        <svg viewBox="0 0 380 220" className="w-full h-auto block">
          <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
          <polygon
            points="92,106 190,36 288,106 190,176"
            fill={preset === 'rhombus_garden_fence_12' ? 'rgba(34,197,94,0.22)' : 'rgba(232,121,249,0.2)'}
            stroke={preset === 'rhombus_garden_fence_12' ? '#34D399' : '#E879F9'}
            strokeWidth="4.5"
          />
          {preset === 'rhombus_kite_ribbon_15' && (
            <path d="M 190 176 Q 210 194 185 208" fill="none" stroke="#FACC15" strokeWidth="3" />
          )}
          <rect x="92" y="42" width="60" height="24" rx="7" fill="#0F172A" stroke="#FACC15" strokeWidth="1.5" />
          <text x="122" y="59" textAnchor="middle" fill="#FDE047" fontSize="14" fontWeight="900">{sideLabel}</text>
          <text x="190" y="206" textAnchor="middle" fill="#E2E8F0" fontSize="13" fontWeight="800">
            {footer}
          </text>
        </svg>
      );
    }

    case 'compare_perimeters_two_shapes':
      return (
        <svg viewBox="0 0 380 220" className="w-full h-auto block">
          <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
          <polygon points="56,64 166,64 146,140 36,140" fill="rgba(56,189,248,0.18)" stroke="#38BDF8" strokeWidth="4" />
          <text x="110" y="54" textAnchor="middle" fill="#7DD3FC" fontSize="13" fontWeight="900">8 cm</text>
          <text x="24" y="108" textAnchor="middle" fill="#F9A8D4" fontSize="13" fontWeight="900">4 cm</text>
          <text x="100" y="176" textAnchor="middle" fill="#E0F2FE" fontSize="12" fontWeight="800">Hình bình hành</text>

          <polygon points="224,104 286,52 348,104 286,156" fill="rgba(232,121,249,0.18)" stroke="#E879F9" strokeWidth="4" />
          <text x="246" y="70" textAnchor="middle" fill="#FDE047" fontSize="13" fontWeight="900">6 cm</text>
          <text x="286" y="176" textAnchor="middle" fill="#F5D0FE" fontSize="12" fontWeight="800">Hình thoi</text>
        </svg>
      );

    case 'para_tilt_invariant':
    default:
      return (
        <svg viewBox="0 0 380 220" className="w-full h-auto block">
          <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
          {/* Original rectangle */}
          <rect x="30" y="64" width="112" height="80" fill="rgba(56,189,248,0.16)" stroke="#38BDF8" strokeWidth="3.5" />
          <text x="86" y="54" textAnchor="middle" fill="#7DD3FC" fontSize="12" fontWeight="900">7 cm</text>
          <text x="16" y="108" textAnchor="middle" fill="#F9A8D4" fontSize="12" fontWeight="900">5 cm</text>

          {/* Arrow */}
          <text x="176" y="110" textAnchor="middle" fill="#FACC15" fontSize="24" fontWeight="900">→</text>

          {/* Tilted parallelogram */}
          <polygon points="234,64 346,64 322,144 210,144" fill="rgba(244,114,182,0.18)" stroke="#F472B6" strokeWidth="3.5" />
          <text x="290" y="54" textAnchor="middle" fill="#7DD3FC" fontSize="12" fontWeight="900">7 cm</text>
          <text x="202" y="108" textAnchor="middle" fill="#F9A8D4" fontSize="12" fontWeight="900">5 cm</text>

          <text x="190" y="192" textAnchor="middle" fill="#FDE047" fontSize="13" fontWeight="800">
            Độ dài 4 thanh gỗ giữ nguyên khi bị xô nghiêng!
          </text>
        </svg>
      );
  }
};

export const ShapesChallengeView: React.FC<ShapesChallengeViewProps> = ({
  quizSeed = 1,
  onBackHome,
  onFinishChallengeLevel,
}) => {
  const [phase, setPhase] = useState<'hub' | 'playing_mcq' | 'playing_lvl3' | 'summary'>('hub');
  const [selectedLevel, setSelectedLevel] = useState<ShapesChallengeLevel>(1);
  const [attemptNonce, setAttemptNonce] = useState<number>(0);

  // MCQ state (Levels 1 & 2)
  const [questions, setQuestions] = useState<ShapesChallengeQuestion[]>([]);
  const [qIdx, setQIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);

  // Level 3 Interactive Slider Construction State (6 missions)
  const [lvl3Idx, setLvl3Idx] = useState<number>(0);
  const [lvl3SideA, setLvl3SideA] = useState<number>(4);
  const [lvl3SideB, setLvl3SideB] = useState<number>(3);
  const [lvl3AngleDeg, setLvl3AngleDeg] = useState<number>(65);
  const [lvl3RotationDeg, setLvl3RotationDeg] = useState<number>(0);
  const [lvl3Checked, setLvl3Checked] = useState<boolean>(false);
  const [lvl3Correct, setLvl3Correct] = useState<boolean>(false);
  const [lvl3Feedback, setLvl3Feedback] = useState<string>('');
  const [lvl3ShowHint, setLvl3ShowHint] = useState<boolean>(false);

  const startLevel = (lvl: ShapesChallengeLevel) => {
    soundFX.playClick(1.15);
    const nextAttempt = attemptNonce + 1;
    setAttemptNonce(nextAttempt);
    setSelectedLevel(lvl);
    setScore(0);

    if (lvl === 1 || lvl === 2) {
      const qs = shuffleQuizQuestions(
        getShapesQuestionsByLevel(lvl),
        computeQuizSeed(quizSeed, lvl, nextAttempt, 401)
      );
      setQuestions(qs);
      setQIdx(0);
      setSelectedOption(null);
      setPhase('playing_mcq');
    } else {
      const first = SHAPES_LAB_MISSIONS[0];
      setLvl3Idx(0);
      setLvl3SideA(first.initialSideA);
      setLvl3SideB(first.initialSideB);
      setLvl3AngleDeg(first.initialAngleDeg);
      setLvl3RotationDeg(0);
      setLvl3Checked(false);
      setLvl3Correct(false);
      setLvl3Feedback('');
      setLvl3ShowHint(false);
      setPhase('playing_lvl3');
    }
  };

  const handleAnswerMcq = (optIdx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optIdx);
    const currentQ = questions[qIdx];
    if (optIdx === currentQ.correctOptionIndex) {
      soundFX.playSuccess();
      setScore((s) => s + 1);
    } else {
      soundFX.playWrong();
    }
  };

  const handleNextMcq = () => {
    soundFX.playClick();
    if (qIdx + 1 < questions.length) {
      setQIdx((i) => i + 1);
      setSelectedOption(null);
    } else {
      const stars = calculateStarReward(score, questions.length);
      onFinishChallengeLevel(selectedLevel, score, stars);
      setPhase('summary');
    }
  };

  const activeLvl3Mission = SHAPES_LAB_MISSIONS[lvl3Idx];
  const lvl3Vertices = useMemo(() => {
    if (!activeLvl3Mission) {
      return computeParallelogramVertices(6, 4, 65, 250, 145, 20);
    }
    const px = computeSafePxPerCm(
      activeLvl3Mission.shapeType,
      lvl3SideA,
      lvl3SideB,
      lvl3AngleDeg,
      98,
      22
    );
    const base =
      activeLvl3Mission.shapeType === 'parallelogram'
        ? computeParallelogramVertices(lvl3SideA, lvl3SideB, lvl3AngleDeg, 250, 145, px)
        : computeRhombusVertices(lvl3SideA, lvl3AngleDeg, 250, 145, px);
    return rotateQuadVertices(base, lvl3RotationDeg, 250, 145);
  }, [activeLvl3Mission, lvl3SideA, lvl3SideB, lvl3AngleDeg, lvl3RotationDeg]);

  const handleCheckLvl3 = () => {
    if (lvl3Checked && lvl3Correct) return;
    const res = evaluateShapesLabMission(activeLvl3Mission, lvl3SideA, lvl3SideB);
    setLvl3Checked(true);
    setLvl3Correct(res.isMatched);
    setLvl3Feedback(res.feedbackVi);
    if (res.isMatched) {
      soundFX.playSuccess();
      setScore((s) => s + 1);
    } else {
      soundFX.playWrong();
    }
  };

  const handleNextLvl3 = () => {
    soundFX.playClick();
    if (lvl3Idx + 1 < SHAPES_LAB_MISSIONS.length) {
      const nextM = SHAPES_LAB_MISSIONS[lvl3Idx + 1];
      setLvl3Idx(lvl3Idx + 1);
      setLvl3SideA(nextM.initialSideA);
      setLvl3SideB(nextM.initialSideB);
      setLvl3AngleDeg(nextM.initialAngleDeg);
      setLvl3RotationDeg(0);
      setLvl3Checked(false);
      setLvl3Correct(false);
      setLvl3Feedback('');
      setLvl3ShowHint(false);
    } else {
      const stars = calculateStarReward(score, SHAPES_LAB_MISSIONS.length);
      onFinishChallengeLevel(3, score, stars);
      setPhase('summary');
    }
  };

  const totalCount =
    selectedLevel === 3 ? SHAPES_LAB_MISSIONS.length : questions.length || 10;

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            if (phase === 'hub') onBackHome();
            else setPhase('hub');
          }}
          className="btn-3d-cobalt px-4 py-2 rounded-xl text-sm font-extrabold cursor-pointer"
        >
          {phase === 'hub' ? '← Trang Chủ' : '← Chọn Cấp Độ'}
        </button>

        <div className="text-center">
          <div className="text-xs font-extrabold text-fuchsia-300 uppercase tracking-wider">
            CHỦ ĐỀ 4 · HÌNH THOI, HÌNH BÌNH HÀNH
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            3. THỬ THÁCH HÌNH BÌNH HÀNH VÀ HÌNH THOI
          </h2>
        </div>

        <div className="bg-[#130E38]/95 border border-yellow-400/50 rounded-xl px-3.5 py-1.5 text-xs font-extrabold text-yellow-300">
          26 Thử thách · 3 Hành tinh
        </div>
      </div>

      {/* HUB: 3 PLANET LEVELS */}
      {phase === 'hub' && (
        <div className="space-y-5">
          <div className="card-3d-cosmic rounded-2xl p-4 border-2 border-fuchsia-400/50 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-950 border-2 border-yellow-400 overflow-hidden shrink-0">
              <img
                src="/assets/aistudio/Th_m_ti_u____9352a9ad.png"
                alt="Robot Toán Học"
                className="w-full h-full object-cover scale-[1.35]"
              />
            </div>
            <p className="text-xs sm:text-sm text-indigo-100 font-medium leading-relaxed">
              <span className="font-extrabold text-yellow-300">Robot Toán Học: </span>
              Chào mừng em đến Đấu trường Chủ đề 4! Chọn một hành tinh bên dưới để thử sức nhận biết hình trong đời sống, tính chu vi chuẩn Toán lớp 4, và kéo thanh trượt dựng hình đạt Sao Vàng nhé!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Level 1 */}
            <div className="card-3d-cosmic rounded-3xl p-5 border-2 border-sky-400/60 flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">🪐</span>
                  <span className="text-xs font-extrabold bg-sky-500/20 text-sky-300 border border-sky-400/50 px-3 py-1 rounded-xl">
                    Cấp độ 1 · 10 câu
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  Nhà Du Hành Tập Sự
                </h3>
                <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                  Nhận biết hình bình hành và hình thoi qua chú gà xếp hình, kim la bàn, cổng lưới mắt cáo, biển báo và đặc điểm các cạnh đối diện.
                </p>
              </div>
              <button
                type="button"
                data-testid="shapes-start-level-1"
                onClick={() => startLevel(1)}
                className="btn-3d-cobalt w-full py-3 rounded-2xl font-extrabold text-sm cursor-pointer"
              >
                🚀 Bắt đầu Cấp độ 1
              </button>
            </div>

            {/* Level 2 */}
            <div className="card-3d-cosmic rounded-3xl p-5 border-2 border-fuchsia-400/60 flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">🌟</span>
                  <span className="text-xs font-extrabold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/50 px-3 py-1 rounded-xl">
                    Cấp độ 2 · 10 câu
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  Nhà Khoa Học Nhí
                </h3>
                <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                  Vận dụng công thức tính CHU VI hình bình hành, hình thoi, đổi đơn vị dm sang cm, bài toán ngược tìm cạnh và bài toán thực tế.
                </p>
              </div>
              <button
                type="button"
                data-testid="shapes-start-level-2"
                onClick={() => startLevel(2)}
                className="btn-3d-pink w-full py-3 rounded-2xl font-extrabold text-sm cursor-pointer"
              >
                🔬 Bắt đầu Cấp độ 2
              </button>
            </div>

            {/* Level 3 */}
            <div className="card-3d-cosmic rounded-3xl p-5 border-2 border-emerald-400/60 flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">🏆</span>
                  <span className="text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 px-3 py-1 rounded-xl">
                    Cấp độ 3 · 6 nhiệm vụ
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  Kiến Trúc Sư Kéo Cạnh
                </h3>
                <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                  Thực hành kéo thanh trượt độ dài cạnh trực tiếp để dựng chính xác hình bình hành và hình thoi theo kích thước và chu vi yêu cầu!
                </p>
              </div>
              <button
                type="button"
                data-testid="shapes-start-level-3"
                onClick={() => startLevel(3)}
                className="btn-3d-emerald w-full py-3 rounded-2xl font-extrabold text-sm cursor-pointer"
              >
                🎚️ Bắt đầu Cấp độ 3
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL 1 & LEVEL 2 MCQ GAMEPLAY */}
      {phase === 'playing_mcq' && questions[qIdx] && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Visual Diagram */}
          <div className="lg:col-span-5 card-3d-cosmic rounded-3xl p-5 border-2 border-indigo-400/60 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className="text-fuchsia-300 uppercase">
                {questions[qIdx].categoryLabelVi}
              </span>
              <span className="font-mono-num text-yellow-300">
                Câu {qIdx + 1} / {questions.length} · Điểm: {score}
              </span>
            </div>

            <div className="bg-[#0B0826] rounded-2xl p-2 border border-indigo-400/40">
              <ShapesDiagramSVG preset={questions[qIdx].diagramPreset} />
            </div>

            <div className="text-center text-xs font-extrabold text-sky-200">
              {questions[qIdx].badgeTitleVi}
            </div>
          </div>

          {/* Right Question & Options */}
          <div className="lg:col-span-7 card-3d-cosmic rounded-3xl p-5 border-2 border-fuchsia-400/60 flex flex-col justify-between gap-4">
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug">
                {questions[qIdx].promptVi}
              </h3>

              <div className="grid grid-cols-1 gap-2.5">
                {questions[qIdx].options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === questions[qIdx].correctOptionIndex;
                  let btnStyle =
                    'bg-[#130E38] border-indigo-400/50 text-white hover:border-yellow-400';
                  if (selectedOption !== null) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-500/25 border-emerald-400 text-emerald-100';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-500/25 border-rose-400 text-rose-100';
                    } else {
                      btnStyle = 'bg-[#130E38]/60 border-indigo-500/30 text-indigo-300 opacity-75';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={selectedOption !== null}
                      onClick={() => handleAnswerMcq(idx)}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left font-extrabold text-sm cursor-pointer transition-all flex items-center gap-3 ${btnStyle}`}
                    >
                      <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-mono-num shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {selectedOption !== null && (
                <div className="bg-indigo-950/90 border-2 border-yellow-400/60 rounded-2xl p-3.5 text-xs sm:text-sm text-indigo-100 leading-relaxed">
                  <span className="font-extrabold text-yellow-300">
                    {selectedOption === questions[qIdx].correctOptionIndex
                      ? '🎉 Chính xác! '
                      : '💡 Giải thích: '}
                  </span>
                  {questions[qIdx].explanationVi}
                </div>
              )}
            </div>

            {selectedOption !== null && (
              <button
                type="button"
                onClick={handleNextMcq}
                className="btn-3d-gold w-full py-3 rounded-2xl font-extrabold text-sm cursor-pointer"
              >
                {qIdx + 1 < questions.length ? 'Câu tiếp theo →' : '🏁 Xem kết quả'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* LEVEL 3: INTERACTIVE SLIDER CONSTRUCTION GAMEPLAY */}
      {phase === 'playing_lvl3' && activeLvl3Mission && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-7 card-3d-cosmic rounded-3xl p-5 border-2 border-emerald-400/60 space-y-3">
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className="text-emerald-300 uppercase">
                {activeLvl3Mission.badgeVi}
              </span>
              <span className="font-mono-num text-yellow-300">
                Nhiệm vụ {lvl3Idx + 1} / {SHAPES_LAB_MISSIONS.length} · Điểm: {score}
              </span>
            </div>

            <div className="bg-[#090621] rounded-2xl p-2 border border-indigo-400/40">
              <svg viewBox="0 0 500 290" className="w-full h-auto block">
                <defs>
                  <pattern id="lvl3-grid" width="22" height="22" patternUnits="userSpaceOnUse">
                    <path d="M 22 0 L 0 0 0 22" fill="none" stroke="rgba(129,140,248,0.16)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="500" height="290" rx="12" fill="url(#lvl3-grid)" />
                <polygon
                  points={`${lvl3Vertices.A.x},${lvl3Vertices.A.y} ${lvl3Vertices.B.x},${lvl3Vertices.B.y} ${lvl3Vertices.C.x},${lvl3Vertices.C.y} ${lvl3Vertices.D.x},${lvl3Vertices.D.y}`}
                  fill={
                    activeLvl3Mission.shapeType === 'parallelogram'
                      ? 'rgba(56,189,248,0.2)'
                      : 'rgba(232,121,249,0.22)'
                  }
                  stroke={
                    activeLvl3Mission.shapeType === 'parallelogram' ? '#38BDF8' : '#E879F9'
                  }
                  strokeWidth="5"
                />
                {(
                  [
                    { id: 'A', pt: lvl3Vertices.A },
                    { id: 'B', pt: lvl3Vertices.B },
                    { id: 'C', pt: lvl3Vertices.C },
                    { id: 'D', pt: lvl3Vertices.D },
                  ] as const
                ).map((v) => {
                  const lbl = getOutwardVertexLabelPos(v.pt, { x: 250, y: 145 }, 18);
                  return (
                    <g key={v.id}>
                      <circle cx={v.pt.x} cy={v.pt.y} r="5.5" fill="#FACC15" />
                      <text x={lbl.x} y={lbl.y + 5} textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900">
                        {v.id}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="bg-indigo-950/90 border border-yellow-400/50 rounded-xl p-3 text-center font-mono-num text-base font-extrabold text-yellow-300">
              {activeLvl3Mission.shapeType === 'parallelogram'
                ? `Hiện tại: a = ${lvl3SideA} cm, b = ${lvl3SideB} cm → Chu vi = ${calculateParallelogramPerimeter(lvl3SideA, lvl3SideB)} cm`
                : `Hiện tại: 4 cạnh a = ${lvl3SideA} cm → Chu vi = ${calculateRhombusPerimeter(lvl3SideA)} cm`}
            </div>
          </div>

          <div className="lg:col-span-5 card-3d-cosmic rounded-3xl p-5 border-2 border-indigo-400/60 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <h3 className="text-lg font-extrabold text-white">
                {activeLvl3Mission.titleVi}
              </h3>
              <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                {activeLvl3Mission.promptVi}
              </p>

              <div className="bg-[#090621] rounded-2xl p-4 border border-indigo-500/40 space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs sm:text-sm font-extrabold">
                    <span className="text-sky-300">
                      {activeLvl3Mission.shapeType === 'parallelogram'
                        ? 'Cạnh đáy a:'
                        : 'Cạnh hình thoi a:'}
                    </span>
                    <span className="text-white font-mono-num">{lvl3SideA} cm</span>
                  </div>
                  <input
                    type="range"
                    data-testid="shapes-lvl3-slider-a"
                    min={2}
                    max={10}
                    step={1}
                    value={lvl3SideA}
                    disabled={lvl3Correct}
                    onChange={(e) => {
                      setLvl3SideA(Number(e.target.value));
                      setLvl3Checked(false);
                    }}
                    className="w-full h-2.5 accent-sky-400 cursor-pointer"
                  />
                </div>

                {activeLvl3Mission.shapeType === 'parallelogram' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs sm:text-sm font-extrabold">
                      <span className="text-pink-300">Cạnh bên b:</span>
                      <span className="text-white font-mono-num">{lvl3SideB} cm</span>
                    </div>
                    <input
                      type="range"
                      data-testid="shapes-lvl3-slider-b"
                      min={2}
                      max={8}
                      step={1}
                      value={lvl3SideB}
                      disabled={lvl3Correct}
                      onChange={(e) => {
                        setLvl3SideB(Number(e.target.value));
                        setLvl3Checked(false);
                      }}
                      className="w-full h-2.5 accent-pink-400 cursor-pointer"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-indigo-500/30">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-amber-300">Độ nghiêng:</span>
                      <span className="text-yellow-300 font-mono-num">{lvl3AngleDeg}°</span>
                    </div>
                    <input
                      type="range"
                      min={45}
                      max={120}
                      step={5}
                      value={lvl3AngleDeg}
                      onChange={(e) => setLvl3AngleDeg(Number(e.target.value))}
                      className="w-full h-2 accent-yellow-400 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-emerald-300">🔄 Xoay hình:</span>
                      <span className="text-emerald-200 font-mono-num">{lvl3RotationDeg}°</span>
                    </div>
                    <input
                      type="range"
                      data-testid="shapes-lvl3-slider-rotation"
                      min={0}
                      max={360}
                      step={5}
                      value={lvl3RotationDeg}
                      onChange={(e) => setLvl3RotationDeg(Number(e.target.value))}
                      className="w-full h-2 accent-emerald-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {lvl3ShowHint && (
                <div className="bg-amber-500/15 border border-yellow-400/50 rounded-xl p-3 text-xs text-yellow-100 font-semibold">
                  💡 Gợi ý: {activeLvl3Mission.hintVi}
                </div>
              )}

              {lvl3Checked && (
                <div
                  className={`rounded-xl p-3 text-xs sm:text-sm font-bold border ${
                    lvl3Correct
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100'
                      : 'bg-rose-500/20 border-rose-400 text-rose-100'
                  }`}
                >
                  {lvl3Feedback}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {!lvl3Correct ? (
                <>
                  <button
                    type="button"
                    data-testid="shapes-lvl3-check-btn"
                    onClick={handleCheckLvl3}
                    className="btn-3d-emerald flex-1 py-2.5 px-4 rounded-xl font-extrabold text-sm cursor-pointer"
                  >
                    ✅ Kiểm tra hình dựng
                  </button>
                  <button
                    type="button"
                    onClick={() => setLvl3ShowHint((v) => !v)}
                    className="btn-3d-cobalt py-2.5 px-3.5 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer"
                  >
                    💡 Gợi ý
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleNextLvl3}
                  className="btn-3d-gold w-full py-3 rounded-xl font-extrabold text-sm cursor-pointer"
                >
                  {lvl3Idx + 1 < SHAPES_LAB_MISSIONS.length
                    ? 'Nhiệm vụ tiếp theo →'
                    : '🏁 Hoàn thành Cấp độ 3'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUMMARY SCREEN */}
      {phase === 'summary' && (
        <div className="max-w-2xl mx-auto card-3d-cosmic rounded-3xl p-6 border-2 border-yellow-400/70 text-center space-y-4">
          <div className="text-5xl">🏆</div>
          <h3 className="text-2xl font-extrabold text-white">
            Hoàn thành Cấp độ {selectedLevel}!
          </h3>
          <div className="text-lg font-mono-num font-extrabold text-yellow-300">
            Điểm số: {score} / {totalCount} · Nhận +{calculateStarReward(score, totalCount)} Sao Vàng ★
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => startLevel(selectedLevel)}
              className="btn-3d-pink px-5 py-2.5 rounded-xl font-extrabold text-sm cursor-pointer"
            >
              🔄 Làm lại cấp độ này
            </button>
            <button
              type="button"
              onClick={() => setPhase('hub')}
              className="btn-3d-cobalt px-5 py-2.5 rounded-xl font-extrabold text-sm cursor-pointer"
            >
              🪐 Chọn cấp độ khác
            </button>
            <button
              type="button"
              onClick={onBackHome}
              className="btn-3d-gold px-5 py-2.5 rounded-xl font-extrabold text-sm cursor-pointer"
            >
              🏠 Về Trang Chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
