import React, { useState } from 'react';
import {
  AngleModelState,
  clampAngle,
  classifyAngle,
  evaluateProtractorAlignment,
  ProtractorState,
} from '../utils/angleMath';
import { soundFX } from '../utils/soundEffects';
import { SemicircleProtractorSVG } from './SemicircleProtractorSVG';

interface ProtractorLabViewProps {
  initialAngleDeg: number;
  onAngleChangeFor3D: (deg: number) => void;
  onRecordSuccessfulMeasurement: () => void;
  onOpenTutorial: () => void;
  onBackHome: () => void;
}

const STANDARD_TEST_ANGLES = [30, 45, 60, 90, 120, 135, 150, 180];

export const ProtractorLabView: React.FC<ProtractorLabViewProps> = ({
  initialAngleDeg,
  onAngleChangeFor3D,
  onRecordSuccessfulMeasurement,
  onOpenTutorial,
  onBackHome,
}) => {
  // Independent Angle State
  const [angleState, setAngleState] = useState<AngleModelState>({
    vertexX: 430,
    vertexY: 360,
    baseRayAngleDeg: 0,
    measureDeg: clampAngle(initialAngleDeg, 0, 180),
  });

  // Independent 180° Semicircular Protractor State (starts slightly offset so student can drag or snap, or click auto-align)
  const [protractorState, setProtractorState] = useState<ProtractorState>({
    x: 430,
    y: 360,
    rotationDeg: 0,
  });

  // Modes & Visibility
  const [showMeasureValue, setShowMeasureValue] = useState<boolean>(true);
  const [practiceMode, setPracticeMode] = useState<boolean>(false);
  const [studentGuess, setStudentGuess] = useState<string>('');
  const [checkResultMsg, setCheckResultMsg] = useState<{
    type: 'info' | 'success' | 'error';
    text: string;
  } | null>(null);
  const [highlightScale, setHighlightScale] = useState<'both' | 'inner' | 'outer'>('both');

  const alignment = evaluateProtractorAlignment(protractorState, angleState);
  const angleClass = classifyAngle(angleState.measureDeg);

  const updateAngleMeasure = (nextDeg: number) => {
    const clamped = clampAngle(nextDeg, 0, 180);
    setAngleState((prev) => ({ ...prev, measureDeg: clamped }));
    onAngleChangeFor3D(clamped);
    setCheckResultMsg(null);
  };

  const adjustAngleByDelta = (delta: number) => {
    soundFX.playTick(angleState.measureDeg + delta);
    updateAngleMeasure(angleState.measureDeg + delta);
  };

  const rotateProtractorByDelta = (deltaDeg: number) => {
    soundFX.playClick(1.05);
    setProtractorState((prev) => {
      let nextRot = prev.rotationDeg + deltaDeg;
      if (nextRot > 180) nextRot -= 360;
      if (nextRot <= -180) nextRot += 360;
      return { ...prev, rotationDeg: nextRot };
    });
  };

  const handleResetAll = () => {
    soundFX.playSnap();
    setAngleState({
      vertexX: 430,
      vertexY: 360,
      baseRayAngleDeg: 0,
      measureDeg: 60,
    });
    setProtractorState({
      x: 430,
      y: 360,
      rotationDeg: 0,
    });
    setPracticeMode(false);
    setShowMeasureValue(true);
    setCheckResultMsg({
      type: 'info',
      text: 'Đã đặt lại thước đo góc 180° và góc đỉnh O; cạnh OA, OB (60°) về vị trí chuẩn ban đầu.',
    });
  };

  const handleStartPracticeChallenge = () => {
    soundFX.playClick(1.2);
    const randomAngles = [25, 30, 40, 45, 55, 60, 75, 90, 105, 115, 120, 135, 145, 150, 165, 180];
    const picked = randomAngles[Math.floor(Math.random() * randomAngles.length)];
    const baseOffsets = [0, 10, 15, -10, 20];
    const pickedBase = baseOffsets[Math.floor(Math.random() * baseOffsets.length)];

    setAngleState({
      vertexX: 430,
      vertexY: 360,
      baseRayAngleDeg: pickedBase,
      measureDeg: picked,
    });
    // Move protractor away from vertex so the student must drag and rotate it!
    setProtractorState({
      x: 260,
      y: 230,
      rotationDeg: -15,
    });
    setPracticeMode(true);
    setShowMeasureValue(false);
    setStudentGuess('');
    setCheckResultMsg({
      type: 'info',
      text: 'Chế độ Tự Thực Hành: Hãy kéo tâm thước trùng đỉnh O, xoay vạch 0° trùng cạnh OB, đọc số đo tại cạnh OA và nhập kết quả để kiểm tra!',
    });
  };

  const handleCheckMeasurement = () => {
    if (!alignment.isCenterAligned) {
      soundFX.playWrong();
      setCheckResultMsg({
        type: 'error',
        text: `Chưa chính xác! Em cần kéo tâm thước trùng khít với đỉnh O của góc trước khi đọc kết quả (còn lệch ${alignment.centerDistancePx} px).`,
      });
      return;
    }
    if (!alignment.isBaselineAligned || !alignment.ray2OnProtractorArc) {
      soundFX.playWrong();
      setCheckResultMsg({
        type: 'error',
        text: alignment.feedbackVi,
      });
      return;
    }

    if (practiceMode || !showMeasureValue) {
      const parsed = Number(studentGuess.trim());
      if (!studentGuess.trim() || Number.isNaN(parsed)) {
        soundFX.playWrong();
        setCheckResultMsg({
          type: 'error',
          text: 'Em hãy nhập số đo độ mà em đọc được trên thước vào ô trả lời nhé!',
        });
        return;
      }
      if (Math.abs(parsed - angleState.measureDeg) <= 1) {
        soundFX.playSuccess();
        setShowMeasureValue(true);
        onRecordSuccessfulMeasurement();
        setCheckResultMsg({
          type: 'success',
          text: `Chính xác 100%! Góc đỉnh O; cạnh OA, OB có số đo là ${angleState.measureDeg}° (${angleClass.nameVi}). Em đặt thước và đọc số đo rất giỏi!`,
        });
      } else {
        soundFX.playWrong();
        const wrongScaleHint =
          Math.abs(parsed - (180 - angleState.measureDeg)) <= 2
            ? ' (Có vẻ em đã nhìn nhầm sang dãy số ngược chiều 180° - số đo thực!)'
            : '';
        setCheckResultMsg({
          type: 'error',
          text: `Số đo ${parsed}° chưa đúng${wrongScaleHint}. Hãy quan sát kỹ vạch chia nơi cạnh OA đi qua theo dãy số có vạch 0° trùng với cạnh OB nhé!`,
        });
      }
    } else {
      soundFX.playSuccess();
      onRecordSuccessfulMeasurement();
      setCheckResultMsg({
        type: 'success',
        text: `Kiểm tra thành công: Tâm thước đã trùng đỉnh O, vạch 0° trùng cạnh OB. Góc đỉnh O; cạnh OA, OB có số đo là ${angleState.measureDeg}° (${angleClass.nameVi}).`,
      });
    }
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-3 flex flex-col gap-3.5">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 card-3d-cosmic rounded-2xl px-4 py-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            PHÒNG THÍ NGHIỆM ĐO GÓC – THƯỚC ĐO GÓC
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200">
            Đo <strong className="text-yellow-300">góc đỉnh O; cạnh OA, OB</strong>: Kéo tâm thước trùng đỉnh O · Xoay vạch 0° trùng cạnh OB · Quan sát cạnh OA cắt vạch chia độ
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              onOpenTutorial();
            }}
            className="btn-3d-gold px-3.5 py-2 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer whitespace-nowrap"
          >
            📖 Hướng dẫn sử dụng (3 bước)
          </button>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              onBackHome();
            }}
            className="btn-3d-cobalt px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm text-white cursor-pointer whitespace-nowrap"
          >
            ← Trang chủ
          </button>
        </div>
      </div>

      {/* Main Split: Left 180° Protractor Canvas | Right Live Telemetry & Practice Check */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left 8 Cols: Interactive Semicircular Protractor SVG */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <SemicircleProtractorSVG
            angleState={angleState}
            protractorState={protractorState}
            alignment={alignment}
            showMeasureValue={showMeasureValue}
            allowDragRay={true}
            allowDragProtractor={true}
            highlightScale={highlightScale}
            onChangeAngleMeasure={updateAngleMeasure}
            onChangeProtractor={setProtractorState}
          />

          {/* Standard Angle Quick-Test Strip (30°, 45°, 60°, 90°, 120°, 135°, 150°, 180°) */}
          <div className="card-3d-cosmic rounded-xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-indigo-200">
              Góc chuẩn kiểm thử nhanh:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {STANDARD_TEST_ANGLES.map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => {
                    soundFX.playClick(1.1);
                    updateAngleMeasure(deg);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-mono-num text-xs font-extrabold cursor-pointer transition-colors ${
                    angleState.measureDeg === deg && showMeasureValue
                      ? 'bg-yellow-400 text-slate-950'
                      : 'bg-indigo-900/80 text-white hover:bg-indigo-700'
                  }`}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Readout, Alignment Status & Controls */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Card 1: Result & Classification Readout */}
          <div className="card-3d-cosmic rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-yellow-300">
                  GÓC ĐỈNH O; CẠNH OA, OB
                </span>
                <div className="flex items-baseline gap-2.5 mt-0.5">
                  <span
                    data-testid="lab-angle-readout"
                    className="text-4xl font-extrabold font-mono-num text-yellow-300"
                  >
                    {showMeasureValue ? `${angleState.measureDeg}°` : '???°'}
                  </span>
                  <span
                    className="text-base font-extrabold"
                    style={{ color: showMeasureValue ? angleClass.colorHex : '#94A3B8' }}
                  >
                    {showMeasureValue ? angleClass.nameVi : '(Đang ẩn đáp án)'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setShowMeasureValue((v) => !v);
                }}
                className="btn-3d-cobalt px-3 py-2 rounded-xl text-xs font-bold text-white cursor-pointer whitespace-nowrap"
              >
                {showMeasureValue ? '🙈 Ẩn số đo' : '👁️ Hiện số đo'}
              </button>
            </div>

            {/* Alignment Diagnostic Checklist */}
            <div className="bg-[#090621] rounded-xl p-3 border border-indigo-500/30 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-indigo-200">1. Tâm thước trùng đỉnh O:</span>
                <span
                  className={`font-bold ${
                    alignment.isCenterAligned ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {alignment.isCenterAligned ? '✓ Đã trùng khít' : `Lệch ${alignment.centerDistancePx}px`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-indigo-200">2. Vạch 0° trùng cạnh OB:</span>
                <span
                  className={`font-bold ${
                    alignment.isBaselineAligned ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {alignment.isBaselineAligned ? '✓ Đã căn chuẩn 0°' : `Lệch ${alignment.baselineErrorDeg}°`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-indigo-200">3. Góc xoay của thước:</span>
                <span className="font-mono-num font-bold text-sky-300">
                  {protractorState.rotationDeg}°
                </span>
              </div>
              {alignment.isFullyAligned && showMeasureValue && (
                <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-yellow-300 font-semibold">
                    Dãy trong (Vàng): {alignment.innerScaleReading}°
                  </span>
                  <span className="text-pink-400 font-semibold">
                    Dãy ngoài (Hồng): {alignment.outerScaleReading}°
                  </span>
                </div>
              )}
            </div>

            {/* Practice / Check Result Input */}
            {(!showMeasureValue || practiceMode) && (
              <div className="bg-indigo-950/90 rounded-xl p-3 border border-pink-500/40 flex flex-col gap-2">
                <label htmlFor="student-measure-input" className="text-xs font-bold text-pink-200">
                  Nhập số đo em đọc được trên thước (°):
                </label>
                <div className="flex gap-2">
                  <input
                    id="student-measure-input"
                    type="number"
                    min={0}
                    max={180}
                    value={studentGuess}
                    onChange={(e) => setStudentGuess(e.target.value)}
                    placeholder="VD: 60"
                    className="w-full rounded-lg bg-slate-900 border border-indigo-400/50 px-3 py-1.5 text-sm font-mono-num text-white focus:outline-none focus:border-yellow-400"
                  />
                  <button
                    type="button"
                    onClick={handleCheckMeasurement}
                    className="btn-3d-emerald px-3.5 py-1.5 rounded-lg text-xs font-extrabold text-white cursor-pointer whitespace-nowrap"
                  >
                    ✓ Kiểm tra kết quả
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons: Kiểm tra kết quả & Tự thực hành */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCheckMeasurement}
                className="btn-3d-emerald py-2.5 px-3 rounded-xl text-xs font-extrabold text-white cursor-pointer"
              >
                ✓ Kiểm tra kết quả
              </button>
              <button
                type="button"
                onClick={handleStartPracticeChallenge}
                className="btn-3d-pink py-2.5 px-3 rounded-xl text-xs font-extrabold text-white cursor-pointer"
              >
                🎯 Tự thực hành đo
              </button>
            </div>

            {checkResultMsg && (
              <div
                role="status"
                className={`rounded-xl p-2.5 text-xs font-semibold border ${
                  checkResultMsg.type === 'success'
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                    : checkResultMsg.type === 'error'
                    ? 'bg-rose-950/90 border-rose-400 text-rose-200'
                    : 'bg-indigo-950/90 border-indigo-400 text-indigo-200'
                }`}
              >
                {checkResultMsg.text}
              </div>
            )}
          </div>

          {/* Card 2: Protractor Rotation Controls (A. Xoay thước) */}
          <div className="card-3d-cosmic rounded-2xl p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-sky-300">
                A. ĐIỀU KHIỂN VÀ XOAY THƯỚC 180°
              </span>
              <div className="flex gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setHighlightScale(highlightScale === 'inner' ? 'both' : 'inner')}
                  className={`px-2 py-0.5 rounded cursor-pointer font-bold ${
                    highlightScale === 'inner'
                      ? 'bg-yellow-400 text-slate-950'
                      : 'bg-slate-800 text-yellow-300'
                  }`}
                >
                  Dãy trong
                </button>
                <button
                  type="button"
                  onClick={() => setHighlightScale(highlightScale === 'outer' ? 'both' : 'outer')}
                  className={`px-2 py-0.5 rounded cursor-pointer font-bold ${
                    highlightScale === 'outer'
                      ? 'bg-pink-500 text-white'
                      : 'bg-slate-800 text-pink-300'
                  }`}
                >
                  Dãy ngoài
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => rotateProtractorByDelta(5)}
                className="btn-3d-cobalt py-2 px-1.5 rounded-lg text-xs font-bold text-white cursor-pointer whitespace-nowrap"
                aria-label="Xoay trái"
              >
                ↺ Xoay trái
              </button>
              <button
                type="button"
                onClick={() => rotateProtractorByDelta(-5)}
                className="btn-3d-cobalt py-2 px-1.5 rounded-lg text-xs font-bold text-white cursor-pointer whitespace-nowrap"
                aria-label="Xoay phải"
              >
                ↻ Xoay phải
              </button>
              <button
                type="button"
                onClick={() => rotateProtractorByDelta(15)}
                className="btn-3d-cobalt py-2 px-1.5 rounded-lg text-xs font-bold text-white cursor-pointer whitespace-nowrap"
              >
                ⚡ Xoay 15°
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playSnap();
                  setProtractorState({
                    x: angleState.vertexX,
                    y: angleState.vertexY,
                    rotationDeg: angleState.baseRayAngleDeg,
                  });
                }}
                className="btn-3d-gold py-2 px-1.5 rounded-lg text-xs font-extrabold cursor-pointer whitespace-nowrap"
              >
                🎯 Khớp tâm O
              </button>
            </div>
          </div>

          {/* Card 3: Angle Opening Controls (B. Điều chỉnh góc) */}
          <div className="card-3d-cosmic rounded-2xl p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="lab-angle-slider" className="text-xs font-extrabold text-pink-300">
                B. ĐIỀU CHỈNH ĐỘ MỞ GÓC (0° – 180°)
              </label>
              <button
                type="button"
                onClick={handleResetAll}
                className="text-xs font-bold text-yellow-300 hover:underline cursor-pointer"
              >
                ⟲ Đặt lại
              </button>
            </div>

            <input
              id="lab-angle-slider"
              type="range"
              min={0}
              max={180}
              value={angleState.measureDeg}
              onChange={(e) => updateAngleMeasure(Number(e.target.value))}
              className="w-full accent-yellow-400 cursor-pointer"
            />

            <div className="grid grid-cols-6 gap-1.5">
              <button
                type="button"
                onClick={() => adjustAngleByDelta(-10)}
                className="bg-slate-800 hover:bg-slate-700 border border-white/15 py-1.5 rounded-lg text-xs font-mono-num font-bold text-rose-300 cursor-pointer"
              >
                -10°
              </button>
              <button
                type="button"
                onClick={() => adjustAngleByDelta(-5)}
                className="bg-slate-800 hover:bg-slate-700 border border-white/15 py-1.5 rounded-lg text-xs font-mono-num font-bold text-rose-300 cursor-pointer"
              >
                -5°
              </button>
              <button
                type="button"
                onClick={() => adjustAngleByDelta(-1)}
                className="bg-slate-800 hover:bg-slate-700 border border-white/15 py-1.5 rounded-lg text-xs font-mono-num font-bold text-rose-300 cursor-pointer"
                aria-label="Giảm góc"
              >
                -1°
              </button>
              <button
                type="button"
                onClick={() => adjustAngleByDelta(1)}
                className="bg-slate-800 hover:bg-slate-700 border border-white/15 py-1.5 rounded-lg text-xs font-mono-num font-bold text-emerald-300 cursor-pointer"
                aria-label="Tăng góc"
              >
                +1°
              </button>
              <button
                type="button"
                onClick={() => adjustAngleByDelta(5)}
                className="bg-slate-800 hover:bg-slate-700 border border-white/15 py-1.5 rounded-lg text-xs font-mono-num font-bold text-emerald-300 cursor-pointer"
              >
                +5°
              </button>
              <button
                type="button"
                onClick={() => adjustAngleByDelta(10)}
                className="bg-slate-800 hover:bg-slate-700 border border-white/15 py-1.5 rounded-lg text-xs font-mono-num font-bold text-emerald-300 cursor-pointer"
              >
                +10°
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
