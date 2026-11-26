import React, { useState } from 'react';
import { soundFX } from '../utils/soundEffects';

interface ParallelExploreViewProps {
  onBackHome: () => void;
  onGoLab: () => void;
  onCompleteExplore: () => void;
}

type ExploreTab = 'realworld' | 'concept' | 'reading' | 'compare';
type RealWorldId = 'train' | 'rocket' | 'ladder' | 'board' | 'track' | 'notebook';
type ReadingShapeId = 'rect_abcd' | 'square_mnpq' | 'split_rect' | 'window_3';
type StickLetterId = 'V' | 'I' | 'E' | 'T';

interface RealWorldItem {
  id: RealWorldId;
  titleVi: string;
  subtitleVi: string;
  icon: string;
  robotSpeechVi: string;
  highlightFactVi: string;
}

const REAL_WORLD_ITEMS: RealWorldItem[] = [
  {
    id: 'train',
    titleVi: 'Đường ray tàu hỏa',
    subtitleVi: 'Hai thanh ray chạy dài song song',
    icon: '🚂',
    robotSpeechVi:
      '“Nhìn kìa! Hai thanh ray thép màu đỏ của đoàn tàu chạy thẳng tắp và luôn cách đều nhau — dù kéo dài mãi đến tận chân trời chúng cũng không bao giờ cắt nhau!”',
    highlightFactVi: 'Hai thanh ray tàu hỏa là hình ảnh kinh điển nhất của hai đường thẳng song song!',
  },
  {
    id: 'rocket',
    titleVi: 'Tên lửa vũ trụ',
    subtitleVi: 'Các đường viền song song trên thân tàu',
    icon: '🚀',
    robotSpeechVi:
      '“Trên thân chiếc tên lửa vũ trụ, hai đường sọc ngang ở mũi và thân cùng hai cạnh khung cửa sổ đều nằm song song với nhau đấy!”',
    highlightFactVi: 'Các đường sọc ngang song song giúp thân tên lửa cân đối và vững chắc.',
  },
  {
    id: 'ladder',
    titleVi: 'Chiếc thang gỗ',
    subtitleVi: 'Nhiều bậc thang song song với nhau',
    icon: '🪜',
    robotSpeechVi:
      '“Một bậc thang ngang có thể song song với RẤT NHIỀU bậc thang khác! Cả 4 bậc thang đều song song với nhau, còn hai thanh trụ dọc hai bên cũng song song với nhau!”',
    highlightFactVi: 'Mở rộng thú vị: Một đường thẳng có thể song song với 2, 3 hoặc nhiều đường thẳng khác!',
  },
  {
    id: 'board',
    titleVi: 'Bảng lớp học',
    subtitleVi: 'Hai mép trên và dưới đối diện nhau',
    icon: '🟩',
    robotSpeechVi:
      '“Chiếc bảng xanh hình chữ nhật ở lớp em có mép trên song song với mép dưới, và mép trái song song với mép phải đấy!”',
    highlightFactVi: 'Trong hình chữ nhật luôn có 2 cặp cạnh đối diện song song với nhau.',
  },
  {
    id: 'track',
    titleVi: 'Làn đường chạy',
    subtitleVi: 'Vạch kẻ làn chạy trên sân thể dục',
    icon: '🏃',
    robotSpeechVi:
      '“Khi thi chạy tiếp sức trên sân trường, các vạch kẻ phân làn chạy được vẽ song song cách đều nhau để mỗi bạn có đường chạy công bằng và không va vào nhau!”',
    highlightFactVi: 'Khoảng cách giữa các làn chạy song song luôn bằng nhau ở mọi vị trí.',
  },
  {
    id: 'notebook',
    titleVi: 'Trang vở ô li',
    subtitleVi: 'Hàng chục dòng kẻ ngang song song',
    icon: '📓',
    robotSpeechVi:
      '“Mở quyển vở ô li ra xem nào! Tất cả các dòng kẻ ngang đều song song với nhau, và tất cả các dòng kẻ dọc cũng song song với nhau đấy!”',
    highlightFactVi: 'Các dòng kẻ ngang song song giúp em viết chữ thẳng hàng thật đẹp.',
  },
];

interface EdgeGroupReading {
  refEdgeId: string;
  refEdgeLabel: string;
  parallelEdges: Array<{ id: string; label: string }>;
  sentenceVi: string;
  tipVi: string;
}

const READING_DATA: Record<ReadingShapeId, { title: string; badge: string; groups: EdgeGroupReading[] }> = {
  rect_abcd: {
    title: 'Hình chữ nhật ABCD',
    badge: '2 cặp cạnh song song',
    groups: [
      {
        refEdgeId: 'AB',
        refEdgeLabel: 'Cạnh AB',
        parallelEdges: [{ id: 'DC', label: 'Cạnh DC' }],
        sentenceVi: 'Cạnh AB song song với cạnh DC (hay: Hai cạnh AB và DC song song với nhau).',
        tipVi: 'Hai cạnh đối diện nằm ngang không bao giờ cắt nhau.',
      },
      {
        refEdgeId: 'AD',
        refEdgeLabel: 'Cạnh AD',
        parallelEdges: [{ id: 'BC', label: 'Cạnh BC' }],
        sentenceVi: 'Cạnh AD song song với cạnh BC (hay: Hai cạnh AD và BC song song với nhau).',
        tipVi: 'Hai cạnh đối diện thẳng đứng cũng song song với nhau.',
      },
    ],
  },
  square_mnpq: {
    title: 'Hình vuông MNPQ',
    badge: '2 cặp cạnh song song',
    groups: [
      {
        refEdgeId: 'MN',
        refEdgeLabel: 'Cạnh MN',
        parallelEdges: [{ id: 'QP', label: 'Cạnh QP' }],
        sentenceVi: 'Cạnh MN song song với cạnh QP (hay: Hai cạnh MN và QP song song với nhau).',
        tipVi: 'Hình vuông cũng có 2 cặp cạnh đối diện song song như hình chữ nhật.',
      },
      {
        refEdgeId: 'MQ',
        refEdgeLabel: 'Cạnh MQ',
        parallelEdges: [{ id: 'NP', label: 'Cạnh NP' }],
        sentenceVi: 'Cạnh MQ song song với cạnh NP (hay: Hai cạnh MQ và NP song song với nhau).',
        tipVi: 'Đọc rõ tên từng đoạn thẳng bằng 2 chữ cái đầu mút.',
      },
    ],
  },
  split_rect: {
    title: 'Hình chữ nhật ghép AMND – MBCN',
    badge: '1 cạnh song song với 2 cạnh!',
    groups: [
      {
        refEdgeId: 'MN',
        refEdgeLabel: 'Cạnh MN',
        parallelEdges: [
          { id: 'AD', label: 'Cạnh AD' },
          { id: 'BC', label: 'Cạnh BC' },
        ],
        sentenceVi: 'Cạnh MN song song với 2 cạnh là cạnh AD và cạnh BC!',
        tipVi: 'Mở rộng: Đừng dừng lại sau khi tìm thấy 1 cạnh! Hãy nhìn cả hai bên xem còn cạnh nào song song nữa không nhé!',
      },
      {
        refEdgeId: 'AD',
        refEdgeLabel: 'Cạnh AD',
        parallelEdges: [
          { id: 'MN', label: 'Cạnh MN' },
          { id: 'BC', label: 'Cạnh BC' },
        ],
        sentenceVi: 'Cạnh AD song song với cả 2 cạnh là cạnh MN và cạnh BC!',
        tipVi: 'Cả ba cạnh thẳng đứng AD, MN và BC đôi một song song với nhau.',
      },
    ],
  },
  window_3: {
    title: 'Khung cửa sổ 3 ô thẳng đứng',
    badge: '1 cạnh song song với 3 cạnh!',
    groups: [
      {
        refEdgeId: 'AD',
        refEdgeLabel: 'Cạnh AD',
        parallelEdges: [
          { id: 'MN', label: 'Cạnh MN' },
          { id: 'PQ', label: 'Cạnh PQ' },
          { id: 'BC', label: 'Cạnh BC' },
        ],
        sentenceVi: 'Cạnh AD song song với tận 3 cạnh: cạnh MN, cạnh PQ và cạnh BC!',
        tipVi: 'Trong thực tế như khung cửa sổ hay thang gỗ, một cạnh thường song song với rất nhiều cạnh khác!',
      },
      {
        refEdgeId: 'AB',
        refEdgeLabel: 'Cạnh AB',
        parallelEdges: [{ id: 'DC', label: 'Cạnh DC' }],
        sentenceVi: 'Cạnh AB song song với cạnh DC (hai mép ngang trên và dưới).',
        tipVi: 'Còn 4 thanh dọc AD, MN, PQ, BC thì vuông góc với AB và DC.',
      },
    ],
  },
};

export const ParallelExploreView: React.FC<ParallelExploreViewProps> = ({
  onBackHome,
  onGoLab,
  onCompleteExplore,
}) => {
  const [activeTab, setActiveTab] = useState<ExploreTab>('realworld');
  const [selectedObject, setSelectedObject] = useState<RealWorldId>('train');
  const [discoveredObjects, setDiscoveredObjects] = useState<RealWorldId[]>(['train']);

  // Tab 2: Concept — extend rectangle sides vs tilt non-parallel line
  const [extendedLines, setExtendedLines] = useState(true);
  const [tiltDeg, setTiltDeg] = useState(0); // 0 = parallel; > 0 = tilted so lines intersect!

  // Tab 3: Reading & 1-to-many parallel edges
  const [readingShape, setReadingShape] = useState<ReadingShapeId>('split_rect');
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);
  const [miniQuizAnswer, setMiniQuizAnswer] = useState<number | null>(null);

  // Tab 4: Compare Parallel vs Perpendicular (VIET sticks & 6 polygons)
  const [selectedLetter, setSelectedLetter] = useState<StickLetterId>('E');
  const [polyFilter, setPolyFilter] = useState<'parallel' | 'perpendicular'>('parallel');

  const currentObj = REAL_WORLD_ITEMS.find((item) => item.id === selectedObject) ?? REAL_WORLD_ITEMS[0];
  const currentReadingShape = READING_DATA[readingShape];
  const activeGroup = currentReadingShape.groups[selectedGroupIdx] ?? currentReadingShape.groups[0];

  const handleSelectObject = (id: RealWorldId) => {
    soundFX.playClick();
    setSelectedObject(id);
    if (!discoveredObjects.includes(id)) {
      const next = [...discoveredObjects, id];
      setDiscoveredObjects(next);
      if (next.length >= 4) {
        onCompleteExplore();
      }
    }
  };

  const handleSwitchReadingShape = (sid: ReadingShapeId) => {
    soundFX.playClick();
    setReadingShape(sid);
    setSelectedGroupIdx(0);
    onCompleteExplore();
  };

  // Helper to check if an edge ID is highlighted in Tab 3
  const getEdgeHighlight = (edgeId: string): 'ref' | 'par' | 'none' => {
    if (activeGroup.refEdgeId === edgeId) return 'ref';
    if (activeGroup.parallelEdges.some((e) => e.id === edgeId)) return 'par';
    return 'none';
  };

  const renderRealWorldScene = (id: RealWorldId) => {
    switch (id) {
      case 'train':
        return (
          <svg viewBox="0 0 560 270" className="w-full h-auto block">
            <rect x="0" y="0" width="560" height="270" rx="16" fill="#0F172A" />
            {/* Sky & green hills */}
            <rect x="18" y="18" width="524" height="234" rx="12" fill="#1E293B" />
            {/* Diagonal wooden sleepers */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
              const cx = 85 + i * 38;
              const cy = 225 - i * 18;
              return (
                <line
                  key={i}
                  x1={cx - 12}
                  y1={cy - 22}
                  x2={cx + 18}
                  y2={cy + 26}
                  stroke="#92400E"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
              );
            })}
            {/* Two Glowing Parallel Red Train Rails */}
            <line x1="60" y1="215" x2="495" y2="10" stroke="#F43F5E" strokeWidth="7" strokeLinecap="round" />
            <line x1="88" y1="260" x2="525" y2="54" stroke="#F43F5E" strokeWidth="7" strokeLinecap="round" />
            {/* Parallel chevrons showing equal direction */}
            <text x="155" y="140" fill="#FACC15" fontSize="14" fontWeight="900">
              Hai thanh ray luôn cách đều nhau
            </text>
            {/* Cute stylized locomotive front */}
            <g transform="translate(365, 55) rotate(-25)">
              <rect x="0" y="-22" width="110" height="48" rx="10" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2.5" />
              <rect x="10" y="-14" width="32" height="20" rx="4" fill="#FEF08A" />
              <rect x="0" y="12" width="110" height="10" fill="#FACC15" />
              <polygon points="-14,24 2,24 2,-10" fill="#EF4444" />
            </g>
          </svg>
        );
      case 'rocket':
        return (
          <svg viewBox="0 0 560 270" className="w-full h-auto block">
            <rect x="0" y="0" width="560" height="270" rx="16" fill="#0B0826" />
            {/* Stars */}
            {[
              [70, 55], [130, 195], [470, 65], [440, 215], [210, 45], [500, 145],
            ].map(([sx, sy], idx) => (
              <circle key={idx} cx={sx} cy={sy} r="3" fill="#FACC15" opacity="0.8" />
            ))}
            {/* Rocket body */}
            <g transform="translate(280, 138) rotate(22)">
              {/* Fins */}
              <polygon points="-42,30 -72,72 -35,66" fill="#F97316" />
              <polygon points="42,30 72,72 35,66" fill="#F97316" />
              {/* Main Hull */}
              <path d="M 0 -92 C 36 -55 44 -10 42 58 L -42 58 C -44 -10 -36 -55 0 -92 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2.5" />
              <path d="M 0 -92 C 18 -72 28 -52 32 -36 L -32 -36 C -28 -52 -18 -72 0 -92 Z" fill="#EF4444" />
              <rect x="-42" y="4" width="84" height="54" fill="#F97316" />
              {/* Highlighted Parallel Horizontal Stripes */}
              <line x1="-58" y1="-36" x2="58" y2="-36" stroke="#34D399" strokeWidth="5.5" strokeDasharray="8 5" />
              <line x1="-62" y1="4" x2="62" y2="4" stroke="#34D399" strokeWidth="5.5" strokeDasharray="8 5" />
              <line x1="-60" y1="58" x2="60" y2="58" stroke="#34D399" strokeWidth="5.5" strokeDasharray="8 5" />
              {/* Porthole */}
              <circle cx="0" cy="-16" r="14" fill="#38BDF8" stroke="#FACC15" strokeWidth="4" />
              {/* Flame */}
              <polygon points="-22,62 0,98 22,62" fill="#FACC15" />
            </g>
            <text x="280" y="252" textAnchor="middle" fill="#34D399" fontSize="14" fontWeight="900">
              Các đường sọc ngang trên thân tên lửa song song với nhau!
            </text>
          </svg>
        );
      case 'ladder':
        return (
          <svg viewBox="0 0 560 270" className="w-full h-auto block">
            <rect x="0" y="0" width="560" height="270" rx="16" fill="#0B0826" />
            {/* Side rails */}
            <line x1="185" y1="28" x2="185" y2="242" stroke="#38BDF8" strokeWidth="10" strokeLinecap="round" />
            <line x1="375" y1="28" x2="375" y2="242" stroke="#38BDF8" strokeWidth="10" strokeLinecap="round" />
            {/* 4 Parallel Rungs */}
            {[62, 112, 162, 212].map((ry, idx) => (
              <g key={ry}>
                <line x1="185" y1={ry} x2="375" y2={ry} stroke="#FACC15" strokeWidth="8" strokeLinecap="round" />
                <text x="405" y={ry + 5} fill="#FACC15" fontSize="13" fontWeight="800">
                  Bậc {idx + 1}
                </text>
              </g>
            ))}
            <text x="85" y="140" textAnchor="middle" fill="#38BDF8" fontSize="13" fontWeight="800">
              2 thanh dọc
            </text>
            <text x="85" y="158" textAnchor="middle" fill="#38BDF8" fontSize="13" fontWeight="800">
              song song
            </text>
          </svg>
        );
      case 'board':
        return (
          <svg viewBox="0 0 560 270" className="w-full h-auto block">
            <rect x="0" y="0" width="560" height="270" rx="16" fill="#0B0826" />
            <rect x="115" y="52" width="330" height="165" rx="6" fill="#064E3B" stroke="#D97706" strokeWidth="10" />
            {/* Top & Bottom Parallel Highlight */}
            <line x1="80" y1="52" x2="480" y2="52" stroke="#FACC15" strokeWidth="5" strokeDasharray="10 6" />
            <line x1="80" y1="217" x2="480" y2="217" stroke="#FACC15" strokeWidth="5" strokeDasharray="10 6" />
            {/* Left & Right Parallel Highlight */}
            <line x1="115" y1="24" x2="115" y2="246" stroke="#38BDF8" strokeWidth="4" strokeDasharray="8 6" />
            <line x1="445" y1="24" x2="445" y2="246" stroke="#38BDF8" strokeWidth="4" strokeDasharray="8 6" />
            <text x="280" y="132" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900">
              BẢNG LỚP HỌC
            </text>
            <text x="280" y="158" textAnchor="middle" fill="#A7F3D0" fontSize="12" fontWeight="700">
              Mép trên song song mép dưới · Mép trái song song mép phải
            </text>
          </svg>
        );
      case 'track':
        return (
          <svg viewBox="0 0 560 270" className="w-full h-auto block">
            <rect x="0" y="0" width="560" height="270" rx="16" fill="#0B0826" />
            <rect x="40" y="45" width="480" height="180" rx="10" fill="#9A3412" />
            {/* 4 Parallel Running Lane Lines */}
            {[65, 112, 159, 206].map((ly, idx) => (
              <g key={ly}>
                <line x1="55" y1={ly} x2="505" y2={ly} stroke="#FFFFFF" strokeWidth="4.5" />
                {idx < 3 && (
                  <text x="280" y={ly + 30} textAnchor="middle" fill="#FEF08A" fontSize="15" fontWeight="900">
                    Làn chạy số {idx + 1}
                  </text>
                )}
              </g>
            ))}
            {/* Start line perpendicular */}
            <line x1="105" y1="65" x2="105" y2="206" stroke="#34D399" strokeWidth="5" strokeDasharray="7 5" />
            <path d="M 105 83 L 123 83 L 123 65" fill="none" stroke="#34D399" strokeWidth="3" />
            <text x="105" y="34" textAnchor="middle" fill="#34D399" fontSize="12" fontWeight="900">
              Vạch xuất phát (vuông góc)
            </text>
          </svg>
        );
      case 'notebook':
        return (
          <svg viewBox="0 0 560 270" className="w-full h-auto block">
            <rect x="0" y="0" width="560" height="270" rx="16" fill="#0B0826" />
            <rect x="110" y="25" width="340" height="220" rx="8" fill="#F8FAFC" />
            {/* Vertical margin line */}
            <line x1="168" y1="25" x2="168" y2="245" stroke="#EF4444" strokeWidth="3" />
            {/* Parallel Horizontal Notebook Lines */}
            {[55, 85, 115, 145, 175, 205, 235].map((y, idx) => (
              <line
                key={y}
                x1="110"
                y1={y}
                x2="450"
                y2={y}
                stroke={idx === 2 || idx === 3 ? '#0284C7' : '#93C5FD'}
                strokeWidth={idx === 2 || idx === 3 ? '4' : '2'}
              />
            ))}
            <text x="308" y="138" textAnchor="middle" fill="#0369A1" fontSize="16" fontWeight="900">
              Các dòng kẻ song song đều nhau
            </text>
          </svg>
        );
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-5">
      {/* Header */}
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
            CHỦ ĐỀ 3 · KHÁM PHÁ TRỰC QUAN CÙNG ROBOT TOÁN HỌC
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            1. KHÁM PHÁ HAI ĐƯỜNG THẲNG SONG SONG
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            onCompleteExplore();
            onGoLab();
          }}
          className="btn-3d-pink px-4 py-2 rounded-xl text-sm font-extrabold cursor-pointer"
        >
          🛤️ Vào Phòng Thí Nghiệm →
        </button>
      </div>

      {/* 4 Pedagogical Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {(
          [
            { id: 'realworld', label: '🔍 1. Thám tử song song quanh em' },
            { id: 'concept', label: '✨ 2. Không bao giờ cắt nhau' },
            { id: 'reading', label: '🗣️ 3. Cách đọc và nhiều cạnh song song' },
            { id: 'compare', label: '🧩 4. Phân biệt Song song và Vuông góc' },
          ] as Array<{ id: ExploreTab; label: string }>
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              soundFX.playClick();
              setActiveTab(tab.id);
              if (tab.id !== 'realworld') onCompleteExplore();
            }}
            className={`px-3 py-3 rounded-2xl text-xs sm:text-sm font-extrabold cursor-pointer transition-all ${
              activeTab === tab.id
                ? 'bg-yellow-400 text-slate-950 shadow-lg'
                : 'bg-[#130E38]/95 text-indigo-100 border-2 border-indigo-400/40 hover:border-yellow-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================================================================ */}
      {/* TAB 1: REAL-WORLD DETECTIVE                                      */}
      {/* ================================================================ */}
      {activeTab === 'realworld' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-7 card-3d-cosmic rounded-3xl p-5 border-2 border-sky-400/60 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-sky-300 uppercase">
                CHẠM VÀO ĐỒ VẬT ĐỂ PHÁT HIỆN ĐƯỜNG THẲNG SONG SONG!
              </span>
              <span className="text-xs font-mono-num font-extrabold bg-emerald-500/20 border border-emerald-400/60 text-emerald-200 px-3 py-1 rounded-xl">
                Đã khám phá: {discoveredObjects.length}/6
              </span>
            </div>

            <div className="bg-[#0B0826] rounded-2xl p-3 border border-indigo-400/40">
              {renderRealWorldScene(selectedObject)}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {REAL_WORLD_ITEMS.map((item) => {
                const isSelected = selectedObject === item.id;
                const isSeen = discoveredObjects.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectObject(item.id)}
                    className={`p-2.5 rounded-2xl text-center cursor-pointer transition-all border-2 ${
                      isSelected
                        ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow-lg'
                        : isSeen
                          ? 'bg-emerald-950/60 text-emerald-100 border-emerald-400/50'
                          : 'bg-[#0B0826] text-indigo-200 border-indigo-500/40 hover:border-sky-400'
                    }`}
                  >
                    <div className="text-2xl">{item.icon}</div>
                    <div className="text-[11px] font-extrabold leading-tight mt-1">
                      {item.titleVi}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 card-3d-cosmic rounded-3xl p-5 border-2 border-indigo-400/60 flex flex-col justify-between gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 border-2 border-yellow-400 overflow-hidden shrink-0">
                  <img
                    src="/assets/aistudio/Th_m_ti_u____9352a9ad.png"
                    alt="Robot Toán Học"
                    className="w-full h-full object-cover scale-[1.35]"
                  />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-yellow-300">ROBOT TOÁN HỌC GỢI Ý:</div>
                  <div className="text-lg font-extrabold text-white">
                    {currentObj.icon} {currentObj.titleVi}
                  </div>
                  <div className="text-xs text-sky-300 font-bold">{currentObj.subtitleVi}</div>
                </div>
              </div>

              <div className="bg-[#0B0826] rounded-2xl p-4 border border-indigo-400/40 text-sm text-indigo-100 leading-relaxed font-semibold">
                {currentObj.robotSpeechVi}
              </div>

              <div className="bg-emerald-500/15 border border-emerald-400/50 rounded-2xl p-3.5 text-sm font-bold text-emerald-200">
                💡 Điểm mấu chốt: {currentObj.highlightFactVi}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setActiveTab('concept');
                }}
                className="btn-3d-emerald py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer"
              >
                Tiếp theo: Không cắt nhau →
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setActiveTab('reading');
                }}
                className="btn-3d-gold py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer"
              >
                🗣️ Học cách đọc ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 2: CONCEPT (RECTANGLE ABCD EXTENDED & TILT EXPERIMENT)       */}
      {/* ================================================================ */}
      {activeTab === 'concept' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-7 card-3d-cosmic rounded-3xl p-5 border-2 border-sky-400/60 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-sky-300 uppercase">
                THÍ NGHIỆM KÉO DÀI HAI CẠNH ĐỐI HÌNH CHỮ NHẬT ABCD
              </span>
              <button
                type="button"
                onClick={() => {
                  soundFX.playSnap();
                  setExtendedLines((v) => !v);
                }}
                className="px-3 py-1.5 rounded-xl bg-sky-500/20 border border-sky-400/60 text-xs font-extrabold text-sky-200 cursor-pointer"
              >
                {extendedLines ? 'Thu gọn về hình chữ nhật' : 'Kéo dài cạnh AB và DC'}
              </button>
            </div>

            <div className="bg-[#0B0826] rounded-2xl p-3 border border-indigo-400/40">
              <svg viewBox="0 0 600 265" className="w-full h-auto block">
                <defs>
                  <pattern id="par-concept-grid" width="26" height="26" patternUnits="userSpaceOnUse">
                    <path d="M 26 0 L 0 0 0 26" fill="none" stroke="rgba(129,140,248,0.12)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="600" height="265" rx="12" fill="url(#par-concept-grid)" />

                {/* Rectangle ABCD */}
                <rect
                  x="175"
                  y="78"
                  width="250"
                  height="112"
                  fill="rgba(56,189,248,0.12)"
                  stroke="#94A3B8"
                  strokeWidth="3"
                />

                {/* Top line AB (tilted if tiltDeg > 0 to demonstrate intersection) */}
                {(() => {
                  const rad = (tiltDeg * Math.PI) / 180;
                  const len = extendedLines ? 260 : 125;
                  const cx = 300;
                  const cy = 78;
                  const x1 = cx - Math.cos(rad) * len;
                  const y1 = cy - Math.sin(rad) * len;
                  const x2 = cx + Math.cos(rad) * len;
                  const y2 = cy + Math.sin(rad) * len;
                  return (
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={tiltDeg === 0 ? '#38BDF8' : '#FB923C'}
                      strokeWidth="5.5"
                      strokeLinecap="round"
                    />
                  );
                })()}

                {/* Bottom line DC */}
                <line
                  x1={extendedLines ? 40 : 175}
                  y1="190"
                  x2={extendedLines ? 560 : 425}
                  y2="190"
                  stroke="#34D399"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                />

                {/* Equal distance vertical markers when parallel */}
                {tiltDeg === 0 && (
                  <g opacity="0.85">
                    <line x1="230" y1="78" x2="230" y2="190" stroke="#FACC15" strokeWidth="2" strokeDasharray="5 5" />
                    <line x1="370" y1="78" x2="370" y2="190" stroke="#FACC15" strokeWidth="2" strokeDasharray="5 5" />
                    <path d="M 230 94 L 246 94 L 246 78" fill="none" stroke="#FACC15" strokeWidth="2" />
                    <path d="M 370 174 L 386 174 L 386 190" fill="none" stroke="#FACC15" strokeWidth="2" />
                    <text x="300" y="140" textAnchor="middle" fill="#FACC15" fontSize="14" fontWeight="900">
                      Luôn cách đều · Không bao giờ cắt nhau!
                    </text>
                  </g>
                )}

                {tiltDeg > 0 && (
                  <text x="300" y="140" textAnchor="middle" fill="#FB923C" fontSize="14" fontWeight="900">
                    Bị nghiêng {tiltDeg}° → Kéo dài sẽ cắt nhau!
                  </text>
                )}

                {/* Labels A, B, C, D */}
                <text x="168" y="66" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="900">A</text>
                <text x="432" y="66" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="900">B</text>
                <text x="168" y="216" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="900">D</text>
                <text x="432" y="216" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="900">C</text>
              </svg>
            </div>

            <div className="bg-[#0B0826] rounded-2xl p-3.5 border border-indigo-400/40 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-extrabold text-indigo-100">
                Thử nghiêng nhẹ đường thẳng AB ({tiltDeg}°):
              </span>
              <div className="flex items-center gap-2">
                {[0, 8, 16].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => {
                      soundFX.playTick(deg * 5);
                      setTiltDeg(deg);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                      tiltDeg === deg
                        ? deg === 0
                          ? 'bg-emerald-400 text-slate-950'
                          : 'bg-orange-400 text-slate-950'
                        : 'bg-indigo-950 text-indigo-200 border border-indigo-400/40'
                    }`}
                  >
                    {deg === 0 ? '0° (Song song chuẩn)' : `Nghiêng ${deg}°`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 card-3d-cosmic rounded-3xl p-5 border-2 border-indigo-400/60 flex flex-col justify-between gap-4">
            <div className="space-y-4">
              <div className="bg-sky-500/20 border-2 border-sky-400/60 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-extrabold text-sky-300 uppercase">
                  KIẾN THỨC CỐT LÕI CẦN NHỚ
                </div>
                <p className="text-base font-extrabold text-white leading-relaxed">
                  • Kéo dài hai cạnh <span className="text-yellow-300">AB</span> và{' '}
                  <span className="text-yellow-300">DC</span> của hình chữ nhật{' '}
                  <span className="text-sky-300">ABCD</span>, ta được{' '}
                  <span className="text-emerald-300">hai đường thẳng song song với nhau</span>.
                </p>
                <p className="text-base font-extrabold text-yellow-200 leading-relaxed">
                  • Hai đường thẳng song song với nhau <span className="underline">không bao giờ cắt nhau</span>!
                </p>
              </div>

              <div className="bg-[#0B0826] rounded-2xl p-4 border border-indigo-500/40 text-sm text-indigo-100 space-y-2">
                <p>
                  • Nếu hai đường thẳng chỉ cần hơi nghiêng về phía nhau một chút thôi, khi kéo dài ra chúng sẽ gặp nhau tại một điểm → <strong className="text-orange-300">KHÔNG song song</strong>.
                </p>
                <p>
                  • Ngược lại, hai đường thẳng song song luôn giữ khoảng cách đều nhau mãi mãi.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setActiveTab('reading');
              }}
              className="btn-3d-gold w-full py-3 px-4 rounded-xl font-extrabold text-sm cursor-pointer"
            >
              Tiếp theo: Học cách đọc và 1 cạnh song song nhiều cạnh →
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 3: READING GUIDE + 1 EDGE PARALLEL TO MULTIPLE EDGES         */}
      {/* ================================================================ */}
      {activeTab === 'reading' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-7 card-3d-cosmic rounded-3xl p-5 border-2 border-yellow-400/60 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-yellow-300 uppercase">
                CHỌN HÌNH VÀ BẤM CẠNH ĐỂ XEM CÁCH ĐỌC CHUẨN
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'rect_abcd', label: 'Chữ nhật ABCD' },
                    { id: 'square_mnpq', label: 'Hình vuông MNPQ' },
                    { id: 'split_rect', label: 'Hình ghép AMND-MBCN' },
                    { id: 'window_3', label: 'Cửa sổ 3 ô' },
                  ] as Array<{ id: ReadingShapeId; label: string }>
                ).map((sh) => (
                  <button
                    key={sh.id}
                    type="button"
                    data-testid={`par-reading-shape-${sh.id}`}
                    onClick={() => handleSwitchReadingShape(sh.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                      readingShape === sh.id
                        ? 'bg-yellow-400 text-slate-950'
                        : 'bg-indigo-950 text-indigo-200 border border-indigo-400/40 hover:border-yellow-300'
                    }`}
                  >
                    {sh.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive SVG Diagram highlighting 1 reference edge (gold) + ALL parallel edges (emerald) */}
            <div className="bg-[#0B0826] rounded-2xl p-3 border border-indigo-400/40">
              <svg viewBox="0 0 600 265" className="w-full h-auto block">
                <defs>
                  <pattern id="par-read-grid" width="26" height="26" patternUnits="userSpaceOnUse">
                    <path d="M 26 0 L 0 0 0 26" fill="none" stroke="rgba(129,140,248,0.12)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="600" height="265" rx="12" fill="url(#par-read-grid)" />

                {/* Shape 1: Rectangle ABCD */}
                {readingShape === 'rect_abcd' && (
                  <g>
                    <rect x="155" y="65" width="290" height="140" fill="rgba(56,189,248,0.12)" stroke="#64748B" strokeWidth="3" />
                    <line x1="155" y1="65" x2="445" y2="65" stroke={getEdgeHighlight('AB') === 'ref' ? '#FACC15' : '#94A3B8'} strokeWidth={getEdgeHighlight('AB') !== 'none' ? 7 : 3.5} strokeLinecap="round" />
                    <line x1="155" y1="205" x2="445" y2="205" stroke={getEdgeHighlight('DC') === 'par' ? '#34D399' : '#94A3B8'} strokeWidth={getEdgeHighlight('DC') !== 'none' ? 7 : 3.5} strokeLinecap="round" />
                    <line x1="155" y1="65" x2="155" y2="205" stroke={getEdgeHighlight('AD') === 'ref' ? '#FACC15' : '#94A3B8'} strokeWidth={getEdgeHighlight('AD') !== 'none' ? 7 : 3.5} strokeLinecap="round" />
                    <line x1="445" y1="65" x2="445" y2="205" stroke={getEdgeHighlight('BC') === 'par' ? '#34D399' : '#94A3B8'} strokeWidth={getEdgeHighlight('BC') !== 'none' ? 7 : 3.5} strokeLinecap="round" />
                    <text x="300" y="47" textAnchor="middle" fill={getEdgeHighlight('AB') === 'ref' ? '#FACC15' : '#CBD5E1'} fontSize="15" fontWeight="900">Cạnh AB</text>
                    <text x="300" y="232" textAnchor="middle" fill={getEdgeHighlight('DC') === 'par' ? '#34D399' : '#CBD5E1'} fontSize="15" fontWeight="900">Cạnh DC</text>
                    <text x="136" y="140" textAnchor="end" fill={getEdgeHighlight('AD') === 'ref' ? '#FACC15' : '#CBD5E1'} fontSize="15" fontWeight="900">Cạnh AD</text>
                    <text x="464" y="140" textAnchor="start" fill={getEdgeHighlight('BC') === 'par' ? '#34D399' : '#CBD5E1'} fontSize="15" fontWeight="900">Cạnh BC</text>
                    <text x="138" y="60" fill="#FFFFFF" fontSize="22" fontWeight="900">A</text>
                    <text x="454" y="60" fill="#FFFFFF" fontSize="22" fontWeight="900">B</text>
                    <text x="454" y="222" fill="#FFFFFF" fontSize="22" fontWeight="900">C</text>
                    <text x="138" y="222" fill="#FFFFFF" fontSize="22" fontWeight="900">D</text>
                  </g>
                )}

                {/* Shape 2: Square MNPQ */}
                {readingShape === 'square_mnpq' && (
                  <g>
                    <rect x="225" y="58" width="150" height="150" fill="rgba(56,189,248,0.12)" stroke="#64748B" strokeWidth="3" />
                    <line x1="225" y1="58" x2="375" y2="58" stroke={getEdgeHighlight('MN') === 'ref' ? '#FACC15' : '#94A3B8'} strokeWidth={getEdgeHighlight('MN') !== 'none' ? 7 : 3.5} strokeLinecap="round" />
                    <line x1="225" y1="208" x2="375" y2="208" stroke={getEdgeHighlight('QP') === 'par' ? '#34D399' : '#94A3B8'} strokeWidth={getEdgeHighlight('QP') !== 'none' ? 7 : 3.5} strokeLinecap="round" />
                    <line x1="225" y1="58" x2="225" y2="208" stroke={getEdgeHighlight('MQ') === 'ref' ? '#FACC15' : '#94A3B8'} strokeWidth={getEdgeHighlight('MQ') !== 'none' ? 7 : 3.5} strokeLinecap="round" />
                    <line x1="375" y1="58" x2="375" y2="208" stroke={getEdgeHighlight('NP') === 'par' ? '#34D399' : '#94A3B8'} strokeWidth={getEdgeHighlight('NP') !== 'none' ? 7 : 3.5} strokeLinecap="round" />
                    <text x="300" y="42" textAnchor="middle" fill={getEdgeHighlight('MN') === 'ref' ? '#FACC15' : '#CBD5E1'} fontSize="15" fontWeight="900">Cạnh MN</text>
                    <text x="300" y="234" textAnchor="middle" fill={getEdgeHighlight('QP') === 'par' ? '#34D399' : '#CBD5E1'} fontSize="15" fontWeight="900">Cạnh QP</text>
                    <text x="206" y="138" textAnchor="end" fill={getEdgeHighlight('MQ') === 'ref' ? '#FACC15' : '#CBD5E1'} fontSize="15" fontWeight="900">Cạnh MQ</text>
                    <text x="394" y="138" textAnchor="start" fill={getEdgeHighlight('NP') === 'par' ? '#34D399' : '#CBD5E1'} fontSize="15" fontWeight="900">Cạnh NP</text>
                    <text x="205" y="54" fill="#FFFFFF" fontSize="22" fontWeight="900">M</text>
                    <text x="382" y="54" fill="#FFFFFF" fontSize="22" fontWeight="900">N</text>
                    <text x="382" y="226" fill="#FFFFFF" fontSize="22" fontWeight="900">P</text>
                    <text x="205" y="226" fill="#FFFFFF" fontSize="22" fontWeight="900">Q</text>
                  </g>
                )}

                {/* Shape 3: Split Rectangle AMND + MBCN (1 edge parallel to 2 edges!) */}
                {readingShape === 'split_rect' && (
                  <g>
                    <rect x="135" y="65" width="330" height="140" fill="rgba(56,189,248,0.12)" stroke="#94A3B8" strokeWidth="3.5" />
                    <line
                      x1="135" y1="65" x2="135" y2="205"
                      stroke={getEdgeHighlight('AD') === 'ref' ? '#FACC15' : getEdgeHighlight('AD') === 'par' ? '#34D399' : '#94A3B8'}
                      strokeWidth="7" strokeLinecap="round"
                    />
                    <line
                      x1="345" y1="65" x2="345" y2="205"
                      stroke={getEdgeHighlight('MN') === 'ref' ? '#FACC15' : getEdgeHighlight('MN') === 'par' ? '#34D399' : '#94A3B8'}
                      strokeWidth="7" strokeLinecap="round"
                    />
                    <line
                      x1="465" y1="65" x2="465" y2="205"
                      stroke={getEdgeHighlight('BC') === 'ref' ? '#FACC15' : getEdgeHighlight('BC') === 'par' ? '#34D399' : '#94A3B8'}
                      strokeWidth="7" strokeLinecap="round"
                    />
                    <text x="118" y="140" textAnchor="end" fill={getEdgeHighlight('AD') === 'ref' ? '#FACC15' : '#34D399'} fontSize="15" fontWeight="900">Cạnh AD</text>
                    <text x="330" y="140" textAnchor="end" fill={getEdgeHighlight('MN') === 'ref' ? '#FACC15' : '#34D399'} fontSize="15" fontWeight="900">Cạnh MN</text>
                    <text x="482" y="140" textAnchor="start" fill={getEdgeHighlight('BC') === 'ref' ? '#FACC15' : '#34D399'} fontSize="15" fontWeight="900">Cạnh BC</text>
                    <text x="120" y="56" fill="#FFFFFF" fontSize="22" fontWeight="900">A</text>
                    <text x="345" y="54" textAnchor="middle" fill="#FACC15" fontSize="22" fontWeight="900">M</text>
                    <text x="470" y="56" fill="#FFFFFF" fontSize="22" fontWeight="900">B</text>
                    <text x="120" y="232" fill="#FFFFFF" fontSize="22" fontWeight="900">D</text>
                    <text x="345" y="234" textAnchor="middle" fill="#FACC15" fontSize="22" fontWeight="900">N</text>
                    <text x="470" y="232" fill="#FFFFFF" fontSize="22" fontWeight="900">C</text>
                  </g>
                )}

                {/* Shape 4: 3-Pane Window (1 edge parallel to 3 edges!) */}
                {readingShape === 'window_3' && (
                  <g>
                    <rect x="115" y="65" width="370" height="140" fill="rgba(56,189,248,0.12)" stroke="#64748B" strokeWidth="3" />
                    <line x1="115" y1="65" x2="485" y2="65" stroke={getEdgeHighlight('AB') === 'ref' ? '#FACC15' : '#94A3B8'} strokeWidth={getEdgeHighlight('AB') !== 'none' ? 7 : 3.5} />
                    <line x1="115" y1="205" x2="485" y2="205" stroke={getEdgeHighlight('DC') === 'par' ? '#34D399' : '#94A3B8'} strokeWidth={getEdgeHighlight('DC') !== 'none' ? 7 : 3.5} />
                    {[
                      { id: 'AD', x: 115, t: 'A', b: 'D' },
                      { id: 'MN', x: 238, t: 'M', b: 'N' },
                      { id: 'PQ', x: 362, t: 'P', b: 'Q' },
                      { id: 'BC', x: 485, t: 'B', b: 'C' },
                    ].map((col) => {
                      const hl = getEdgeHighlight(col.id);
                      const colStroke = hl === 'ref' ? '#FACC15' : hl === 'par' ? '#34D399' : '#94A3B8';
                      return (
                        <g key={col.id}>
                          <line x1={col.x} y1="65" x2={col.x} y2="205" stroke={colStroke} strokeWidth={hl !== 'none' ? 7 : 3.5} strokeLinecap="round" />
                          <text x={col.x} y="52" textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="900">{col.t}</text>
                          <text x={col.x} y="232" textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="900">{col.b}</text>
                        </g>
                      );
                    })}
                    <text x="100" y="140" textAnchor="end" fill={getEdgeHighlight('AD') === 'ref' ? '#FACC15' : '#CBD5E1'} fontSize="14" fontWeight="900">AD</text>
                    <text x="224" y="140" textAnchor="end" fill={getEdgeHighlight('MN') === 'par' ? '#34D399' : '#CBD5E1'} fontSize="14" fontWeight="900">MN</text>
                    <text x="348" y="140" textAnchor="end" fill={getEdgeHighlight('PQ') === 'par' ? '#34D399' : '#CBD5E1'} fontSize="14" fontWeight="900">PQ</text>
                    <text x="500" y="140" textAnchor="start" fill={getEdgeHighlight('BC') === 'par' ? '#34D399' : '#CBD5E1'} fontSize="14" fontWeight="900">BC</text>
                  </g>
                )}
              </svg>
            </div>

            {/* Selectable Reference Edge Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-indigo-200">Bấm chọn cạnh chuẩn (vàng):</span>
              {currentReadingShape.groups.map((grp, idx) => (
                <button
                  key={grp.refEdgeId}
                  type="button"
                  onClick={() => {
                    soundFX.playSnap();
                    setSelectedGroupIdx(idx);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer border-2 ${
                    selectedGroupIdx === idx
                      ? 'bg-yellow-400 text-slate-950 border-yellow-300'
                      : 'bg-indigo-950 text-indigo-200 border-indigo-400/40 hover:border-yellow-300'
                  }`}
                >
                  ⭐ {grp.refEdgeLabel} ({grp.parallelEdges.length} cạnh song song)
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 card-3d-cosmic rounded-3xl p-5 border-2 border-indigo-400/60 flex flex-col justify-between gap-4">
            <div className="space-y-3.5">
              {/* Two standard Vietnamese reading formulas */}
              <div className="bg-[#0B0826] border-2 border-yellow-400/60 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-extrabold text-yellow-300 uppercase">
                  🗣️ 2 MẪU CÂU ĐỌC CHUẨN HAI CẠNH SONG SONG
                </div>
                <div className="text-sm font-extrabold text-white space-y-1">
                  <div>
                    • Mẫu 1: <span className="text-yellow-300">Cạnh ...</span> song song với{' '}
                    <span className="text-emerald-300">cạnh ...</span>
                  </div>
                  <div>
                    • Mẫu 2: <span className="text-sky-300">Hai cạnh ... và ...</span> song song với nhau
                  </div>
                </div>
                <div className="text-[11px] font-bold text-pink-300">
                  ★ Lưu ý mở rộng: Một cạnh có thể song song với 2, 3 hoặc nhiều cạnh khác trong cùng một hình!
                </div>
              </div>

              {/* Active Highlight Reading Box */}
              <div className="bg-emerald-500/20 border-2 border-emerald-400/70 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-emerald-300 uppercase">
                    ✅ CÁCH ĐỌC TRÊN HÌNH BÊN:
                  </span>
                  <span className="text-[11px] font-extrabold bg-yellow-400/20 text-yellow-200 px-2 py-0.5 rounded-lg">
                    {currentReadingShape.badge}
                  </span>
                </div>
                <p className="text-base font-extrabold text-white leading-snug">
                  “{activeGroup.sentenceVi}”
                </p>
                <p className="text-xs text-emerald-100 leading-relaxed">{activeGroup.tipVi}</p>
              </div>

              {/* Mini Quick-Check Quiz */}
              <div className="bg-[#0B0826] border border-indigo-400/40 rounded-2xl p-3.5 space-y-2">
                <div className="text-xs font-extrabold text-sky-300">
                  🎯 THỬ TÀI ĐỌC NHANH: Trong khung cửa sổ 3 ô dọc (AD, MN, PQ, BC), cạnh MN song song với những cạnh nào?
                </div>
                <div className="space-y-1.5">
                  {[
                    'Cạnh AD, cạnh PQ và cạnh BC (3 cạnh)',
                    'Chỉ song song với duy nhất cạnh PQ (1 cạnh)',
                  ].map((opt, idx) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setMiniQuizAnswer(idx);
                        if (idx === 0) soundFX.playSuccess();
                        else soundFX.playWrong();
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        miniQuizAnswer === idx
                          ? idx === 0
                            ? 'bg-emerald-500/25 border-emerald-400 text-emerald-100'
                            : 'bg-rose-500/25 border-rose-400 text-rose-100'
                          : 'bg-indigo-950/80 border-indigo-500/40 text-indigo-100 hover:border-yellow-300'
                      }`}
                    >
                      {miniQuizAnswer === idx && (idx === 0 ? '✅ ' : '❌ ')}
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setActiveTab('compare');
              }}
              className="btn-3d-emerald w-full py-3 px-4 rounded-xl font-extrabold text-sm cursor-pointer"
            >
              Tiếp theo: Phân biệt Song song và Vuông góc →
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 4: COMPARE PARALLEL VS PERPENDICULAR (VIET & 6 POLYGONS)     */}
      {/* ================================================================ */}
      {activeTab === 'compare' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left: Matchstick Letters V I E T */}
          <div className="lg:col-span-6 card-3d-cosmic rounded-3xl p-5 border-2 border-pink-400/60 space-y-4">
            <div>
              <div className="text-xs font-extrabold text-pink-300 uppercase">
                TRÒ CHƠI QUE TÍNH · BỐN CHỮ CÁI V, I, E, T
              </div>
              <p className="text-xs text-indigo-100 mt-1">
                Bấm chọn từng chữ cái để kiểm tra xem chữ nào có que tính song song, vuông góc hay có cả hai!
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {(['V', 'I', 'E', 'T'] as StickLetterId[]).map((lt) => (
                <button
                  key={lt}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setSelectedLetter(lt);
                  }}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-1.5 ${
                    selectedLetter === lt
                      ? 'bg-yellow-400/20 border-yellow-400 shadow-lg'
                      : 'bg-[#0B0826] border-indigo-500/40 hover:border-pink-400'
                  }`}
                >
                  <svg viewBox="0 0 80 80" className="w-16 h-16">
                    {lt === 'V' && (
                      <g stroke="#F472B6" strokeWidth="7" strokeLinecap="round">
                        <line x1="16" y1="14" x2="40" y2="66" />
                        <line x1="64" y1="14" x2="40" y2="66" />
                      </g>
                    )}
                    {lt === 'I' && (
                      <line x1="40" y1="14" x2="40" y2="66" stroke="#38BDF8" strokeWidth="7" strokeLinecap="round" />
                    )}
                    {lt === 'E' && (
                      <g strokeLinecap="round">
                        <line x1="20" y1="14" x2="20" y2="66" stroke="#38BDF8" strokeWidth="7" />
                        <line x1="20" y1="14" x2="62" y2="14" stroke="#34D399" strokeWidth="7" />
                        <line x1="20" y1="40" x2="58" y2="40" stroke="#34D399" strokeWidth="7" />
                        <line x1="20" y1="66" x2="62" y2="66" stroke="#34D399" strokeWidth="7" />
                      </g>
                    )}
                    {lt === 'T' && (
                      <g strokeLinecap="round">
                        <line x1="14" y1="16" x2="66" y2="16" stroke="#FACC15" strokeWidth="7" />
                        <line x1="40" y1="16" x2="40" y2="66" stroke="#F472B6" strokeWidth="7" />
                      </g>
                    )}
                  </svg>
                  <span className="text-xs font-extrabold text-white">Chữ {lt}</span>
                </button>
              ))}
            </div>

            <div className="bg-[#0B0826] rounded-2xl p-4 border border-indigo-400/40 text-sm font-bold text-indigo-100 leading-relaxed">
              {selectedLetter === 'V' &&
                'Chữ V: Hai que tính cắt nhau tạo thành góc nhọn — KHÔNG song song và KHÔNG vuông góc.'}
              {selectedLetter === 'I' &&
                'Chữ I: Chỉ có 1 que tính thẳng đứng duy nhất nên không tạo thành cặp song song hay vuông góc.'}
              {selectedLetter === 'E' &&
                '🏆 Chữ E: ĐẶC BIỆT NHẤT! Có 3 que tính ngang SONG SONG với nhau (1 thanh song song với 2 thanh kia) VÀ cả 3 đều VUÔNG GÓC với thanh đứng!'}
              {selectedLetter === 'T' &&
                'Chữ T: Hai que tính VUÔNG GÓC với nhau tạo thành 2 góc vuông, nhưng không có cặp nào song song.'}
            </div>
          </div>

          {/* Right: 6 Polygons Interactive Filter */}
          <div className="lg:col-span-6 card-3d-cosmic rounded-3xl p-5 border-2 border-emerald-400/60 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-emerald-300 uppercase">
                  BỘ 6 HÌNH ĐA GIÁC · LỌC NHANH
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setPolyFilter('parallel');
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer ${
                      polyFilter === 'parallel'
                        ? 'bg-emerald-400 text-slate-950'
                        : 'bg-indigo-950 text-indigo-200 border border-indigo-400/40'
                    }`}
                  >
                    Có cặp cạnh song song
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setPolyFilter('perpendicular');
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer ${
                      polyFilter === 'perpendicular'
                        ? 'bg-pink-400 text-slate-950'
                        : 'bg-indigo-950 text-indigo-200 border border-indigo-400/40'
                    }`}
                  >
                    Có cặp cạnh vuông góc
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { n: 1, name: 'Chữ nhật', hasPar: true, hasPerp: true },
                  { n: 2, name: 'Hình thang', hasPar: true, hasPerp: false },
                  { n: 3, name: 'Tam giác', hasPar: false, hasPerp: false },
                  { n: 4, name: 'Tam giác vuông', hasPar: false, hasPerp: true },
                  { n: 5, name: 'Lục giác đều', hasPar: true, hasPerp: false },
                  { n: 6, name: 'Ngôi nhà', hasPar: true, hasPerp: true },
                ].map((p) => {
                  const matched = polyFilter === 'parallel' ? p.hasPar : p.hasPerp;
                  return (
                    <div
                      key={p.n}
                      className={`p-2.5 rounded-2xl border-2 text-center transition-all ${
                        matched
                          ? polyFilter === 'parallel'
                            ? 'bg-emerald-500/20 border-emerald-400'
                            : 'bg-pink-500/20 border-pink-400'
                          : 'bg-[#0B0826] border-indigo-500/30 opacity-50'
                      }`}
                    >
                      <svg viewBox="0 0 100 68" className="w-full h-14 mx-auto">
                        {p.n === 1 && <rect x="14" y="14" width="72" height="42" fill="rgba(56,189,248,0.2)" stroke="#FFFFFF" strokeWidth="2.5" />}
                        {p.n === 2 && <polygon points="28,14 72,14 88,56 12,56" fill="rgba(56,189,248,0.2)" stroke="#FFFFFF" strokeWidth="2.5" />}
                        {p.n === 3 && <polygon points="14,14 86,14 40,56" fill="rgba(56,189,248,0.2)" stroke="#FFFFFF" strokeWidth="2.5" />}
                        {p.n === 4 && (
                          <g>
                            <polygon points="20,12 20,56 84,56" fill="rgba(56,189,248,0.2)" stroke="#FFFFFF" strokeWidth="2.5" />
                            <path d="M 32 56 L 32 44 L 20 44" fill="none" stroke="#F472B6" strokeWidth="2.5" />
                          </g>
                        )}
                        {p.n === 5 && <polygon points="30,12 70,12 88,34 70,56 30,56 12,34" fill="rgba(56,189,248,0.2)" stroke="#FFFFFF" strokeWidth="2.5" />}
                        {p.n === 6 && <polygon points="50,8 82,28 82,58 18,58 18,28" fill="rgba(56,189,248,0.2)" stroke="#FFFFFF" strokeWidth="2.5" />}
                        <text x="50" y="40" textAnchor="middle" fill="#FACC15" fontSize="14" fontWeight="900">
                          {p.n}
                        </text>
                      </svg>
                      <div className="text-[11px] font-extrabold text-white mt-0.5">{p.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFX.playSuccess();
                onCompleteExplore();
                onGoLab();
              }}
              className="btn-3d-pink w-full py-3 px-4 rounded-xl font-extrabold text-sm cursor-pointer"
            >
              🛤️ Thực hành vẽ song song bằng Ê Ke ngay →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
