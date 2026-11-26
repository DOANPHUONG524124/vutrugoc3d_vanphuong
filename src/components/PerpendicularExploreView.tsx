import React, { useState } from 'react';
import { soundFX } from '../utils/soundEffects';

interface PerpendicularExploreViewProps {
  onOpenLab: () => void;
  onOpenGuide: () => void;
  onBackHome: () => void;
}

type ExploreTabId = 'realworld' | 'concept' | 'reading' | 'eke';
type RealWorldItemId = 'board' | 'kite' | 'window' | 'windmill' | 'notebook' | 'crossroad';
type ReadingShapeId = 'triangle_abc' | 'rect_mnpq' | 'quad_abcd';

interface ReadingVertexInfo {
  id: string;
  label: string;
  isRight: boolean;
  edge1Label: string;
  edge2Label: string;
  sentenceVi: string;
  tipVi: string;
}

const READING_SHAPES: Record<
  ReadingShapeId,
  {
    titleVi: string;
    subtitleVi: string;
    vertices: ReadingVertexInfo[];
  }
> = {
  triangle_abc: {
    titleVi: 'Hình tam giác ABC',
    subtitleVi: 'Có 1 góc vuông tại đỉnh A',
    vertices: [
      {
        id: 'A',
        label: 'Đỉnh A (Vuông)',
        isRight: true,
        edge1Label: 'Cạnh AB',
        edge2Label: 'Cạnh AC',
        sentenceVi: 'Cạnh AB vuông góc với cạnh AC tại đỉnh A.',
        tipVi: 'Mẹo nhỏ: Đọc tên cạnh thứ nhất → "vuông góc với" → tên cạnh thứ hai → "tại đỉnh" chung của hai cạnh!',
      },
      {
        id: 'B',
        label: 'Đỉnh B (Nhọn)',
        isRight: false,
        edge1Label: 'Cạnh BA',
        edge2Label: 'Cạnh BC',
        sentenceVi: 'Cạnh BA và cạnh BC cắt nhau tại đỉnh B nhưng KHÔNG vuông góc (góc nhọn).',
        tipVi: 'Chú ý: Không phải hai cạnh nào cắt nhau cũng vuông góc đâu nhé! Chỉ vuông góc khi tạo thành góc 90°.',
      },
      {
        id: 'C',
        label: 'Đỉnh C (Nhọn)',
        isRight: false,
        edge1Label: 'Cạnh CA',
        edge2Label: 'Cạnh CB',
        sentenceVi: 'Cạnh CA và cạnh CB cắt nhau tại đỉnh C nhưng KHÔNG vuông góc (góc nhọn).',
        tipVi: 'Đỉnh C tạo thành góc nhọn bé hơn 90° nên hai cạnh CA và CB không vuông góc.',
      },
    ],
  },
  rect_mnpq: {
    titleVi: 'Hình chữ nhật MNPQ',
    subtitleVi: 'Có 4 cặp cạnh vuông góc tại 4 đỉnh M, N, P, Q',
    vertices: [
      {
        id: 'M',
        label: 'Đỉnh M',
        isRight: true,
        edge1Label: 'Cạnh MN',
        edge2Label: 'Cạnh MQ',
        sentenceVi: 'Cạnh MN vuông góc với cạnh MQ tại đỉnh M.',
        tipVi: 'Cả hai cạnh MN và MQ đều xuất phát từ đỉnh M và tạo thành góc vuông 90°.',
      },
      {
        id: 'N',
        label: 'Đỉnh N',
        isRight: true,
        edge1Label: 'Cạnh NM',
        edge2Label: 'Cạnh NP',
        sentenceVi: 'Cạnh MN vuông góc với cạnh NP tại đỉnh N.',
        tipVi: 'Em cũng có thể đọc là: "Cạnh NP vuông góc với cạnh NM tại đỉnh N".',
      },
      {
        id: 'P',
        label: 'Đỉnh P',
        isRight: true,
        edge1Label: 'Cạnh PN',
        edge2Label: 'Cạnh PQ',
        sentenceVi: 'Cạnh NP vuông góc với cạnh PQ tại đỉnh P.',
        tipVi: 'Hai cạnh kề nhau tại đỉnh P tạo thành một góc vuông chuẩn 90°.',
      },
      {
        id: 'Q',
        label: 'Đỉnh Q',
        isRight: true,
        edge1Label: 'Cạnh QP',
        edge2Label: 'Cạnh QM',
        sentenceVi: 'Cạnh PQ vuông góc với cạnh QM tại đỉnh Q.',
        tipVi: 'Hình chữ nhật có đủ 4 cặp cạnh vuông góc ở cả 4 góc!',
      },
    ],
  },
  quad_abcd: {
    titleVi: 'Hình tứ giác ABCD',
    subtitleVi: 'Vuông tại đỉnh A và D; không vuông tại B và C',
    vertices: [
      {
        id: 'A',
        label: 'Đỉnh A (Vuông)',
        isRight: true,
        edge1Label: 'Cạnh AB',
        edge2Label: 'Cạnh AD',
        sentenceVi: 'Cạnh AB vuông góc với cạnh AD tại đỉnh A.',
        tipVi: 'Tại đỉnh A có kí hiệu ô vuông vức nên AB vuông góc với AD.',
      },
      {
        id: 'D',
        label: 'Đỉnh D (Vuông)',
        isRight: true,
        edge1Label: 'Cạnh DA',
        edge2Label: 'Cạnh DC',
        sentenceVi: 'Cạnh AD vuông góc với cạnh DC tại đỉnh D.',
        tipVi: 'Tại đỉnh D có góc vuông 90° nên cạnh AD vuông góc với cạnh DC.',
      },
      {
        id: 'B',
        label: 'Đỉnh B (Góc tù)',
        isRight: false,
        edge1Label: 'Cạnh AB',
        edge2Label: 'Cạnh BC',
        sentenceVi: 'Cạnh AB và cạnh BC cắt nhau tại đỉnh B nhưng KHÔNG vuông góc.',
        tipVi: 'Góc đỉnh B là góc tù (lớn hơn 90°), nên AB không vuông góc với BC.',
      },
      {
        id: 'C',
        label: 'Đỉnh C (Góc nhọn)',
        isRight: false,
        edge1Label: 'Cạnh BC',
        edge2Label: 'Cạnh CD',
        sentenceVi: 'Cạnh BC và cạnh CD cắt nhau tại đỉnh C nhưng KHÔNG vuông góc.',
        tipVi: 'Góc đỉnh C là góc nhọn (bé hơn 90°), nên BC không vuông góc với CD.',
      },
    ],
  },
};

const REAL_WORLD_ITEMS: Array<{
  id: RealWorldItemId;
  icon: string;
  titleVi: string;
  shortDescVi: string;
  robotSpeechVi: string;
  highlightNoteVi: string;
}> = [
  {
    id: 'board',
    icon: '🟩',
    titleVi: 'Bảng lớp học',
    shortDescVi: 'Hai cạnh kề nhau ở góc bảng',
    robotSpeechVi:
      'Nhìn lên bảng xanh quen thuộc ở lớp học kìa! Mép ngang phía trên và mép dọc bên cạnh gặp nhau tạo thành góc vuông 90° thật ngay ngắn.',
    highlightNoteVi: 'Hai cạnh kề của bảng lớp vuông góc với nhau tại mỗi góc bảng.',
  },
  {
    id: 'kite',
    icon: '🪁',
    titleVi: 'Con diều tre',
    shortDescVi: 'Hai thanh tre buộc chữ thập',
    robotSpeechVi:
      'Tớ đang buộc hai thanh tre vuông góc với nhau để làm con diều đấy! Buộc đúng góc vuông 90° sẽ giúp con diều cân đối và bay cao vút trên bầu trời.',
    highlightNoteVi: 'Hai thanh tre khung diều cắt nhau vuông góc tạo thành 4 góc vuông.',
  },
  {
    id: 'window',
    icon: '🪟',
    titleVi: 'Khung cửa sổ',
    shortDescVi: 'Thanh ngang và thanh dọc đan nhau',
    robotSpeechVi:
      'Khung cửa sổ trong nhà có thanh gỗ nằm ngang và thanh gỗ thẳng đứng cắt nhau vuông góc, chia khung cửa thành những ô hình chữ nhật thật đẹp!',
    highlightNoteVi: 'Thanh ngang và thanh dọc của cửa sổ vuông góc tại tâm và 4 góc khung.',
  },
  {
    id: 'windmill',
    icon: '🌻',
    titleVi: 'Cối xay gió',
    shortDescVi: 'Hai thanh cánh quạt bắt chéo nhau',
    robotSpeechVi:
      'Cối xay gió quay trong gió nhờ hai thanh cánh quạt dài bắt chéo vuông góc nhau tại trục quay ở giữa. Ngoài ra khung tranh và ô cửa sổ cũng có góc vuông đó!',
    highlightNoteVi: 'Hai thanh cánh quạt cối xay gió vuông góc nhau tại tâm quay.',
  },
  {
    id: 'notebook',
    icon: '📓',
    titleVi: 'Trang vở ô li',
    shortDescVi: 'Đường kẻ ngang và kẻ dọc trong vở',
    robotSpeechVi:
      'Mỗi ngày em mở quyển vở ô li ra viết bài, các đường kẻ ngang và đường kẻ dọc cắt nhau tạo thành hàng trăm ô vuông vức — đó chính là các đường thẳng vuông góc!',
    highlightNoteVi: 'Mỗi dòng kẻ ngang đều vuông góc với các đường kẻ dọc trong vở ô li.',
  },
  {
    id: 'crossroad',
    icon: '🚦',
    titleVi: 'Ngã tư đường phố',
    shortDescVi: 'Hai con đường cắt nhau hình chữ thập',
    robotSpeechVi:
      'Khi nhìn từ trên cao xuống một ngã tư thẳng tắp, hai con đường giao nhau tạo thành 4 góc vuông bằng nhau ở 4 góc phố!',
    highlightNoteVi: 'Hai con đường cắt nhau hình chữ thập vuông góc tại giao lộ.',
  },
];

export const PerpendicularExploreView: React.FC<PerpendicularExploreViewProps> = ({
  onOpenLab,
  onOpenGuide,
  onBackHome,
}) => {
  const [activeTab, setActiveTab] = useState<ExploreTabId>('realworld');

  // Tab 1: Real world
  const [selectedRealItem, setSelectedRealItem] = useState<RealWorldItemId>('board');
  const [discoveredItems, setDiscoveredItems] = useState<RealWorldItemId[]>(['board']);

  // Tab 2: Concept (Rectangle ABCD + 4 Right Angles)
  const [conceptMode, setConceptMode] = useState<'rect' | 'four_rights'>('rect');
  const [showExtensions, setShowExtensions] = useState<boolean>(true);
  const [showRectEke, setShowRectEke] = useState<boolean>(true);
  const [selectedQuadrants, setSelectedQuadrants] = useState<number[]>([1]);

  // Tab 3: Reading Perpendicular Sides
  const [readingShape, setReadingShape] = useState<ReadingShapeId>('triangle_abc');
  const [selectedVertexId, setSelectedVertexId] = useState<string>('A');
  const [miniQuizPick, setMiniQuizPick] = useState<number | null>(null);

  const currentRealInfo =
    REAL_WORLD_ITEMS.find((item) => item.id === selectedRealItem) || REAL_WORLD_ITEMS[0];

  const currentReadingSpec = READING_SHAPES[readingShape];
  const currentVertexInfo =
    currentReadingSpec.vertices.find((v) => v.id === selectedVertexId) ||
    currentReadingSpec.vertices[0];

  const handleSelectRealItem = (id: RealWorldItemId) => {
    soundFX.playSnap();
    setSelectedRealItem(id);
    setDiscoveredItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleSwitchReadingShape = (shapeId: ReadingShapeId) => {
    soundFX.playClick(1.1);
    setReadingShape(shapeId);
    setSelectedVertexId(READING_SHAPES[shapeId].vertices[0].id);
  };

  const toggleQuadrant = (q: number) => {
    soundFX.playSnap();
    setSelectedQuadrants((prev) =>
      prev.includes(q) ? prev : [...prev, q].sort((a, b) => a - b)
    );
  };

  const TABS: { id: ExploreTabId; label: string; icon: string }[] = [
    { id: 'realworld', label: '1. Thám tử góc vuông quanh em', icon: '🔍' },
    { id: 'concept', label: '2. Khái niệm và 4 góc vuông', icon: '✨' },
    { id: 'reading', label: '3. Cách đọc hai cạnh vuông góc', icon: '🗣️' },
    { id: 'eke', label: '4. Khám phá chiếc Ê Ke', icon: '🛠️' },
  ];

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-4">
      {/* Top Bar */}
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
            CHỦ ĐỀ 2 · KHÁM PHÁ TRỰC QUAN CÙNG ROBOT TOÁN HỌC
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            1. KHÁM PHÁ HAI ĐƯỜNG THẲNG VUÔNG GÓC
          </h2>
        </div>

        <button
          type="button"
          onClick={onOpenLab}
          className="btn-3d-pink px-4 py-2 rounded-xl text-sm font-extrabold cursor-pointer"
        >
          📐 Vào Phòng Thí Nghiệm Ê Ke →
        </button>
      </div>

      {/* 4 Sub-tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              data-testid={`explore-tab-${t.id}`}
              onClick={() => {
                soundFX.playClick(1.1);
                setActiveTab(t.id);
              }}
              className={`px-3.5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-center gap-2 ${
                active
                  ? 'bg-yellow-400 text-slate-950 shadow-lg scale-[1.02]'
                  : 'bg-[#130E38]/95 text-indigo-100 border-2 border-indigo-400/40 hover:border-yellow-400'
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================================================================ */}
      {/* TAB 1: THÁM TỬ GÓC VUÔNG QUANH EM (REAL-WORLD FIRST DISCOVERY)  */}
      {/* ================================================================ */}
      {activeTab === 'realworld' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left 7 cols: Interactive Real-World SVG Showcase */}
          <div className="lg:col-span-7 card-3d-cosmic rounded-3xl p-5 border-2 border-sky-400/60 flex flex-col justify-between gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-sky-300 uppercase tracking-wider">
                CHẠM VÀO ĐỒ VẬT ĐỂ PHÁT HIỆN ĐƯỜNG THẲNG VUÔNG GÓC!
              </span>
              <span className="font-mono-num text-xs font-extrabold text-emerald-300 bg-emerald-500/15 border border-emerald-400/40 rounded-xl px-2.5 py-1">
                Đã khám phá: {discoveredItems.length}/{REAL_WORLD_ITEMS.length}
              </span>
            </div>

            {/* Vivid SVG Scene for Selected Everyday Object */}
            <div className="bg-[#0B0826] rounded-2xl p-3 border border-indigo-400/40">
              <svg viewBox="0 0 600 300" className="w-full h-auto block">
                <rect x="0" y="0" width="600" height="300" rx="14" fill="#100C2E" />

                {/* 1. Classroom Blackboard */}
                {selectedRealItem === 'board' && (
                  <g>
                    <rect x="90" y="38" width="420" height="210" rx="8" fill="#065F46" stroke="#B45309" strokeWidth="14" />
                    <rect x="190" y="248" width="220" height="12" rx="4" fill="#92400E" />
                    {/* Highlighted Perpendicular Edges */}
                    <line x1="90" y1="38" x2="510" y2="38" stroke="#FACC15" strokeWidth="5" strokeDasharray="10 6" />
                    <line x1="90" y1="38" x2="90" y2="248" stroke="#38BDF8" strokeWidth="5" strokeDasharray="10 6" />
                    {/* Crisp Right-Angle Square */}
                    <path d="M 122 38 L 122 70 L 90 70" fill="rgba(52,211,153,0.35)" stroke="#34D399" strokeWidth="4" />
                    <circle cx="90" cy="38" r="7" fill="#34D399" stroke="#FFF" strokeWidth="2" />
                    <text x="300" y="138" textAnchor="middle" fill="#D1FAE5" fontSize="24" fontWeight="800">
                      BẢNG LỚP HỌC
                    </text>
                    <text x="300" y="172" textAnchor="middle" fill="#6EE7B7" fontSize="15" fontWeight="700">
                      Mép ngang và mép dọc gặp nhau tạo góc vuông 90°
                    </text>
                  </g>
                )}

                {/* 2. Bamboo Kite */}
                {selectedRealItem === 'kite' && (
                  <g>
                    <polygon points="300,26 392,118 300,118" fill="#F8FAFC" opacity="0.92" />
                    <polygon points="300,26 208,118 300,118" fill="#EF4444" opacity="0.9" />
                    <polygon points="208,118 300,256 300,118" fill="#0EA5E9" opacity="0.9" />
                    <polygon points="392,118 300,256 300,118" fill="#FACC15" opacity="0.92" />
                    <path d="M 208 118 Q 180 185 205 268" fill="none" stroke="#FB7185" strokeWidth="5" strokeLinecap="round" />
                    <path d="M 392 118 Q 420 185 395 268" fill="none" stroke="#FB7185" strokeWidth="5" strokeLinecap="round" />
                    <line x1="300" y1="18" x2="300" y2="266" stroke="#92400E" strokeWidth="9" strokeLinecap="round" />
                    <line x1="196" y1="118" x2="404" y2="118" stroke="#92400E" strokeWidth="9" strokeLinecap="round" />
                    <line x1="300" y1="18" x2="300" y2="266" stroke="#FDE047" strokeWidth="2.5" strokeDasharray="6 4" />
                    <line x1="196" y1="118" x2="404" y2="118" stroke="#FDE047" strokeWidth="2.5" strokeDasharray="6 4" />
                    <path d="M 324 118 L 324 94 L 300 94" fill="rgba(52,211,153,0.4)" stroke="#34D399" strokeWidth="4" />
                    <circle cx="300" cy="118" r="6.5" fill="#34D399" stroke="#FFF" strokeWidth="2" />
                  </g>
                )}

                {/* 3. Window Frame */}
                {selectedRealItem === 'window' && (
                  <g>
                    <rect x="140" y="34" width="320" height="232" rx="6" fill="#38BDF8" fillOpacity="0.22" stroke="#D97706" strokeWidth="12" />
                    <line x1="300" y1="34" x2="300" y2="266" stroke="#F59E0B" strokeWidth="10" />
                    <line x1="140" y1="150" x2="460" y2="150" stroke="#F59E0B" strokeWidth="10" />
                    <line x1="300" y1="34" x2="300" y2="266" stroke="#FEF08A" strokeWidth="2.5" strokeDasharray="6 4" />
                    <line x1="140" y1="150" x2="460" y2="150" stroke="#FEF08A" strokeWidth="2.5" strokeDasharray="6 4" />
                    <path d="M 326 150 L 326 124 L 300 124" fill="rgba(52,211,153,0.4)" stroke="#34D399" strokeWidth="4" />
                    <path d="M 166 40 L 166 64 L 146 64" fill="none" stroke="#34D399" strokeWidth="3.5" />
                    <circle cx="300" cy="150" r="6" fill="#34D399" stroke="#FFF" strokeWidth="2" />
                  </g>
                )}

                {/* 4. Windmill */}
                {selectedRealItem === 'windmill' && (
                  <g>
                    <rect x="28" y="18" width="544" height="264" fill="#BAE6FD" stroke="#10B981" strokeWidth="10" />
                    <path d="M 33 250 Q 300 212 567 250 L 567 277 L 33 277 Z" fill="#84CC16" />
                    <polygon points="256,268 276,128 324,128 344,268" fill="#CBD5E1" stroke="#64748B" strokeWidth="2.5" />
                    <polygon points="268,132 300,96 332,132" fill="#EA580C" />
                    <line x1="222" y1="42" x2="378" y2="198" stroke="#EA580C" strokeWidth="14" strokeLinecap="round" />
                    <line x1="222" y1="198" x2="378" y2="42" stroke="#EA580C" strokeWidth="14" strokeLinecap="round" />
                    <line x1="212" y1="32" x2="388" y2="208" stroke="#FDE047" strokeWidth="3" strokeDasharray="6 4" />
                    <line x1="212" y1="208" x2="388" y2="32" stroke="#FDE047" strokeWidth="3" strokeDasharray="6 4" />
                    <path d="M 316 104 L 300 88 L 284 104" fill="rgba(52,211,153,0.45)" stroke="#10B981" strokeWidth="4" />
                    <circle cx="300" cy="120" r="8" fill="#9A3412" stroke="#FDE047" strokeWidth="2" />
                  </g>
                )}

                {/* 5. Grid Notebook Page */}
                {selectedRealItem === 'notebook' && (
                  <g>
                    <rect x="130" y="26" width="340" height="248" rx="8" fill="#F8FAFC" stroke="#38BDF8" strokeWidth="4" />
                    {[62, 98, 134, 170, 206, 242].map((y) => (
                      <line key={`h-${y}`} x1="130" y1={y} x2="470" y2={y} stroke="#93C5FD" strokeWidth="1.5" />
                    ))}
                    {[166, 202, 238, 274, 310, 346, 382, 418, 454].map((x) => (
                      <line key={`v-${x}`} x1={x} y1="26" x2={x} y2="274" stroke="#93C5FD" strokeWidth="1.5" />
                    ))}
                    <line x1="184" y1="26" x2="184" y2="274" stroke="#F43F5E" strokeWidth="2.5" />
                    {/* Highlighted perpendicular grid lines */}
                    <line x1="130" y1="134" x2="470" y2="134" stroke="#0284C7" strokeWidth="4.5" />
                    <line x1="310" y1="26" x2="310" y2="274" stroke="#EC4899" strokeWidth="4.5" />
                    <path d="M 332 134 L 332 112 L 310 112" fill="rgba(16,185,129,0.35)" stroke="#059669" strokeWidth="3.5" />
                    <circle cx="310" cy="134" r="6" fill="#059669" />
                  </g>
                )}

                {/* 6. City Crossroad */}
                {selectedRealItem === 'crossroad' && (
                  <g>
                    <rect x="0" y="0" width="600" height="300" rx="14" fill="#15803D" opacity="0.55" />
                    <rect x="0" y="108" width="600" height="84" fill="#334155" />
                    <rect x="258" y="0" width="84" height="300" fill="#334155" />
                    <line x1="0" y1="150" x2="600" y2="150" stroke="#FACC15" strokeWidth="4" strokeDasharray="14 10" />
                    <line x1="300" y1="0" x2="300" y2="300" stroke="#FACC15" strokeWidth="4" strokeDasharray="14 10" />
                    <path d="M 326 150 L 326 124 L 300 124" fill="rgba(52,211,153,0.4)" stroke="#34D399" strokeWidth="4" />
                    <path d="M 274 150 L 274 176 L 300 176" fill="rgba(52,211,153,0.4)" stroke="#34D399" strokeWidth="4" />
                    <circle cx="300" cy="150" r="6.5" fill="#34D399" stroke="#FFF" strokeWidth="2" />
                  </g>
                )}
              </svg>
            </div>

            {/* 6 Object Selector Chips */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {REAL_WORLD_ITEMS.map((item) => {
                const isSelected = item.id === selectedRealItem;
                const isSeen = discoveredItems.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectRealItem(item.id)}
                    className={`p-2 rounded-2xl text-center cursor-pointer transition-all border-2 ${
                      isSelected
                        ? 'bg-yellow-400 text-slate-950 border-yellow-200 scale-105 shadow-md'
                        : isSeen
                          ? 'bg-emerald-950/60 text-emerald-100 border-emerald-400/50 hover:border-yellow-300'
                          : 'bg-[#0B0826] text-indigo-100 border-indigo-400/40 hover:border-yellow-300'
                    }`}
                  >
                    <div className="text-xl">{item.icon}</div>
                    <div className="text-[11px] font-extrabold mt-0.5 leading-tight">
                      {item.titleVi}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 5 cols: Robot Toán Học Companion Guide */}
          <div className="lg:col-span-5 card-3d-cosmic rounded-3xl p-5 border-2 border-yellow-400/60 flex flex-col justify-between gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 border-2 border-yellow-400 overflow-hidden shrink-0">
                  <img
                    src="/assets/aistudio/Th_m_ti_u____9352a9ad.png"
                    alt="Robot Toán Học"
                    className="w-full h-full object-cover scale-[1.35]"
                  />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-yellow-300">ROBOT TOÁN HỌC GỢI Ý:</div>
                  <h3 className="text-xl font-extrabold text-white">
                    {currentRealInfo.icon} {currentRealInfo.titleVi}
                  </h3>
                  <div className="text-xs font-semibold text-sky-300">{currentRealInfo.shortDescVi}</div>
                </div>
              </div>

              <div className="bg-[#0B0826] rounded-2xl p-4 border border-indigo-500/40 text-sm text-indigo-100 leading-relaxed">
                &ldquo;{currentRealInfo.robotSpeechVi}&rdquo;
              </div>

              <div className="bg-emerald-500/15 border-2 border-emerald-400/50 rounded-2xl p-3.5 text-xs sm:text-sm font-bold text-emerald-100">
                💡 Điểm mấu chốt: {currentRealInfo.highlightNoteVi}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setActiveTab('concept');
                }}
                className="btn-3d-emerald py-3 px-4 rounded-xl font-extrabold text-sm cursor-pointer"
              >
                Tiếp theo: 4 góc vuông →
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setActiveTab('reading');
                }}
                className="btn-3d-gold py-3 px-4 rounded-xl font-extrabold text-sm cursor-pointer"
              >
                🗣️ Học cách đọc tên ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 2: KHÁI NIỆM (RECTANGLE ABCD & 4 RIGHT ANGLES AROUND O)     */}
      {/* ================================================================ */}
      {activeTab === 'concept' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-7 card-3d-cosmic rounded-3xl p-5 border-2 border-emerald-400/60 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setConceptMode('rect');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                    conceptMode === 'rect'
                      ? 'bg-yellow-400 text-slate-950'
                      : 'bg-indigo-950 text-indigo-200 border border-indigo-400/40'
                  }`}
                >
                  📐 Kéo dài cạnh hình chữ nhật
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setConceptMode('four_rights');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                    conceptMode === 'four_rights'
                      ? 'bg-emerald-400 text-slate-950'
                      : 'bg-indigo-950 text-indigo-200 border border-indigo-400/40'
                  }`}
                >
                  ➕ Bốn góc vuông chung đỉnh O
                </button>
              </div>

              {conceptMode === 'rect' ? (
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playTick(90);
                      setShowExtensions((v) => !v);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                      showExtensions ? 'bg-emerald-500 text-slate-950' : 'bg-indigo-950 text-indigo-200'
                    }`}
                  >
                    {showExtensions ? '✓ Kéo dài AB, AD' : 'Bật kéo dài'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playTick(120);
                      setShowRectEke((v) => !v);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                      showRectEke ? 'bg-sky-400 text-slate-950' : 'bg-indigo-950 text-indigo-200'
                    }`}
                  >
                    {showRectEke ? '✓ Đặt ê ke' : 'Hiện ê ke'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playSuccess();
                    setSelectedQuadrants([1, 2, 3, 4]);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-yellow-400 text-slate-950 text-xs font-extrabold cursor-pointer"
                >
                  ✨ Hiện cả 4 góc vuông
                </button>
              )}
            </div>

            <div className="bg-[#0B0826] rounded-2xl p-4 border border-indigo-400/40">
              {conceptMode === 'rect' ? (
                <svg viewBox="0 0 600 310" className="w-full h-auto block">
                  {showExtensions && (
                    <g>
                      <line x1="90" y1="80" x2="510" y2="80" stroke="#FACC15" strokeWidth="4" strokeDasharray="10 6" />
                      <line x1="170" y1="22" x2="170" y2="290" stroke="#FACC15" strokeWidth="4" strokeDasharray="10 6" />
                    </g>
                  )}
                  <rect x="170" y="80" width="250" height="150" fill="rgba(56, 189, 248, 0.14)" stroke="#F8FAFC" strokeWidth="4" />
                  {showRectEke ? (
                    <g transform="translate(170, 80)">
                      <path
                        d="M 0 0 L 160 0 L 0 112 Z M 22 22 L 102 22 L 22 74 Z"
                        fillRule="evenodd"
                        fill="rgba(56, 189, 248, 0.62)"
                        stroke="#7DD3FC"
                        strokeWidth="2.5"
                      />
                      <path d="M 18 0 L 18 18 L 0 18" fill="rgba(250, 204, 21, 0.35)" stroke="#FACC15" strokeWidth="3" />
                      <text x="42" y="42" fill="#FFFFFF" fontSize="13" fontWeight="900">Ê KE</text>
                    </g>
                  ) : (
                    <path d="M 192 80 L 192 102 L 170 102" fill="none" stroke="#34D399" strokeWidth="3.5" />
                  )}
                  <circle cx="170" cy="80" r="5" fill="#FACC15" />
                  <text x="148" y="70" fill="#FDE047" fontSize="22" fontWeight="900">A</text>
                  <circle cx="420" cy="80" r="5" fill="#FFFFFF" />
                  <text x="428" y="70" fill="#FFFFFF" fontSize="22" fontWeight="900">B</text>
                  <circle cx="420" cy="230" r="5" fill="#FFFFFF" />
                  <text x="430" y="246" fill="#FFFFFF" fontSize="22" fontWeight="900">C</text>
                  <circle cx="170" cy="230" r="5" fill="#FFFFFF" />
                  <text x="144" y="246" fill="#FFFFFF" fontSize="22" fontWeight="900">D</text>
                </svg>
              ) : (
                <svg viewBox="0 0 600 310" className="w-full h-auto block">
                  {[
                    { id: 1, x: 300, y: 155, w: 120, h: 105, sq: 'M 326 155 L 326 181 L 300 181', label: 'Góc 1 (90°)', lx: 365, ly: 210 },
                    { id: 2, x: 300, y: 50, w: 120, h: 105, sq: 'M 326 155 L 326 129 L 300 129', label: 'Góc 2 (90°)', lx: 365, ly: 105 },
                    { id: 3, x: 180, y: 50, w: 120, h: 105, sq: 'M 274 155 L 274 129 L 300 129', label: 'Góc 3 (90°)', lx: 235, ly: 105 },
                    { id: 4, x: 180, y: 155, w: 120, h: 105, sq: 'M 274 155 L 274 181 L 300 181', label: 'Góc 4 (90°)', lx: 235, ly: 210 },
                  ].map((q) => {
                    const active = selectedQuadrants.includes(q.id);
                    return (
                      <g key={q.id} className="cursor-pointer" onClick={() => toggleQuadrant(q.id)}>
                        <rect
                          x={q.x}
                          y={q.y}
                          width={q.w}
                          height={q.h}
                          fill={active ? 'rgba(52, 211, 153, 0.22)' : 'rgba(99, 102, 241, 0.08)'}
                          stroke={active ? 'rgba(52, 211, 153, 0.45)' : 'rgba(129, 140, 248, 0.2)'}
                          strokeDasharray={active ? undefined : '4 4'}
                        />
                        {active && (
                          <path d={q.sq} fill="rgba(250, 204, 21, 0.35)" stroke="#FACC15" strokeWidth="3.5" />
                        )}
                        <text
                          x={q.lx}
                          y={q.ly}
                          textAnchor="middle"
                          fill={active ? '#6EE7B7' : '#94A3B8'}
                          fontSize="13"
                          fontWeight="800"
                        >
                          {active ? q.label : 'Bấm kiểm tra'}
                        </text>
                      </g>
                    );
                  })}
                  <line x1="110" y1="155" x2="500" y2="155" stroke="#F8FAFC" strokeWidth="4.5" />
                  <line x1="300" y1="26" x2="300" y2="286" stroke="#F8FAFC" strokeWidth="4.5" />
                  <circle cx="300" cy="155" r="6.5" fill="#FACC15" stroke="#0F172A" strokeWidth="2" />
                  <text x="260" y="122" fill="#FDE047" stroke="#0B0826" strokeWidth="5" paintOrder="stroke" fontSize="22" fontWeight="900">O</text>
                  <circle cx="450" cy="155" r="5" fill="#38BDF8" />
                  <text x="450" y="140" textAnchor="middle" fill="#38BDF8" fontSize="22" fontWeight="900">M</text>
                  <circle cx="300" cy="260" r="5" fill="#F472B6" />
                  <text x="270" y="266" fill="#F472B6" stroke="#0B0826" strokeWidth="4" paintOrder="stroke" fontSize="22" fontWeight="900">N</text>
                </svg>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 card-3d-cosmic rounded-3xl p-5 border-2 border-indigo-400/60 flex flex-col justify-between gap-4">
            <div className="space-y-4">
              <div className="bg-sky-500/20 border-2 border-sky-400/60 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-extrabold text-sky-300 uppercase">
                  KIẾN THỨC CỐT LÕI CẦN NHỚ
                </div>
                {conceptMode === 'rect' ? (
                  <p className="text-base font-extrabold text-white leading-relaxed">
                    Kéo dài hai cạnh kề <span className="text-yellow-300">AB</span> và{' '}
                    <span className="text-yellow-300">AD</span> của hình chữ nhật{' '}
                    <span className="text-sky-300">ABCD</span>, ta được{' '}
                    <span className="text-emerald-300">hai đường thẳng vuông góc với nhau</span>.
                  </p>
                ) : (
                  <p className="text-base font-extrabold text-white leading-relaxed">
                    Hai đường thẳng <span className="text-sky-300">OM</span> và{' '}
                    <span className="text-pink-300">ON</span> vuông góc với nhau tại O sẽ tạo thành{' '}
                    <span className="text-yellow-300">4 góc vuông có chung đỉnh O</span>.
                  </p>
                )}
              </div>

              <div className="bg-[#0B0826] rounded-2xl p-4 border border-indigo-500/40 text-sm text-indigo-100 space-y-2">
                <p>
                  • Kí hiệu góc vuông trên hình vẽ luôn là <strong className="text-yellow-300">hình vuông vức</strong> đặt tại đỉnh góc.
                </p>
                <p>
                  • Hai đường thẳng chỉ gọi là vuông góc khi chúng cắt nhau và tạo ra góc bằng đúng <strong className="text-emerald-300">90°</strong>.
                </p>
                {conceptMode === 'four_rights' && (
                  <p className="font-bold text-yellow-300">
                    Số góc vuông em đã kiểm tra: {selectedQuadrants.length} / 4 góc vuông!
                  </p>
                )}
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
              Tiếp theo: Hướng dẫn cách đọc hai cạnh vuông góc →
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 3: HƯỚNG DẪN CÁCH ĐỌC HAI CẠNH / ĐƯỜNG THẲNG VUÔNG GÓC      */}
      {/* ================================================================ */}
      {activeTab === 'reading' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left 7 cols: Interactive Shape with Clickable Vertices & Highlighted Edges */}
          <div className="lg:col-span-7 card-3d-cosmic rounded-3xl p-5 border-2 border-yellow-400/60 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-yellow-300 uppercase">
                CHỌN HÌNH VÀ BẤM VÀO ĐỈNH ĐỂ XEM CÁCH ĐỌC CHUẨN
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['triangle_abc', 'rect_mnpq', 'quad_abcd'] as ReadingShapeId[]).map((sid) => (
                  <button
                    key={sid}
                    type="button"
                    data-testid={`reading-shape-${sid}`}
                    onClick={() => handleSwitchReadingShape(sid)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                      readingShape === sid
                        ? 'bg-yellow-400 text-slate-950'
                        : 'bg-indigo-950 text-indigo-200 border border-indigo-400/40 hover:border-yellow-300'
                    }`}
                  >
                    {sid === 'triangle_abc' && 'Tam giác ABC'}
                    {sid === 'rect_mnpq' && 'Hình chữ nhật MNPQ'}
                    {sid === 'quad_abcd' && 'Tứ giác ABCD'}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive SVG Diagram with Highlighted Meeting Edges */}
            <div className="bg-[#0B0826] rounded-2xl p-3 border border-indigo-400/40">
              <svg viewBox="0 0 600 285" className="w-full h-auto block">
                <defs>
                  <pattern id="read-grid" width="26" height="26" patternUnits="userSpaceOnUse">
                    <path d="M 26 0 L 0 0 0 26" fill="none" stroke="rgba(129,140,248,0.12)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="600" height="285" rx="12" fill="url(#read-grid)" />

                {/* Shape 1: Right Triangle ABC (Right angle at A) */}
                {readingShape === 'triangle_abc' && (
                  <g>
                    <polygon points="180,60 180,225 435,225" fill="rgba(99,102,241,0.16)" stroke="#94A3B8" strokeWidth="3.5" />
                    {/* Highlight meeting edges for selected vertex */}
                    {selectedVertexId === 'A' && (
                      <g>
                        <line x1="180" y1="60" x2="180" y2="225" stroke="#38BDF8" strokeWidth="7" strokeLinecap="round" />
                        <line x1="180" y1="225" x2="435" y2="225" stroke="#F472B6" strokeWidth="7" strokeLinecap="round" />
                        <path d="M 206 225 L 206 199 L 180 199" fill="rgba(52,211,153,0.35)" stroke="#34D399" strokeWidth="4" />
                        <text x="160" y="148" textAnchor="end" fill="#38BDF8" fontSize="16" fontWeight="900">Cạnh AB</text>
                        <text x="308" y="255" textAnchor="middle" fill="#F472B6" fontSize="16" fontWeight="900">Cạnh AC</text>
                      </g>
                    )}
                    {selectedVertexId === 'B' && (
                      <g>
                        <line x1="180" y1="60" x2="180" y2="225" stroke="#FB923C" strokeWidth="6" strokeLinecap="round" />
                        <line x1="180" y1="60" x2="435" y2="225" stroke="#FACC15" strokeWidth="6" strokeLinecap="round" />
                      </g>
                    )}
                    {selectedVertexId === 'C' && (
                      <g>
                        <line x1="180" y1="225" x2="435" y2="225" stroke="#FB923C" strokeWidth="6" strokeLinecap="round" />
                        <line x1="180" y1="60" x2="435" y2="225" stroke="#FACC15" strokeWidth="6" strokeLinecap="round" />
                      </g>
                    )}
                    {/* Always show crisp right-angle square at A */}
                    {selectedVertexId !== 'A' && (
                      <path d="M 202 225 L 202 203 L 180 203" fill="none" stroke="#34D399" strokeWidth="3" />
                    )}
                    {/* Vertices B(180,60), A(180,225), C(435,225) */}
                    {[
                      { id: 'A', x: 180, y: 225, lx: 154, ly: 244 },
                      { id: 'B', x: 180, y: 60, lx: 158, ly: 54 },
                      { id: 'C', x: 435, y: 225, lx: 454, ly: 242 },
                    ].map((pt) => (
                      <g
                        key={pt.id}
                        className="cursor-pointer"
                        onClick={() => {
                          soundFX.playSnap();
                          setSelectedVertexId(pt.id);
                        }}
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={selectedVertexId === pt.id ? 14 : 9}
                          fill={pt.id === 'A' ? '#10B981' : '#F97316'}
                          fillOpacity="0.28"
                        />
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="7"
                          fill={selectedVertexId === pt.id ? '#FACC15' : '#38BDF8'}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        <text x={pt.lx} y={pt.ly} fill="#FFFFFF" fontSize="24" fontWeight="900">
                          {pt.id}
                        </text>
                      </g>
                    ))}
                  </g>
                )}

                {/* Shape 2: Rectangle MNPQ */}
                {readingShape === 'rect_mnpq' && (
                  <g>
                    <rect x="165" y="62" width="270" height="162" fill="rgba(56,189,248,0.14)" stroke="#94A3B8" strokeWidth="3.5" />
                    {/* Highlighted meeting edges per selected vertex */}
                    {selectedVertexId === 'M' && (
                      <g>
                        <line x1="165" y1="62" x2="435" y2="62" stroke="#38BDF8" strokeWidth="7" strokeLinecap="round" />
                        <line x1="165" y1="62" x2="165" y2="224" stroke="#F472B6" strokeWidth="7" strokeLinecap="round" />
                        <path d="M 191 62 L 191 88 L 165 88" fill="rgba(52,211,153,0.4)" stroke="#34D399" strokeWidth="4" />
                        <text x="300" y="42" textAnchor="middle" fill="#38BDF8" fontSize="15" fontWeight="900">Cạnh MN</text>
                        <text x="148" y="148" textAnchor="end" fill="#F472B6" fontSize="15" fontWeight="900">Cạnh MQ</text>
                      </g>
                    )}
                    {selectedVertexId === 'N' && (
                      <g>
                        <line x1="165" y1="62" x2="435" y2="62" stroke="#38BDF8" strokeWidth="7" strokeLinecap="round" />
                        <line x1="435" y1="62" x2="435" y2="224" stroke="#F472B6" strokeWidth="7" strokeLinecap="round" />
                        <path d="M 409 62 L 409 88 L 435 88" fill="rgba(52,211,153,0.4)" stroke="#34D399" strokeWidth="4" />
                        <text x="300" y="42" textAnchor="middle" fill="#38BDF8" fontSize="15" fontWeight="900">Cạnh MN</text>
                        <text x="452" y="148" textAnchor="start" fill="#F472B6" fontSize="15" fontWeight="900">Cạnh NP</text>
                      </g>
                    )}
                    {selectedVertexId === 'P' && (
                      <g>
                        <line x1="435" y1="62" x2="435" y2="224" stroke="#38BDF8" strokeWidth="7" strokeLinecap="round" />
                        <line x1="435" y1="224" x2="165" y2="224" stroke="#F472B6" strokeWidth="7" strokeLinecap="round" />
                        <path d="M 409 224 L 409 198 L 435 198" fill="rgba(52,211,153,0.4)" stroke="#34D399" strokeWidth="4" />
                        <text x="452" y="148" textAnchor="start" fill="#38BDF8" fontSize="15" fontWeight="900">Cạnh NP</text>
                        <text x="300" y="254" textAnchor="middle" fill="#F472B6" fontSize="15" fontWeight="900">Cạnh PQ</text>
                      </g>
                    )}
                    {selectedVertexId === 'Q' && (
                      <g>
                        <line x1="165" y1="224" x2="435" y2="224" stroke="#38BDF8" strokeWidth="7" strokeLinecap="round" />
                        <line x1="165" y1="224" x2="165" y2="62" stroke="#F472B6" strokeWidth="7" strokeLinecap="round" />
                        <path d="M 191 224 L 191 198 L 165 198" fill="rgba(52,211,153,0.4)" stroke="#34D399" strokeWidth="4" />
                        <text x="300" y="254" textAnchor="middle" fill="#38BDF8" fontSize="15" fontWeight="900">Cạnh PQ</text>
                        <text x="148" y="148" textAnchor="end" fill="#F472B6" fontSize="15" fontWeight="900">Cạnh QM</text>
                      </g>
                    )}
                    {[
                      { id: 'M', x: 165, y: 62, lx: 138, ly: 56 },
                      { id: 'N', x: 435, y: 62, lx: 448, ly: 56 },
                      { id: 'P', x: 435, y: 224, lx: 448, ly: 244 },
                      { id: 'Q', x: 165, y: 224, lx: 136, ly: 244 },
                    ].map((pt) => (
                      <g
                        key={pt.id}
                        className="cursor-pointer"
                        onClick={() => {
                          soundFX.playSnap();
                          setSelectedVertexId(pt.id);
                        }}
                      >
                        <circle cx={pt.x} cy={pt.y} r={selectedVertexId === pt.id ? 14 : 9} fill="#10B981" fillOpacity="0.3" />
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="7"
                          fill={selectedVertexId === pt.id ? '#FACC15' : '#34D399'}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        <text x={pt.lx} y={pt.ly} fill="#FFFFFF" fontSize="24" fontWeight="900">
                          {pt.id}
                        </text>
                      </g>
                    ))}
                  </g>
                )}

                {/* Shape 3: Right Trapezoid ABCD */}
                {readingShape === 'quad_abcd' && (
                  <g>
                    <polygon points="165,68 350,68 465,222 165,222" fill="rgba(56,189,248,0.14)" stroke="#94A3B8" strokeWidth="3.5" />
                    <path d="M 189 68 L 189 92 L 165 92" fill="none" stroke="#34D399" strokeWidth="3" />
                    <path d="M 189 222 L 189 198 L 165 198" fill="none" stroke="#34D399" strokeWidth="3" />
                    {selectedVertexId === 'A' && (
                      <g>
                        <line x1="165" y1="68" x2="350" y2="68" stroke="#38BDF8" strokeWidth="7" strokeLinecap="round" />
                        <line x1="165" y1="68" x2="165" y2="222" stroke="#F472B6" strokeWidth="7" strokeLinecap="round" />
                        <path d="M 192 68 L 192 95 L 165 95" fill="rgba(52,211,153,0.4)" stroke="#34D399" strokeWidth="4" />
                        <text x="258" y="48" textAnchor="middle" fill="#38BDF8" fontSize="15" fontWeight="900">Cạnh AB</text>
                        <text x="148" y="150" textAnchor="end" fill="#F472B6" fontSize="15" fontWeight="900">Cạnh AD</text>
                      </g>
                    )}
                    {selectedVertexId === 'D' && (
                      <g>
                        <line x1="165" y1="68" x2="165" y2="222" stroke="#38BDF8" strokeWidth="7" strokeLinecap="round" />
                        <line x1="165" y1="222" x2="465" y2="222" stroke="#F472B6" strokeWidth="7" strokeLinecap="round" />
                        <path d="M 192 222 L 192 195 L 165 195" fill="rgba(52,211,153,0.4)" stroke="#34D399" strokeWidth="4" />
                        <text x="148" y="150" textAnchor="end" fill="#38BDF8" fontSize="15" fontWeight="900">Cạnh AD</text>
                        <text x="315" y="252" textAnchor="middle" fill="#F472B6" fontSize="15" fontWeight="900">Cạnh DC</text>
                      </g>
                    )}
                    {selectedVertexId === 'B' && (
                      <g>
                        <line x1="165" y1="68" x2="350" y2="68" stroke="#FB923C" strokeWidth="6" strokeLinecap="round" />
                        <line x1="350" y1="68" x2="465" y2="222" stroke="#FACC15" strokeWidth="6" strokeLinecap="round" />
                      </g>
                    )}
                    {selectedVertexId === 'C' && (
                      <g>
                        <line x1="350" y1="68" x2="465" y2="222" stroke="#FB923C" strokeWidth="6" strokeLinecap="round" />
                        <line x1="165" y1="222" x2="465" y2="222" stroke="#FACC15" strokeWidth="6" strokeLinecap="round" />
                      </g>
                    )}
                    {[
                      { id: 'A', x: 165, y: 68, lx: 140, ly: 60, right: true },
                      { id: 'B', x: 350, y: 68, lx: 358, ly: 58, right: false },
                      { id: 'C', x: 465, y: 222, lx: 478, ly: 238, right: false },
                      { id: 'D', x: 165, y: 222, lx: 138, ly: 242, right: true },
                    ].map((pt) => (
                      <g
                        key={pt.id}
                        className="cursor-pointer"
                        onClick={() => {
                          soundFX.playSnap();
                          setSelectedVertexId(pt.id);
                        }}
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={selectedVertexId === pt.id ? 14 : 9}
                          fill={pt.right ? '#10B981' : '#F97316'}
                          fillOpacity="0.3"
                        />
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="7"
                          fill={selectedVertexId === pt.id ? '#FACC15' : pt.right ? '#34D399' : '#FB923C'}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        <text x={pt.lx} y={pt.ly} fill="#FFFFFF" fontSize="24" fontWeight="900">
                          {pt.id}
                        </text>
                      </g>
                    ))}
                  </g>
                )}
              </svg>
            </div>

            {/* Clickable Vertex Pills */}
            <div className="flex flex-wrap gap-2">
              {currentReadingSpec.vertices.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    soundFX.playSnap();
                    setSelectedVertexId(v.id);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer border-2 transition-all ${
                    selectedVertexId === v.id
                      ? 'bg-yellow-400 text-slate-950 border-yellow-200'
                      : v.isRight
                        ? 'bg-emerald-950/60 text-emerald-200 border-emerald-400/50'
                        : 'bg-[#0B0826] text-orange-200 border-orange-400/40'
                  }`}
                >
                  {v.isRight ? '✅ ' : '⚠️ '}
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right 5 cols: Formula Card + Live Reading Sentence + Quick Mini Check */}
          <div className="lg:col-span-5 card-3d-cosmic rounded-3xl p-5 border-2 border-sky-400/60 flex flex-col justify-between gap-4">
            <div className="space-y-3.5">
              {/* Golden Formula Box */}
              <div className="bg-indigo-950/90 border-2 border-yellow-400/70 rounded-2xl p-3.5 space-y-1.5">
                <div className="text-xs font-extrabold text-yellow-300 uppercase">
                  🗣️ CÔNG THỨC ĐỌC CHUẨN TRONG HÌNH
                </div>
                <div className="text-sm sm:text-base font-extrabold text-white leading-snug">
                  <span className="text-sky-300">Cạnh ...</span> vuông góc với{' '}
                  <span className="text-pink-300">cạnh ...</span> tại{' '}
                  <span className="text-emerald-300">đỉnh ...</span>
                </div>
                <div className="text-[11px] text-indigo-200">
                  Ví dụ: <strong>Cạnh AB vuông góc với cạnh AC tại đỉnh A.</strong>
                </div>
              </div>

              {/* Dynamic Reading Sentence for Selected Vertex */}
              <div
                className={`rounded-2xl p-4 border-2 space-y-2 ${
                  currentVertexInfo.isRight
                    ? 'bg-emerald-500/20 border-emerald-400'
                    : 'bg-orange-500/15 border-orange-400'
                }`}
              >
                <div className="text-xs font-extrabold uppercase text-yellow-300">
                  {currentVertexInfo.isRight ? '✅ ĐỌC TÊN CẶP CẠNH VUÔNG GÓC:' : '❌ CHÚ Ý KHÔNG VUÔNG GÓC:'}
                </div>
                <p className="text-base sm:text-lg font-extrabold text-white leading-snug">
                  &ldquo;{currentVertexInfo.sentenceVi}&rdquo;
                </p>
                <p className="text-xs text-indigo-100 leading-relaxed">{currentVertexInfo.tipVi}</p>
              </div>

              {/* Quick Mini Check */}
              <div className="bg-[#0B0826] rounded-2xl p-3.5 border border-indigo-400/40 space-y-2">
                <div className="text-xs font-extrabold text-sky-300">
                  🎯 THỬ TÀI ĐỌC NHANH: Hình vuông ABCD có góc vuông tại B. Câu nào đọc đúng?
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    'Cạnh BA vuông góc với cạnh BC tại đỉnh B',
                    'Cạnh AB vuông góc với cạnh CD tại đỉnh B',
                  ].map((opt, idx) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setMiniQuizPick(idx);
                        if (idx === 0) soundFX.playSuccess();
                        else soundFX.playWrong();
                      }}
                      className={`text-left px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        miniQuizPick === idx
                          ? idx === 0
                            ? 'bg-emerald-500/25 border-emerald-400 text-emerald-100'
                            : 'bg-rose-500/25 border-rose-400 text-rose-100'
                          : 'bg-indigo-950/70 border-indigo-500/40 text-indigo-100 hover:border-yellow-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {miniQuizPick !== null && (
                  <div className="text-xs font-bold text-yellow-300">
                    {miniQuizPick === 0
                      ? '🎉 Chuẩn xác! Hai cạnh BA và BC cùng gặp nhau tại đỉnh B và tạo góc vuông 90°!'
                      : '💡 Thử lại nhé! Tại đỉnh B thì hai cạnh gặp nhau là cạnh BA và cạnh BC.'}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setActiveTab('eke');
              }}
              className="btn-3d-emerald w-full py-2.5 px-4 rounded-xl font-extrabold text-sm cursor-pointer"
            >
              Tiếp theo: Khám phá chiếc Ê Ke →
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 4: KHÁM PHÁ CHIẾC Ê KE THẦN KÌ                               */}
      {/* ================================================================ */}
      {activeTab === 'eke' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-7 card-3d-cosmic rounded-3xl p-5 border-2 border-sky-400/60 space-y-3">
            <div className="text-xs font-extrabold text-yellow-300 uppercase">
              CẤU TẠO CHIẾC THƯỚC Ê KE — NHẬN BIẾT ĐÚNG GÓC VUÔNG 90°
            </div>
            <div className="bg-[#0B0826] rounded-2xl p-4 border border-indigo-400/40">
              <svg viewBox="0 0 600 300" className="w-full h-auto block">
                <rect x="0" y="0" width="600" height="300" rx="12" fill="#0B0826" />
                {/* Big Set Square Illustration */}
                <path
                  d="M 150 245 L 430 245 L 150 55 Z M 192 212 L 325 212 L 192 118 Z"
                  fillRule="evenodd"
                  fill="rgba(56, 189, 248, 0.55)"
                  stroke="#7DD3FC"
                  strokeWidth="4"
                />
                {/* Highlight 2 Right-Angle Legs */}
                <line x1="150" y1="245" x2="430" y2="245" stroke="#34D399" strokeWidth="6" />
                <line x1="150" y1="245" x2="150" y2="55" stroke="#FACC15" strokeWidth="6" />
                {/* Crisp Right-Angle Square at (150,245) */}
                <path d="M 182 245 L 182 213 L 150 213" fill="rgba(250,204,21,0.35)" stroke="#FACC15" strokeWidth="4" />
                <circle cx="150" cy="245" r="7" fill="#FACC15" stroke="#0F172A" strokeWidth="2" />

                {/* Labels */}
                <text x="150" y="276" textAnchor="middle" fill="#FDE047" fontSize="15" fontWeight="900">
                  ⭐ Đỉnh góc vuông (90°)
                </text>
                <text x="315" y="274" textAnchor="middle" fill="#6EE7B7" fontSize="14" fontWeight="800">
                  Cạnh góc vuông 1
                </text>
                <text x="72" y="155" textAnchor="middle" fill="#FDE047" fontSize="14" fontWeight="800">
                  Cạnh góc
                </text>
                <text x="72" y="174" textAnchor="middle" fill="#FDE047" fontSize="14" fontWeight="800">
                  vuông 2
                </text>

                {/* Acute corners warning */}
                <circle cx="150" cy="55" r="7" fill="#FB923C" />
                <text x="230" y="54" fill="#FDBA74" fontSize="13" fontWeight="800">
                  Góc nhọn (không dùng vẽ 90°)
                </text>
                <circle cx="430" cy="245" r="7" fill="#FB923C" />
                <text x="498" y="232" textAnchor="middle" fill="#FDBA74" fontSize="13" fontWeight="800">
                  Góc nhọn
                </text>
                <text x="372" y="142" fill="#FDA4AF" fontSize="13" fontWeight="800" transform="rotate(34 372 142)">
                  Cạnh huyền (dài nhất)
                </text>
              </svg>
            </div>
          </div>

          <div className="lg:col-span-5 card-3d-cosmic rounded-3xl p-5 border-2 border-emerald-400/60 flex flex-col justify-between gap-4">
            <div className="space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 border-2 border-yellow-400 overflow-hidden shrink-0">
                  <img
                    src="/assets/aistudio/Th_m_ti_u____9352a9ad.png"
                    alt="Robot Toán Học"
                    className="w-full h-full object-cover scale-[1.35]"
                  />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-yellow-300">BÍ KÍP TỪ ROBOT TOÁN HỌC</div>
                  <h3 className="text-lg font-extrabold text-white">Dùng Ê Ke chuẩn không cần chỉnh!</h3>
                </div>
              </div>

              <div className="bg-[#0B0826] rounded-2xl p-4 border border-indigo-500/40 space-y-2.5 text-sm text-indigo-100 leading-relaxed">
                <p>
                  1. Mỗi chiếc ê ke có <strong className="text-yellow-300">duy nhất 1 góc vuông (90°)</strong> nằm giữa hai cạnh ngắn hơn (hai cạnh góc vuông).
                </p>
                <p>
                  2. Khi <strong className="text-emerald-300">kiểm tra góc vuông</strong>: đặt đỉnh góc vuông ê ke trùng đỉnh góc cần kiểm tra. Nếu hai cạnh trùng khít 2 cạnh góc vuông ê ke thì đó là góc vuông!
                </p>
                <p>
                  3. Khi <strong className="text-sky-300">vẽ hai đường thẳng vuông góc</strong>: đặt 1 cạnh góc vuông trùng đường thẳng có sẵn, cạnh góc vuông kia chạm điểm cho trước rồi vạch thẳng.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onOpenLab}
                className="btn-3d-pink py-3 px-4 rounded-xl font-extrabold text-sm cursor-pointer"
              >
                📐 Thực hành Ê Ke ngay!
              </button>
              <button
                type="button"
                onClick={onOpenGuide}
                className="btn-3d-gold py-3 px-4 rounded-xl font-extrabold text-sm cursor-pointer"
              >
                📖 Xem 2 bước vẽ chi tiết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
