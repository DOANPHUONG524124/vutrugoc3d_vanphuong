import React, { useState } from 'react';
import {
  calculateParallelogramPerimeter,
  calculateRhombusPerimeter,
} from '../utils/shapesMath';
import { soundFX } from '../utils/soundEffects';

interface ShapesExploreViewProps {
  onBackHome: () => void;
  onGoLab: () => void;
  onCompleteExplore: () => void;
}

type ExploreTab = 'parallelogram' | 'rhombus' | 'compare' | 'perimeter';

export const ShapesExploreView: React.FC<ShapesExploreViewProps> = ({
  onBackHome,
  onGoLab,
  onCompleteExplore,
}) => {
  const [activeTab, setActiveTab] = useState<ExploreTab>('parallelogram');
  const [paraHighlightPair, setParaHighlightPair] = useState<'none' | 'ab_dc' | 'ad_bc' | 'all'>('all');
  const [rhombusHighlight, setRhombusHighlight] = useState<'all' | 'pair1' | 'pair2'>('all');
  const [roosterTailHighlighted, setRoosterTailHighlighted] = useState<boolean>(true);
  const [compassNeedleHighlighted, setCompassNeedleHighlighted] = useState<boolean>(true);
  const [miniCheckAnswer, setMiniCheckAnswer] = useState<string | null>(null);

  // Interactive perimeter preview inside Tab 4
  const [sampleParaA, setSampleParaA] = useState<number>(6);
  const [sampleParaB, setSampleParaB] = useState<number>(4);
  const [sampleRhombusA, setSampleRhombusA] = useState<number>(5);

  const handleSelectTab = (tab: ExploreTab) => {
    soundFX.playClick(1.08);
    setActiveTab(tab);
    if (tab === 'perimeter') {
      onCompleteExplore();
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
          <div className="text-xs font-extrabold text-fuchsia-300 uppercase tracking-wider">
            CHỦ ĐỀ 4 · HÌNH THOI, HÌNH BÌNH HÀNH
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            1. KHÁM PHÁ HÌNH BÌNH HÀNH VÀ HÌNH THOI
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFX.playClick(1.15);
            onCompleteExplore();
            onGoLab();
          }}
          className="btn-3d-pink px-4 py-2 rounded-xl text-sm font-extrabold cursor-pointer"
        >
          🎚️ Thí nghiệm kéo cạnh →
        </button>
      </div>

      {/* Robot Toán Học Companion Banner */}
      <div className="card-3d-cosmic rounded-2xl p-4 border-2 border-fuchsia-400/50 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 border-2 border-yellow-400 overflow-hidden shrink-0 shadow-md">
          <img
            src="/assets/aistudio/Th_m_ti_u____9352a9ad.png"
            alt="Robot Toán Học"
            className="w-full h-full object-cover scale-[1.35]"
          />
        </div>
        <div className="flex-1 text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
          <span className="font-extrabold text-yellow-300">Robot Toán Học: </span>
          {activeTab === 'parallelogram' &&
            'Quan sát đuôi chú gà xếp hình kìa! Mảnh ghép màu đỏ đó có hai cặp cạnh đối diện song song và bằng nhau — đó chính là HÌNH BÌNH HÀNH. Bấm vào các nút cặp cạnh để kiểm tra trên lưới ô vuông nhé!'}
          {activeTab === 'rhombus' &&
            'Nhìn chiếc kim nam châm của la bàn kìa! Kim có hai cặp cạnh đối diện song song và cả BỐN CẠNH đều bằng nhau — đó chính là HÌNH THOI đấy em ạ!'}
          {activeTab === 'compare' &&
            'Hình bình hành và Hình thoi giống nhau ở điểm nào và khác nhau ở điểm nào? Cùng Robot Toán Học đặt hai hình cạnh nhau để so sánh thật rõ nhé!'}
          {activeTab === 'perimeter' &&
            'Ở lớp 4, chúng ta học cách tính CHU VI (tổng độ dài đường bao quanh 4 cạnh) của hình bình hành và hình thoi. Hãy thử bấm đổi số đo để xem chu vi thay đổi ngay lập tức nhé!'}
        </div>
      </div>

      {/* 4 Exploration Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          { id: 'parallelogram' as ExploreTab, label: '1. Hình bình hành quanh em' },
          { id: 'rhombus' as ExploreTab, label: '2. Hình thoi quanh em' },
          { id: 'compare' as ExploreTab, label: '3. So sánh Hai Hình' },
          { id: 'perimeter' as ExploreTab, label: '4. Công thức Chu vi Lớp 4' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            data-testid={`shapes-explore-tab-${tab.id}`}
            onClick={() => handleSelectTab(tab.id)}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer transition-all ${
              activeTab === tab.id
                ? 'bg-fuchsia-400 text-slate-950 shadow-lg scale-[1.02]'
                : 'bg-[#130E38]/90 text-indigo-200 border border-indigo-400/40 hover:bg-indigo-900/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: HÌNH BÌNH HÀNH */}
      {activeTab === 'parallelogram' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Tangram Rooster & Real-World Cards */}
          <div className="lg:col-span-5 card-3d-cosmic rounded-3xl p-5 border-2 border-sky-400/60 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-sky-300">
                🐓 Câu chuyện xếp hình chú gà
              </h3>
              <button
                type="button"
                onClick={() => {
                  soundFX.playSnap();
                  setRoosterTailHighlighted((v) => !v);
                }}
                className="px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-400/60 text-rose-200 text-xs font-extrabold cursor-pointer hover:bg-rose-500/35"
              >
                {roosterTailHighlighted ? '✨ Đang nổi bật đuôi gà' : 'Bấm soi đuôi gà'}
              </button>
            </div>

            <div className="bg-[#0B0826] rounded-2xl p-3 border border-indigo-400/40">
              <svg viewBox="0 0 380 220" className="w-full h-auto block">
                <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
                {/* Speech bubbles */}
                <rect x="14" y="14" width="142" height="34" rx="10" fill="#1E1B4B" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="85" y="35" textAnchor="middle" fill="#E0F2FE" fontSize="12" fontWeight="700">
                  Đuôi con gà là hình gì?
                </text>
                <rect x="206" y="14" width="160" height="34" rx="10" fill="#3B0764" stroke="#F472B6" strokeWidth="1.5" />
                <text x="286" y="35" textAnchor="middle" fill="#FCE7F3" fontSize="12" fontWeight="800">
                  Là hình bình hành đó!
                </text>

                {/* Tangram Rooster */}
                {/* Head (red triangle) */}
                <polygon points="108,86 134,64 160,86" fill="#EF4444" stroke="#0F172A" strokeWidth="2" />
                {/* Neck (orange square) */}
                <polygon points="124,86 158,86 158,120 124,120" fill="#F97316" stroke="#0F172A" strokeWidth="2" />
                {/* Body (large green triangle) */}
                <polygon points="124,120 236,120 180,176" fill="#10B981" stroke="#0F172A" strokeWidth="2" />
                {/* Foot left (small blue triangle) */}
                <polygon points="154,150 180,176 142,176" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
                {/* Foot bottom (medium blue triangle) */}
                <polygon points="180,176 180,206 148,206" fill="#0284C7" stroke="#0F172A" strokeWidth="2" />
                {/* Tail (RED PARALLELOGRAM) */}
                <polygon
                  points="210,120 242,88 294,88 262,120"
                  fill="#F43F5E"
                  stroke={roosterTailHighlighted ? '#FACC15' : '#0F172A'}
                  strokeWidth={roosterTailHighlighted ? '4.5' : '2'}
                />
                {roosterTailHighlighted && (
                  <g>
                    <line x1="274" y1="74" x2="258" y2="96" stroke="#FACC15" strokeWidth="2.5" strokeDasharray="4 3" />
                    <rect x="242" y="138" width="128" height="30" rx="8" fill="#FACC15" />
                    <text x="306" y="157" textAnchor="middle" fill="#0F172A" fontSize="12" fontWeight="900">
                      HÌNH BÌNH HÀNH
                    </text>
                  </g>
                )}
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {[
                { icon: '🧩', title: 'Miếng ghép xếp hình', desc: 'Mảnh hình bình hành trong bộ 7 mảnh ghép trí tuệ' },
                { icon: '🪜', title: 'Bậc lan can cầu thang', desc: 'Các khung nghiêng song song đều nhau trên cầu thang' },
                { icon: '🏢', title: 'Mái hiên và ô kính nghiêng', desc: 'Các tấm kính kiến trúc cắt vát có 2 cặp cạnh song song' },
                { icon: '📐', title: 'Thanh thước nối song song', desc: 'Hai thanh gỗ đối diện luôn song song và bằng nhau' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-indigo-950/80 border border-indigo-400/35 rounded-xl p-2.5 space-y-1"
                >
                  <div className="font-extrabold text-white">
                    {item.icon} {item.title}
                  </div>
                  <div className="text-indigo-200 leading-snug">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Interactive Grid Parallelogram ABCD */}
          <div className="lg:col-span-7 card-3d-cosmic rounded-3xl p-5 border-2 border-indigo-400/60 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                📐 Khám phá Hình bình hành ABCD trên lưới ô vuông
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all' as const, label: 'Xem cả 2 cặp' },
                  { id: 'ab_dc' as const, label: 'Cặp AB và DC' },
                  { id: 'ad_bc' as const, label: 'Cặp AD và BC' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      soundFX.playClick(1.1);
                      setParaHighlightPair(opt.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                      paraHighlightPair === opt.id
                        ? 'bg-yellow-400 text-slate-950'
                        : 'bg-indigo-950 text-indigo-200 border border-indigo-400/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0B0826] rounded-2xl p-3 border border-indigo-400/40">
              <svg viewBox="0 0 540 245" className="w-full h-auto block">
                <defs>
                  <pattern id="para-explore-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect x="28" y="16" width="480" height="192" fill="url(#para-explore-grid)" stroke="rgba(148,163,184,0.35)" strokeWidth="1" />

                {/* Parallelogram ABCD: A(156,48) B(412,48) C(348,176) D(92,176) => AB=DC=8 ô, horizontal shift 2 ô, height 4 ô */}
                <polygon
                  points="156,48 412,48 348,176 92,176"
                  fill="rgba(56,189,248,0.16)"
                />

                {/* Edge AB & DC */}
                <line
                  x1="156"
                  y1="48"
                  x2="412"
                  y2="48"
                  stroke={paraHighlightPair === 'ab_dc' || paraHighlightPair === 'all' ? '#38BDF8' : '#64748B'}
                  strokeWidth={paraHighlightPair === 'ab_dc' || paraHighlightPair === 'all' ? '6' : '3'}
                  strokeLinecap="round"
                />
                <line
                  x1="92"
                  y1="176"
                  x2="348"
                  y2="176"
                  stroke={paraHighlightPair === 'ab_dc' || paraHighlightPair === 'all' ? '#38BDF8' : '#64748B'}
                  strokeWidth={paraHighlightPair === 'ab_dc' || paraHighlightPair === 'all' ? '6' : '3'}
                  strokeLinecap="round"
                />
                {/* Equal tick marks on AB and DC */}
                <line x1="284" y1="40" x2="284" y2="56" stroke="#FACC15" strokeWidth="3" />
                <line x1="220" y1="168" x2="220" y2="184" stroke="#FACC15" strokeWidth="3" />

                {/* Edge AD & BC */}
                <line
                  x1="156"
                  y1="48"
                  x2="92"
                  y2="176"
                  stroke={paraHighlightPair === 'ad_bc' || paraHighlightPair === 'all' ? '#F472B6' : '#64748B'}
                  strokeWidth={paraHighlightPair === 'ad_bc' || paraHighlightPair === 'all' ? '6' : '3'}
                  strokeLinecap="round"
                />
                <line
                  x1="412"
                  y1="48"
                  x2="348"
                  y2="176"
                  stroke={paraHighlightPair === 'ad_bc' || paraHighlightPair === 'all' ? '#F472B6' : '#64748B'}
                  strokeWidth={paraHighlightPair === 'ad_bc' || paraHighlightPair === 'all' ? '6' : '3'}
                  strokeLinecap="round"
                />
                {/* Double equal tick marks on AD and BC */}
                <line x1="117" y1="108" x2="131" y2="115" stroke="#FACC15" strokeWidth="3" />
                <line x1="113" y1="116" x2="127" y2="123" stroke="#FACC15" strokeWidth="3" />
                <line x1="373" y1="108" x2="387" y2="115" stroke="#FACC15" strokeWidth="3" />
                <line x1="369" y1="116" x2="383" y2="123" stroke="#FACC15" strokeWidth="3" />

                {/* Vertices */}
                {[
                  { label: 'A', x: 156, y: 48, tx: 146, ty: 36 },
                  { label: 'B', x: 412, y: 48, tx: 424, ty: 38 },
                  { label: 'C', x: 348, y: 176, tx: 362, ty: 194 },
                  { label: 'D', x: 92, y: 176, tx: 76, ty: 194 },
                ].map((v) => (
                  <g key={v.label}>
                    <circle cx={v.x} cy={v.y} r="5.5" fill="#FACC15" stroke="#0F172A" strokeWidth="2" />
                    <text x={v.tx} y={v.ty} fill="#FFFFFF" fontSize="20" fontWeight="900">
                      {v.label}
                    </text>
                  </g>
                ))}

                <text x="270" y="232" textAnchor="middle" fill="#BAE6FD" fontSize="14" fontWeight="800">
                  Hình bình hành ABCD · AB = DC = 8 ô · AD = BC
                </text>
              </svg>
            </div>

            <div className="bg-indigo-950/90 border-2 border-sky-400/50 rounded-2xl p-4 space-y-2 text-xs sm:text-sm text-indigo-100">
              <div className="font-extrabold text-yellow-300">
                📌 Hình bình hành ABCD có các đặc điểm:
              </div>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>
                  <span className="font-bold text-sky-300">AB và DC</span> là hai cạnh đối diện;{' '}
                  <span className="font-bold text-pink-300">AD và BC</span> là hai cạnh đối diện.
                </li>
                <li>
                  Cạnh <span className="font-bold text-sky-300">AB song song với cạnh DC</span>; cạnh{' '}
                  <span className="font-bold text-pink-300">AD song song với cạnh BC</span>.
                </li>
                <li>
                  <span className="font-bold text-yellow-300">AB = DC</span> và{' '}
                  <span className="font-bold text-yellow-300">AD = BC</span>.
                </li>
              </ul>
              <div className="mt-2 bg-sky-500/20 border border-sky-300/60 rounded-xl px-3.5 py-2 font-extrabold text-white">
                ⭐ Ghi nhớ: Hình bình hành có hai cặp cạnh đối diện song song và bằng nhau.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HÌNH THOI */}
      {activeTab === 'rhombus' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Magnetic Compass & Real-World Cards */}
          <div className="lg:col-span-5 card-3d-cosmic rounded-3xl p-5 border-2 border-fuchsia-400/60 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-fuchsia-300">
                🧭 Chiếc kim nam châm của la bàn
              </h3>
              <button
                type="button"
                onClick={() => {
                  soundFX.playSnap();
                  setCompassNeedleHighlighted((v) => !v);
                }}
                className="px-3 py-1 rounded-lg bg-fuchsia-500/20 border border-fuchsia-400/60 text-fuchsia-200 text-xs font-extrabold cursor-pointer hover:bg-fuchsia-500/35"
              >
                {compassNeedleHighlighted ? '✨ Đang soi kim hình thoi' : 'Bấm soi kim la bàn'}
              </button>
            </div>

            <div className="bg-[#0B0826] rounded-2xl p-3 border border-indigo-400/40">
              <svg viewBox="0 0 380 220" className="w-full h-auto block">
                <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
                {/* Compass outer ring */}
                <circle cx="130" cy="110" r="82" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="8" />
                <circle cx="130" cy="110" r="72" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
                <text x="130" y="54" textAnchor="middle" fill="#0F172A" fontSize="15" fontWeight="900">N</text>
                <text x="130" y="175" textAnchor="middle" fill="#0F172A" fontSize="15" fontWeight="900">S</text>
                <text x="72" y="115" textAnchor="middle" fill="#0F172A" fontSize="14" fontWeight="900">W</text>
                <text x="188" y="115" textAnchor="middle" fill="#0F172A" fontSize="14" fontWeight="900">E</text>

                {/* Rhombus magnetic needle tilted slightly */}
                <g transform="rotate(-18 130 110)">
                  <polygon points="130,40 144,110 130,110 116,110" fill="#2563EB" />
                  <polygon points="130,180 144,110 130,110 116,110" fill="#EF4444" />
                  <polygon
                    points="130,40 144,110 130,180 116,110"
                    fill="none"
                    stroke={compassNeedleHighlighted ? '#22C55E' : '#0F172A'}
                    strokeWidth={compassNeedleHighlighted ? '4' : '1.5'}
                  />
                  <circle cx="130" cy="110" r="4.5" fill="#FACC15" stroke="#0F172A" strokeWidth="1.5" />
                </g>

                {/* Callout */}
                <rect x="224" y="58" width="144" height="104" rx="14" fill="#1E1B4B" stroke="#E879F9" strokeWidth="2" />
                <text x="296" y="88" textAnchor="middle" fill="#F0ABFC" fontSize="13" fontWeight="900">
                  Kim nam châm
                </text>
                <text x="296" y="110" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700">
                  có 4 cạnh bằng nhau
                </text>
                <text x="296" y="132" textAnchor="middle" fill="#FACC15" fontSize="14" fontWeight="900">
                  → Dạng HÌNH THOI
                </text>
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {[
                { icon: '🧭', title: 'Kim nam châm la bàn', desc: '4 cạnh thon đều bằng nhau giúp chỉ hướng Bắc – Nam' },
                { icon: '🪁', title: 'Con diều hình thoi', desc: 'Khung con diều có 4 cạnh viền bằng nhau cân đối' },
                { icon: '🔲', title: 'Ô lưới sắt mắt cáo', desc: 'Các ô lưới trên cánh cổng xếp đều có dạng hình thoi' },
                { icon: '⚠️', title: 'Biển báo giao thông', desc: 'Biển báo đặt dựng theo hình viên kim cương 4 cạnh bằng nhau' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-indigo-950/80 border border-fuchsia-400/35 rounded-xl p-2.5 space-y-1"
                >
                  <div className="font-extrabold text-white">
                    {item.icon} {item.title}
                  </div>
                  <div className="text-indigo-200 leading-snug">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Interactive Grid Rhombus ABCD */}
          <div className="lg:col-span-7 card-3d-cosmic rounded-3xl p-5 border-2 border-indigo-400/60 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                💎 Khám phá Hình thoi ABCD trên lưới ô vuông
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all' as const, label: '4 cạnh bằng nhau' },
                  { id: 'pair1' as const, label: 'AB song song DC' },
                  { id: 'pair2' as const, label: 'AD song song BC' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      soundFX.playClick(1.1);
                      setRhombusHighlight(opt.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                      rhombusHighlight === opt.id
                        ? 'bg-yellow-400 text-slate-950'
                        : 'bg-indigo-950 text-indigo-200 border border-indigo-400/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0B0826] rounded-2xl p-3 border border-indigo-400/40">
              <svg viewBox="0 0 540 245" className="w-full h-auto block">
                <defs>
                  <pattern id="rhombus-explore-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect x="28" y="16" width="480" height="192" fill="url(#rhombus-explore-grid)" stroke="rgba(148,163,184,0.35)" strokeWidth="1" />

                {/* Rhombus ABCD matching textbook: A(92,112) B(268,32) C(444,112) D(268,192) */}
                <polygon
                  points="92,112 268,32 444,112 268,192"
                  fill="rgba(232,121,249,0.16)"
                />

                {/* AB & DC */}
                <line
                  x1="92"
                  y1="112"
                  x2="268"
                  y2="32"
                  stroke={rhombusHighlight === 'all' || rhombusHighlight === 'pair1' ? '#E879F9' : '#64748B'}
                  strokeWidth={rhombusHighlight === 'all' || rhombusHighlight === 'pair1' ? '6' : '3'}
                  strokeLinecap="round"
                />
                <line
                  x1="268"
                  y1="192"
                  x2="444"
                  y2="112"
                  stroke={rhombusHighlight === 'all' || rhombusHighlight === 'pair1' ? '#E879F9' : '#64748B'}
                  strokeWidth={rhombusHighlight === 'all' || rhombusHighlight === 'pair1' ? '6' : '3'}
                  strokeLinecap="round"
                />

                {/* AD & BC */}
                <line
                  x1="92"
                  y1="112"
                  x2="268"
                  y2="192"
                  stroke={rhombusHighlight === 'all' || rhombusHighlight === 'pair2' ? '#34D399' : '#64748B'}
                  strokeWidth={rhombusHighlight === 'all' || rhombusHighlight === 'pair2' ? '6' : '3'}
                  strokeLinecap="round"
                />
                <line
                  x1="268"
                  y1="32"
                  x2="444"
                  y2="112"
                  stroke={rhombusHighlight === 'all' || rhombusHighlight === 'pair2' ? '#34D399' : '#64748B'}
                  strokeWidth={rhombusHighlight === 'all' || rhombusHighlight === 'pair2' ? '6' : '3'}
                  strokeLinecap="round"
                />

                {/* Single equal tick marks on all 4 sides */}
                <line x1="175" y1="64" x2="185" y2="80" stroke="#FACC15" strokeWidth="3.2" />
                <line x1="351" y1="144" x2="361" y2="160" stroke="#FACC15" strokeWidth="3.2" />
                <line x1="175" y1="160" x2="185" y2="144" stroke="#FACC15" strokeWidth="3.2" />
                <line x1="351" y1="80" x2="361" y2="64" stroke="#FACC15" strokeWidth="3.2" />

                {/* Vertices */}
                {[
                  { label: 'A', x: 92, y: 112, tx: 68, ty: 118 },
                  { label: 'B', x: 268, y: 32, tx: 262, ty: 24 },
                  { label: 'C', x: 444, y: 112, tx: 458, ty: 118 },
                  { label: 'D', x: 268, y: 192, tx: 262, ty: 214 },
                ].map((v) => (
                  <g key={v.label}>
                    <circle cx={v.x} cy={v.y} r="5.5" fill="#FACC15" stroke="#0F172A" strokeWidth="2" />
                    <text x={v.tx} y={v.ty} fill="#FFFFFF" fontSize="20" fontWeight="900">
                      {v.label}
                    </text>
                  </g>
                ))}

                <text x="270" y="236" textAnchor="middle" fill="#F5D0FE" fontSize="14" fontWeight="800">
                  Hình thoi ABCD · Bốn cạnh bằng nhau: AB = BC = CD = DA
                </text>
              </svg>
            </div>

            <div className="bg-indigo-950/90 border-2 border-fuchsia-400/50 rounded-2xl p-4 space-y-2 text-xs sm:text-sm text-indigo-100">
              <div className="font-extrabold text-yellow-300">
                📌 Hình thoi ABCD có các đặc điểm:
              </div>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>
                  Cạnh <span className="font-bold text-fuchsia-300">AB song song với cạnh DC</span>; cạnh{' '}
                  <span className="font-bold text-emerald-300">AD song song với cạnh BC</span>.
                </li>
                <li>
                  Bốn cạnh có độ dài bằng nhau:{' '}
                  <span className="font-bold text-yellow-300">AB = BC = CD = DA</span>.
                </li>
              </ul>
              <div className="mt-2 bg-fuchsia-500/20 border border-fuchsia-300/60 rounded-xl px-3.5 py-2 font-extrabold text-white">
                ⭐ Ghi nhớ: Hình thoi có hai cặp cạnh đối diện song song và bốn cạnh bằng nhau.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SO SÁNH HAI HÌNH */}
      {activeTab === 'compare' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 card-3d-cosmic rounded-3xl p-5 border-2 border-emerald-400/60 space-y-3">
            <h3 className="text-lg font-extrabold text-emerald-300">
              🤝 Điểm GIỐNG NHAU
            </h3>
            <div className="bg-[#0B0826] rounded-2xl p-4 border border-emerald-400/40 space-y-2.5 text-sm text-indigo-100">
              <p>✅ Cả Hình bình hành và Hình thoi đều là hình tứ giác (có 4 đỉnh, 4 cạnh).</p>
              <p>✅ Cả hai hình đều có <span className="font-extrabold text-yellow-300">hai cặp cạnh đối diện song song với nhau</span>.</p>
              <p>✅ Cả hai hình đều có các cạnh đối diện bằng nhau.</p>
            </div>
            <div className="bg-emerald-500/15 border border-emerald-400/50 rounded-2xl p-3.5 text-xs sm:text-sm text-emerald-100 font-semibold">
              💡 Mẹo hay: Khi hai cạnh kề của hình bình hành kéo dài bằng nhau (a = b), hình bình hành trở thành hình thoi!
            </div>
          </div>

          <div className="lg:col-span-6 card-3d-cosmic rounded-3xl p-5 border-2 border-amber-400/60 space-y-3">
            <h3 className="text-lg font-extrabold text-yellow-300">
              🔍 Điểm KHÁC NHAU
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="bg-[#0B0826] rounded-2xl p-4 border border-sky-400/50 space-y-2">
                <div className="font-extrabold text-sky-300 text-base">Hình bình hành</div>
                <p className="text-indigo-100">
                  Hai cặp cạnh đối diện bằng nhau: <span className="font-bold text-white">AB = DC</span> và{' '}
                  <span className="font-bold text-white">AD = BC</span>.
                </p>
                <p className="text-sky-200 font-semibold">
                  Hai cạnh kề (a và b) thường có độ dài khác nhau.
                </p>
              </div>
              <div className="bg-[#0B0826] rounded-2xl p-4 border border-fuchsia-400/50 space-y-2">
                <div className="font-extrabold text-fuchsia-300 text-base">Hình thoi</div>
                <p className="text-indigo-100">
                  Cả bốn cạnh đều bằng nhau:{' '}
                  <span className="font-bold text-white">AB = BC = CD = DA</span>.
                </p>
                <p className="text-fuchsia-200 font-semibold">
                  Chỉ cần biết độ dài 1 cạnh (a) là biết ngay cả 4 cạnh!
                </p>
              </div>
            </div>

            {/* Quick Interactive Mini-Check */}
            <div className="bg-indigo-950/90 border border-indigo-400/40 rounded-2xl p-4 space-y-2.5">
              <div className="text-xs sm:text-sm font-extrabold text-white">
                🎯 Câu hỏi nhanh: Hình nào luôn có cả 4 cạnh bằng nhau?
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {['Hình thoi', 'Mọi hình bình hành'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setMiniCheckAnswer(opt);
                      if (opt === 'Hình thoi') soundFX.playSuccess();
                      else soundFX.playWrong();
                    }}
                    className={`py-2 px-3 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer ${
                      miniCheckAnswer === opt
                        ? opt === 'Hình thoi'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-500 text-white'
                        : 'bg-[#130E38] text-indigo-100 border border-indigo-400/50 hover:bg-indigo-900'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {miniCheckAnswer && (
                <div
                  className={`text-xs font-bold px-3 py-2 rounded-xl ${
                    miniCheckAnswer === 'Hình thoi'
                      ? 'bg-emerald-500/20 text-emerald-200'
                      : 'bg-rose-500/20 text-rose-200'
                  }`}
                >
                  {miniCheckAnswer === 'Hình thoi'
                    ? '🎉 Chính xác! Hình thoi có 2 cặp cạnh đối diện song song và cả 4 cạnh đều bằng nhau.'
                    : 'Chưa đúng rồi! Hình bình hành thường có cạnh đáy và cạnh bên khác nhau, còn Hình thoi mới luôn có cả 4 cạnh bằng nhau.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CÔNG THỨC CHU VI LỚP 4 */}
      {activeTab === 'perimeter' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Parallelogram Perimeter Interactive Card */}
          <div className="card-3d-cosmic rounded-3xl p-5 border-2 border-sky-400/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-sky-300">
                📏 Chu vi Hình bình hành
              </h3>
              <span className="font-mono-num text-xs font-extrabold bg-sky-500/20 border border-sky-400/60 text-sky-200 px-3 py-1 rounded-xl">
                P = (a + b) × 2
              </span>
            </div>

            <div className="bg-[#0B0826] rounded-2xl p-4 border border-sky-400/40 space-y-3">
              <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                Muốn tính <span className="font-extrabold text-yellow-300">chu vi hình bình hành</span>, ta lấy{' '}
                <span className="font-bold text-white">tổng độ dài hai cạnh kề nhau nhân với 2</span> (cùng một đơn vị đo).
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <label className="bg-indigo-950/90 rounded-xl p-2.5 border border-sky-400/40 flex flex-col gap-1">
                  <span className="font-bold text-sky-300">Cạnh đáy a = {sampleParaA} cm</span>
                  <input
                    type="range"
                    min={2}
                    max={12}
                    value={sampleParaA}
                    onChange={(e) => {
                      soundFX.playTick(Number(e.target.value) * 10);
                      setSampleParaA(Number(e.target.value));
                    }}
                    className="accent-sky-400 cursor-pointer"
                  />
                </label>
                <label className="bg-indigo-950/90 rounded-xl p-2.5 border border-pink-400/40 flex flex-col gap-1">
                  <span className="font-bold text-pink-300">Cạnh bên b = {sampleParaB} cm</span>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    value={sampleParaB}
                    onChange={(e) => {
                      soundFX.playTick(Number(e.target.value) * 12);
                      setSampleParaB(Number(e.target.value));
                    }}
                    className="accent-pink-400 cursor-pointer"
                  />
                </label>
              </div>

              <div className="bg-sky-500/15 border border-sky-300/60 rounded-xl p-3 text-center">
                <div className="text-xs text-sky-200 font-bold">Tính chu vi trực tiếp:</div>
                <div className="text-lg sm:text-xl font-mono-num font-extrabold text-yellow-300 mt-1">
                  P = ({sampleParaA} + {sampleParaB}) × 2 ={' '}
                  {calculateParallelogramPerimeter(sampleParaA, sampleParaB)} cm
                </div>
              </div>
            </div>
          </div>

          {/* Rhombus Perimeter Interactive Card */}
          <div className="card-3d-cosmic rounded-3xl p-5 border-2 border-fuchsia-400/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-fuchsia-300">
                💎 Chu vi Hình thoi
              </h3>
              <span className="font-mono-num text-xs font-extrabold bg-fuchsia-500/20 border border-fuchsia-400/60 text-fuchsia-200 px-3 py-1 rounded-xl">
                P = a × 4
              </span>
            </div>

            <div className="bg-[#0B0826] rounded-2xl p-4 border border-fuchsia-400/40 space-y-3">
              <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                Vì hình thoi có 4 cạnh bằng nhau, nên muốn tính{' '}
                <span className="font-extrabold text-yellow-300">chu vi hình thoi</span>, ta lấy{' '}
                <span className="font-bold text-white">độ dài một cạnh nhân với 4</span>.
              </p>

              <label className="bg-indigo-950/90 rounded-xl p-2.5 border border-fuchsia-400/40 flex flex-col gap-1 text-xs">
                <span className="font-bold text-fuchsia-300">
                  Độ dài một cạnh a = {sampleRhombusA} cm (cả 4 cạnh đều bằng {sampleRhombusA} cm)
                </span>
                <input
                  type="range"
                  min={2}
                  max={12}
                  value={sampleRhombusA}
                  onChange={(e) => {
                    soundFX.playTick(Number(e.target.value) * 14);
                    setSampleRhombusA(Number(e.target.value));
                  }}
                  className="accent-fuchsia-400 cursor-pointer"
                />
              </label>

              <div className="bg-fuchsia-500/15 border border-fuchsia-300/60 rounded-xl p-3 text-center">
                <div className="text-xs text-fuchsia-200 font-bold">Tính chu vi trực tiếp:</div>
                <div className="text-lg sm:text-xl font-mono-num font-extrabold text-yellow-300 mt-1">
                  P = {sampleRhombusA} × 4 = {calculateRhombusPerimeter(sampleRhombusA)} cm
                </div>
              </div>
            </div>
          </div>

          {/* Shared Grade 4 Unit Reminder */}
          <div className="lg:col-span-2 bg-amber-500/15 border-2 border-yellow-400/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-yellow-100 font-semibold">
              ⚠️ <span className="font-extrabold text-yellow-300">Lưu ý quan trọng Toán Lớp 4:</span> Khi tính chu vi hình bình hành, nếu hai cạnh khác đơn vị đo (ví dụ <span className="font-bold text-white">dm</span> và <span className="font-bold text-white">cm</span>), em nhớ <span className="font-bold text-white">đổi về cùng một đơn vị đo</span> trước khi cộng rồi nhân 2 nhé!
            </div>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick(1.15);
                onCompleteExplore();
                onGoLab();
              }}
              className="btn-3d-gold px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shrink-0 cursor-pointer"
            >
              🎚️ Vào Phòng Thí Nghiệm Kéo Cạnh →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
