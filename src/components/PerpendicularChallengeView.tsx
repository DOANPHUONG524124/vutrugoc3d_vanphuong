import React, { useMemo, useState } from 'react';
import { calculateStarReward } from '../utils/challengeGenerator';
import {
  computeSnapSetSquareState,
  evaluateSetSquareAlignment,
  getPerpendicularQuestionsByLevel,
  normalizeDeg360,
  PERPENDICULAR_LEVEL3_TASKS,
  PerpendicularChallengeLevel,
  PerpendicularDiagramPreset,
  SetSquareState,
} from '../utils/perpendicularMath';
import { computeQuizSeed, shuffleQuizQuestions } from '../utils/quizShuffle';
import { soundFX } from '../utils/soundEffects';
import { InteractiveSetSquareSVG } from './InteractiveSetSquareSVG';

interface PerpendicularChallengeViewProps {
  quizSeed?: number;
  onFinishChallengeLevel: (
    level: PerpendicularChallengeLevel,
    score: number,
    starsEarned: number
  ) => void;
  onBackHome: () => void;
}

const PerpendicularQuestionDiagram: React.FC<{ preset: PerpendicularDiagramPreset }> = ({
  preset,
}) => {
  return (
    <div className="w-full rounded-2xl bg-[#0A0724] border-2 border-indigo-400/50 p-3 flex items-center justify-center">
      <svg viewBox="0 0 420 260" className="w-full max-w-[420px] h-auto block">
        <defs>
          <pattern id="perp-q-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(129,140,248,0.12)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="420" height="260" rx="12" fill="url(#perp-q-grid)" />

        {/* Kite Bamboo Sticks */}
        {preset === 'kite_bamboo_sticks' && (
          <g>
            <polygon points="210,24 290,104 210,104" fill="#F8FAFC" opacity="0.9" />
            <polygon points="210,24 130,104 210,104" fill="#EF4444" opacity="0.88" />
            <polygon points="130,104 210,236 210,104" fill="#0EA5E9" opacity="0.88" />
            <polygon points="290,104 210,236 210,104" fill="#FACC15" opacity="0.9" />
            <line x1="210" y1="16" x2="210" y2="244" stroke="#92400E" strokeWidth="8" strokeLinecap="round" />
            <line x1="120" y1="104" x2="300" y2="104" stroke="#92400E" strokeWidth="8" strokeLinecap="round" />
            <line x1="210" y1="16" x2="210" y2="244" stroke="#FDE047" strokeWidth="2.5" strokeDasharray="6 4" />
            <line x1="120" y1="104" x2="300" y2="104" stroke="#FDE047" strokeWidth="2.5" strokeDasharray="6 4" />
            <path d="M 230 104 L 230 84 L 210 84" fill="rgba(52,211,153,0.4)" stroke="#34D399" strokeWidth="3.5" />
            <circle cx="210" cy="104" r="5.5" fill="#34D399" stroke="#FFF" strokeWidth="2" />
          </g>
        )}

        {/* Crossroad Scene */}
        {preset === 'crossroad_scene' && (
          <g>
            <rect x="12" y="12" width="396" height="236" rx="10" fill="#15803D" opacity="0.55" />
            <rect x="12" y="96" width="396" height="68" fill="#334155" />
            <rect x="176" y="12" width="68" height="236" fill="#334155" />
            <line x1="12" y1="130" x2="408" y2="130" stroke="#FACC15" strokeWidth="3.5" strokeDasharray="12 8" />
            <line x1="210" y1="12" x2="210" y2="248" stroke="#FACC15" strokeWidth="3.5" strokeDasharray="12 8" />
            <path d="M 232 130 L 232 108 L 210 108" fill="rgba(52,211,153,0.4)" stroke="#34D399" strokeWidth="3.2" />
            <path d="M 188 130 L 188 152 L 210 152" fill="rgba(52,211,153,0.4)" stroke="#34D399" strokeWidth="3.2" />
          </g>
        )}

        {/* Right Triangle ABC (for reading side names) */}
        {preset === 'right_triangle_abc_read' && (
          <g>
            <polygon points="115,52 115,205 325,205" fill="rgba(99,102,241,0.18)" stroke="#F8FAFC" strokeWidth="3.8" />
            <path d="M 137 205 L 137 183 L 115 183" fill="rgba(52,211,153,0.35)" stroke="#34D399" strokeWidth="3.5" />
            <circle cx="115" cy="205" r="5.5" fill="#34D399" />
            <text x="90" y="220" fill="#34D399" fontSize="21" fontWeight="900">A</text>
            <text x="92" y="52" fill="#FDE047" fontSize="21" fontWeight="900">B</text>
            <text x="336" y="218" fill="#38BDF8" fontSize="21" fontWeight="900">C</text>
          </g>
        )}

        {/* Rectangle MNPQ */}
        {preset === 'rect_mnpq_read' && (
          <g>
            <rect x="95" y="60" width="230" height="140" fill="rgba(56,189,248,0.16)" stroke="#F8FAFC" strokeWidth="3.8" />
            <path d="M 115 60 L 115 80 L 95 80" fill="none" stroke="#34D399" strokeWidth="3" />
            <path d="M 305 60 L 305 80 L 325 80" fill="none" stroke="#34D399" strokeWidth="3" />
            <path d="M 305 200 L 305 180 L 325 180" fill="none" stroke="#34D399" strokeWidth="3" />
            <path d="M 115 200 L 115 180 L 95 180" fill="none" stroke="#34D399" strokeWidth="3" />
            <text x="72" y="56" fill="#FDE047" fontSize="20" fontWeight="900">M</text>
            <text x="334" y="56" fill="#FDE047" fontSize="20" fontWeight="900">N</text>
            <text x="336" y="216" fill="#FFFFFF" fontSize="20" fontWeight="900">P</text>
            <text x="72" y="216" fill="#FFFFFF" fontSize="20" fontWeight="900">Q</text>
          </g>
        )}

        {/* Two Lines XY & PQ perpendicular at O */}
        {preset === 'two_lines_xy_pq' && (
          <g>
            <line x1="60" y1="130" x2="360" y2="130" stroke="#38BDF8" strokeWidth="4.2" />
            <line x1="210" y1="25" x2="210" y2="235" stroke="#F472B6" strokeWidth="4.2" />
            <path d="M 232 130 L 232 108 L 210 108" fill="rgba(52,211,153,0.35)" stroke="#34D399" strokeWidth="3.2" />
            <circle cx="210" cy="130" r="6" fill="#FACC15" />
            <text x="184" y="120" fill="#FDE047" fontSize="20" fontWeight="900">O</text>
            <text x="68" y="114" fill="#38BDF8" fontSize="20" fontWeight="900">X</text>
            <text x="342" y="114" fill="#38BDF8" fontSize="20" fontWeight="900">Y</text>
            <text x="224" y="42" fill="#F472B6" fontSize="20" fontWeight="900">P</text>
            <text x="224" y="232" fill="#F472B6" fontSize="20" fontWeight="900">Q</text>
          </g>
        )}

        {/* Extended Rectangle ABCD */}
        {preset === 'rect_abcd_extended' && (
          <g>
            <line x1="55" y1="68" x2="365" y2="68" stroke="#FACC15" strokeWidth="3.5" strokeDasharray="8 5" />
            <line x1="115" y1="22" x2="115" y2="238" stroke="#FACC15" strokeWidth="3.5" strokeDasharray="8 5" />
            <rect x="115" y="68" width="190" height="120" fill="rgba(56,189,248,0.16)" stroke="#F8FAFC" strokeWidth="3.5" />
            <path d="M 115 68 L 235 68 L 115 155 Z M 133 84 L 188 84 L 133 125 Z" fillRule="evenodd" fill="rgba(56,189,248,0.6)" stroke="#7DD3FC" strokeWidth="2" />
            <path d="M 131 68 L 131 84 L 115 84" fill="none" stroke="#FACC15" strokeWidth="3" />
            <text x="95" y="60" fill="#FDE047" fontSize="19" fontWeight="900">A</text>
            <text x="312" y="60" fill="#FFFFFF" fontSize="19" fontWeight="900">B</text>
            <text x="314" y="205" fill="#FFFFFF" fontSize="19" fontWeight="900">C</text>
            <text x="94" y="205" fill="#FFFFFF" fontSize="19" fontWeight="900">D</text>
          </g>
        )}

        {/* OM & ON forming 4 right angles */}
        {preset === 'om_on_four_rights' && (
          <g>
            <line x1="65" y1="130" x2="355" y2="130" stroke="#F8FAFC" strokeWidth="4" />
            <line x1="210" y1="26" x2="210" y2="234" stroke="#F8FAFC" strokeWidth="4" />
            <path d="M 230 130 L 230 150 L 210 150" fill="rgba(52,211,153,0.3)" stroke="#34D399" strokeWidth="3" />
            <path d="M 230 130 L 230 110 L 210 110" fill="rgba(250,204,21,0.2)" stroke="#FACC15" strokeWidth="2.5" strokeDasharray="3 2" />
            <path d="M 190 130 L 190 110 L 210 110" fill="rgba(250,204,21,0.2)" stroke="#FACC15" strokeWidth="2.5" strokeDasharray="3 2" />
            <path d="M 190 130 L 190 150 L 210 150" fill="rgba(250,204,21,0.2)" stroke="#FACC15" strokeWidth="2.5" strokeDasharray="3 2" />
            <circle cx="210" cy="130" r="5.5" fill="#FACC15" />
            <text x="180" y="114" fill="#FDE047" stroke="#0A0724" strokeWidth="4" paintOrder="stroke" fontSize="19" fontWeight="900">O</text>
            <circle cx="325" cy="130" r="4.5" fill="#38BDF8" />
            <text x="325" y="116" textAnchor="middle" fill="#38BDF8" fontSize="19" fontWeight="900">M</text>
            <circle cx="210" cy="212" r="4.5" fill="#F472B6" />
            <text x="184" y="218" fill="#F472B6" fontSize="19" fontWeight="900">N</text>
          </g>
        )}

        {/* Pentagon ABCDE */}
        {preset === 'pentagon_abcde_check' && (
          <g>
            <polygon points="100,175 155,75 305,75 305,205 155,205" fill="rgba(99,102,241,0.18)" stroke="#F8FAFC" strokeWidth="3.5" />
            <text x="78" y="182" fill="#FDE047" fontSize="19" fontWeight="900">A</text>
            <text x="148" y="64" fill="#FFFFFF" fontSize="19" fontWeight="900">B</text>
            <text x="314" y="68" fill="#34D399" fontSize="19" fontWeight="900">C</text>
            <text x="314" y="216" fill="#34D399" fontSize="19" fontWeight="900">D</text>
            <text x="145" y="226" fill="#FFFFFF" fontSize="19" fontWeight="900">E</text>
          </g>
        )}

        {/* Right Trapezoid ABCD */}
        {preset === 'trapezoid_abcd_check' && (
          <g>
            <polygon points="100,72 240,72 340,192 100,192" fill="rgba(56,189,248,0.16)" stroke="#F8FAFC" strokeWidth="3.5" />
            <path d="M 118 72 L 118 90 L 100 90" fill="none" stroke="#34D399" strokeWidth="3.2" />
            <path d="M 118 192 L 118 174 L 100 174" fill="none" stroke="#34D399" strokeWidth="3.2" />
            <text x="82" y="68" fill="#34D399" fontSize="19" fontWeight="900">A</text>
            <text x="246" y="66" fill="#FFFFFF" fontSize="19" fontWeight="900">B</text>
            <text x="348" y="202" fill="#FFFFFF" fontSize="19" fontWeight="900">C</text>
            <text x="82" y="206" fill="#34D399" fontSize="19" fontWeight="900">D</text>
          </g>
        )}

        {/* Windmill Scene */}
        {preset === 'windmill_scene' && (
          <g>
            <rect x="20" y="18" width="380" height="224" fill="#BAE6FD" stroke="#10B981" strokeWidth="10" />
            <path d="M 25 215 Q 210 185 395 215 L 395 237 L 25 237 Z" fill="#84CC16" />
            <polygon points="175,225 190,115 230,115 245,225" fill="#CBD5E1" stroke="#64748B" strokeWidth="2" />
            <polygon points="184,118 210,85 236,118" fill="#EA580C" />
            <line x1="145" y1="42" x2="275" y2="172" stroke="#D97706" strokeWidth="11" strokeLinecap="round" />
            <line x1="145" y1="172" x2="275" y2="42" stroke="#D97706" strokeWidth="11" strokeLinecap="round" />
            <path d="M 222 95 L 210 83 L 198 95" fill="none" stroke="#10B981" strokeWidth="3.2" />
            <circle cx="210" cy="107" r="7" fill="#9A3412" />
          </g>
        )}

        {/* Eke Step 1 (H on AB) */}
        {preset === 'eke_step1_h_on' && (
          <g>
            <line x1="55" y1="95" x2="365" y2="95" stroke="#F8FAFC" strokeWidth="4" />
            <path
              d="M 210 95 L 115 95 L 210 220 Z M 192 112 L 152 112 L 192 172 Z"
              fillRule="evenodd"
              fill="rgba(56,189,248,0.65)"
              stroke="#7DD3FC"
              strokeWidth="2.5"
            />
            <path d="M 194 95 L 194 111 L 210 111" fill="none" stroke="#FACC15" strokeWidth="2.8" />
            <line x1="210" y1="35" x2="210" y2="235" stroke="#FB7185" strokeWidth="3.5" strokeDasharray="6 4" />
            <circle cx="95" cy="95" r="4.5" fill="#FACC15" />
            <text x="90" y="82" fill="#FDE047" fontSize="18" fontWeight="900">A</text>
            <circle cx="325" cy="95" r="4.5" fill="#FACC15" />
            <text x="320" y="82" fill="#FDE047" fontSize="18" fontWeight="900">B</text>
            <circle cx="210" cy="95" r="5.5" fill="#FB7185" stroke="#FFF" strokeWidth="2" />
            <text x="220" y="84" fill="#FFFFFF" fontSize="18" fontWeight="900">H</text>
          </g>
        )}

        {/* Eke Step 1 (H outside AB) */}
        {preset === 'eke_step1_h_off' && (
          <g>
            <line x1="55" y1="82" x2="365" y2="82" stroke="#F8FAFC" strokeWidth="4" />
            <path
              d="M 215 82 L 125 82 L 215 215 Z M 198 98 L 160 98 L 198 164 Z"
              fillRule="evenodd"
              fill="rgba(56,189,248,0.65)"
              stroke="#7DD3FC"
              strokeWidth="2.5"
            />
            <path d="M 199 82 L 199 98 L 215 98" fill="none" stroke="#FACC15" strokeWidth="2.8" />
            <line x1="215" y1="26" x2="215" y2="236" stroke="#FB7185" strokeWidth="3.8" />
            <circle cx="95" cy="82" r="4.5" fill="#FACC15" />
            <text x="90" y="70" fill="#FDE047" fontSize="18" fontWeight="900">A</text>
            <circle cx="325" cy="82" r="4.5" fill="#FACC15" />
            <text x="320" y="70" fill="#FDE047" fontSize="18" fontWeight="900">B</text>
            <circle cx="215" cy="146" r="5.5" fill="#FB7185" stroke="#FFF" strokeWidth="2" />
            <text x="228" y="152" fill="#FFFFFF" fontSize="18" fontWeight="900">H</text>
            <text x="226" y="42" fill="#FDA4AF" fontSize="17" fontWeight="900">C</text>
            <text x="226" y="232" fill="#FDA4AF" fontSize="17" fontWeight="900">D</text>
          </g>
        )}

        {/* Wrong Eke Placement */}
        {preset === 'eke_wrong_acute_corner' && (
          <g>
            <line x1="55" y1="165" x2="365" y2="165" stroke="#F8FAFC" strokeWidth="4" />
            <polygon points="210,165 320,165 255,62" fill="rgba(249,115,22,0.45)" stroke="#FB923C" strokeWidth="3" />
            <circle cx="210" cy="165" r="6" fill="#EF4444" stroke="#FFF" strokeWidth="2" />
            <text x="204" y="192" fill="#FFFFFF" fontSize="18" fontWeight="900">H</text>
            <text x="210" y="42" textAnchor="middle" fill="#FCA5A5" fontSize="14" fontWeight="800">
              ⚠ Đặt góc nhọn của ê ke vào điểm H
            </text>
          </g>
        )}

        {/* Daily Objects Grid */}
        {preset === 'daily_objects_grid' && (
          <g>
            <rect x="35" y="42" width="160" height="92" rx="6" fill="#065F46" stroke="#D97706" strokeWidth="6" />
            <path d="M 55 48 L 55 64 L 41 64" fill="none" stroke="#FACC15" strokeWidth="3" />
            <text x="115" y="95" textAnchor="middle" fill="#ECFDF5" fontSize="14" fontWeight="800">Bảng lớp học</text>
            <rect x="235" y="42" width="145" height="92" rx="4" fill="#38BDF8" fillOpacity="0.25" stroke="#E2E8F0" strokeWidth="4" />
            <line x1="307" y1="42" x2="307" y2="134" stroke="#E2E8F0" strokeWidth="4" />
            <line x1="235" y1="88" x2="380" y2="88" stroke="#E2E8F0" strokeWidth="4" />
            <path d="M 321 88 L 321 74 L 307 74" fill="none" stroke="#FACC15" strokeWidth="3" />
            <text x="307" y="158" textAnchor="middle" fill="#E0E7FF" fontSize="13" fontWeight="700">Khung cửa sổ</text>
            <text x="115" y="158" textAnchor="middle" fill="#E0E7FF" fontSize="13" fontWeight="700">Góc bảng vuông 90°</text>
            <rect x="135" y="176" width="150" height="68" rx="4" fill="#F8FAFC" stroke="#38BDF8" strokeWidth="3" />
            <line x1="135" y1="210" x2="285" y2="210" stroke="#93C5FD" strokeWidth="2" />
            <line x1="210" y1="176" x2="210" y2="244" stroke="#93C5FD" strokeWidth="2" />
            <path d="M 224 210 L 224 196 L 210 196" fill="none" stroke="#059669" strokeWidth="2.8" />
            <text x="210" y="256" textAnchor="middle" fill="#E0E7FF" fontSize="12" fontWeight="700">Vở ô li</text>
          </g>
        )}

        {/* Two Intersecting Non-Perpendicular Lines */}
        {preset === 'two_lines_intersect_non_perp' && (
          <g>
            <line x1="65" y1="135" x2="355" y2="135" stroke="#F8FAFC" strokeWidth="4" />
            <line x1="140" y1="225" x2="280" y2="45" stroke="#38BDF8" strokeWidth="4" />
            <circle cx="210" cy="135" r="5.5" fill="#FACC15" />
            <path d="M 244 135 A 34 34 0 0 0 231 108" fill="none" stroke="#F472B6" strokeWidth="3" />
            <text x="256" y="118" fill="#F9A8D4" fontSize="15" fontWeight="800">60°</text>
            <path d="M 231 108 A 34 34 0 0 0 176 135" fill="none" stroke="#FACC15" strokeWidth="3" />
            <text x="154" y="108" fill="#FDE047" fontSize="15" fontWeight="800">120°</text>
          </g>
        )}
      </svg>
    </div>
  );
};

export const PerpendicularChallengeView: React.FC<PerpendicularChallengeViewProps> = ({
  quizSeed = 1,
  onFinishChallengeLevel,
  onBackHome,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<PerpendicularChallengeLevel>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [attemptNonce, setAttemptNonce] = useState<number>(0);

  // Level 1 & 2 quiz state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  // Level 3 interactive Ê Ke challenge state
  const [lvl3Idx, setLvl3Idx] = useState(0);
  const [lvl3SetSquare, setLvl3SetSquare] = useState<SetSquareState>(
    () => PERPENDICULAR_LEVEL3_TASKS[0].initialSetSquare
  );
  const [lvl3DoneMap, setLvl3DoneMap] = useState<Record<number, boolean>>({});
  const [lvl3Feedback, setLvl3Feedback] = useState<string>('');

  const questions = useMemo(
    () =>
      selectedLevel === 1 || selectedLevel === 2
        ? shuffleQuizQuestions(
            getPerpendicularQuestionsByLevel(selectedLevel),
            computeQuizSeed(quizSeed, selectedLevel, attemptNonce, 201)
          )
        : [],
    [selectedLevel, quizSeed, attemptNonce]
  );

  const currentLvl3Task = PERPENDICULAR_LEVEL3_TASKS[lvl3Idx] || PERPENDICULAR_LEVEL3_TASKS[0];
  const lvl3Alignment = useMemo(
    () =>
      evaluateSetSquareAlignment(
        lvl3SetSquare,
        currentLvl3Task.line,
        currentLvl3Task.targetPoint
      ),
    [lvl3SetSquare, currentLvl3Task]
  );

  const startLevel = (lvl: PerpendicularChallengeLevel) => {
    soundFX.playClick(1.15);
    setAttemptNonce((n) => n + 1);
    setSelectedLevel(lvl);
    setCurrentIdx(0);
    setAnswers({});
    setLvl3Idx(0);
    setLvl3SetSquare({ ...PERPENDICULAR_LEVEL3_TASKS[0].initialSetSquare });
    setLvl3DoneMap({});
    setLvl3Feedback('');
    setFinished(false);
    setIsPlaying(true);
  };

  // --- LEVEL SELECTION HUB (3 PLANETS, MATCHING TOPIC 1) ---
  if (!isPlaying) {
    const levelCards: Array<{
      lvl: PerpendicularChallengeLevel;
      planetVi: string;
      titleVi: string;
      descVi: string;
      colorClass: string;
      badgeText: string;
      highlightsVi: string[];
    }> = [
      {
        lvl: 1,
        planetVi: 'HÀNH TINH 1 · SAO THỦY',
        titleVi: 'CẤP ĐỘ 1 – NHÀ DU HÀNH TẬP SỰ',
        descVi:
          'Nhận biết hình ảnh hai đường thẳng vuông góc trong đời sống quanh em, số góc vuông chung đỉnh và cách nhận diện góc vuông trên chiếc ê ke.',
        colorClass: 'border-yellow-400',
        badgeText: '10 câu nhận biết',
        highlightsVi: [
          '🪁 Nhận biết góc vuông trong đồ vật đời sống',
          '➕ Hiểu 4 góc vuông chung đỉnh O',
          '🔍 Phân biệt vuông góc và cắt nhau không vuông góc',
        ],
      },
      {
        lvl: 2,
        planetVi: 'HÀNH TINH 2 · SAO MỘC',
        titleVi: 'CẤP ĐỘ 2 – NHÀ KHOA HỌC NHÍ',
        descVi:
          'Đọc tên chính xác các cặp cạnh vuông góc trong tam giác, hình chữ nhật, tứ giác, ngũ giác; đếm số cặp cạnh vuông góc và nắm vững 2 bước vẽ ê ke.',
        colorClass: 'border-pink-500',
        badgeText: '10 câu đọc và đếm',
        highlightsVi: [
          '🗣️ Đọc chuẩn: "Cạnh AB vuông góc cạnh AC tại A"',
          '🔢 Đếm cặp cạnh vuông góc trong đa giác',
          '✏️ Nắm vững quy trình 2 bước đặt ê ke vẽ vuông góc',
        ],
      },
      {
        lvl: 3,
        planetVi: 'HÀNH TINH 3 · SAO THỔ',
        titleVi: 'CẤP ĐỘ 3 – BẬC THẦY Ê KE',
        descVi:
          'Trực tiếp kéo, xoay thước Ê Ke tương tác và vạch đường thẳng vuông góc qua điểm nằm trên hoặc nằm ngoài đường thẳng ngang, đứng, nghiêng!',
        colorClass: 'border-emerald-400',
        badgeText: '6 bài thực hành Ê Ke',
        highlightsVi: [
          '📐 Kéo và xoay thước Ê Ke thực hành trực tiếp',
          '✏️ Vạch đường thẳng vuông góc qua điểm trên và ngoài đường thẳng',
          '⭐ Chinh phục cả đường ngang, đứng và nghiêng',
        ],
      },
    ];

    return (
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackHome}
            className="btn-3d-cobalt px-4 py-2 rounded-xl text-sm font-extrabold cursor-pointer"
          >
            ← Trang Chủ
          </button>
          <div className="text-center">
            <div className="text-xs font-extrabold text-yellow-300 uppercase tracking-wider">
              CHỦ ĐỀ 2 · CHINH PHỤC 3 HÀNH TINH VUÔNG GÓC
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              3. THỬ THÁCH HAI ĐƯỜNG THẲNG VUÔNG GÓC
            </h2>
          </div>
          <div className="w-24 hidden sm:block" />
        </div>

        {/* Robot Toán Học Welcome Banner */}
        <div className="card-3d-cosmic rounded-3xl p-4 border-2 border-sky-400/50 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 border-2 border-yellow-400 overflow-hidden shrink-0">
            <img
              src="/assets/aistudio/Th_m_ti_u____9352a9ad.png"
              alt="Robot Toán Học"
              className="w-full h-full object-cover scale-[1.35]"
            />
          </div>
          <div className="text-center sm:text-left">
            <div className="text-xs font-extrabold text-yellow-300">ROBOT TOÁN HỌC MỜI EM CHỌN HÀNH TINH:</div>
            <p className="text-sm font-semibold text-indigo-100 mt-0.5">
              Hãy chọn 1 trong 3 cấp độ bên dưới — từ nhận biết đời sống, đọc tên cặp cạnh vuông góc trong hình đến trực tiếp cầm thước Ê Ke vẽ đường thẳng vuông góc để rinh trọn Sao Vàng nhé!
            </p>
          </div>
        </div>

        {/* 3 Planet Level Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {levelCards.map((card) => (
            <div
              key={card.lvl}
              className={`card-3d-cosmic rounded-3xl p-5 border-2 ${card.colorClass} flex flex-col justify-between gap-4`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold text-yellow-300 uppercase tracking-wider whitespace-nowrap">
                    {card.planetVi}
                  </span>
                  <span className="text-[11px] font-extrabold bg-indigo-950 border border-indigo-400/50 text-sky-300 px-2.5 py-1 rounded-xl whitespace-nowrap shrink-0">
                    {card.badgeText}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                  {card.titleVi}
                </h3>
                <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">{card.descVi}</p>
                <ul className="space-y-1.5 text-xs text-indigo-200 bg-[#0B0826] rounded-2xl p-3 border border-indigo-500/30">
                  {card.highlightsVi.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                data-testid={`perp-start-level-${card.lvl}`}
                onClick={() => startLevel(card.lvl)}
                className={`${
                  card.lvl === 1
                    ? 'btn-3d-gold'
                    : card.lvl === 2
                      ? 'btn-3d-pink'
                      : 'btn-3d-emerald'
                } w-full py-3 px-4 rounded-xl font-extrabold text-sm cursor-pointer`}
              >
                🚀 Bắt đầu Cấp độ {card.lvl}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- FINISHED SCREEN (ALL 3 LEVELS) ---
  if (finished) {
    const totalCount =
      selectedLevel === 3 ? PERPENDICULAR_LEVEL3_TASKS.length : questions.length;
    const correctCount =
      selectedLevel === 3
        ? Object.values(lvl3DoneMap).filter(Boolean).length
        : questions.reduce((acc, q, idx) => (answers[idx] === q.correctOptionIndex ? acc + 1 : acc), 0);
    const stars = calculateStarReward(correctCount, totalCount);

    return (
      <div className="max-w-3xl w-full mx-auto px-4 py-8">
        <div className="card-3d-cosmic rounded-3xl p-8 border-2 border-yellow-400/70 text-center space-y-5">
          <div className="text-5xl">🏆</div>
          <div className="text-xs font-extrabold text-yellow-300 uppercase">
            CẤP ĐỘ {selectedLevel} · HAI ĐƯỜNG THẲNG VUÔNG GÓC
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            CHÚC MỪNG NHÀ TOÁN HỌC NHÍ!
          </h2>
          <p className="text-lg font-bold text-indigo-100">
            Em đã hoàn thành xuất sắc{' '}
            <span className="font-mono-num text-yellow-300 text-2xl">
              {correctCount} / {totalCount}
            </span>{' '}
            thử thách!
          </p>
          <div className="flex items-center justify-center gap-3 text-4xl">
            {[1, 2, 3].map((s) => (
              <span key={s} className={s <= stars ? 'text-yellow-400' : 'text-indigo-800'}>
                ★
              </span>
            ))}
          </div>
          <div className="text-sm font-bold text-emerald-300">
            Phần thưởng: +{stars} Sao Vàng Vũ Trụ
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => startLevel(selectedLevel)}
              className="btn-3d-emerald px-5 py-3 rounded-xl font-extrabold text-sm cursor-pointer"
            >
              🔄 Chơi lại Cấp độ {selectedLevel}
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setIsPlaying(false);
                setFinished(false);
              }}
              className="btn-3d-gold px-5 py-3 rounded-xl font-extrabold text-sm cursor-pointer"
            >
              🪐 Chọn Cấp độ khác
            </button>
            <button
              type="button"
              onClick={onBackHome}
              className="btn-3d-cobalt px-5 py-3 rounded-xl font-extrabold text-sm cursor-pointer"
            >
              🏠 Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- LEVEL 3: INTERACTIVE Ê KE HANDS-ON CHALLENGE ---
  if (selectedLevel === 3) {
    const doneCount = Object.values(lvl3DoneMap).filter(Boolean).length;
    const isCurrentDone = Boolean(lvl3DoneMap[lvl3Idx]);

    const handleLvl3Snap = () => {
      soundFX.playSnap();
      setLvl3SetSquare(
        computeSnapSetSquareState(currentLvl3Task.line, currentLvl3Task.targetPoint)
      );
      setLvl3Feedback(
        `Đã đặt chuẩn Bước 1! Hãy bấm nút "Vạch đường thẳng ${currentLvl3Task.drawnLineLabels.join('')}" để hoàn thành thử thách này.`
      );
    };

    const handleLvl3Draw = () => {
      if (!lvl3Alignment.isFullyAligned) {
        soundFX.playWrong();
        setLvl3Feedback(
          !lvl3Alignment.isLegOnLine
            ? `Cạnh góc vuông của ê ke chưa trùng đường thẳng ${currentLvl3Task.line.nameVi}. Em hãy xoay và kéo lại nhé!`
            : `Cạnh góc vuông thứ hai chưa gặp điểm ${currentLvl3Task.targetPointLabel}. Trượt ê ke thêm chút nữa nào!`
        );
        return;
      }
      soundFX.playSuccess();
      setLvl3DoneMap((prev) => ({ ...prev, [lvl3Idx]: true }));
      setLvl3Feedback(
        `🎉 Chính xác tuyệt đối! Đường thẳng ${currentLvl3Task.drawnLineLabels.join('')} đi qua điểm ${currentLvl3Task.targetPointLabel} và vuông góc với ${currentLvl3Task.line.nameVi}!`
      );
    };

    const handleLvl3Jump = (idx: number) => {
      soundFX.playClick();
      setLvl3Idx(idx);
      setLvl3SetSquare({ ...PERPENDICULAR_LEVEL3_TASKS[idx].initialSetSquare });
      setLvl3Feedback('');
    };

    const handleLvl3NextOrFinish = () => {
      soundFX.playClick();
      if (lvl3Idx < PERPENDICULAR_LEVEL3_TASKS.length - 1) {
        handleLvl3Jump(lvl3Idx + 1);
      } else {
        const finalCorrect = Object.values(lvl3DoneMap).filter(Boolean).length;
        const stars = calculateStarReward(finalCorrect, PERPENDICULAR_LEVEL3_TASKS.length);
        onFinishChallengeLevel(3, finalCorrect * 10, stars);
        setFinished(true);
        soundFX.playSuccess();
      }
    };

    return (
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setIsPlaying(false);
            }}
            className="btn-3d-cobalt px-4 py-2 rounded-xl text-sm font-extrabold cursor-pointer"
          >
            ← Chọn Cấp Độ
          </button>

          <div className="text-center">
            <div className="text-xs font-extrabold text-emerald-300 uppercase">
              HÀNH TINH 3 · CẤP ĐỘ 3 – BẬC THẦY Ê KE
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              THỬ THÁCH {lvl3Idx + 1} / {PERPENDICULAR_LEVEL3_TASKS.length}: VẼ ĐƯỜNG THẲNG VUÔNG GÓC
            </h2>
          </div>

          <div className="bg-[#130E38]/95 border-2 border-emerald-400/60 rounded-2xl px-4 py-2 text-sm font-extrabold text-emerald-300 font-mono-num">
            Hoàn thành: {doneCount}/{PERPENDICULAR_LEVEL3_TASKS.length}
          </div>
        </div>

        {/* Quick task strip */}
        <div className="flex flex-wrap justify-center gap-2">
          {PERPENDICULAR_LEVEL3_TASKS.map((t, idx) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleLvl3Jump(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold font-mono-num border-2 cursor-pointer ${
                idx === lvl3Idx
                  ? 'bg-yellow-400 text-slate-950 border-yellow-200'
                  : lvl3DoneMap[idx]
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                    : 'bg-[#130E38] text-indigo-200 border-indigo-400/40'
              }`}
            >
              {lvl3DoneMap[idx] ? '✓ ' : ''}Bài {idx + 1}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-8 space-y-3">
            <InteractiveSetSquareSVG
              mode="draw"
              drawTask={currentLvl3Task}
              setSquare={lvl3SetSquare}
              onChangeSetSquare={setLvl3SetSquare}
              hasDrawnPerp={isCurrentDone}
              alignment={lvl3Alignment}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#130E38]/95 border border-indigo-400/40 rounded-2xl p-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-indigo-200 mr-1">Xoay nhanh ê ke:</span>
                {[15, 5, -5, -15, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      soundFX.playTick(Math.abs(d) * 4);
                      setLvl3SetSquare((prev) => ({
                        ...prev,
                        rotationDeg: normalizeDeg360(prev.rotationDeg + d),
                      }));
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-950 border border-indigo-400/50 text-xs font-extrabold text-white hover:bg-indigo-800 cursor-pointer font-mono-num"
                  >
                    {d > 0 ? `↺ +${d}°` : `↻ ${d}°`}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleLvl3Snap}
                className="px-3 py-1.5 rounded-lg bg-yellow-400/20 border border-yellow-400/60 text-xs font-extrabold text-yellow-200 hover:bg-yellow-400/30 cursor-pointer"
              >
                💡 Gợi ý đặt chuẩn ê ke
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 card-3d-cosmic rounded-3xl p-5 border-2 border-emerald-400/60 space-y-4">
            <div>
              <div className="text-xs font-extrabold text-yellow-300 uppercase">
                {currentLvl3Task.badgeVi}
              </div>
              <h3 className="text-lg font-extrabold text-white mt-1 leading-snug">
                {currentLvl3Task.titleVi}
              </h3>
              <p className="text-xs text-indigo-200 mt-1.5 leading-relaxed">
                {currentLvl3Task.instructionVi}
              </p>
            </div>

            <div className="space-y-2 text-xs font-bold">
              <div
                className={`p-3 rounded-xl border ${
                  lvl3Alignment.isLegOnLine
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    : 'bg-[#0B0826] border-indigo-500/40 text-indigo-200'
                }`}
              >
                {lvl3Alignment.isLegOnLine ? '✅ ' : '1️⃣ '}
                Một cạnh góc vuông ê ke trùng đường thẳng {currentLvl3Task.line.nameVi}
              </div>
              <div
                className={`p-3 rounded-xl border ${
                  lvl3Alignment.isOtherLegAtPoint
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    : 'bg-[#0B0826] border-indigo-500/40 text-indigo-200'
                }`}
              >
                {lvl3Alignment.isOtherLegAtPoint ? '✅ ' : '2️⃣ '}
                Cạnh góc vuông thứ hai gặp điểm {currentLvl3Task.targetPointLabel}
              </div>
            </div>

            <button
              type="button"
              data-testid="lvl3-draw-btn"
              onClick={handleLvl3Draw}
              className="btn-3d-emerald w-full py-3 px-4 rounded-xl font-extrabold text-sm cursor-pointer"
            >
              ✏️ Vạch đường thẳng {currentLvl3Task.drawnLineLabels.join('')}
            </button>

            {lvl3Feedback && (
              <div
                className={`p-3 rounded-2xl text-xs font-bold border leading-relaxed ${
                  isCurrentDone
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100'
                    : 'bg-amber-500/20 border-amber-400 text-amber-100'
                }`}
              >
                {lvl3Feedback}
              </div>
            )}

            {isCurrentDone && (
              <button
                type="button"
                onClick={handleLvl3NextOrFinish}
                className="btn-3d-gold w-full py-2.5 px-4 rounded-xl font-extrabold text-sm cursor-pointer"
              >
                {lvl3Idx < PERPENDICULAR_LEVEL3_TASKS.length - 1
                  ? 'Thử thách tiếp theo →'
                  : '🏆 Hoàn thành Cấp độ 3'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- LEVEL 1 & LEVEL 2 QUIZ SCREEN ---
  const currentQ = questions[currentIdx];
  const selectedOption = answers[currentIdx];
  const isAnswered = selectedOption !== undefined;
  const isCorrect = selectedOption === currentQ.correctOptionIndex;
  const correctCount = questions.reduce(
    (acc, q, idx) => (answers[idx] === q.correctOptionIndex ? acc + 1 : acc),
    0
  );

  const handleSelectOption = (optionIdx: number) => {
    if (isAnswered) return;
    setAnswers((prev) => ({ ...prev, [currentIdx]: optionIdx }));
    if (optionIdx === currentQ.correctOptionIndex) {
      soundFX.playSuccess();
    } else {
      soundFX.playWrong();
    }
  };

  const handleNextOrFinish = () => {
    soundFX.playClick();
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      const stars = calculateStarReward(correctCount, questions.length);
      onFinishChallengeLevel(selectedLevel, correctCount * 10, stars);
      setFinished(true);
      soundFX.playSuccess();
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-4">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            setIsPlaying(false);
          }}
          className="btn-3d-cobalt px-4 py-2 rounded-xl text-sm font-extrabold cursor-pointer"
        >
          ← Chọn Cấp Độ
        </button>

        <div className="text-center">
          <div className="text-xs font-extrabold text-yellow-300 uppercase tracking-wider">
            {selectedLevel === 1
              ? 'HÀNH TINH 1 · CẤP ĐỘ 1 – NHÀ DU HÀNH TẬP SỰ'
              : 'HÀNH TINH 2 · CẤP ĐỘ 2 – NHÀ KHOA HỌC NHÍ'}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            THỬ THÁCH HAI ĐƯỜNG THẲNG VUÔNG GÓC
          </h2>
        </div>

        <div className="bg-[#130E38]/95 border-2 border-emerald-400/60 rounded-2xl px-4 py-2 text-sm font-extrabold text-emerald-300 font-mono-num">
          Điểm: {correctCount}/{questions.length}
        </div>
      </div>

      {/* Quick Question Selector Strip */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {questions.map((q, idx) => {
          const ans = answers[idx];
          const isCurrent = idx === currentIdx;
          const statusClass =
            ans === undefined
              ? 'bg-[#130E38] text-indigo-200 border-indigo-400/40'
              : ans === q.correctOptionIndex
                ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                : 'bg-rose-500 text-white border-rose-300';
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => {
                soundFX.playClick();
                setCurrentIdx(idx);
              }}
              className={`w-9 h-9 rounded-xl font-mono-num text-xs font-extrabold border-2 cursor-pointer transition-transform ${statusClass} ${
                isCurrent ? 'ring-2 ring-yellow-300 scale-110' : ''
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Main Question Card */}
      <div className="card-3d-cosmic rounded-3xl p-5 sm:p-6 border-2 border-indigo-400/60 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold">
            <span className="text-yellow-300">{currentQ.categoryLabelVi}</span>
            <span className="text-sky-300">{currentQ.badgeTitleVi}</span>
          </div>
          <PerpendicularQuestionDiagram preset={currentQ.diagramPreset} />
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="text-xs font-extrabold text-indigo-300 uppercase">
            CÂU HỎI {currentIdx + 1} / {questions.length}
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
            {currentQ.promptVi}
          </h3>

          <div className="grid grid-cols-1 gap-2.5">
            {currentQ.options.map((opt, optIdx) => {
              const letter = ['A', 'B', 'C', 'D'][optIdx];
              let btnStyle =
                'bg-[#0D092A] border-indigo-400/40 text-indigo-100 hover:border-yellow-400 hover:bg-indigo-950';
              if (isAnswered) {
                if (optIdx === currentQ.correctOptionIndex) {
                  btnStyle = 'bg-emerald-500/25 border-emerald-400 text-emerald-100';
                } else if (optIdx === selectedOption) {
                  btnStyle = 'bg-rose-500/25 border-rose-400 text-rose-100';
                } else {
                  btnStyle = 'bg-[#0D092A]/60 border-indigo-500/20 text-indigo-400';
                }
              }
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 font-bold text-sm transition-all ${btnStyle} ${
                    isAnswered ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  <span className="w-8 h-8 rounded-xl bg-indigo-900/90 border border-indigo-400/50 flex items-center justify-center font-mono-num font-extrabold text-yellow-300 shrink-0">
                    {letter}
                  </span>
                  <span className="leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div
              className={`p-4 rounded-2xl border-2 space-y-2 ${
                isCorrect
                  ? 'bg-emerald-500/15 border-emerald-400 text-emerald-100'
                  : 'bg-amber-500/15 border-amber-400 text-amber-100'
              }`}
            >
              <div className="font-extrabold text-sm">
                {isCorrect ? '🎉 Chính xác! Tuyệt vời quá!' : '💡 Chưa chính xác, cùng xem giải thích nhé:'}
              </div>
              <p className="text-xs sm:text-sm leading-relaxed">{currentQ.explanationVi}</p>
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextOrFinish}
                  className="btn-3d-gold px-5 py-2.5 rounded-xl font-extrabold text-sm cursor-pointer"
                >
                  {currentIdx < questions.length - 1 ? 'Câu tiếp theo →' : '🏆 Xem kết quả'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
