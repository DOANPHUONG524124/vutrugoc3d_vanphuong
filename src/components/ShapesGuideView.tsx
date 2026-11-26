import React, { useState } from 'react';
import { soundFX } from '../utils/soundEffects';

interface ShapesGuideViewProps {
  onBackHome: () => void;
  onGoLab: () => void;
  onCompleteGuide: () => void;
}

export const ShapesGuideView: React.FC<ShapesGuideViewProps> = ({
  onBackHome,
  onGoLab,
  onCompleteGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'parallelogram' | 'rhombus'>('parallelogram');

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
            CHỦ ĐỀ 4 · CẨM NANG KIẾN THỨC TOÁN LỚP 4
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            4. KIẾN THỨC VÀ CHU VI HÌNH BÌNH HÀNH, HÌNH THOI
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFX.playClick(1.15);
            onCompleteGuide();
            onGoLab();
          }}
          className="btn-3d-emerald px-4 py-2 rounded-xl text-sm font-extrabold cursor-pointer"
        >
          🎚️ Thực hành kéo cạnh →
        </button>
      </div>

      {/* Main 2-Tab Interactive Handbook */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Diagram + Formula Showcase */}
        <div className="lg:col-span-7 card-3d-cosmic rounded-3xl p-5 border-2 border-fuchsia-400/60 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                data-testid="shapes-guide-tab-parallelogram"
                onClick={() => {
                  soundFX.playClick();
                  setActiveTab('parallelogram');
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer ${
                  activeTab === 'parallelogram'
                    ? 'bg-sky-400 text-slate-950 shadow-md'
                    : 'bg-indigo-950 text-indigo-200 border border-indigo-400/40'
                }`}
              >
                1. Hình bình hành và Chu vi
              </button>
              <button
                type="button"
                data-testid="shapes-guide-tab-rhombus"
                onClick={() => {
                  soundFX.playClick(1.1);
                  setActiveTab('rhombus');
                  onCompleteGuide();
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer ${
                  activeTab === 'rhombus'
                    ? 'bg-fuchsia-400 text-slate-950 shadow-md'
                    : 'bg-indigo-950 text-indigo-200 border border-indigo-400/40'
                }`}
              >
                2. Hình thoi và Chu vi
              </button>
            </div>
            <span className="text-xs font-extrabold text-yellow-300">
              Chương trình Toán Lớp 4
            </span>
          </div>

          <div className="bg-[#0B0826] rounded-2xl p-3 border border-indigo-400/40">
            {activeTab === 'parallelogram' ? (
              <svg viewBox="0 0 560 250" className="w-full h-auto block">
                <defs>
                  <pattern id="guide-para-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="560" height="250" rx="12" fill="url(#guide-para-grid)" />
                <polygon points="168,52 448,52 392,188 112,188" fill="rgba(56,189,248,0.18)" />
                {/* Parallel edges highlighted */}
                <line x1="168" y1="52" x2="448" y2="52" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" />
                <line x1="112" y1="188" x2="392" y2="188" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" />
                <line x1="168" y1="52" x2="112" y2="188" stroke="#F472B6" strokeWidth="6" strokeLinecap="round" />
                <line x1="448" y1="52" x2="392" y2="188" stroke="#F472B6" strokeWidth="6" strokeLinecap="round" />

                <text x="152" y="42" fill="#FFFFFF" fontSize="20" fontWeight="900">A</text>
                <text x="458" y="44" fill="#FFFFFF" fontSize="20" fontWeight="900">B</text>
                <text x="402" y="206" fill="#FFFFFF" fontSize="20" fontWeight="900">C</text>
                <text x="94" y="206" fill="#FFFFFF" fontSize="20" fontWeight="900">D</text>

                <rect x="276" y="18" width="64" height="26" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
                <text x="308" y="36" textAnchor="middle" fill="#7DD3FC" fontSize="14" fontWeight="900">a = 8 cm</text>

                <rect x="44" y="108" width="64" height="26" rx="8" fill="#0F172A" stroke="#F472B6" strokeWidth="2" />
                <text x="76" y="126" textAnchor="middle" fill="#F9A8D4" fontSize="14" fontWeight="900">b = 5 cm</text>

                <text x="280" y="236" textAnchor="middle" fill="#FDE047" fontSize="15" fontWeight="900">
                  Chu vi P = (8 + 5) × 2 = 26 cm
                </text>
              </svg>
            ) : (
              <svg viewBox="0 0 560 250" className="w-full h-auto block">
                <defs>
                  <pattern id="guide-rhom-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="560" height="250" rx="12" fill="url(#guide-rhom-grid)" />
                <polygon points="116,120 280,38 444,120 280,202" fill="rgba(232,121,249,0.2)" />
                <line x1="116" y1="120" x2="280" y2="38" stroke="#E879F9" strokeWidth="6" strokeLinecap="round" />
                <line x1="280" y1="202" x2="444" y2="120" stroke="#E879F9" strokeWidth="6" strokeLinecap="round" />
                <line x1="116" y1="120" x2="280" y2="202" stroke="#34D399" strokeWidth="6" strokeLinecap="round" />
                <line x1="280" y1="38" x2="444" y2="120" stroke="#34D399" strokeWidth="6" strokeLinecap="round" />

                <text x="92" y="126" fill="#FFFFFF" fontSize="20" fontWeight="900">A</text>
                <text x="274" y="28" fill="#FFFFFF" fontSize="20" fontWeight="900">B</text>
                <text x="456" y="126" fill="#FFFFFF" fontSize="20" fontWeight="900">C</text>
                <text x="274" y="222" fill="#FFFFFF" fontSize="20" fontWeight="900">D</text>

                <rect x="130" y="48" width="64" height="26" rx="8" fill="#0F172A" stroke="#FACC15" strokeWidth="2" />
                <text x="162" y="66" textAnchor="middle" fill="#FDE047" fontSize="14" fontWeight="900">a = 6 cm</text>

                <text x="280" y="242" textAnchor="middle" fill="#FDE047" fontSize="15" fontWeight="900">
                  Chu vi P = 6 × 4 = 24 cm
                </text>
              </svg>
            )}
          </div>
        </div>

        {/* Right Detailed Walkthrough & Worked Examples */}
        <div className="lg:col-span-5 card-3d-cosmic rounded-3xl p-5 border-2 border-indigo-400/60 flex flex-col justify-between gap-4">
          {activeTab === 'parallelogram' ? (
            <div className="space-y-3">
              <h3 className="text-lg font-extrabold text-sky-300">
                🔷 Ghi nhớ Hình bình hành
              </h3>
              <div className="bg-[#090621] rounded-2xl p-4 border border-sky-400/40 space-y-2 text-xs sm:text-sm text-indigo-100">
                <p>
                  • <span className="font-bold text-white">Đặc điểm:</span> Có hai cặp cạnh đối diện song song và bằng nhau.
                </p>
                <p>
                  • <span className="font-bold text-sky-300">Cách đọc:</span> Cạnh AB song song với cạnh DC và AB = DC; cạnh AD song song với cạnh BC và AD = BC.
                </p>
                <p>
                  • <span className="font-bold text-yellow-300">Công thức Chu vi:</span> P = (a + b) × 2 (cùng đơn vị đo).
                </p>
              </div>
              <div className="bg-emerald-500/15 border border-emerald-400/50 rounded-2xl p-3.5 space-y-1.5 text-xs sm:text-sm text-emerald-100">
                <div className="font-extrabold text-yellow-300">📝 Ví dụ mẫu (có đổi đơn vị):</div>
                <p>Tính chu vi hình bình hành có cạnh đáy 2 dm và cạnh bên 15 cm.</p>
                <p className="font-bold text-white">
                  Bài giải: Đổi 2 dm = 20 cm. Chu vi là: (20 + 15) × 2 = 70 (cm).
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-extrabold text-fuchsia-300">
                💎 Ghi nhớ Hình thoi
              </h3>
              <div className="bg-[#090621] rounded-2xl p-4 border border-fuchsia-400/40 space-y-2 text-xs sm:text-sm text-indigo-100">
                <p>
                  • <span className="font-bold text-white">Đặc điểm:</span> Có hai cặp cạnh đối diện song song và bốn cạnh bằng nhau.
                </p>
                <p>
                  • <span className="font-bold text-fuchsia-300">Cách đọc:</span> Cạnh AB song song với cạnh DC, cạnh AD song song với cạnh BC và AB = BC = CD = DA.
                </p>
                <p>
                  • <span className="font-bold text-yellow-300">Công thức Chu vi:</span> P = a × 4 (a là độ dài một cạnh).
                </p>
              </div>
              <div className="bg-emerald-500/15 border border-emerald-400/50 rounded-2xl p-3.5 space-y-1.5 text-xs sm:text-sm text-emerald-100">
                <div className="font-extrabold text-yellow-300">📝 Ví dụ mẫu (toán ngược):</div>
                <p>Một khung tranh hình thoi có chu vi 32 cm. Tìm độ dài một cạnh.</p>
                <p className="font-bold text-white">
                  Bài giải: Độ dài một cạnh hình thoi là: 32 : 4 = 8 (cm).
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              soundFX.playSuccess();
              onCompleteGuide();
            }}
            className="btn-3d-gold w-full py-3 rounded-2xl font-extrabold text-sm cursor-pointer"
          >
            ⭐ Đánh dấu đã nắm vững kiến thức (+2 Sao)
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs sm:text-sm">
        <div className="card-3d-cosmic rounded-2xl p-4 border border-sky-400/50 space-y-1.5">
          <div className="font-extrabold text-sky-300">1. Hình bình hành</div>
          <p className="text-indigo-100 leading-relaxed">
            Có hai cặp cạnh đối diện song song với nhau và bằng nhau (AB = DC, AD = BC).
          </p>
        </div>
        <div className="card-3d-cosmic rounded-2xl p-4 border border-fuchsia-400/50 space-y-1.5">
          <div className="font-extrabold text-fuchsia-300">2. Hình thoi</div>
          <p className="text-indigo-100 leading-relaxed">
            Có hai cặp cạnh đối diện song song với nhau và cả 4 cạnh đều bằng nhau (AB = BC = CD = DA).
          </p>
        </div>
        <div className="card-3d-cosmic rounded-2xl p-4 border border-yellow-400/50 space-y-1.5">
          <div className="font-extrabold text-yellow-300">3. Công thức Chu vi</div>
          <p className="text-indigo-100 leading-relaxed">
            Hình bình hành: P = (a + b) × 2. Hình thoi: P = a × 4.
          </p>
        </div>
        <div className="card-3d-cosmic rounded-2xl p-4 border border-rose-400/50 space-y-1.5">
          <div className="font-extrabold text-rose-300">4. Lỗi cần tránh</div>
          <p className="text-indigo-100 leading-relaxed">
            Quên đổi hai cạnh về cùng đơn vị đo trước khi tính chu vi, hoặc quên nhân với 2 ở hình bình hành!
          </p>
        </div>
      </div>
    </div>
  );
};
