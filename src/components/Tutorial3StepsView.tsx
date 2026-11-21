import React, { useState } from 'react';
import {
  AngleModelState,
  evaluateProtractorAlignment,
  ProtractorState,
} from '../utils/angleMath';
import { soundFX } from '../utils/soundEffects';
import { SemicircleProtractorSVG } from './SemicircleProtractorSVG';

interface Tutorial3StepsViewProps {
  onCompleteTutorial: () => void;
  onGoToLab: () => void;
  onBackHome: () => void;
}

export const Tutorial3StepsView: React.FC<Tutorial3StepsViewProps> = ({
  onCompleteTutorial,
  onGoToLab,
  onBackHome,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [stepCompletedMsg, setStepCompletedMsg] = useState<string | null>(null);

  // Target angle for the 3-step lesson: 70° acute angle with base ray at 15°
  const angleState: AngleModelState = {
    vertexX: 430,
    vertexY: 360,
    baseRayAngleDeg: 15,
    measureDeg: 70,
  };

  const [protractorState, setProtractorState] = useState<ProtractorState>({
    x: 240,
    y: 220,
    rotationDeg: -20,
  });

  const alignment = evaluateProtractorAlignment(protractorState, angleState);

  const handleSelectStep = (targetStep: 1 | 2 | 3) => {
    soundFX.playClick();
    setStep(targetStep);
    setStepCompletedMsg(null);
    setSelectedAnswer(null);
    if (targetStep === 1) {
      setProtractorState({ x: 240, y: 220, rotationDeg: -20 });
    } else if (targetStep === 2) {
      setProtractorState({ x: angleState.vertexX, y: angleState.vertexY, rotationDeg: -20 });
    } else {
      setProtractorState({
        x: angleState.vertexX,
        y: angleState.vertexY,
        rotationDeg: angleState.baseRayAngleDeg,
      });
    }
  };

  const handleAutoDemonstrateCurrentStep = () => {
    soundFX.playSnap();
    if (step === 1) {
      setProtractorState((prev) => ({
        ...prev,
        x: angleState.vertexX,
        y: angleState.vertexY,
      }));
      setStepCompletedMsg(
        'Tuyệt vời! Tâm thước đã được di chuyển trùng khít với đỉnh góc O.'
      );
    } else if (step === 2) {
      setProtractorState({
        x: angleState.vertexX,
        y: angleState.vertexY,
        rotationDeg: angleState.baseRayAngleDeg,
      });
      setStepCompletedMsg(
        'Chính xác! Đường chuẩn vạch 0° của thước đã xoay trùng khít với cạnh OB.'
      );
    } else {
      setSelectedAnswer(70);
      onCompleteTutorial();
      soundFX.playSuccess();
      setStepCompletedMsg(
        'Xuất sắc! Cạnh OA đi qua vạch 70° trên dãy số bắt đầu từ 0° (màu vàng). Em đã hoàn thành bài học 3 bước!'
      );
    }
  };

  const handleRetryStep = () => {
    soundFX.playClick(0.95);
    handleSelectStep(step);
  };

  const handleNextStep = () => {
    soundFX.playClick(1.15);
    if (step === 1) handleSelectStep(2);
    else if (step === 2) handleSelectStep(3);
    else {
      onCompleteTutorial();
      onGoToLab();
    }
  };

  const robotExplanationByStep: Record<1 | 2 | 3, { title: string; guide: string; warning: string }> = {
    1: {
      title: 'BƯỚC 1: ĐẶT TÂM THƯỚC TRÙNG ĐỈNH GÓC O',
      guide:
        'Chúng ta đang đo góc đỉnh O; cạnh OA, OB. Em hãy kéo chiếc thước đo góc sao cho dấu cộng Tâm Thước nằm đúng ngay tại Đỉnh O của góc.',
      warning: alignment.isCenterAligned
        ? '✅ Đã đặt đúng: Tâm thước đã trùng khít với đỉnh O!'
        : `⚠️ Nhắc nhở: Tâm thước đang lệch đỉnh O khoảng ${alignment.centerDistancePx}px. Hãy kéo thước đến đúng đỉnh O nhé!`,
    },
    2: {
      title: 'BƯỚC 2: XOAY VẠCH 0° TRÙNG VỚI CẠNH OB CỦA GÓC',
      guide:
        'Giữ nguyên tâm thước tại đỉnh O, em hãy kéo núm xoay thước (hoặc bấm nút xoay) để đường chuẩn vạch 0° trùng khít với cạnh OB.',
      warning: !alignment.isCenterAligned
        ? '⚠️ Nhắc nhở: Em làm lệch tâm thước khỏi đỉnh O rồi! Hãy đặt lại tâm thước về đỉnh O trước.'
        : alignment.isBaselineAligned
        ? '✅ Đã đặt đúng: Vạch 0° đã trùng khít với cạnh OB!'
        : `⚠️ Nhắc nhở: Vạch 0° vẫn còn lệch ${alignment.baselineErrorDeg}° so với cạnh OB. Hãy xoay thước thêm một chút!`,
    },
    3: {
      title: 'BƯỚC 3: QUAN SÁT CẠNH OA VÀ ĐỌC SỐ ĐO (°)',
      guide:
        'Vì cạnh OB trùng với vạch 0° của dãy số màu vàng (bên phải), em hãy nhìn theo dãy số màu vàng xem cạnh OA đi qua vạch chia độ nào!',
      warning: alignment.isFullyAligned
        ? '✅ Thước đã đặt chuẩn! Hãy chọn số đo đúng của góc đỉnh O; cạnh OA, OB bên dưới.'
        : '⚠️ Nhắc nhở: Hãy đảm bảo cả Tâm thước và Vạch 0° đều được căn chuẩn trước khi đọc số đo!',
    },
  };

  const currentInfo = robotExplanationByStep[step];

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 card-3d-cosmic rounded-2xl px-5 py-3.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            BÀI HỌC TƯƠNG TÁC: 3 BƯỚC ĐO GÓC CHUẨN XÁC
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200">
            Cùng Robot Toán Học thực hành đo <strong className="text-yellow-300">góc đỉnh O; cạnh OA, OB</strong> với thước đo góc
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              onGoToLab();
            }}
            className="btn-3d-pink px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm text-white cursor-pointer"
          >
            🔬 Sang Phòng Thí Nghiệm
          </button>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              onBackHome();
            }}
            className="btn-3d-cobalt px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm text-white cursor-pointer"
          >
            ← Trang chủ
          </button>
        </div>
      </div>

      {/* Stepper Tabs */}
      <div className="grid grid-cols-3 gap-3">
        {([1, 2, 3] as const).map((s) => {
          const labels = {
            1: 'Bước 1: Đặt tâm thước',
            2: 'Bước 2: Đặt vạch 0°',
            3: 'Bước 3: Đọc số đo (°)',
          };
          const active = step === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => handleSelectStep(s)}
              className={`py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer transition-all border-2 ${
                active
                  ? 'bg-yellow-400 text-slate-950 border-white shadow-lg scale-[1.02]'
                  : 'bg-[#15103D] text-indigo-200 border-indigo-500/40 hover:border-indigo-400'
              }`}
            >
              {labels[s]}
            </button>
          );
        })}
      </div>

      {/* Main Split: Left Interactive Protractor Stage | Right Robot Guide & Step Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8">
          <SemicircleProtractorSVG
            angleState={angleState}
            protractorState={protractorState}
            alignment={alignment}
            showMeasureValue={step === 3 && selectedAnswer === 70}
            allowDragRay={false}
            allowDragProtractor={true}
            highlightScale={step === 3 ? 'inner' : 'both'}
            onChangeProtractor={setProtractorState}
          />
        </div>

        <div className="lg:col-span-4 card-3d-cosmic rounded-2xl p-5 flex flex-col gap-4">
          {/* Robot Avatar & Speech Bubble */}
          <div className="flex items-center gap-3 bg-indigo-950/90 p-3.5 rounded-xl border border-indigo-400/40">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 flex items-center justify-center overflow-hidden shrink-0 border-2 border-yellow-400 shadow-md">
              <img
                src="/assets/aistudio/Th_m_ti_u____9352a9ad.png"
                alt="Robot Toán học"
                className="w-full h-full object-cover scale-[1.35]"
              />
            </div>
            <div>
              <div className="text-xs font-extrabold text-yellow-300">
                ROBOT TOÁN HỌC HƯỚNG DẪN
              </div>
              <div className="text-sm font-extrabold text-white">
                {currentInfo.title}
              </div>
            </div>
          </div>

          <p className="text-sm text-indigo-100 leading-relaxed">
            {currentInfo.guide}
          </p>

          {/* Live Diagnostic / Warning Banner */}
          <div
            role="status"
            className={`p-3.5 rounded-xl text-xs font-bold border ${
              (step === 1 && alignment.isCenterAligned) ||
              (step === 2 && alignment.isCenterAligned && alignment.isBaselineAligned) ||
              (step === 3 && alignment.isFullyAligned)
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                : 'bg-amber-950/90 border-amber-400 text-amber-200'
            }`}
          >
            {currentInfo.warning}
          </div>

          {/* Step-specific Controls */}
          {step === 2 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setProtractorState((p) => ({ ...p, rotationDeg: p.rotationDeg + 5 }))
                }
                className="btn-3d-cobalt flex-1 py-2 rounded-lg text-xs font-bold text-white cursor-pointer"
              >
                ↺ Xoay trái +5°
              </button>
              <button
                type="button"
                onClick={() =>
                  setProtractorState((p) => ({ ...p, rotationDeg: p.rotationDeg - 5 }))
                }
                className="btn-3d-cobalt flex-1 py-2 rounded-lg text-xs font-bold text-white cursor-pointer"
              >
                ↻ Xoay phải -5°
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="bg-[#090621] p-3.5 rounded-xl border border-indigo-500/40 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-yellow-300">
                Chọn số đo đúng của góc đỉnh O; cạnh OA, OB trên thước:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[70, 110, 45, 90].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setSelectedAnswer(val);
                      if (val === 70) {
                        soundFX.playSuccess();
                        onCompleteTutorial();
                        setStepCompletedMsg(
                          'Chính xác! Cạnh OA cắt đúng vạch 70° trên dãy số màu vàng (0° ở cạnh OB). Nếu đọc 110° là nhìn nhầm sang dãy số ngược chiều!'
                        );
                      } else {
                        soundFX.playWrong();
                        setStepCompletedMsg(
                          val === 110
                            ? 'Cẩn thận nhé! 110° là số trên dãy màu hồng (bắt đầu từ bên trái). Vì cạnh OB ở bên phải, em phải đọc dãy màu vàng là 70°!'
                            : 'Chưa đúng rồi! Em hãy nhìn kỹ vạch chia nơi cạnh OA đi qua nhé.'
                        );
                      }
                    }}
                    className={`py-2.5 rounded-xl font-mono-num font-extrabold text-sm cursor-pointer border-2 ${
                      selectedAnswer === val
                        ? val === 70
                          ? 'bg-emerald-500 text-white border-white'
                          : 'bg-rose-600 text-white border-white'
                        : 'bg-indigo-900/80 text-white border-indigo-500/40 hover:bg-indigo-800'
                    }`}
                  >
                    {val}°
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Auto-Animation Demo Button */}
          <button
            type="button"
            onClick={handleAutoDemonstrateCurrentStep}
            className="btn-3d-gold w-full py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer"
          >
            {step === 1
              ? '✨ Hoạt ảnh: Tự động đặt tâm thước trùng đỉnh O'
              : step === 2
              ? '✨ Hoạt ảnh: Tự động xoay vạch 0° trùng cạnh OB'
              : '✨ Hiển thị đáp án mẫu 70°'}
          </button>

          {stepCompletedMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-400 text-xs text-emerald-200 font-semibold">
              🎉 {stepCompletedMsg}
            </div>
          )}

          {/* Footer Navigation: Thử lại & Tiếp theo */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={handleRetryStep}
              className="btn-3d-cobalt flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white cursor-pointer"
            >
              ⟲ Thử lại bước này
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="btn-3d-pink flex-1 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm text-white cursor-pointer"
            >
              {step < 3 ? 'Tiếp theo →' : 'Hoàn thành và Vào Phòng Lab →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
