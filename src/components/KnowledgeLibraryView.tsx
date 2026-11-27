import React, { useState } from 'react';
import { soundFX } from '../utils/soundEffects';
import {
  TextbookAngleMeasurePlacementSVG,
  TextbookAngleNamingSVG,
} from './TextbookAngleIllustrations';

interface KnowledgeLibraryViewProps {
  onMarkLibraryRead: () => void;
  onOpenTutorial: () => void;
  onOpenLab: () => void;
  onOpenJourney: () => void;
  onBackHome: () => void;
}

export const KnowledgeLibraryView: React.FC<KnowledgeLibraryViewProps> = ({
  onMarkLibraryRead,
  onOpenTutorial,
  onOpenLab,
  onOpenJourney,
  onBackHome,
}) => {
  const [activeTab, setActiveTab] = useState<'knowledge' | 'mistakes'>('knowledge');

  const handleTabSwitch = (tab: 'knowledge' | 'mistakes') => {
    soundFX.playClick();
    setActiveTab(tab);
    onMarkLibraryRead();
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 card-3d-cosmic rounded-2xl px-5 py-3.5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            4. CẨM NANG KIẾN THỨC · GÓC VÀ ĐO GÓC
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200">
            Cẩm nang đơn vị đo góc, cấu tạo thước đo góc và các lỗi thường gặp khi đo góc
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              onOpenJourney();
            }}
            className="btn-3d-gold px-3.5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm text-slate-950 cursor-pointer"
          >
            🚀 Hành Trình Vũ Trụ
          </button>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              onBackHome();
            }}
            className="btn-3d-cobalt px-4 py-2.5 rounded-xl font-bold text-sm text-white cursor-pointer"
          >
            ← Quay lại Trang chủ
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => handleTabSwitch('knowledge')}
          className={`py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer border-2 ${
            activeTab === 'knowledge'
              ? 'bg-yellow-400 text-slate-950 border-white shadow-lg'
              : 'bg-[#140F38] text-indigo-200 border-indigo-500/40 hover:border-indigo-400'
          }`}
        >
          📚 1. Kiến Thức Và Cấu Tạo Góc
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch('mistakes')}
          className={`py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer border-2 ${
            activeTab === 'mistakes'
              ? 'bg-pink-500 text-white border-white shadow-lg'
              : 'bg-[#140F38] text-indigo-200 border-indigo-500/40 hover:border-indigo-400'
          }`}
        >
          ⚠️ 2. Lỗi Thường Gặp (Đúng/Sai)
        </button>
      </div>

      {/* TAB 1: KNOWLEDGE CARDS */}
      {activeTab === 'knowledge' && (
        <div className="flex flex-col gap-5">
          {/* Grade 4 Textbook Angle Naming & Measure Placement Banner */}
          <div className="card-3d-cosmic rounded-2xl p-5 border-2 border-yellow-400/70 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
              <div className="sm:col-span-7">
                <TextbookAngleNamingSVG className="h-full" />
              </div>
              <div className="sm:col-span-5">
                <TextbookAngleMeasurePlacementSVG className="h-full" />
              </div>
            </div>
            <div className="lg:col-span-6 flex flex-col gap-2.5">
              <div className="text-xs font-extrabold text-yellow-300">
                📖 CHUẨN KIẾN THỨC TOÁN LỚP 4 · CÁCH ĐỌC TÊN GÓC VÀ VỊ TRÍ GHI SỐ ĐO
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Cách Gọi Tên Góc Và Vị Trí Viết Số Đo Góc (°)
              </h2>
              <p className="text-sm text-indigo-100 leading-relaxed">
                Trong sách giáo khoa Toán lớp 4, khi đọc tên một góc ta nêu{' '}
                <strong className="text-yellow-300">tên đỉnh góc trước</strong>, sau đó nêu{' '}
                <strong className="text-sky-300">tên hai cạnh</strong> bắt đầu từ đỉnh; và{' '}
                <strong className="text-emerald-300">số đo góc (60°, 90°, 120°...)</strong> luôn được viết ở ngay{' '}
                <strong>bên trong khe góc sát gần đỉnh</strong>:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-[#090621] p-3 rounded-xl border border-yellow-400/50 text-xs sm:text-sm">
                  <div className="text-yellow-300 font-extrabold mb-1">
                    • Góc đỉnh O; cạnh OA, OB
                  </div>
                  <p className="text-indigo-200 text-xs">
                    Đỉnh là điểm <strong>O</strong>; hai cạnh là <strong>cạnh OA</strong> và{' '}
                    <strong>cạnh OB</strong>.
                  </p>
                </div>
                <div className="bg-[#090621] p-3 rounded-xl border border-emerald-400/50 text-xs sm:text-sm">
                  <div className="text-emerald-300 font-extrabold mb-1">
                    • Vị trí ghi số đo (60°, 90°, 120°)
                  </div>
                  <p className="text-indigo-200 text-xs">
                    Đặt ở phía trong khe góc gần sát đỉnh (như tứ giác ABCD có góc 60°, 90°, 120°).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 6.1: Đơn vị đo góc */}
            <div className="card-3d-cosmic rounded-2xl p-5 flex flex-col gap-3 border-2 border-yellow-400/60">
              <div className="text-xs font-extrabold text-yellow-300">MỤC 1 · ĐƠN VỊ ĐO LƯỜNG</div>
              <h2 className="text-xl font-extrabold text-white">Đơn Vị Đo Góc Là Độ (°)</h2>
              <p className="text-sm text-indigo-100 leading-relaxed">
                Để đo độ mở rộng giữa hai cạnh của một góc, các nhà Toán học sử dụng đơn vị là{' '}
                <strong className="text-yellow-300">Độ</strong>, ký hiệu là dấu tròn nhỏ{' '}
                <strong className="text-yellow-300 font-mono-num">°</strong> viết ở phía trên bên phải con số.
              </p>
              <div className="bg-[#090621] rounded-xl p-3.5 border border-indigo-500/30 space-y-2 text-xs font-mono-num">
                <div className="flex justify-between">
                  <span className="text-yellow-300 font-bold">45° (Bốn mươi lăm độ)</span>
                  <span className="text-slate-300">Góc nhọn</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400 font-bold">90° (Chín mươi độ)</span>
                  <span className="text-slate-300">Góc vuông</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pink-400 font-bold">120° (Một trăm hai mươi độ)</span>
                  <span className="text-slate-300">Góc tù</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sky-400 font-bold">180° (Một trăm tám mươi độ)</span>
                  <span className="text-slate-300">Góc bẹt</span>
                </div>
              </div>
            </div>

            {/* Card 6.2: Cấu tạo thước đo góc */}
            <div className="card-3d-cosmic rounded-2xl p-5 flex flex-col gap-3 border-2 border-sky-400/60">
              <div className="text-xs font-extrabold text-sky-300">MỤC 2 · DỤNG CỤ HỌC TẬP</div>
              <h2 className="text-xl font-extrabold text-white">Thước Đo Góc</h2>
              <ul className="text-xs sm:text-sm text-indigo-100 space-y-2 leading-relaxed">
                <li>
                  • <strong>Hình dạng nửa hình tròn:</strong> Chia thành 180 phần bằng nhau từ{' '}
                  <span className="font-mono-num text-yellow-300">0° đến 180°</span>.
                </li>
                <li>
                  • <strong>Tâm thước:</strong> Điểm chính giữa nằm trên đường thẳng đáy của thước.
                </li>
                <li>
                  • <strong>Đường chuẩn 0°–180°:</strong> Đường thẳng nối vạch 0° và vạch 180° đi qua tâm thước.
                </li>
                <li>
                  • <strong>Hai dãy số ngược chiều:</strong> Dãy trong (0° từ phải sang trái) và dãy ngoài (0° từ trái sang phải) giúp đo góc mở về bất kỳ hướng nào.
                </li>
              </ul>
              <button
                type="button"
                onClick={onOpenLab}
                className="btn-3d-cobalt mt-auto py-2.5 px-4 rounded-xl text-xs font-extrabold text-white cursor-pointer"
              >
                🔬 Mở Phòng Thí Nghiệm Thước 180°
              </button>
            </div>

            {/* Card 6.3: Cách sử dụng thước 3 bước */}
            <div className="card-3d-cosmic rounded-2xl p-5 flex flex-col gap-3 border-2 border-pink-500/60">
              <div className="text-xs font-extrabold text-pink-300">MỤC 3 · QUY TRÌNH CHUẨN</div>
              <h2 className="text-xl font-extrabold text-white">3 Bước Đo Góc Chính Xác</h2>
              <div className="space-y-2.5 text-xs sm:text-sm text-indigo-100">
                <div className="bg-[#090621] p-2.5 rounded-xl border border-white/10">
                  <strong className="text-yellow-300">Bước 1:</strong> Đặt <strong>tâm thước</strong> trùng khít với <strong>đỉnh O</strong> của góc.
                </div>
                <div className="bg-[#090621] p-2.5 rounded-xl border border-white/10">
                  <strong className="text-emerald-300">Bước 2:</strong> Xoay thước sao cho <strong>đường chuẩn vạch 0°</strong> trùng khít với một cạnh của góc (ví dụ <strong>cạnh OB</strong>).
                </div>
                <div className="bg-[#090621] p-2.5 rounded-xl border border-white/10">
                  <strong className="text-pink-300">Bước 3:</strong> Cạnh còn lại (<strong>cạnh OA</strong>) đi qua vạch chia nào (trên dãy số bắt đầu từ 0° đó) thì đó chính là số đo của <strong>góc đỉnh O; cạnh OA, OB</strong>.
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenTutorial}
                className="btn-3d-pink mt-auto py-2.5 px-4 rounded-xl text-xs font-extrabold text-white cursor-pointer"
              >
                📖 Thực hành Bài học 3 bước
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMMON MISTAKES (ĐÚNG VS SAI VISUAL COMPARATOR) */}
      {activeTab === 'mistakes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Mistake 1: Lệch tâm thước */}
          <div className="card-3d-cosmic rounded-2xl p-5 flex flex-col gap-3">
            <h3 className="text-lg font-extrabold text-amber-300">
              Lỗi 1: Đặt Tâm Thước Không Trùng Đỉnh Góc
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-rose-950/80 border border-rose-400 rounded-xl p-2.5 text-center">
                <div className="text-xs font-extrabold text-rose-300 mb-1">❌ CÁCH ĐẶT SAI</div>
                <svg viewBox="0 0 120 80" className="w-full h-20">
                  <path d="M 20 65 A 40 40 0 0 1 100 65 Z" fill="rgba(59,130,246,0.3)" stroke="#60A5FA" />
                  <circle cx="60" cy="65" r="3" fill="#FACC15" />
                  {/* Vertex shifted away from center */}
                  <line x1="35" y1="55" x2="95" y2="55" stroke="#FF2E93" strokeWidth="3" />
                  <line x1="35" y1="55" x2="75" y2="20" stroke="#FF2E93" strokeWidth="3" />
                  <circle cx="35" cy="55" r="3.5" fill="#FF2E93" />
                </svg>
                <p className="text-[11px] text-rose-200">Đỉnh góc bị lệch khỏi tâm thước</p>
              </div>
              <div className="bg-emerald-950/80 border border-emerald-400 rounded-xl p-2.5 text-center">
                <div className="text-xs font-extrabold text-emerald-300 mb-1">✅ CÁCH ĐẶT ĐÚNG</div>
                <svg viewBox="0 0 120 80" className="w-full h-20">
                  <path d="M 20 65 A 40 40 0 0 1 100 65 Z" fill="rgba(34,197,94,0.3)" stroke="#22C55E" />
                  <line x1="60" y1="65" x2="100" y2="65" stroke="#38BDF8" strokeWidth="3" />
                  <line x1="60" y1="65" x2="90" y2="30" stroke="#FACC15" strokeWidth="3" />
                  <circle cx="60" cy="65" r="4" fill="#FACC15" />
                </svg>
                <p className="text-[11px] text-emerald-200">Tâm thước trùng khít đỉnh O</p>
              </div>
            </div>
            <p className="text-xs text-indigo-100">
              <strong>Cách khắc phục:</strong> Luôn kiểm tra dấu cộng tâm thước nằm ngay chính giữa đỉnh O của góc trước khi nhìn vạch chia.
            </p>
          </div>

          {/* Mistake 2: Vạch 0° không trùng cạnh góc */}
          <div className="card-3d-cosmic rounded-2xl p-5 flex flex-col gap-3">
            <h3 className="text-lg font-extrabold text-amber-300">
              Lỗi 2: Vạch 0° Không Trùng Với Cạnh Của Góc
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-rose-950/80 border border-rose-400 rounded-xl p-2.5 text-center">
                <div className="text-xs font-extrabold text-rose-300 mb-1">❌ CÁCH ĐẶT SAI</div>
                <svg viewBox="0 0 120 80" className="w-full h-20">
                  <path d="M 20 65 A 40 40 0 0 1 100 65 Z" fill="rgba(59,130,246,0.3)" stroke="#60A5FA" />
                  {/* Both rays floating above baseline */}
                  <line x1="60" y1="65" x2="95" y2="48" stroke="#38BDF8" strokeWidth="3" />
                  <line x1="60" y1="65" x2="65" y2="22" stroke="#FF2E93" strokeWidth="3" />
                  <circle cx="60" cy="65" r="3.5" fill="#FACC15" />
                </svg>
                <p className="text-[11px] text-rose-200">Cạnh OB lệch khỏi vạch 0°</p>
              </div>
              <div className="bg-emerald-950/80 border border-emerald-400 rounded-xl p-2.5 text-center">
                <div className="text-xs font-extrabold text-emerald-300 mb-1">✅ CÁCH ĐẶT ĐÚNG</div>
                <svg viewBox="0 0 120 80" className="w-full h-20">
                  <path d="M 20 65 A 40 40 0 0 1 100 65 Z" fill="rgba(34,197,94,0.3)" stroke="#22C55E" />
                  <line x1="60" y1="65" x2="100" y2="65" stroke="#22C55E" strokeWidth="3.5" />
                  <line x1="60" y1="65" x2="85" y2="30" stroke="#FACC15" strokeWidth="3" />
                  <circle cx="60" cy="65" r="4" fill="#FACC15" />
                </svg>
                <p className="text-[11px] text-emerald-200">Vạch 0° nằm đè lên cạnh OB</p>
              </div>
            </div>
            <p className="text-xs text-indigo-100">
              <strong>Cách khắc phục:</strong> Xoay thước để đường chuẩn 0°–180° nằm đè khít lên một cạnh của góc (cạnh OB).
            </p>
          </div>

          {/* Mistake 3: Đọc nhầm dãy số ngược chiều */}
          <div className="card-3d-cosmic rounded-2xl p-5 flex flex-col gap-3">
            <h3 className="text-lg font-extrabold text-amber-300">
              Lỗi 3: Đọc Nhầm Hai Dãy Số (Nhầm Nhọn Và Tù)
            </h3>
            <div className="bg-[#090621] border border-indigo-500/40 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-rose-300 font-bold">
                <span>❌ Sai lầm phổ biến:</span>
                <span>Góc nhọn 60° đọc thành 120°!</span>
              </div>
              <div className="flex items-center justify-between text-emerald-300 font-bold">
                <span>✅ Mẹo kiểm tra nhanh:</span>
                <span>So sánh với góc vuông 90°</span>
              </div>
              <p className="text-indigo-200 leading-relaxed">
                Trước khi kết luận số đo của <strong>góc đỉnh O; cạnh OA, OB</strong>, hãy nhìn xem góc đó hẹp hơn góc vuông (phải {'<'} 90°) hay rộng hơn góc vuông (phải {'>'} 90°). Luôn đếm từ vạch <strong>0°</strong> nơi đặt cạnh OB!
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
