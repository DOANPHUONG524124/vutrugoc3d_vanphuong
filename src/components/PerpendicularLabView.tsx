import React, { useMemo, useState } from 'react';
import {
  CheckShapeId,
  computeSnapSetSquareState,
  DrawTaskId,
  evaluateSetSquareAlignment,
  normalizeDeg360,
  PERPENDICULAR_CHECK_TASKS,
  PERPENDICULAR_DRAW_TASKS,
  SetSquareState,
} from '../utils/perpendicularMath';
import { soundFX } from '../utils/soundEffects';
import { InteractiveSetSquareSVG } from './InteractiveSetSquareSVG';

interface PerpendicularLabViewProps {
  onRecordSuccess: () => void;
  onOpenGuide: () => void;
  onBackHome: () => void;
}

export const PerpendicularLabView: React.FC<PerpendicularLabViewProps> = ({
  onRecordSuccess,
  onOpenGuide,
  onBackHome,
}) => {
  const [labMode, setLabMode] = useState<'draw' | 'check'>('draw');

  // --- DRAW MODE STATE (Bài 28 – 1a & 1b) ---
  const [drawTaskId, setDrawTaskId] = useState<DrawTaskId>('b28_cd_horizontal_m_on');
  const currentDrawTask = useMemo(
    () => PERPENDICULAR_DRAW_TASKS.find((t) => t.id === drawTaskId) || PERPENDICULAR_DRAW_TASKS[0],
    [drawTaskId]
  );
  const [drawSetSquare, setDrawSetSquare] = useState<SetSquareState>(
    () => PERPENDICULAR_DRAW_TASKS[0].initialSetSquare
  );
  const [completedDrawIds, setCompletedDrawIds] = useState<DrawTaskId[]>([]);
  const [drawFeedback, setDrawFeedback] = useState<string>('');

  // --- CHECK MODE STATE (Bài 27 Hoạt động 2, 3 & Luyện tập 2) ---
  const [checkShapeId, setCheckShapeId] = useState<CheckShapeId>('pentagon_abcde');
  const currentCheckTask = useMemo(
    () =>
      PERPENDICULAR_CHECK_TASKS.find((t) => t.id === checkShapeId) || PERPENDICULAR_CHECK_TASKS[0],
    [checkShapeId]
  );
  const [checkSetSquare, setCheckSetSquare] = useState<SetSquareState>(
    () => PERPENDICULAR_CHECK_TASKS[0].initialSetSquare
  );
  const [checkedVerticesByShape, setCheckedVerticesByShape] = useState<Record<string, string[]>>({
    pentagon_abcde: [],
    trapezoid_abcd: [],
    windmill_blades: [],
  });
  const [activeVertexId, setActiveVertexId] = useState<string | null>(null);
  const [checkFeedback, setCheckFeedback] = useState<string>(
    'Bấm vào từng đỉnh hoặc kéo ê ke tới đỉnh để kiểm tra xem hai cạnh có vuông góc không nhé!'
  );

  const alignment = useMemo(
    () =>
      evaluateSetSquareAlignment(
        drawSetSquare,
        currentDrawTask.line,
        currentDrawTask.targetPoint
      ),
    [drawSetSquare, currentDrawTask]
  );

  const hasDrawnCurrent = completedDrawIds.includes(currentDrawTask.id);
  const checkedVertexIds = checkedVerticesByShape[currentCheckTask.id] || [];

  const handleSelectDrawTask = (id: DrawTaskId) => {
    soundFX.playClick();
    const task = PERPENDICULAR_DRAW_TASKS.find((t) => t.id === id);
    if (!task) return;
    setDrawTaskId(id);
    setDrawSetSquare({ ...task.initialSetSquare });
    setDrawFeedback('');
  };

  const handleSnapSetSquare = () => {
    soundFX.playSnap();
    const snapped = computeSnapSetSquareState(currentDrawTask.line, currentDrawTask.targetPoint);
    setDrawSetSquare(snapped);
    setDrawFeedback(
      `Tuyệt vời! Ê ke đã đặt chuẩn Bước 1: một cạnh góc vuông trùng ${currentDrawTask.line.nameVi} và cạnh kia gặp điểm ${currentDrawTask.targetPointLabel}. Hãy bấm "Vạch đường thẳng" ở Bước 2!`
    );
  };

  const handleRotateDrawEke = (deltaDeg: number) => {
    soundFX.playTick(Math.abs(deltaDeg) * 4);
    setDrawSetSquare((prev) => ({
      ...prev,
      rotationDeg: normalizeDeg360(prev.rotationDeg + deltaDeg),
    }));
  };

  const handleDrawPerpLine = () => {
    if (!alignment.isFullyAligned) {
      soundFX.playWrong();
      if (!alignment.isLegOnLine) {
        setDrawFeedback(
          `Chưa đặt đúng Bước 1: Một cạnh góc vuông của ê ke cần trùng khít với đường thẳng ${currentDrawTask.line.nameVi}! (Hoặc bấm nút "Đặt chuẩn ê ke" để xem mẫu)`
        );
      } else {
        setDrawFeedback(
          `Một cạnh đã trùng ${currentDrawTask.line.nameVi}, nhưng cạnh góc vuông thứ hai chưa gặp điểm ${currentDrawTask.targetPointLabel}! Hãy trượt ê ke chạm điểm ${currentDrawTask.targetPointLabel}.`
        );
      }
      return;
    }

    soundFX.playSuccess();
    const alreadyDone = completedDrawIds.includes(currentDrawTask.id);
    if (!alreadyDone) {
      setCompletedDrawIds((prev) => [...prev, currentDrawTask.id]);
      onRecordSuccess();
    }
    const [l1, l2] = currentDrawTask.drawnLineLabels;
    setDrawFeedback(
      `🎉 Xuất sắc! Em đã vẽ xong đường thẳng ${l1}${l2} đi qua điểm ${currentDrawTask.targetPointLabel} và vuông góc với đường thẳng ${currentDrawTask.line.nameVi}!${alreadyDone ? '' : ' (+1 Sao Vàng)'}`
    );
  };

  const handleResetDrawTask = () => {
    soundFX.playClick(0.95);
    setDrawSetSquare({ ...currentDrawTask.initialSetSquare });
    setCompletedDrawIds((prev) => prev.filter((id) => id !== currentDrawTask.id));
    setDrawFeedback('');
  };

  const handleSelectCheckShape = (id: CheckShapeId) => {
    soundFX.playClick();
    const shape = PERPENDICULAR_CHECK_TASKS.find((s) => s.id === id);
    if (!shape) return;
    setCheckShapeId(id);
    setCheckSetSquare({ ...shape.initialSetSquare });
    setActiveVertexId(null);
    setCheckFeedback(
      'Bấm vào từng nút đỉnh bên dưới hoặc trên hình để ướm nhanh góc vuông 90° của chiếc ê ke!'
    );
  };

  const handleSnapCheckVertex = (vertexId: string) => {
    const v = currentCheckTask.vertices.find((item) => item.id === vertexId);
    if (!v) return;
    setActiveVertexId(v.id);
    setCheckSetSquare({
      x: v.point.x,
      y: v.point.y,
      rotationDeg: v.snapRotationDeg,
    });

    const prevChecked = checkedVerticesByShape[currentCheckTask.id] || [];
    const nextChecked = prevChecked.includes(v.id) ? prevChecked : [...prevChecked, v.id];

    if (!prevChecked.includes(v.id)) {
      setCheckedVerticesByShape((prev) => ({
        ...prev,
        [currentCheckTask.id]: nextChecked,
      }));
      // Award star when all vertices of a shape have been checked
      if (nextChecked.length === currentCheckTask.vertices.length) {
        onRecordSuccess();
      }
    }

    if (v.isRightAngle) {
      soundFX.playSuccess();
      setCheckFeedback(`✅ GÓC VUÔNG (90°): ${v.pairNameVi}! Hai cạnh trùng khít 2 cạnh góc vuông của ê ke.`);
    } else {
      soundFX.playWrong();
      setCheckFeedback(`❌ KHÔNG VUÔNG GÓC: ${v.pairNameVi}. Hai cạnh không trùng khít góc vuông ê ke.`);
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
            CHỦ ĐỀ 2 · THỰC HÀNH Ê KE TƯƠNG TÁC
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            2. PHÒNG THÍ NGHIỆM Ê KE VÀ VẼ VUÔNG GÓC
          </h2>
        </div>

        <button
          type="button"
          onClick={onOpenGuide}
          className="btn-3d-gold px-4 py-2 rounded-xl text-sm font-extrabold cursor-pointer"
        >
          📖 Xem 2 bước vẽ ê ke
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
        <button
          type="button"
          data-testid="lab-mode-draw"
          onClick={() => {
            soundFX.playClick(1.1);
            setLabMode('draw');
          }}
          className={`py-3 px-4 rounded-2xl font-extrabold text-sm cursor-pointer transition-all ${
            labMode === 'draw'
              ? 'bg-pink-500 text-white shadow-lg border-2 border-yellow-300'
              : 'bg-[#130E38]/95 text-indigo-100 border-2 border-indigo-400/40 hover:border-pink-400'
          }`}
        >
          ✏️ Thực hành vẽ đường thẳng vuông góc
        </button>
        <button
          type="button"
          data-testid="lab-mode-check"
          onClick={() => {
            soundFX.playClick(1.1);
            setLabMode('check');
          }}
          className={`py-3 px-4 rounded-2xl font-extrabold text-sm cursor-pointer transition-all ${
            labMode === 'check'
              ? 'bg-emerald-500 text-slate-950 shadow-lg border-2 border-yellow-300'
              : 'bg-[#130E38]/95 text-indigo-100 border-2 border-indigo-400/40 hover:border-emerald-400'
          }`}
        >
          📐 Dùng ê ke kiểm tra góc vuông trên hình
        </button>
      </div>

      {/* ====================================================== */}
      {/* DRAW MODE CONTENT (BÀI 28 – 5 TEXTBOOK CASES)          */}
      {/* ====================================================== */}
      {labMode === 'draw' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 8 cols: Task selector + Interactive SVG Canvas */}
          <div className="lg:col-span-8 space-y-3">
            {/* 5 Exercise Selector Buttons */}
            <div className="flex flex-wrap gap-2">
              {PERPENDICULAR_DRAW_TASKS.map((task, idx) => {
                const active = task.id === drawTaskId;
                const done = completedDrawIds.includes(task.id);
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => handleSelectDrawTask(task.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 ${
                      active
                        ? 'bg-yellow-400 text-slate-950 shadow-md'
                        : done
                          ? 'bg-emerald-900/70 text-emerald-200 border border-emerald-400/60'
                          : 'bg-[#130E38]/95 text-indigo-100 border border-indigo-400/40 hover:border-yellow-300'
                    }`}
                  >
                    <span>{done ? '✅' : `Bài ${idx + 1}`}</span>
                    <span>
                      {idx === 0 && 'CD ngang (M trên CD)'}
                      {idx === 1 && 'CD nghiêng (M trên CD)'}
                      {idx === 2 && 'CD đứng (M ngoài CD)'}
                      {idx === 3 && 'Mẫu AB (H trên AB)'}
                      {idx === 4 && 'Mẫu AB (H ngoài AB)'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Interactive SVG Set Square Canvas */}
            <InteractiveSetSquareSVG
              mode="draw"
              drawTask={currentDrawTask}
              setSquare={drawSetSquare}
              onChangeSetSquare={setDrawSetSquare}
              hasDrawnPerp={hasDrawnCurrent}
              alignment={alignment}
            />

            {/* Quick Rotation Toolbar below Canvas */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#130E38]/95 border border-indigo-400/40 rounded-2xl p-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-indigo-200 mr-1">Xoay nhanh ê ke:</span>
                {[
                  { label: '↺ +15°', delta: 15 },
                  { label: '↺ +5°', delta: 5 },
                  { label: '↻ -5°', delta: -5 },
                  { label: '↻ -15°', delta: -15 },
                  { label: '↻ +90°', delta: 90 },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => handleRotateDrawEke(btn.delta)}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-950 border border-indigo-400/50 text-xs font-extrabold text-white hover:bg-indigo-800 cursor-pointer font-mono-num"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleResetDrawTask}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-500/50 text-xs font-extrabold text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                🔄 Làm lại bài này
              </button>
            </div>
          </div>

          {/* Right 4 cols: Live 2-Step Checklist & Action Controls */}
          <div className="lg:col-span-4 card-3d-cosmic rounded-3xl p-5 border-2 border-sky-400/60 space-y-4">
            <div>
              <div className="text-xs font-extrabold text-yellow-300 uppercase">
                {currentDrawTask.badgeVi}
              </div>
              <h3 className="text-lg font-extrabold text-white mt-1 leading-snug">
                {currentDrawTask.titleVi}
              </h3>
              <p className="text-xs text-indigo-200 mt-1.5 leading-relaxed">
                {currentDrawTask.instructionVi}
              </p>
            </div>

            {/* Live Alignment Checklist */}
            <div className="space-y-2">
              <div className="text-xs font-extrabold text-sky-300 uppercase">
                KIỂM TRA ĐẶT Ê KE TRỰC TIẾP:
              </div>
              <div
                className={`p-3 rounded-xl border text-xs font-bold flex items-start gap-2.5 ${
                  alignment.isLegOnLine
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    : 'bg-[#0B0826] border-indigo-500/40 text-indigo-200'
                }`}
              >
                <span className="text-base leading-none">{alignment.isLegOnLine ? '✅' : '1️⃣'}</span>
                <span>
                  Bước 1a: Đặt một cạnh góc vuông của ê ke trùng đường thẳng{' '}
                  <strong>{currentDrawTask.line.nameVi}</strong>
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border text-xs font-bold flex items-start gap-2.5 ${
                  alignment.isOtherLegAtPoint
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    : 'bg-[#0B0826] border-indigo-500/40 text-indigo-200'
                }`}
              >
                <span className="text-base leading-none">
                  {alignment.isOtherLegAtPoint ? '✅' : '2️⃣'}
                </span>
                <span>
                  Bước 1b: Cạnh góc vuông thứ hai của ê ke gặp điểm{' '}
                  <strong>{currentDrawTask.targetPointLabel}</strong>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                data-testid="snap-eke-btn"
                onClick={handleSnapSetSquare}
                className="btn-3d-gold w-full py-2.5 px-4 rounded-xl font-extrabold text-sm cursor-pointer"
              >
                🎯 Đặt chuẩn ê ke tự động (Bước 1)
              </button>

              <button
                type="button"
                data-testid="draw-perp-btn"
                onClick={handleDrawPerpLine}
                className={`w-full py-3 px-4 rounded-xl font-extrabold text-sm cursor-pointer transition-all ${
                  alignment.isFullyAligned
                    ? 'btn-3d-emerald'
                    : 'bg-indigo-950/90 text-indigo-200 border-2 border-indigo-400/50 hover:border-pink-400'
                }`}
              >
                ✏️ Vạch đường thẳng {currentDrawTask.drawnLineLabels.join('')} (Bước 2)
              </button>
            </div>

            {/* Live Feedback Banner */}
            {drawFeedback && (
              <div
                data-testid="draw-feedback"
                className={`p-3 rounded-2xl text-xs font-bold leading-relaxed border ${
                  hasDrawnCurrent || alignment.isFullyAligned
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100'
                    : 'bg-amber-500/20 border-amber-400 text-amber-100'
                }`}
              >
                {drawFeedback}
              </div>
            )}

            <div className="text-xs font-bold text-indigo-300 flex items-center justify-between border-t border-indigo-500/30 pt-3">
              <span>Đã hoàn thành thực hành vẽ:</span>
              <span className="font-mono-num text-yellow-300 font-extrabold">
                {completedDrawIds.length} / {PERPENDICULAR_DRAW_TASKS.length} bài
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* CHECK MODE CONTENT (BÀI 27 – 3 TEXTBOOK SHAPES)        */}
      {/* ====================================================== */}
      {labMode === 'check' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 8 cols: Shape Selector + Interactive Set Square Canvas */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap gap-2">
              {PERPENDICULAR_CHECK_TASKS.map((shape) => {
                const active = shape.id === checkShapeId;
                const checkedCount = (checkedVerticesByShape[shape.id] || []).length;
                const allDone = checkedCount === shape.vertices.length;
                return (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => handleSelectCheckShape(shape.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                      active
                        ? 'bg-yellow-400 text-slate-950 shadow-md'
                        : allDone
                          ? 'bg-emerald-900/70 text-emerald-200 border border-emerald-400/60'
                          : 'bg-[#130E38]/95 text-indigo-100 border border-indigo-400/40 hover:border-yellow-300'
                    }`}
                  >
                    {allDone ? '✅ ' : '📐 '}
                    {shape.id === 'pentagon_abcde' && 'Hình ngũ giác ABCDE'}
                    {shape.id === 'trapezoid_abcd' && 'Hình tứ giác ABCD'}
                    {shape.id === 'windmill_blades' && 'Cánh quạt cối xay gió'}
                  </button>
                );
              })}
            </div>

            <InteractiveSetSquareSVG
              mode="check"
              checkTask={currentCheckTask}
              setSquare={checkSetSquare}
              onChangeSetSquare={setCheckSetSquare}
              checkedVertexIds={checkedVertexIds}
              activeVertexId={activeVertexId}
              onSelectCheckVertex={handleSnapCheckVertex}
            />
          </div>

          {/* Right 4 cols: Vertex Check Buttons + Summary of Perpendicular vs Non-Perpendicular Pairs */}
          <div className="lg:col-span-4 card-3d-cosmic rounded-3xl p-5 border-2 border-emerald-400/60 space-y-4">
            <div>
              <div className="text-xs font-extrabold text-yellow-300 uppercase">
                {currentCheckTask.badgeVi}
              </div>
              <h3 className="text-lg font-extrabold text-white mt-1 leading-snug">
                {currentCheckTask.titleVi}
              </h3>
              <p className="text-xs text-indigo-200 mt-1.5 leading-relaxed">
                {currentCheckTask.instructionVi}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-extrabold text-sky-300 uppercase">
                BẤM CHỌN ĐỈNH ĐỂ ƯỚM NHANH Ê KE:
              </div>
              <div className="grid grid-cols-2 gap-2">
                {currentCheckTask.vertices.map((v) => {
                  const isChecked = checkedVertexIds.includes(v.id);
                  const isActive = activeVertexId === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSnapCheckVertex(v.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-extrabold cursor-pointer transition-all border ${
                        isActive
                          ? 'bg-yellow-400 text-slate-950 border-yellow-300 scale-[1.02]'
                          : isChecked
                            ? v.isRightAngle
                              ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400'
                              : 'bg-orange-500/25 text-orange-200 border-orange-400'
                            : 'bg-[#0B0826] text-white border-indigo-400/40 hover:border-yellow-400'
                      }`}
                    >
                      {isChecked ? (v.isRightAngle ? '✅ ' : '❌ ') : '📐 '}
                      {currentCheckTask.id === 'windmill_blades' ? v.label : `Đỉnh ${v.label}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Check Feedback */}
            <div className="p-3 rounded-2xl bg-[#0B0826] border border-indigo-400/40 text-xs font-bold text-indigo-100 leading-relaxed">
              {checkFeedback}
            </div>

            {/* Discovered Pairs Summary */}
            <div className="space-y-2 border-t border-indigo-500/30 pt-3">
              <div className="text-xs font-extrabold text-emerald-300">
                ✓ Các cặp vuông góc ({currentCheckTask.expectedRightPairsVi.length}):
              </div>
              <ul className="space-y-1 text-xs text-emerald-100 pl-1">
                {currentCheckTask.expectedRightPairsVi.map((pair) => (
                  <li key={pair}>• {pair}</li>
                ))}
              </ul>

              {currentCheckTask.nonRightPairsVi.length > 0 && (
                <>
                  <div className="text-xs font-extrabold text-orange-300 pt-1">
                    ✗ Các cặp cắt nhau không vuông góc ({currentCheckTask.nonRightPairsVi.length}):
                  </div>
                  <ul className="space-y-1 text-xs text-orange-100 pl-1">
                    {currentCheckTask.nonRightPairsVi.map((pair) => (
                      <li key={pair}>• {pair}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
