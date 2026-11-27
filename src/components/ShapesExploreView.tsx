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
type ParaExampleId = 'tangram' | 'staircase' | 'awning' | 'ruler';
type RhombusExampleId = 'compass' | 'kite' | 'lattice' | 'sign';

const PARA_EXAMPLES: Array<{
  id: ParaExampleId;
  icon: string;
  title: string;
  heading: string;
  desc: string;
  robotTip: string;
}> = [
  {
    id: 'tangram',
    icon: '🧩',
    title: 'Miếng ghép xếp hình',
    heading: 'Câu chuyện xếp hình chú gà',
    desc: 'Mảnh hình bình hành trong bộ 7 mảnh ghép trí tuệ',
    robotTip:
      'Quan sát đuôi chú gà xếp hình kìa! Mảnh ghép màu đỏ đó có hai cặp cạnh đối diện song song và bằng nhau — đó chính là HÌNH BÌNH HÀNH!',
  },
  {
    id: 'staircase',
    icon: '🏠',
    title: 'Bậc lan can cầu thang',
    heading: 'Khung lan can cầu thang nghiêng',
    desc: 'Các khung nghiêng song song đều nhau trên cầu thang',
    robotTip:
      'Nhìn khung lan can cầu thang kìa! Tay vịn phía trên song song với thanh đỡ phía dưới, còn hai thanh trụ đứng song song với nhau tạo thành HÌNH BÌNH HÀNH!',
  },
  {
    id: 'awning',
    icon: '🏢',
    title: 'Mái hiên và ô kính nghiêng',
    heading: 'Mái hiên và ô kính kiến trúc nghiêng',
    desc: 'Các tấm kính kiến trúc cắt vát có 2 cặp cạnh song song',
    robotTip:
      'Những ô kính và mái hiên nghiêng trên tòa nhà đều có hai cặp cạnh đối diện song song và bằng nhau, tạo nên các HÌNH BÌNH HÀNH rất đẹp mắt!',
  },
  {
    id: 'ruler',
    icon: '📐',
    title: 'Thanh thước nối song song',
    heading: 'Bộ thanh thước nối song song',
    desc: 'Hai thanh gỗ đối diện luôn song song và bằng nhau',
    robotTip:
      'Hai thanh thước ngang bằng nhau nối với nhau bằng hai thanh ngắn bằng nhau tạo thành bộ khung HÌNH BÌNH HÀNH giúp vẽ đường thẳng song song cực chuẩn!',
  },
];

const RHOMBUS_EXAMPLES: Array<{
  id: RhombusExampleId;
  icon: string;
  title: string;
  heading: string;
  desc: string;
  robotTip: string;
}> = [
  {
    id: 'compass',
    icon: '🧭',
    title: 'Kim nam châm la bàn',
    heading: 'Chiếc kim nam châm của la bàn',
    desc: '4 cạnh thon đều bằng nhau giúp chỉ hướng Bắc – Nam',
    robotTip:
      'Nhìn chiếc kim nam châm của la bàn kìa! Kim có hai cặp cạnh đối diện song song và cả BỐN CẠNH đều bằng nhau — đó chính là HÌNH THOI đấy em ạ!',
  },
  {
    id: 'kite',
    icon: '🪁',
    title: 'Con diều hình thoi',
    heading: 'Cánh diều hình thoi bay trên trời',
    desc: 'Khung con diều có 4 cạnh viền bằng nhau cân đối',
    robotTip:
      'Chiếc diều hình thoi có 4 cạnh viền bằng nhau tăm tắp và 2 cặp cạnh đối diện song song giúp cánh diều đón gió thật cân bằng!',
  },
  {
    id: 'lattice',
    icon: '💠',
    title: 'Ô lưới sắt mắt cáo',
    heading: 'Cánh cổng lưới sắt mắt cáo',
    desc: 'Các ô lưới trên cánh cổng xếp đều có dạng hình thoi',
    robotTip:
      'Trên cánh cổng sắt xếp mắt cáo, mỗi ô lưới nhỏ đều được ghép từ 4 thanh sắt ngắn bằng nhau và đối diện song song — tạo thành rất nhiều HÌNH THOI!',
  },
  {
    id: 'sign',
    icon: '⚠️',
    title: 'Biển báo giao thông',
    heading: 'Biển báo giao thông hình thoi',
    desc: 'Biển báo đặt dựng theo hình viên kim cương 4 cạnh bằng nhau',
    robotTip:
      'Tấm biển báo giao thông màu vàng đặt dựng nghiêng có 4 cạnh viền bằng nhau và hai cặp cạnh đối diện song song là hình ảnh HÌNH THOI rất quen thuộc trên đường phố!',
  },
];

export const ShapesExploreView: React.FC<ShapesExploreViewProps> = ({
  onBackHome,
  onGoLab,
  onCompleteExplore,
}) => {
  const [activeTab, setActiveTab] = useState<ExploreTab>('parallelogram');
  const [paraHighlightPair, setParaHighlightPair] = useState<'none' | 'ab_dc' | 'ad_bc' | 'all'>('all');
  const [rhombusHighlight, setRhombusHighlight] = useState<'all' | 'pair1' | 'pair2'>('all');

  const [selectedParaExample, setSelectedParaExample] = useState<ParaExampleId>('tangram');
  const [paraHighlightActive, setParaHighlightActive] = useState<boolean>(true);

  const [selectedRhombusExample, setSelectedRhombusExample] = useState<RhombusExampleId>('compass');
  const [rhombusHighlightActive, setRhombusHighlightActive] = useState<boolean>(true);

  const [miniCheckAnswer, setMiniCheckAnswer] = useState<string | null>(null);

  // Interactive perimeter preview inside Tab 4
  const [sampleParaA, setSampleParaA] = useState<number>(6);
  const [sampleParaB, setSampleParaB] = useState<number>(4);
  const [sampleRhombusA, setSampleRhombusA] = useState<number>(5);

  const activeParaMeta =
    PARA_EXAMPLES.find((e) => e.id === selectedParaExample) ?? PARA_EXAMPLES[0];
  const activeRhombusMeta =
    RHOMBUS_EXAMPLES.find((e) => e.id === selectedRhombusExample) ?? RHOMBUS_EXAMPLES[0];

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
          {activeTab === 'parallelogram' && activeParaMeta.robotTip}
          {activeTab === 'rhombus' && activeRhombusMeta.robotTip}
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
          {/* Left: Interactive Real-World Examples Showcase */}
          <div className="lg:col-span-5 card-3d-cosmic rounded-3xl p-5 border-2 border-sky-400/60 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3
                data-testid="para-example-heading"
                className="text-base sm:text-lg font-extrabold text-sky-300"
              >
                {activeParaMeta.icon} {activeParaMeta.heading}
              </h3>
              <button
                type="button"
                onClick={() => {
                  soundFX.playSnap();
                  setParaHighlightActive((v) => !v);
                }}
                className="px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-400/60 text-rose-200 text-xs font-extrabold cursor-pointer hover:bg-rose-500/35 shrink-0"
              >
                {paraHighlightActive ? '✨ Đang soi hình' : 'Bấm soi hình'}
              </button>
            </div>

            <div className="bg-[#0B0826] rounded-2xl p-3 border border-indigo-400/40">
              {selectedParaExample === 'tangram' && (
                <svg viewBox="0 0 380 220" className="w-full h-auto block">
                  <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
                  <rect x="14" y="14" width="142" height="34" rx="10" fill="#1E1B4B" stroke="#38BDF8" strokeWidth="1.5" />
                  <text x="85" y="35" textAnchor="middle" fill="#E0F2FE" fontSize="12" fontWeight="700">
                    Đuôi con gà là hình gì?
                  </text>
                  <rect x="206" y="14" width="160" height="34" rx="10" fill="#3B0764" stroke="#F472B6" strokeWidth="1.5" />
                  <text x="286" y="35" textAnchor="middle" fill="#FCE7F3" fontSize="12" fontWeight="800">
                    Là hình bình hành đó!
                  </text>

                  {/* Tangram Rooster */}
                  <polygon points="108,86 134,64 160,86" fill="#EF4444" stroke="#0F172A" strokeWidth="2" />
                  <polygon points="124,86 158,86 158,120 124,120" fill="#F97316" stroke="#0F172A" strokeWidth="2" />
                  <polygon points="124,120 236,120 180,176" fill="#10B981" stroke="#0F172A" strokeWidth="2" />
                  <polygon points="154,150 180,176 142,176" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
                  <polygon points="180,176 180,206 148,206" fill="#0284C7" stroke="#0F172A" strokeWidth="2" />
                  {/* Tail (RED PARALLELOGRAM) */}
                  <polygon
                    points="210,120 242,88 294,88 262,120"
                    fill="#F43F5E"
                    stroke={paraHighlightActive ? '#FACC15' : '#0F172A'}
                    strokeWidth={paraHighlightActive ? '4.5' : '2'}
                  />
                  {paraHighlightActive && (
                    <g>
                      <line x1="274" y1="74" x2="258" y2="96" stroke="#FACC15" strokeWidth="2.5" strokeDasharray="4 3" />
                      <rect x="242" y="138" width="128" height="30" rx="8" fill="#FACC15" />
                      <text x="306" y="157" textAnchor="middle" fill="#0F172A" fontSize="12" fontWeight="900">
                        HÌNH BÌNH HÀNH
                      </text>
                    </g>
                  )}
                </svg>
              )}

              {selectedParaExample === 'staircase' && (
                <svg viewBox="0 0 380 220" className="w-full h-auto block">
                  <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
                  {/* Steps base */}
                  <path
                    d="M 28 194 L 92 194 L 92 164 L 154 164 L 154 134 L 216 134 L 216 104 L 278 104 L 278 74 L 352 74 L 352 204 L 28 204 Z"
                    fill="#1E293B"
                    stroke="#64748B"
                    strokeWidth="2.5"
                  />
                  {/* Upper & lower slanted handrails */}
                  <line x1="42" y1="112" x2="328" y2="26" stroke="#94A3B8" strokeWidth="7" strokeLinecap="round" />
                  <line x1="42" y1="184" x2="328" y2="98" stroke="#64748B" strokeWidth="5" strokeLinecap="round" />
                  {/* Vertical balusters forming 4 parallelograms */}
                  {[64, 128, 192, 256, 316].map((x) => {
                    const yTop = 112 + ((x - 42) / 286) * (26 - 112);
                    const yBot = 184 + ((x - 42) / 286) * (98 - 184);
                    return (
                      <line
                        key={x}
                        x1={x}
                        y1={yTop}
                        x2={x}
                        y2={yBot}
                        stroke="#94A3B8"
                        strokeWidth="4"
                      />
                    );
                  })}

                  {/* Highlighted central railing panel parallelogram */}
                  {paraHighlightActive && (
                    <g>
                      <polygon
                        points="128,86 256,48 256,120 128,158"
                        fill="rgba(56,189,248,0.28)"
                        stroke="#FACC15"
                        strokeWidth="4.5"
                      />
                      <line x1="128" y1="86" x2="256" y2="48" stroke="#38BDF8" strokeWidth="5" />
                      <line x1="128" y1="158" x2="256" y2="120" stroke="#38BDF8" strokeWidth="5" />
                      <line x1="128" y1="86" x2="128" y2="158" stroke="#F472B6" strokeWidth="5" />
                      <line x1="256" y1="48" x2="256" y2="120" stroke="#F472B6" strokeWidth="5" />
                      <rect x="234" y="156" width="132" height="30" rx="8" fill="#FACC15" />
                      <text x="300" y="175" textAnchor="middle" fill="#0F172A" fontSize="12" fontWeight="900">
                        HÌNH BÌNH HÀNH
                      </text>
                    </g>
                  )}
                  <text x="190" y="214" textAnchor="middle" fill="#BAE6FD" fontSize="11" fontWeight="800">
                    Khung lan can có 2 cặp cạnh đối song song và bằng nhau
                  </text>
                </svg>
              )}

              {selectedParaExample === 'awning' && (
                <svg viewBox="0 0 380 220" className="w-full h-auto block">
                  <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
                  {/* Modern building wall */}
                  <rect x="34" y="22" width="312" height="172" rx="10" fill="#1E1B4B" stroke="#475569" strokeWidth="2.5" />
                  {/* Slanted architectural glass panels / awning stripes */}
                  {[0, 1, 2].map((i) => {
                    const x0 = 66 + i * 86;
                    const isMid = i === 1;
                    return (
                      <polygon
                        key={i}
                        points={`${x0 + 26},46 ${x0 + 96},46 ${x0 + 70},152 ${x0},152`}
                        fill={
                          isMid && paraHighlightActive
                            ? 'rgba(56,189,248,0.38)'
                            : 'rgba(148,163,184,0.2)'
                        }
                        stroke={isMid && paraHighlightActive ? '#FACC15' : '#64748B'}
                        strokeWidth={isMid && paraHighlightActive ? '4.5' : '2.5'}
                      />
                    );
                  })}
                  {/* Shine lines on glass */}
                  <line x1="176" y1="62" x2="164" y2="108" stroke="rgba(255,255,255,0.45)" strokeWidth="3" strokeLinecap="round" />
                  {paraHighlightActive && (
                    <g>
                      <line x1="178" y1="46" x2="248" y2="46" stroke="#38BDF8" strokeWidth="5" />
                      <line x1="152" y1="152" x2="222" y2="152" stroke="#38BDF8" strokeWidth="5" />
                      <line x1="178" y1="46" x2="152" y2="152" stroke="#F472B6" strokeWidth="5" />
                      <line x1="248" y1="46" x2="222" y2="152" stroke="#F472B6" strokeWidth="5" />
                      <rect x="124" y="162" width="132" height="28" rx="8" fill="#FACC15" />
                      <text x="190" y="180" textAnchor="middle" fill="#0F172A" fontSize="12" fontWeight="900">
                        HÌNH BÌNH HÀNH
                      </text>
                    </g>
                  )}
                  <text x="190" y="212" textAnchor="middle" fill="#BAE6FD" fontSize="11" fontWeight="800">
                    Ô kính và mái hiên nghiêng tạo thành hình bình hành
                  </text>
                </svg>
              )}

              {selectedParaExample === 'ruler' && (
                <svg viewBox="0 0 380 220" className="w-full h-auto block">
                  <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
                  {/* Top wooden/blue parallel straightedge */}
                  <rect x="78" y="42" width="246" height="22" rx="5" fill="#0284C7" stroke="#7DD3FC" strokeWidth="2" />
                  {/* Bottom parallel straightedge */}
                  <rect x="46" y="140" width="246" height="22" rx="5" fill="#0284C7" stroke="#7DD3FC" strokeWidth="2" />
                  {/* Ruler ticks */}
                  {[0, 1, 2, 3, 4, 5, 6].map((t) => (
                    <g key={t}>
                      <line x1={96 + t * 34} y1="42" x2={96 + t * 34} y2="51" stroke="#E0F2FE" strokeWidth="2" />
                      <line x1={64 + t * 34} y1="153" x2={64 + t * 34} y2="162" stroke="#E0F2FE" strokeWidth="2" />
                    </g>
                  ))}
                  {/* Two slanted equal brass linkage bars */}
                  <line x1="126" y1="53" x2="94" y2="151" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" />
                  <line x1="274" y1="53" x2="242" y2="151" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" />

                  {/* Parallelogram overlay */}
                  {paraHighlightActive && (
                    <g>
                      <polygon
                        points="126,53 274,53 242,151 94,151"
                        fill="rgba(56,189,248,0.22)"
                        stroke="#FACC15"
                        strokeWidth="4"
                        strokeDasharray="7 4"
                      />
                      <rect x="124" y="176" width="132" height="28" rx="8" fill="#FACC15" />
                      <text x="190" y="194" textAnchor="middle" fill="#0F172A" fontSize="12" fontWeight="900">
                        HÌNH BÌNH HÀNH
                      </text>
                    </g>
                  )}

                  {/* Brass pivot pins */}
                  {[
                    { x: 126, y: 53 },
                    { x: 274, y: 53 },
                    { x: 242, y: 151 },
                    { x: 94, y: 151 },
                  ].map((p, idx) => (
                    <circle key={idx} cx={p.x} cy={p.y} r="5.5" fill="#FEF08A" stroke="#0F172A" strokeWidth="2" />
                  ))}
                </svg>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-extrabold text-yellow-300 uppercase">
                👆 Bấm chọn từng đồ vật thực tế để xem hình minh họa:
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {PARA_EXAMPLES.map((item) => {
                  const isActive = selectedParaExample === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-testid={`para-example-card-${item.id}`}
                      onClick={() => {
                        soundFX.playClick(1.12);
                        setSelectedParaExample(item.id);
                        setParaHighlightActive(true);
                      }}
                      className={`text-left rounded-xl p-2.5 space-y-1 cursor-pointer transition-all border-2 ${
                        isActive
                          ? 'bg-sky-500/25 border-yellow-400 shadow-lg scale-[1.02]'
                          : 'bg-indigo-950/80 border-indigo-400/35 hover:border-sky-400 hover:bg-indigo-900/70'
                      }`}
                    >
                      <div className="font-extrabold text-white flex items-center justify-between gap-1">
                        <span>
                          {item.icon} {item.title}
                        </span>
                        {isActive && <span className="text-[10px] text-yellow-300">●</span>}
                      </div>
                      <div className="text-indigo-200 leading-snug">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
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

                <polygon
                  points="156,48 412,48 348,176 92,176"
                  fill="rgba(56,189,248,0.16)"
                />

                {/* Edge AB and DC */}
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
                <line x1="284" y1="40" x2="284" y2="56" stroke="#FACC15" strokeWidth="3" />
                <line x1="220" y1="168" x2="220" y2="184" stroke="#FACC15" strokeWidth="3" />

                {/* Edge AD and BC */}
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
          {/* Left: Interactive Real-World Rhombus Showcase */}
          <div className="lg:col-span-5 card-3d-cosmic rounded-3xl p-5 border-2 border-fuchsia-400/60 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3
                data-testid="rhombus-example-heading"
                className="text-base sm:text-lg font-extrabold text-fuchsia-300"
              >
                {activeRhombusMeta.icon} {activeRhombusMeta.heading}
              </h3>
              <button
                type="button"
                onClick={() => {
                  soundFX.playSnap();
                  setRhombusHighlightActive((v) => !v);
                }}
                className="px-3 py-1 rounded-lg bg-fuchsia-500/20 border border-fuchsia-400/60 text-fuchsia-200 text-xs font-extrabold cursor-pointer hover:bg-fuchsia-500/35 shrink-0"
              >
                {rhombusHighlightActive ? '✨ Đang soi hình thoi' : 'Bấm soi hình thoi'}
              </button>
            </div>

            <div className="bg-[#0B0826] rounded-2xl p-3 border border-indigo-400/40">
              {selectedRhombusExample === 'compass' && (
                <svg viewBox="0 0 380 220" className="w-full h-auto block">
                  <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
                  <circle cx="130" cy="110" r="82" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="8" />
                  <circle cx="130" cy="110" r="72" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
                  <text x="130" y="54" textAnchor="middle" fill="#0F172A" fontSize="15" fontWeight="900">N</text>
                  <text x="130" y="175" textAnchor="middle" fill="#0F172A" fontSize="15" fontWeight="900">S</text>
                  <text x="72" y="115" textAnchor="middle" fill="#0F172A" fontSize="14" fontWeight="900">W</text>
                  <text x="188" y="115" textAnchor="middle" fill="#0F172A" fontSize="14" fontWeight="900">E</text>

                  <g transform="rotate(-18 130 110)">
                    <polygon points="130,40 144,110 130,110 116,110" fill="#2563EB" />
                    <polygon points="130,180 144,110 130,110 116,110" fill="#EF4444" />
                    <polygon
                      points="130,40 144,110 130,180 116,110"
                      fill="none"
                      stroke={rhombusHighlightActive ? '#22C55E' : '#0F172A'}
                      strokeWidth={rhombusHighlightActive ? '4' : '1.5'}
                    />
                    <circle cx="130" cy="110" r="4.5" fill="#FACC15" stroke="#0F172A" strokeWidth="1.5" />
                  </g>

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
              )}

              {selectedRhombusExample === 'kite' && (
                <svg viewBox="0 0 380 220" className="w-full h-auto block">
                  <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
                  {/* Clouds / sky accents */}
                  <circle cx="58" cy="48" r="18" fill="rgba(56,189,248,0.16)" />
                  <circle cx="76" cy="48" r="22" fill="rgba(56,189,248,0.16)" />
                  <circle cx="318" cy="44" r="16" fill="rgba(232,121,249,0.15)" />

                  {/* Flowing kite tail */}
                  <path
                    d="M 150 162 Q 190 184 226 172 T 294 196"
                    fill="none"
                    stroke="#FACC15"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />
                  {/* Ribbon bows on tail */}
                  <polygon points="210,174 220,166 220,182" fill="#F43F5E" />
                  <polygon points="228,174 218,166 218,182" fill="#F43F5E" />
                  <polygon points="262,182 272,174 272,190" fill="#38BDF8" />
                  <polygon points="280,182 270,174 270,190" fill="#38BDF8" />

                  {/* Rhombus kite 4 colorful quarters */}
                  <polygon points="150,28 216,95 150,95" fill="#F43F5E" />
                  <polygon points="150,28 84,95 150,95" fill="#FACC15" />
                  <polygon points="150,162 216,95 150,95" fill="#38BDF8" />
                  <polygon points="150,162 84,95 150,95" fill="#10B981" />

                  {/* Wooden cross spars */}
                  <line x1="150" y1="28" x2="150" y2="162" stroke="#FEF08A" strokeWidth="2.5" />
                  <line x1="84" y1="95" x2="216" y2="95" stroke="#FEF08A" strokeWidth="2.5" />

                  {/* Outer rhombus highlight */}
                  <polygon
                    points="150,28 216,95 150,162 84,95"
                    fill="none"
                    stroke={rhombusHighlightActive ? '#E879F9' : '#0F172A'}
                    strokeWidth={rhombusHighlightActive ? '5' : '2'}
                  />

                  {/* Callout */}
                  <rect x="236" y="54" width="132" height="92" rx="14" fill="#1E1B4B" stroke="#E879F9" strokeWidth="2" />
                  <text x="302" y="82" textAnchor="middle" fill="#F0ABFC" fontSize="13" fontWeight="900">
                    Con diều cân đối
                  </text>
                  <text x="302" y="104" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="700">
                    4 cạnh viền bằng nhau
                  </text>
                  <text x="302" y="128" textAnchor="middle" fill="#FACC15" fontSize="13.5" fontWeight="900">
                    → HÌNH THOI
                  </text>
                </svg>
              )}

              {selectedRhombusExample === 'lattice' && (
                <svg viewBox="0 0 380 220" className="w-full h-auto block">
                  <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
                  <rect x="34" y="20" width="312" height="162" rx="8" fill="#1E293B" stroke="#94A3B8" strokeWidth="5" />
                  {[0, 1, 2, 3].map((col) =>
                    [0, 1].map((row) => {
                      const cx = 86 + col * 68;
                      const cy = 65 + row * 72;
                      const isFeatured = col === 1 && row === 0;
                      return (
                        <polygon
                          key={`${col}-${row}`}
                          points={`${cx},${cy - 32} ${cx + 30},${cy} ${cx},${cy + 32} ${cx - 30},${cy}`}
                          fill={
                            isFeatured && rhombusHighlightActive
                              ? 'rgba(232,121,249,0.34)'
                              : 'rgba(56,189,248,0.08)'
                          }
                          stroke={
                            isFeatured && rhombusHighlightActive ? '#FACC15' : '#38BDF8'
                          }
                          strokeWidth={isFeatured && rhombusHighlightActive ? '4.5' : '2.5'}
                        />
                      );
                    })
                  )}
                  <text x="190" y="205" textAnchor="middle" fill="#F5D0FE" fontSize="11" fontWeight="800">
                    Mỗi ô lưới mắt cáo có 4 cạnh bằng nhau dạng HÌNH THOI
                  </text>
                </svg>
              )}

              {selectedRhombusExample === 'sign' && (
                <svg viewBox="0 0 380 220" className="w-full h-auto block">
                  <rect x="0" y="0" width="380" height="220" rx="12" fill="#0D0A2A" />
                  {/* Steel post */}
                  <rect x="130" y="146" width="12" height="62" fill="#94A3B8" />
                  {/* Yellow diamond traffic sign */}
                  <polygon
                    points="136,24 202,90 136,156 70,90"
                    fill="#FACC15"
                    stroke={rhombusHighlightActive ? '#E879F9' : '#0F172A'}
                    strokeWidth={rhombusHighlightActive ? '5.5' : '4'}
                  />
                  <polygon points="136,36 190,90 136,144 82,90" fill="none" stroke="#0F172A" strokeWidth="2.5" />
                  <text x="136" y="102" textAnchor="middle" fill="#0F172A" fontSize="34" fontWeight="900">
                    !
                  </text>

                  {/* Callout */}
                  <rect x="224" y="54" width="144" height="100" rx="14" fill="#1E1B4B" stroke="#FACC15" strokeWidth="2" />
                  <text x="296" y="82" textAnchor="middle" fill="#FDE047" fontSize="13" fontWeight="900">
                    Biển báo dựng đứng
                  </text>
                  <text x="296" y="104" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="700">
                    4 cạnh viền bằng nhau
                  </text>
                  <text x="296" y="124" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="700">
                    2 cặp cạnh song song
                  </text>
                  <text x="296" y="144" textAnchor="middle" fill="#F0ABFC" fontSize="13" fontWeight="900">
                    → Dạng HÌNH THOI
                  </text>
                </svg>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-extrabold text-yellow-300 uppercase">
                👆 Bấm chọn từng đồ vật thực tế để xem hình minh họa:
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {RHOMBUS_EXAMPLES.map((item) => {
                  const isActive = selectedRhombusExample === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-testid={`rhombus-example-card-${item.id}`}
                      onClick={() => {
                        soundFX.playClick(1.15);
                        setSelectedRhombusExample(item.id);
                        setRhombusHighlightActive(true);
                      }}
                      className={`text-left rounded-xl p-2.5 space-y-1 cursor-pointer transition-all border-2 ${
                        isActive
                          ? 'bg-fuchsia-500/25 border-yellow-400 shadow-lg scale-[1.02]'
                          : 'bg-indigo-950/80 border-fuchsia-400/35 hover:border-fuchsia-400 hover:bg-indigo-900/70'
                      }`}
                    >
                      <div className="font-extrabold text-white flex items-center justify-between gap-1">
                        <span>
                          {item.icon} {item.title}
                        </span>
                        {isActive && <span className="text-[10px] text-yellow-300">●</span>}
                      </div>
                      <div className="text-indigo-200 leading-snug">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
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

                <polygon
                  points="92,112 268,32 444,112 268,192"
                  fill="rgba(232,121,249,0.16)"
                />

                {/* AB and DC */}
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

                {/* AD and BC */}
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

                {/* Equal tick marks */}
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
