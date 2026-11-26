import React, { useState } from 'react';
import { soundFX } from '../utils/soundEffects';

interface PerpendicularGuideViewProps {
  onCompleteGuide: () => void;
  onOpenLab: () => void;
  onBackHome: () => void;
}

export const PerpendicularGuideView: React.FC<PerpendicularGuideViewProps> = ({
  onCompleteGuide,
  onOpenLab,
  onBackHome,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [caseType, setCaseType] = useState<'on_line' | 'off_line'>('on_line');

  const handleSelectStep = (next: 1 | 2) => {
    soundFX.playClick(next === 2 ? 1.2 : 1);
    setStep(next);
    if (next === 2) {
      onCompleteGuide();
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-5">
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
            CHỦ ĐỀ 2 · HƯỚNG DẪN THỰC HÀNH VÀ GHI NHỚ
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            4. BÀI HỌC 2 BƯỚC VẼ BẰNG Ê KE VÀ GHI NHỚ
          </h2>
        </div>

        <button
          type="button"
          onClick={onOpenLab}
          className="btn-3d-pink px-4 py-2 rounded-xl text-sm font-extrabold cursor-pointer"
        >
          ✏️ Thực hành vẽ ngay →
        </button>
      </div>

      {/* Interactive 2-Step Walkthrough */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Animated SVG Illustration */}
        <div className="lg:col-span-7 card-3d-cosmic rounded-3xl p-5 border-2 border-sky-400/60 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-yellow-300 uppercase">
              VẼ ĐƯỜNG THẲNG CD ĐI QUA ĐIỂM H VÀ VUÔNG GÓC VỚI AB
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFX.playTick(90);
                  setCaseType('on_line');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                  caseType === 'on_line'
                    ? 'bg-yellow-400 text-slate-950'
                    : 'bg-indigo-950 text-indigo-200 border border-indigo-400/40'
                }`}
              >
                Điểm H trên AB
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playTick(120);
                  setCaseType('off_line');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
                  caseType === 'off_line'
                    ? 'bg-yellow-400 text-slate-950'
                    : 'bg-indigo-950 text-indigo-200 border border-indigo-400/40'
                }`}
              >
                Điểm H ngoài AB
              </button>
            </div>
          </div>

          <div className="bg-[#0A0724] rounded-2xl p-4 border border-indigo-400/40">
            <svg viewBox="0 0 600 320" className="w-full h-auto block">
              <defs>
                <pattern id="guide-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                  <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(129,140,248,0.12)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="600" height="320" rx="14" fill="url(#guide-grid)" />

              {/* Base line AB */}
              <line x1="90" y1="105" x2="510" y2="105" stroke="#F8FAFC" strokeWidth="4.5" />
              <circle cx="150" cy="105" r="5" fill="#FACC15" />
              <text x="142" y="90" fill="#FDE047" fontSize="22" fontWeight="900">A</text>
              <circle cx="450" cy="105" r="5" fill="#FACC15" />
              <text x="444" y="90" fill="#FDE047" fontSize="22" fontWeight="900">B</text>

              {/* Set Square (Ê Ke) placed at (300, 105) pointing left along AB and down through H */}
              <g>
                <path
                  d="M 300 105 L 185 105 L 300 255 Z M 280 124 L 228 124 L 280 198 Z"
                  fillRule="evenodd"
                  fill="rgba(56, 189, 248, 0.65)"
                  stroke="#7DD3FC"
                  strokeWidth="3"
                />
                {/* Highlighted Leg 1 along AB */}
                <line x1="300" y1="105" x2="185" y2="105" stroke="#34D399" strokeWidth="4.5" />
                {/* Highlighted Leg 2 meeting H */}
                <line x1="300" y1="105" x2="300" y2="255" stroke="#FACC15" strokeWidth="4.5" />
                {/* Crisp Right-Angle Square on Ê Ke */}
                <path d="M 282 105 L 282 123 L 300 123" fill="rgba(250,204,21,0.3)" stroke="#FACC15" strokeWidth="3" />
                <text x="242" y="156" fill="#FFFFFF" fontSize="13" fontWeight="900">Ê KE</text>
              </g>

              {/* Step 2: Drawn Red Perpendicular Line CD */}
              {step === 2 && (
                <g>
                  <line x1="300" y1="24" x2="300" y2="278" stroke="#FB7185" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 320 105 L 320 85 L 300 85" fill="none" stroke="#34D399" strokeWidth="3.5" />
                  <circle cx="300" cy="52" r="5" fill="#FB7185" stroke="#FFF" strokeWidth="1.5" />
                  <text x="315" y="58" fill="#FDA4AF" fontSize="22" fontWeight="900">C</text>
                  <circle cx="300" cy="256" r="5" fill="#FB7185" stroke="#FFF" strokeWidth="1.5" />
                  <text x="315" y="262" fill="#FDA4AF" fontSize="22" fontWeight="900">D</text>
                </g>
              )}

              {/* Point H (on AB or outside AB) */}
              <circle
                cx="300"
                cy={caseType === 'on_line' ? 105 : 178}
                r="7"
                fill="#F43F5E"
                stroke="#FFFFFF"
                strokeWidth="2.5"
              />
              <text
                x="316"
                y={caseType === 'on_line' ? 96 : 185}
                fill="#FFFFFF"
                fontSize="22"
                fontWeight="900"
              >
                H
              </text>

              {/* Caption */}
              <text x="300" y="308" textAnchor="middle" fill="#A5B4FC" fontSize="14" fontWeight="700">
                {caseType === 'on_line'
                  ? 'Trường hợp 1: Điểm H ở trên đường thẳng AB'
                  : 'Trường hợp 2: Điểm H ở ngoài đường thẳng AB'}
              </text>
            </svg>
          </div>
        </div>

        {/* Right: Step Controls & Textbook Wording */}
        <div className="lg:col-span-5 card-3d-cosmic rounded-3xl p-5 border-2 border-yellow-400/60 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectStep(1)}
                className={`py-3 px-3 rounded-2xl font-extrabold text-sm cursor-pointer ${
                  step === 1
                    ? 'bg-yellow-400 text-slate-950 shadow-lg'
                    : 'bg-[#0B0826] text-indigo-200 border border-indigo-400/40'
                }`}
              >
                1️⃣ Bước 1: Đặt ê ke
              </button>
              <button
                type="button"
                onClick={() => handleSelectStep(2)}
                className={`py-3 px-3 rounded-2xl font-extrabold text-sm cursor-pointer ${
                  step === 2
                    ? 'bg-emerald-400 text-slate-950 shadow-lg'
                    : 'bg-[#0B0826] text-indigo-200 border border-indigo-400/40'
                }`}
              >
                2️⃣ Bước 2: Vạch CD
              </button>
            </div>

            <div
              className={`p-4 rounded-2xl border-2 space-y-2 ${
                step === 1
                  ? 'bg-sky-500/15 border-sky-400 text-white'
                  : 'bg-[#0B0826] border-indigo-500/30 text-indigo-200'
              }`}
            >
              <div className="text-xs font-extrabold text-yellow-300 uppercase">BƯỚC 1 · ĐẶT CHUẨN Ê KE</div>
              <p className="text-sm font-bold leading-relaxed">
                Đặt một cạnh góc vuông của ê ke trùng với đường thẳng AB và cạnh góc vuông thứ hai gặp điểm H.
              </p>
            </div>

            <div
              className={`p-4 rounded-2xl border-2 space-y-2 ${
                step === 2
                  ? 'bg-emerald-500/15 border-emerald-400 text-white'
                  : 'bg-[#0B0826] border-indigo-500/30 text-indigo-200'
              }`}
            >
              <div className="text-xs font-extrabold text-emerald-300 uppercase">BƯỚC 2 · VẠCH ĐƯỜNG THẲNG VUÔNG GÓC</div>
              <p className="text-sm font-bold leading-relaxed">
                Vạch một đường thẳng theo cạnh góc vuông thứ hai của ê ke, ta được đường thẳng CD đi qua điểm H và vuông góc với đường thẳng AB.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onCompleteGuide();
              onOpenLab();
            }}
            className="btn-3d-emerald w-full py-3 px-4 rounded-xl font-extrabold text-sm cursor-pointer"
          >
            ✅ Em đã hiểu! Vào Phòng Thí Nghiệm thực hành vẽ
          </button>
        </div>
      </div>

      {/* Bottom Summary Cards: Ghi nhớ chuẩn, Cách đọc & Lỗi thường gặp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-3d-cosmic rounded-3xl p-5 border-2 border-emerald-400/50 space-y-2">
          <div className="text-xs font-extrabold text-emerald-300 uppercase">📌 GHI NHỚ 1 · ĐỊNH NGHĨA</div>
          <h3 className="text-base font-extrabold text-white">4 góc vuông chung đỉnh</h3>
          <p className="text-xs text-indigo-100 leading-relaxed">
            Hai đường thẳng vuông góc với nhau cắt nhau tại một điểm và tạo thành đúng{' '}
            <strong className="text-yellow-300">4 góc vuông (90°)</strong> có chung đỉnh đó.
          </p>
        </div>

        <div className="card-3d-cosmic rounded-3xl p-5 border-2 border-yellow-400/50 space-y-2">
          <div className="text-xs font-extrabold text-yellow-300 uppercase">🗣️ GHI NHỚ 2 · CÁCH ĐỌC</div>
          <h3 className="text-base font-extrabold text-white">Đọc tên cạnh vuông góc</h3>
          <p className="text-xs text-indigo-100 leading-relaxed">
            Nêu lần lượt 2 cạnh và đỉnh chung tạo góc vuông. Ví dụ:{' '}
            <strong className="text-sky-300">&ldquo;Cạnh AB vuông góc với cạnh AC tại đỉnh A&rdquo;</strong>.
          </p>
        </div>

        <div className="card-3d-cosmic rounded-3xl p-5 border-2 border-sky-400/50 space-y-2">
          <div className="text-xs font-extrabold text-sky-300 uppercase">📌 GHI NHỚ 3 · CẤU TẠO Ê KE</div>
          <h3 className="text-base font-extrabold text-white">Chọn đúng góc vuông 90°</h3>
          <p className="text-xs text-indigo-100 leading-relaxed">
            Chiếc ê ke chỉ có <strong className="text-yellow-300">1 góc vuông</strong> và 2 góc nhọn. Luôn sử dụng 2 cạnh tạo nên góc vuông của ê ke!
          </p>
        </div>

        <div className="card-3d-cosmic rounded-3xl p-5 border-2 border-rose-400/50 space-y-2">
          <div className="text-xs font-extrabold text-rose-300 uppercase">⚠️ LỖI CẦN TRÁNH</div>
          <h3 className="text-base font-extrabold text-white">Đặt nhầm góc nhọn ê ke</h3>
          <p className="text-xs text-indigo-100 leading-relaxed">
            Đặt cạnh dài nhất (cạnh huyền) hoặc góc nhọn của ê ke sẽ tạo ra đường nghiêng không vuông góc. Hãy kiểm tra ô vuông 90° trên ê ke trước khi vạch!
          </p>
        </div>
      </div>
    </div>
  );
};
