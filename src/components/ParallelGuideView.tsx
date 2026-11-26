import React, { useState } from 'react';
import { soundFX } from '../utils/soundEffects';

interface ParallelGuideViewProps {
  onBackHome: () => void;
  onGoLab: () => void;
  onCompleteGuide: () => void;
}

export const ParallelGuideView: React.FC<ParallelGuideViewProps> = ({
  onBackHome,
  onGoLab,
  onCompleteGuide,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

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
            CHỦ ĐỀ 3 · BÀI HỌC 2 BƯỚC VẼ BẰNG Ê KE
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            4. HƯỚNG DẪN VẼ HAI ĐƯỜNG THẲNG SONG SONG
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            onCompleteGuide();
            onGoLab();
          }}
          className="btn-3d-emerald px-4 py-2 rounded-xl text-sm font-extrabold cursor-pointer"
        >
          ✏️ Thực hành vẽ ngay →
        </button>
      </div>

      {/* Interactive 2-Step Illustration Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 card-3d-cosmic rounded-3xl p-5 border-2 border-sky-400/60 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-sky-300 uppercase">
              VẼ ĐƯỜNG THẲNG CD ĐI QUA ĐIỂM H VÀ SONG SONG VỚI ĐƯỜNG THẲNG AB
            </span>
            <span className="text-xs font-extrabold bg-yellow-400/20 border border-yellow-400/60 text-yellow-200 px-3 py-1 rounded-xl">
              Đang xem: Bước {step} / 2
            </span>
          </div>

          <div className="bg-[#0B0826] rounded-2xl p-3 border border-indigo-400/40">
            <svg viewBox="0 0 600 290" className="w-full h-auto block">
              <defs>
                <pattern id="par-guide-grid" width="26" height="26" patternUnits="userSpaceOnUse">
                  <path d="M 26 0 L 0 0 0 26" fill="none" stroke="rgba(129,140,248,0.12)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="600" height="290" rx="12" fill="url(#par-guide-grid)" />

              {/* Base line AB */}
              <line x1="95" y1="82" x2="505" y2="82" stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" />
              <circle cx="155" cy="82" r="5" fill="#FACC15" />
              <circle cx="445" cy="82" r="5" fill="#FACC15" />
              <text x="155" y="66" textAnchor="middle" fill="#38BDF8" fontSize="20" fontWeight="900">A</text>
              <text x="445" y="66" textAnchor="middle" fill="#38BDF8" fontSize="20" fontWeight="900">B</text>

              {/* Step 1: Auxiliary line MN through H perpendicular to AB */}
              <line
                x1="300"
                y1="25"
                x2="300"
                y2="265"
                stroke="#FB7185"
                strokeWidth="4"
                strokeDasharray="10 6"
                strokeLinecap="round"
              />
              <path d="M 282 82 L 282 100 L 300 100" fill="rgba(251,113,133,0.3)" stroke="#FB7185" strokeWidth="2.8" />
              <text x="318" y="42" fill="#FDA4AF" fontSize="19" fontWeight="900">M</text>
              <text x="318" y="258" fill="#FDA4AF" fontSize="19" fontWeight="900">N</text>

              {/* Step 1 Set Square (positioned on AB & MN) */}
              {step === 1 && (
                <g>
                  <path
                    d="M 300 82 L 185 82 L 300 225 Z M 278 102 L 222 102 L 278 175 Z"
                    fill="rgba(56,189,248,0.28)"
                    fillRule="evenodd"
                    stroke="#38BDF8"
                    strokeWidth="3"
                  />
                  <path d="M 282 82 L 282 100 L 300 100" fill="rgba(250,204,21,0.35)" stroke="#FACC15" strokeWidth="2.5" />
                  <text x="242" y="138" fill="#FFFFFF" fontSize="13" fontWeight="900">Ê KE</text>
                </g>
              )}

              {/* Step 2: Parallel line CD through H perpendicular to MN + Set Square at H */}
              {step === 2 && (
                <g>
                  <line x1="95" y1="186" x2="505" y2="186" stroke="#34D399" strokeWidth="5.5" strokeLinecap="round" />
                  <circle cx="155" cy="186" r="5" fill="#FACC15" />
                  <circle cx="445" cy="186" r="5" fill="#FACC15" />
                  <text x="155" y="172" textAnchor="middle" fill="#6EE7B7" fontSize="20" fontWeight="900">C</text>
                  <text x="445" y="172" textAnchor="middle" fill="#6EE7B7" fontSize="20" fontWeight="900">D</text>

                  {/* Set Square at H aligned along MN and CD */}
                  <path
                    d="M 300 186 L 418 186 L 300 278 Z M 318 202 L 372 202 L 318 245 Z"
                    fill="rgba(52,211,153,0.28)"
                    fillRule="evenodd"
                    stroke="#34D399"
                    strokeWidth="3"
                  />
                  <path d="M 318 186 L 318 204 L 300 204" fill="rgba(250,204,21,0.35)" stroke="#FACC15" strokeWidth="2.8" />
                  <text x="336" y="222" fill="#FFFFFF" fontSize="12" fontWeight="900">Ê KE</text>
                </g>
              )}

              {/* Target Point H */}
              <circle cx="300" cy="186" r="7" fill="#FACC15" stroke="#FFFFFF" strokeWidth="2" />
              <text x="278" y="176" fill="#FACC15" fontSize="21" fontWeight="900">H</text>
            </svg>
          </div>
        </div>

        {/* Right: Step Switcher & Explanation */}
        <div className="lg:col-span-5 card-3d-cosmic rounded-3xl p-5 border-2 border-indigo-400/60 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setStep(1);
                }}
                className={`p-3 rounded-2xl text-xs font-extrabold cursor-pointer border-2 ${
                  step === 1
                    ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow'
                    : 'bg-[#0B0826] text-indigo-200 border-indigo-500/40'
                }`}
              >
                1️⃣ Bước 1: Vẽ đường phụ MN
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setStep(2);
                  onCompleteGuide();
                }}
                className={`p-3 rounded-2xl text-xs font-extrabold cursor-pointer border-2 ${
                  step === 2
                    ? 'bg-emerald-400 text-slate-950 border-emerald-300 shadow'
                    : 'bg-[#0B0826] text-indigo-200 border-indigo-500/40'
                }`}
              >
                2️⃣ Bước 2: Vẽ CD song song với AB
              </button>
            </div>

            {step === 1 ? (
              <div className="bg-sky-500/15 border-2 border-sky-400/60 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-extrabold text-sky-300 uppercase">BƯỚC 1</div>
                <p className="text-base font-extrabold text-white leading-relaxed">
                  Dùng Ê Ke vẽ đường thẳng phụ <span className="text-pink-300">MN</span> đi qua điểm{' '}
                  <span className="text-yellow-300">H</span> và{' '}
                  <span className="text-sky-300">vuông góc với đường thẳng AB</span>.
                </p>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  Đặt 1 cạnh góc vuông của ê ke trùng đường thẳng AB, trượt ê ke đến khi cạnh góc vuông thứ hai gặp đúng điểm H rồi vạch đường MN.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-500/15 border-2 border-emerald-400/60 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-extrabold text-emerald-300 uppercase">BƯỚC 2</div>
                <p className="text-base font-extrabold text-white leading-relaxed">
                  Dùng Ê Ke vẽ đường thẳng <span className="text-emerald-300">CD</span> đi qua điểm{' '}
                  <span className="text-yellow-300">H</span> và{' '}
                  <span className="text-pink-300">vuông góc với đường thẳng phụ MN</span>.
                </p>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  Khi cả AB và CD đều cùng vuông góc với đường phụ MN, ta thu được đường thẳng CD đi qua H và SONG SONG hoàn hảo với đường thẳng AB!
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2.5">
            {step === 1 ? (
              <button
                type="button"
                onClick={() => {
                  soundFX.playSnap();
                  setStep(2);
                  onCompleteGuide();
                }}
                className="btn-3d-gold w-full py-3 px-4 rounded-xl font-extrabold text-sm cursor-pointer"
              >
                Xem tiếp Bước 2 →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  soundFX.playSuccess();
                  onCompleteGuide();
                  onGoLab();
                }}
                className="btn-3d-emerald w-full py-3 px-4 rounded-xl font-extrabold text-sm cursor-pointer"
              >
                🛤️ Tự tay vẽ trong Phòng Thí Nghiệm →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-3d-cosmic rounded-2xl p-4 border border-sky-400/50 space-y-1.5">
          <div className="text-xs font-extrabold text-sky-300 uppercase">📌 GHI NHỚ 1 · KHÁI NIỆM</div>
          <p className="text-xs text-indigo-100 leading-relaxed">
            Hai đường thẳng song song với nhau <strong>không bao giờ cắt nhau</strong> và luôn cách đều nhau dù kéo dài mãi về hai phía.
          </p>
        </div>
        <div className="card-3d-cosmic rounded-2xl p-4 border border-yellow-400/50 space-y-1.5">
          <div className="text-xs font-extrabold text-yellow-300 uppercase">🗣️ GHI NHỚ 2 · CÁCH ĐỌC</div>
          <p className="text-xs text-indigo-100 leading-relaxed">
            Đọc: <strong>“Cạnh AB song song với cạnh DC”</strong> hoặc{' '}
            <strong>“Hai cạnh AB và DC song song với nhau”</strong>. Lưu ý 1 cạnh có thể song song với nhiều cạnh khác!
          </p>
        </div>
        <div className="card-3d-cosmic rounded-2xl p-4 border border-emerald-400/50 space-y-1.5">
          <div className="text-xs font-extrabold text-emerald-300 uppercase">📐 GHI NHỚ 3 · 2 BƯỚC VẼ</div>
          <p className="text-xs text-indigo-100 leading-relaxed">
            Bước 1: Vẽ đường phụ MN qua H vuông góc AB. Bước 2: Vẽ CD qua H vuông góc MN → Ta được CD song song với AB!
          </p>
        </div>
        <div className="card-3d-cosmic rounded-2xl p-4 border border-rose-400/50 space-y-1.5">
          <div className="text-xs font-extrabold text-rose-300 uppercase">⚠️ LỖI CẦN TRÁNH</div>
          <p className="text-xs text-indigo-100 leading-relaxed">
            Không ước lượng bằng mắt thường (dễ bị lệch dẫn tới cắt nhau khi kéo dài), và đừng quên tìm hết TẤT CẢ các cạnh song song trong hình ghép!
          </p>
        </div>
      </div>
    </div>
  );
};
