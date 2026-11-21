import React, { useState } from 'react';
import { classifyAngle, polarToSvgCartesian } from '../utils/angleMath';
import { soundFX } from '../utils/soundEffects';
import {
  TextbookAngleMeasurePlacementSVG,
  TextbookAngleNamingSVG,
} from './TextbookAngleIllustrations';

export interface AngleMuseumCard {
  id: 'acute' | 'right' | 'obtuse' | 'straight' | 'reflex' | 'full';
  titleVi: string;
  ruleVi: string;
  defaultDeg: number;
  minDeg: number;
  maxDeg: number;
  colorHex: string;
  borderClass: string;
  explanationVi: string;
  realWorldExampleVi: string;
  isCore: boolean;
}

export const ANGLE_MUSEUM_ITEMS: AngleMuseumCard[] = [
  {
    id: 'acute',
    titleVi: 'Góc nhọn',
    ruleVi: '0° < Số đo < 90°',
    defaultDeg: 45,
    minDeg: 10,
    maxDeg: 89,
    colorHex: '#FACC15',
    borderClass: 'border-yellow-400',
    explanationVi: 'Góc nhọn có số đo lớn hơn 0° và nhỏ hơn góc vuông (90°). Hai cạnh mở hẹp như mũi tên phi thuyền.',
    realWorldExampleVi: 'Ví dụ: Mũi tên lửa, miếng bánh pizza cắt nhỏ, compa mở hẹp (45°).',
    isCore: true,
  },
  {
    id: 'right',
    titleVi: 'Góc vuông',
    ruleVi: 'Số đo = 90°',
    defaultDeg: 90,
    minDeg: 90,
    maxDeg: 90,
    colorHex: '#22C55E',
    borderClass: 'border-emerald-400',
    explanationVi: 'Góc vuông có số đo đúng bằng 90°. Tại đỉnh góc luôn được đánh dấu bằng ký hiệu ô vuông nhỏ.',
    realWorldExampleVi: 'Ví dụ: Góc quyển sách Toán, góc bàn học, hai kim đồng hồ lúc 3 giờ đúng.',
    isCore: true,
  },
  {
    id: 'obtuse',
    titleVi: 'Góc tù',
    ruleVi: '90° < Số đo < 180°',
    defaultDeg: 120,
    minDeg: 91,
    maxDeg: 179,
    colorHex: '#FF2E93',
    borderClass: 'border-pink-500',
    explanationVi: 'Góc tù có độ mở lớn hơn góc vuông (90°) nhưng nhỏ hơn góc bẹt (180°).',
    realWorldExampleVi: 'Ví dụ: Chiếc quạt giấy mở rộng, ghế tựa ngả lưng trên tàu vũ trụ (120°).',
    isCore: true,
  },
  {
    id: 'straight',
    titleVi: 'Góc bẹt',
    ruleVi: 'Số đo = 180°',
    defaultDeg: 180,
    minDeg: 180,
    maxDeg: 180,
    colorHex: '#38BDF8',
    borderClass: 'border-sky-400',
    explanationVi: 'Góc bẹt có số đo bằng 180° (bằng hai góc vuông ghép lại). Hai cạnh tạo thành một đường thẳng có đỉnh nằm ở giữa.',
    realWorldExampleVi: 'Ví dụ: Đường thẳng mép thước kẻ, hai kim đồng hồ lúc 6 giờ đúng.',
    isCore: true,
  },
];

interface ExploreAnglesViewProps {
  onSelectAngleForLab: (deg: number) => void;
  onAnglePreviewChange: (deg: number) => void;
  onBackHome: () => void;
}

export const ExploreAnglesView: React.FC<ExploreAnglesViewProps> = ({
  onSelectAngleForLab,
  onAnglePreviewChange,
  onBackHome,
}) => {
  const [selectedCard, setSelectedCard] = useState<AngleMuseumCard>(ANGLE_MUSEUM_ITEMS[0]);
  const [liveDeg, setLiveDeg] = useState<number>(45);

  const handleSelectCard = (card: AngleMuseumCard) => {
    soundFX.playClick(1.1);
    setSelectedCard(card);
    setLiveDeg(card.defaultDeg);
    onAnglePreviewChange(card.defaultDeg);
  };

  const handleSliderChange = (nextDeg: number) => {
    setLiveDeg(nextDeg);
    onAnglePreviewChange(nextDeg);
    soundFX.playTick(nextDeg);
  };

  const coreCards = ANGLE_MUSEUM_ITEMS;

  // Interactive SVG preview coordinates
  const cx = 190;
  const cy = 175;
  const r = 130;
  const ray1 = polarToSvgCartesian(cx, cy, r, 0);
  const ray2 = polarToSvgCartesian(cx, cy, r, liveDeg);
  const arcR = 64;
  const arcStart = polarToSvgCartesian(cx, cy, arcR, 0);
  const arcEnd = polarToSvgCartesian(cx, cy, arcR, liveDeg === 360 ? 359.5 : liveDeg);
  const largeArc = liveDeg > 180 ? 1 : 0;
  const currentCls = classifyAngle(liveDeg);

  // Textbook position for angle measure: nestled inside the angle corner near vertex O
  const measureLabelRadius = liveDeg < 35 ? 74 : liveDeg < 55 ? 48 : liveDeg === 90 ? 44 : 40;
  const measureLabelPos = polarToSvgCartesian(cx, cy, measureLabelRadius, liveDeg / 2);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-3d-cosmic rounded-2xl px-5 py-3.5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            BẢO TÀNG KHÁM PHÁ CÁC LOẠI GÓC 3D
          </h1>
          <p className="text-sm text-indigo-200">
            Chạm vào từng loại góc để quan sát <strong className="text-yellow-300">góc đỉnh O; cạnh OA, OB</strong>, thay đổi độ mở hai cạnh và chuyển sang Phòng Thí Nghiệm!
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            onBackHome();
          }}
          className="btn-3d-cobalt px-4 py-2.5 rounded-xl font-bold text-sm text-white whitespace-nowrap shrink-0 cursor-pointer"
        >
          ← Quay lại Trang chủ
        </button>
      </div>

      {/* Main Split: Left Cards Grid | Right 3D & Interactive Angle Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 4 Core Angles + Textbook Naming Convention Banner */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="card-3d-cosmic rounded-2xl p-5">
            <h2 className="text-lg font-extrabold text-yellow-300 mb-3.5">
              BỐN LOẠI GÓC TRỌNG TÂM TRONG CHƯƠNG TRÌNH TIỂU HỌC
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coreCards.map((card) => {
                const isSelected = selectedCard.id === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleSelectCard(card)}
                    className={`text-left p-5 rounded-2xl transition-transform cursor-pointer border-2 ${
                      isSelected
                        ? `${card.borderClass} bg-indigo-950/95 scale-[1.02] shadow-lg`
                        : 'border-indigo-500/30 bg-[#130E38]/90 hover:border-indigo-400/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className="text-xl font-extrabold"
                        style={{ color: card.colorHex }}
                      >
                        {card.titleVi}
                      </span>
                      <span className="font-mono-num text-sm font-bold text-white bg-slate-900/90 px-2.5 py-1 rounded-lg border border-white/15">
                        Mẫu: {card.defaultDeg}°
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-indigo-200 mb-2">
                      Quy tắc: {card.ruleVi}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {card.explanationVi}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grade 4 Textbook Angle Naming & Measure Placement Reference Card */}
          <div className="card-3d-cosmic rounded-2xl p-4 border-2 border-yellow-400/50 flex flex-col gap-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-block bg-yellow-400/20 text-yellow-300 font-extrabold px-2.5 py-1 rounded-md text-xs border border-yellow-400/40">
                📖 KIẾN THỨC CẤU TẠO GÓC VÀ VỊ TRÍ GHI SỐ ĐO (TOÁN LỚP 4)
              </div>
              <span className="text-xs text-indigo-200 font-semibold">
                Nêu tên Đỉnh trước, hai cạnh sau · Ghi số đo ở góc trong sát đỉnh
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
              <div className="sm:col-span-7">
                <TextbookAngleNamingSVG className="h-full" />
              </div>
              <div className="sm:col-span-5">
                <TextbookAngleMeasurePlacementSVG className="h-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 2-Side Model Inspector & CTA */}
        <div className="lg:col-span-5 card-3d-cosmic rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-extrabold text-yellow-300">
                MÔ HÌNH: GÓC ĐỈNH O; CẠNH OA, OB
              </span>
              <h3
                className="text-2xl font-extrabold"
                style={{ color: selectedCard.colorHex }}
              >
                {selectedCard.titleVi} ({liveDeg}°)
              </h3>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold font-mono-num text-yellow-300">
                {liveDeg}°
              </div>
              <div className="text-xs text-indigo-200">{currentCls.rangeVi}</div>
            </div>
          </div>

          {/* Interactive SVG Diagram of Góc đỉnh O; cạnh OA, OB */}
          <div className="rounded-xl bg-[#090621] border border-indigo-500/40 p-2">
            <svg viewBox="0 0 420 260" className="w-full h-52 select-none">
              <defs>
                <pattern id="museumGrid" width="25" height="25" patternUnits="userSpaceOnUse">
                  <path
                    d="M 25 0 L 0 0 0 25"
                    fill="none"
                    stroke="rgba(99, 102, 241, 0.14)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect x="0" y="0" width="420" height="260" fill="url(#museumGrid)" />

              {/* Sector or Right-Angle Square */}
              {liveDeg === 90 ? (
                <rect
                  x={cx}
                  y={cy - 22}
                  width={22}
                  height={22}
                  fill="rgba(34, 197, 94, 0.25)"
                  stroke="#22C55E"
                  strokeWidth={2}
                />
              ) : (
                <path
                  d={`M ${cx} ${cy} L ${arcStart.x} ${arcStart.y} A ${arcR} ${arcR} 0 ${largeArc} 0 ${arcEnd.x} ${arcEnd.y} Z`}
                  fill={selectedCard.colorHex}
                  fillOpacity={0.22}
                  stroke={selectedCard.colorHex}
                  strokeWidth={2}
                />
              )}

              {/* Horizontal Base Side OB */}
              <line
                x1={cx}
                y1={cy}
                x2={ray1.x}
                y2={ray1.y}
                stroke="#38BDF8"
                strokeWidth={5}
                strokeLinecap="round"
              />
              <circle cx={ray1.x} cy={ray1.y} r={5} fill="#38BDF8" />
              <text x={ray1.x + 8} y={ray1.y + 5} fill="#38BDF8" fontSize="13" fontWeight="800">
                B (Cạnh OB)
              </text>

              {/* Movable Upper Side OA */}
              <line
                x1={cx}
                y1={cy}
                x2={ray2.x}
                y2={ray2.y}
                stroke={selectedCard.colorHex}
                strokeWidth={5}
                strokeLinecap="round"
              />
              <circle cx={ray2.x} cy={ray2.y} r={6} fill="#FFFFFF" stroke={selectedCard.colorHex} strokeWidth={3} />
              <text x={ray2.x + 10} y={ray2.y - 8} fill={selectedCard.colorHex} fontSize="13" fontWeight="800">
                A (Cạnh OA)
              </text>

              {/* Angle Measure Placed Inside the Angle Corner Near Vertex O (Textbook Style) */}
              <text
                x={measureLabelPos.x}
                y={measureLabelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#FFFFFF"
                stroke="#090621"
                strokeWidth="4"
                paintOrder="stroke"
                fontSize="16"
                fontWeight="800"
                className="font-mono-num"
              >
                {liveDeg}°
              </text>

              {/* Vertex O */}
              <circle cx={cx} cy={cy} r={7} fill="#FACC15" stroke="#090621" strokeWidth={2} />
              <text x={cx - 22} y={cy + 24} fill="#FACC15" fontSize="13" fontWeight="800">
                Đỉnh O
              </text>
            </svg>
          </div>

          {/* Slider to experiment with ray opening within this angle category */}
          {selectedCard.minDeg < selectedCard.maxDeg ? (
            <div className="bg-indigo-950/80 rounded-xl p-3 border border-indigo-500/30">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-200 mb-1.5">
                <label htmlFor="explore-angle-slider">
                  Kéo thử thay đổi độ mở của {selectedCard.titleVi}:
                </label>
                <span className="font-mono-num text-yellow-300">{liveDeg}°</span>
              </div>
              <input
                id="explore-angle-slider"
                type="range"
                min={selectedCard.minDeg}
                max={selectedCard.maxDeg}
                value={liveDeg}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-indigo-300 font-mono-num mt-1">
                <span>{selectedCard.minDeg}°</span>
                <span>Mẫu chuẩn: {selectedCard.defaultDeg}°</span>
                <span>{selectedCard.maxDeg}°</span>
              </div>
            </div>
          ) : (
            <div className="bg-indigo-950/80 rounded-xl p-3 border border-indigo-500/30 text-xs text-indigo-200">
              <strong>Lưu ý đặc biệt:</strong> {selectedCard.titleVi} luôn có số đo cố định đúng bằng{' '}
              <span className="font-mono-num font-bold text-yellow-300">{selectedCard.defaultDeg}°</span>!
            </div>
          )}

          {/* Explanation & Real-world example */}
          <div className="bg-[#0E0A2E] rounded-xl p-3.5 border border-white/10 text-xs space-y-1.5">
            <p className="text-white font-semibold">{selectedCard.explanationVi}</p>
            <p className="text-indigo-200">{selectedCard.realWorldExampleVi}</p>
          </div>

          {/* Primary Action Button: Thử tạo góc này trong Phòng Thí Nghiệm 180° */}
          <button
            type="button"
            onClick={() => {
              soundFX.playSuccess();
              const targetLabDeg = Math.min(180, liveDeg);
              onSelectAngleForLab(targetLabDeg);
            }}
            className="btn-3d-pink w-full py-3.5 px-5 rounded-xl font-extrabold text-base text-white cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🚀 Thử tạo góc này trong Phòng Thí Nghiệm ({Math.min(180, liveDeg)}°)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
