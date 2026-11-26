import React, { useMemo, useState } from 'react';
import {
  SetSquareState,
  normalizeDeg360,
} from '../utils/perpendicularMath';
import {
  PARALLEL_DRAW_TASKS,
  PARALLEL_CHECK_SHAPES,
  ParallelCheckShapeId,
  computeParallelGeometry,
  evaluateParallelStepAlignment,
} from '../utils/parallelMath';
import { InteractiveParallelSetSquareSVG } from './InteractiveParallelSetSquareSVG';
import { soundFX } from '../utils/soundEffects';

interface ParallelLabViewProps {
  onBackHome: () => void;
  onCompleteLabAction: () => void;
}

export const ParallelLabView: React.FC<ParallelLabViewProps> = ({
  onBackHome,
  onCompleteLabAction,
}) => {
  const [labMode, setLabMode] = useState<'draw' | 'check'>('draw');

  // --- DRAW MODE STATE (2-step parallel drawing with Ê Ke) ---
  const [drawTaskIdx, setDrawTaskIdx] = useState(0);
  const currentDrawTask = PARALLEL_DRAW_TASKS[drawTaskIdx];
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [hasDrawnStep1, setHasDrawnStep1] = useState(false);
  const [hasDrawnStep2, setHasDrawnStep2] = useState(false);
  const [setSquare, setSetSquare] = useState<SetSquareState>(currentDrawTask.initialSetSquare);
  const [drawFeedback, setDrawFeedback] = useState<string>('');
  const [completedDrawIds, setCompletedDrawIds] = useState<string[]>([]);

  // --- CHECK MODE STATE (Multi-select all edges parallel to reference edge) ---
  const [checkShapeId, setCheckShapeId] = useState<ParallelCheckShapeId>('split_rect_amnd_mbcn');
  const currentCheckShape =
    PARALLEL_CHECK_SHAPES.find((s) => s.id === checkShapeId) ?? PARALLEL_CHECK_SHAPES[0];
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);
  const [checkFeedback, setCheckFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [completedCheckIds, setCompletedCheckIds] = useState<string[]>([]);

  const alignment = useMemo(
    () => evaluateParallelStepAlignment(setSquare, currentDrawTask, activeStep),
    [setSquare, currentDrawTask, activeStep]
  );

  const handleSelectDrawTask = (idx: number) => {
    soundFX.playClick();
    const t = PARALLEL_DRAW_TASKS[idx];
    setDrawTaskIdx(idx);
    setActiveStep(1);
    setHasDrawnStep1(false);
    setHasDrawnStep2(false);
    setSetSquare(t.initialSetSquare);
    setDrawFeedback('');
  };

  const handleSnapSetSquare = () => {
    soundFX.playSnap();
    const geom = computeParallelGeometry(currentDrawTask);
    setSetSquare(activeStep === 1 ? geom.step1Snap : geom.step2Snap);
    setDrawFeedback(
      activeStep === 1
        ? '✨ Đã đặt chuẩn Ê Ke cho Bước 1! Hãy bấm "Vạch đường phụ MN" ngay nhé!'
        : '✨ Đã đặt chuẩn Ê Ke cho Bước 2! Hãy bấm "Vạch đường thẳng song song CD" ngay nhé!'
    );
  };

  const handleDrawStep = () => {
    if (!alignment.isFullyAligned) {
      soundFX.playWrong();
      if (!alignment.isLegOnLine) {
        setDrawFeedback(
          activeStep === 1
            ? `⚠️ Cạnh góc vuông của Ê Ke chưa trùng đường thẳng ${currentDrawTask.baseLine.nameVi}. Hãy kéo hoặc xoay Ê Ke lại nhé!`
            : `⚠️ Cạnh góc vuông của Ê Ke chưa trùng đường phụ ${currentDrawTask.auxLineLabels.join('')}. Hãy kéo hoặc xoay lại nhé!`
        );
      } else {
        setDrawFeedback(
          `⚠️ Cạnh góc vuông thứ hai của Ê Ke chưa chạm đúng điểm ${currentDrawTask.targetPointLabel}. Hãy trượt nhẹ dọc theo đường thẳng nhé!`
        );
      }
      return;
    }

    if (activeStep === 1) {
      soundFX.playSuccess();
      setHasDrawnStep1(true);
      setActiveStep(2);
      setDrawFeedback(
        `✅ Xong Bước 1! Đã vẽ đường phụ ${currentDrawTask.auxLineLabels.join('')} vuông góc với ${currentDrawTask.baseLine.nameVi}. Giờ hãy đặt Ê Ke trùng đường ${currentDrawTask.auxLineLabels.join('')} tại ${currentDrawTask.targetPointLabel} để vẽ Bước 2 nhé!`
      );
    } else {
      soundFX.playSuccess();
      setHasDrawnStep2(true);
      setDrawFeedback(
        `🎉 Xuất sắc! Đường thẳng ${currentDrawTask.parallelLineLabels.join('')} đi qua ${currentDrawTask.targetPointLabel} và SONG SONG hoàn hảo với đường thẳng ${currentDrawTask.baseLine.nameVi}!`
      );
      if (!completedDrawIds.includes(currentDrawTask.id)) {
        setCompletedDrawIds((prev) => [...prev, currentDrawTask.id]);
      }
      onCompleteLabAction();
    }
  };

  const handleSwitchCheckShape = (id: ParallelCheckShapeId) => {
    soundFX.playClick();
    setCheckShapeId(id);
    setSelectedEdgeIds([]);
    setCheckFeedback(null);
  };

  const handleToggleEdge = (edgeId: string) => {
    soundFX.playClick();
    setCheckFeedback(null);
    setSelectedEdgeIds((prev) =>
      prev.includes(edgeId) ? prev.filter((e) => e !== edgeId) : [...prev, edgeId]
    );
  };

  const handleVerifyCheck = () => {
    const expected = [...currentCheckShape.expectedParallelEdgeIds].sort();
    const chosen = [...selectedEdgeIds].sort();
    const isExact =
      expected.length === chosen.length && expected.every((id, idx) => id === chosen[idx]);

    if (isExact) {
      soundFX.playSuccess();
      setCheckFeedback({
        ok: true,
        text: `🎉 Chính xác tuyệt đối! ${currentCheckShape.readingSummaryVi}`,
      });
      if (!completedCheckIds.includes(currentCheckShape.id)) {
        setCompletedCheckIds((prev) => [...prev, currentCheckShape.id]);
      }
      onCompleteLabAction();
    } else {
      soundFX.playWrong();
      const missingCount = expected.filter((id) => !chosen.includes(id)).length;
      const wrongCount = chosen.filter((id) => !expected.includes(id)).length;
      if (wrongCount > 0) {
        setCheckFeedback({
          ok: false,
          text: `⚠️ Có ${wrongCount} cạnh em chọn KHÔNG song song với cạnh ${currentCheckShape.referenceEdgeNameVi} (chúng cắt nhau hoặc vuông góc). Hãy bỏ chọn và thử lại nhé!`,
        });
      } else {
        setCheckFeedback({
          ok: false,
          text: `💡 Em tìm đúng hướng rồi nhưng còn thiếu ${missingCount} cạnh nữa! Hãy nhớ: 1 cạnh có thể song song với NHIỀU cạnh trong cùng một hình!`,
        });
      }
    }
  };

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
            CHỦ ĐỀ 3 · THỰC HÀNH TƯƠNG TÁC
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            2. PHÒNG THÍ NGHIỆM ĐƯỜNG THẲNG SONG SONG
          </h2>
        </div>

        <div className="flex gap-1.5 bg-[#130E38]/95 border border-indigo-400/50 rounded-2xl p-1">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setLabMode('draw');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
              labMode === 'draw' ? 'bg-pink-500 text-white shadow' : 'text-indigo-200 hover:text-white'
            }`}
          >
            ✏️ Vẽ song song (2 bước Ê Ke)
          </button>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setLabMode('check');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
              labMode === 'check'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            🔍 Tìm tất cả cạnh song song
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* MODE 1: DRAW PARALLEL LINES (2 STEPS WITH Ê KE)                  */}
      {/* ================================================================ */}
      {labMode === 'draw' && (
        <div className="space-y-4">
          {/* Task Selector Strip */}
          <div className="flex flex-wrap justify-center gap-2">
            {PARALLEL_DRAW_TASKS.map((t, idx) => {
              const isDone = completedDrawIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectDrawTask(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer border ${
                    idx === drawTaskIdx
                      ? 'bg-yellow-400 text-slate-950 border-yellow-300'
                      : isDone
                        ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/60'
                        : 'bg-[#130E38]/95 text-indigo-200 border-indigo-400/40 hover:border-yellow-300'
                  }`}
                >
                  {isDone ? '✓ ' : ''}Nhiệm vụ {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8 space-y-3">
              <InteractiveParallelSetSquareSVG
                task={currentDrawTask}
                activeStep={activeStep}
                hasDrawnStep1={hasDrawnStep1}
                hasDrawnStep2={hasDrawnStep2}
                setSquare={setSquare}
                onChangeSetSquare={setSetSquare}
                alignment={alignment}
              />

              {/* Quick Rotate & Snap Helper Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#130E38]/95 border border-indigo-400/40 rounded-2xl p-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-indigo-200 mr-1">Xoay nhanh ê ke:</span>
                  {[15, 5, -5, -15, 90].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        soundFX.playTick(Math.abs(d) * 4);
                        setSetSquare((prev) => ({
                          ...prev,
                          rotationDeg: normalizeDeg360(prev.rotationDeg + d),
                        }));
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-950 border border-indigo-400/50 text-xs font-extrabold text-white hover:bg-indigo-800 cursor-pointer font-mono-num"
                    >
                      {d > 0 ? `↺ +${d}°` : `↻ ${d}°`}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  data-testid="par-lab-snap-btn"
                  onClick={handleSnapSetSquare}
                  className="px-3 py-1.5 rounded-lg bg-yellow-400/20 border border-yellow-400/60 text-xs font-extrabold text-yellow-200 hover:bg-yellow-400/30 cursor-pointer"
                >
                  💡 Gợi ý đặt chuẩn Bước {activeStep}
                </button>
              </div>
            </div>

            {/* Right 4 cols: Live 2-Step Guide & Action Buttons */}
            <div className="lg:col-span-4 card-3d-cosmic rounded-3xl p-5 border-2 border-sky-400/60 space-y-4">
              <div>
                <div className="text-xs font-extrabold text-yellow-300 uppercase">
                  {currentDrawTask.badgeVi}
                </div>
                <h3 className="text-lg font-extrabold text-white mt-1 leading-snug">
                  {currentDrawTask.titleVi}
                </h3>
                <p className="text-xs text-indigo-200 mt-1.5 leading-relaxed">
                  {activeStep === 1
                    ? currentDrawTask.instructionStep1Vi
                    : currentDrawTask.instructionStep2Vi}
                </p>
              </div>

              {/* 2-Step Progress Pills */}
              <div className="grid grid-cols-2 gap-2 text-xs font-extrabold">
                <div
                  className={`p-2.5 rounded-xl border text-center ${
                    hasDrawnStep1
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                      : 'bg-yellow-400/20 border-yellow-400 text-yellow-200'
                  }`}
                >
                  {hasDrawnStep1 ? '✅ ' : '1️⃣ '}Bước 1: MN vuông góc với AB
                </div>
                <div
                  className={`p-2.5 rounded-xl border text-center ${
                    hasDrawnStep2
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                      : activeStep === 2
                        ? 'bg-yellow-400/20 border-yellow-400 text-yellow-200'
                        : 'bg-[#0B0826] border-indigo-500/40 text-indigo-300'
                  }`}
                >
                  {hasDrawnStep2 ? '✅ ' : '2️⃣ '}Bước 2: CD vuông góc với MN
                </div>
              </div>

              {/* Live Alignment Checklist */}
              <div className="space-y-2 text-xs font-bold">
                <div
                  className={`p-3 rounded-xl border ${
                    alignment.isLegOnLine
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                      : 'bg-[#0B0826] border-indigo-500/40 text-indigo-200'
                  }`}
                >
                  {alignment.isLegOnLine ? '✅ ' : '• '}
                  Một cạnh góc vuông ê ke trùng đường{' '}
                  {activeStep === 1
                    ? currentDrawTask.baseLine.nameVi
                    : currentDrawTask.auxLineLabels.join('')}
                </div>
                <div
                  className={`p-3 rounded-xl border ${
                    alignment.isOtherLegAtPoint
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                      : 'bg-[#0B0826] border-indigo-500/40 text-indigo-200'
                  }`}
                >
                  {alignment.isOtherLegAtPoint ? '✅ ' : '• '}
                  Cạnh góc vuông thứ hai gặp đúng điểm {currentDrawTask.targetPointLabel}
                </div>
              </div>

              {!hasDrawnStep2 ? (
                <button
                  type="button"
                  data-testid="par-lab-draw-btn"
                  onClick={handleDrawStep}
                  className="btn-3d-emerald w-full py-3 px-4 rounded-xl font-extrabold text-sm cursor-pointer"
                >
                  {activeStep === 1
                    ? `✏️ Bước 1: Vạch đường phụ ${currentDrawTask.auxLineLabels.join('')}`
                    : `✨ Bước 2: Vạch đường song song ${currentDrawTask.parallelLineLabels.join('')}`}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectDrawTask(drawTaskIdx)}
                    className="btn-3d-cobalt flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs cursor-pointer"
                  >
                    🔄 Vẽ lại
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSelectDrawTask((drawTaskIdx + 1) % PARALLEL_DRAW_TASKS.length)
                    }
                    className="btn-3d-gold flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs cursor-pointer"
                  >
                    Nhiệm vụ tiếp →
                  </button>
                </div>
              )}

              {drawFeedback && (
                <div
                  className={`p-3 rounded-2xl text-xs font-bold border leading-relaxed ${
                    hasDrawnStep2 || drawFeedback.startsWith('✅') || drawFeedback.startsWith('✨')
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100'
                      : 'bg-amber-500/20 border-amber-400 text-amber-100'
                  }`}
                >
                  {drawFeedback}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODE 2: MULTI-SELECT ALL PARALLEL EDGES ON SHAPE                 */}
      {/* ================================================================ */}
      {labMode === 'check' && (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-center gap-2">
            {PARALLEL_CHECK_SHAPES.map((sh) => {
              const isDone = completedCheckIds.includes(sh.id);
              return (
                <button
                  key={sh.id}
                  type="button"
                  onClick={() => handleSwitchCheckShape(sh.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer border ${
                    checkShapeId === sh.id
                      ? 'bg-yellow-400 text-slate-950 border-yellow-300'
                      : isDone
                        ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/60'
                        : 'bg-[#130E38]/95 text-indigo-200 border-indigo-400/40 hover:border-yellow-300'
                  }`}
                >
                  {isDone ? '✓ ' : ''}{sh.titleVi}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-8 card-3d-cosmic rounded-3xl p-4 border-2 border-emerald-400/60 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold">
                <span className="text-yellow-300">
                  BẤM TRỰC TIẾP VÀO TỪNG CẠNH ĐỂ CHỌN (CÓ THỂ CHỌN NHIỀU CẠNH!)
                </span>
                <span className="text-sky-300">
                  Đã chọn: {selectedEdgeIds.length} cạnh
                </span>
              </div>

              <div className="bg-[#0B0826] rounded-2xl p-2 border border-indigo-400/40">
                <svg viewBox="0 0 700 360" className="w-full h-auto block">
                  <defs>
                    <pattern id="par-check-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                      <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(129,140,248,0.14)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect x="0" y="0" width="700" height="360" rx="12" fill="url(#par-check-grid)" />

                  {currentCheckShape.edges.map((edge) => {
                    const isRef = Boolean(edge.isReference);
                    const isSel = selectedEdgeIds.includes(edge.id);
                    const strokeColor = isRef ? '#FACC15' : isSel ? '#34D399' : '#94A3B8';
                    return (
                      <g
                        key={edge.id}
                        className={isRef ? '' : 'cursor-pointer'}
                        onClick={() => {
                          if (!isRef) handleToggleEdge(edge.id);
                        }}
                      >
                        {/* Wide invisible hit target for easy elementary clicking */}
                        {!isRef && (
                          <line
                            x1={edge.p1.x}
                            y1={edge.p1.y}
                            x2={edge.p2.x}
                            y2={edge.p2.y}
                            stroke="transparent"
                            strokeWidth="26"
                          />
                        )}
                        <line
                          x1={edge.p1.x}
                          y1={edge.p1.y}
                          x2={edge.p2.x}
                          y2={edge.p2.y}
                          stroke={strokeColor}
                          strokeWidth={isRef || isSel ? 8 : 4.5}
                          strokeLinecap="round"
                        />
                        <text
                          x={edge.labelPos.x}
                          y={edge.labelPos.y}
                          textAnchor="middle"
                          fill={isRef ? '#FACC15' : isSel ? '#6EE7B7' : '#CBD5E1'}
                          fontSize="14"
                          fontWeight="900"
                        >
                          {edge.labelVi}
                        </text>
                      </g>
                    );
                  })}

                  {currentCheckShape.vertices.map((v) => (
                    <text
                      key={v.label}
                      x={v.x}
                      y={v.y}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="22"
                      fontWeight="900"
                    >
                      {v.label}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            <div className="lg:col-span-4 card-3d-cosmic rounded-3xl p-5 border-2 border-indigo-400/60 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <span className="inline-block text-[11px] font-extrabold bg-yellow-400/20 border border-yellow-400/60 text-yellow-200 px-3 py-1 rounded-xl">
                  {currentCheckShape.badgeVi}
                </span>
                <h3 className="text-lg font-extrabold text-white">{currentCheckShape.titleVi}</h3>
                <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                  {currentCheckShape.promptVi}
                </p>

                {/* Clickable Edge Pill Buttons (also accessible via keyboard/touch) */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-indigo-300">Hoặc bấm chọn nhanh tên cạnh:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentCheckShape.edges
                      .filter((e) => !e.isReference)
                      .map((edge) => {
                        const isSel = selectedEdgeIds.includes(edge.id);
                        return (
                          <button
                            key={edge.id}
                            type="button"
                            onClick={() => handleToggleEdge(edge.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer border ${
                              isSel
                                ? 'bg-emerald-400 text-slate-950 border-emerald-300'
                                : 'bg-[#0B0826] text-indigo-100 border-indigo-400/40 hover:border-yellow-300'
                            }`}
                          >
                            {isSel ? '✓ ' : ''}{edge.labelVi}
                          </button>
                        );
                      })}
                  </div>
                </div>

                {checkFeedback && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-bold border leading-relaxed ${
                      checkFeedback.ok
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100'
                        : 'bg-amber-500/20 border-amber-400 text-amber-100'
                    }`}
                  >
                    {checkFeedback.text}
                  </div>
                )}
              </div>

              <button
                type="button"
                data-testid="par-check-verify-btn"
                onClick={handleVerifyCheck}
                className="btn-3d-emerald w-full py-3 px-4 rounded-xl font-extrabold text-sm cursor-pointer"
              >
                ✅ Kiểm tra kết quả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
