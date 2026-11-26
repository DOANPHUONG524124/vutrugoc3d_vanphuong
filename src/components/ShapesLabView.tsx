import React, { useMemo, useRef, useState } from 'react';
import {
  calculateParallelogramPerimeter,
  calculateRhombusPerimeter,
  computeParallelogramVertices,
  computeRhombusVertices,
  computeSafePxPerCm,
  evaluateShapesLabMission,
  getOutwardEdgeLabelPos,
  getOutwardVertexLabelPos,
  normalizeRotationDeg,
  rotatePoint2D,
  rotateQuadVertices,
  SHAPES_LAB_MISSIONS,
  ShapesLabMissionType,
} from '../utils/shapesMath';
import { soundFX } from '../utils/soundEffects';

interface ShapesLabViewProps {
  onBackHome: () => void;
  onCompleteLabAction: () => void;
}

type LabMode = 'sandbox' | 'missions';
type HighlightPair = 'both' | 'pair1' | 'pair2';

const CANVAS_CENTER = { x: 280, y: 170 };

export const ShapesLabView: React.FC<ShapesLabViewProps> = ({
  onBackHome,
  onCompleteLabAction,
}) => {
  const [labMode, setLabMode] = useState<LabMode>('sandbox');

  // Sandbox interactive state
  const [shapeType, setShapeType] = useState<ShapesLabMissionType>('parallelogram');
  const [paraSideA, setParaSideA] = useState<number>(6);
  const [paraSideB, setParaSideB] = useState<number>(4);
  const [paraTiltDeg, setParaTiltDeg] = useState<number>(65);

  const [rhombusSideA, setRhombusSideA] = useState<number>(5);
  const [rhombusAngleDeg, setRhombusAngleDeg] = useState<number>(65);
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [highlightPair, setHighlightPair] = useState<HighlightPair>('both');

  // Direct drag-to-rotate state on SVG canvas
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDraggingRotate, setIsDraggingRotate] = useState<boolean>(false);
  const dragStartRef = useRef<{ pointerAngleDeg: number; startRotationDeg: number } | null>(null);

  // Mission mode state
  const [missionIdx, setMissionIdx] = useState<number>(0);
  const currentMission = SHAPES_LAB_MISSIONS[missionIdx];
  const [missionSideA, setMissionSideA] = useState<number>(currentMission.initialSideA);
  const [missionSideB, setMissionSideB] = useState<number>(currentMission.initialSideB);
  const [missionAngleDeg, setMissionAngleDeg] = useState<number>(currentMission.initialAngleDeg);
  const [missionRotationDeg, setMissionRotationDeg] = useState<number>(0);
  const [missionFeedback, setMissionFeedback] = useState<{
    matched: boolean;
    text: string;
  } | null>(null);
  const [showMissionHint, setShowMissionHint] = useState<boolean>(false);
  const [completedMissions, setCompletedMissions] = useState<Record<string, boolean>>({});

  const activeShapeType: ShapesLabMissionType =
    labMode === 'sandbox' ? shapeType : currentMission.shapeType;
  const activeSideA =
    labMode === 'sandbox'
      ? shapeType === 'parallelogram'
        ? paraSideA
        : rhombusSideA
      : missionSideA;
  const activeSideB = labMode === 'sandbox' ? paraSideB : missionSideB;
  const activeAngleDeg =
    labMode === 'sandbox'
      ? shapeType === 'parallelogram'
        ? paraTiltDeg
        : rhombusAngleDeg
      : missionAngleDeg;
  const activeRotationDeg = labMode === 'sandbox' ? rotationDeg : missionRotationDeg;

  const updateActiveRotation = (nextDeg: number) => {
    const normalized = Math.round(normalizeRotationDeg(nextDeg));
    if (labMode === 'sandbox') {
      setRotationDeg(normalized);
    } else {
      setMissionRotationDeg(normalized);
    }
  };

  // Dynamic safe scale so rotated shapes NEVER clip outside the 560x340 canvas
  const pxPerCm = useMemo(
    () => computeSafePxPerCm(activeShapeType, activeSideA, activeSideB, activeAngleDeg, 108, 24),
    [activeShapeType, activeSideA, activeSideB, activeAngleDeg]
  );

  const vertices = useMemo(() => {
    const baseVerts =
      activeShapeType === 'parallelogram'
        ? computeParallelogramVertices(
            activeSideA,
            activeSideB,
            activeAngleDeg,
            CANVAS_CENTER.x,
            CANVAS_CENTER.y,
            pxPerCm
          )
        : computeRhombusVertices(
            activeSideA,
            activeAngleDeg,
            CANVAS_CENTER.x,
            CANVAS_CENTER.y,
            pxPerCm
          );
    return rotateQuadVertices(baseVerts, activeRotationDeg, CANVAS_CENTER.x, CANVAS_CENTER.y);
  }, [activeShapeType, activeSideA, activeSideB, activeAngleDeg, activeRotationDeg, pxPerCm]);

  // Direct on-canvas rotate handle sits neatly above the top of the unrotated shape and spins with it
  const rotateHandlePos = useMemo(
    () => rotatePoint2D({ x: CANVAS_CENTER.x, y: CANVAS_CENTER.y - 134 }, CANVAS_CENTER.x, CANVAS_CENTER.y, activeRotationDeg),
    [activeRotationDeg]
  );

  const getPointerAngleFromCenter = (clientX: number, clientY: number): number => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * 560;
    const svgY = ((clientY - rect.top) / rect.height) * 340;
    return (Math.atan2(svgY - CANVAS_CENTER.y, svgX - CANVAS_CENTER.x) * 180) / Math.PI;
  };

  const handleRotatePointerDown = (e: React.PointerEvent<SVGGElement>) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setIsDraggingRotate(true);
    dragStartRef.current = {
      pointerAngleDeg: getPointerAngleFromCenter(e.clientX, e.clientY),
      startRotationDeg: activeRotationDeg,
    };
    soundFX.playClick(1.1);
  };

  const handleRotatePointerMove = (e: React.PointerEvent<SVGGElement>) => {
    if (!isDraggingRotate || !dragStartRef.current) return;
    const currentPtrAngle = getPointerAngleFromCenter(e.clientX, e.clientY);
    const delta = currentPtrAngle - dragStartRef.current.pointerAngleDeg;
    const snapped = Math.round((dragStartRef.current.startRotationDeg + delta) / 5) * 5;
    updateActiveRotation(snapped);
  };

  const handleRotatePointerUp = (e: React.PointerEvent<SVGGElement>) => {
    if (!isDraggingRotate) return;
    if ((e.currentTarget as Element).hasPointerCapture(e.pointerId)) {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    }
    setIsDraggingRotate(false);
    dragStartRef.current = null;
  };

  const currentPerimeter =
    activeShapeType === 'parallelogram'
      ? calculateParallelogramPerimeter(activeSideA, activeSideB)
      : calculateRhombusPerimeter(activeSideA);

  const loadMission = (index: number) => {
    const m = SHAPES_LAB_MISSIONS[index];
    setMissionIdx(index);
    setMissionSideA(m.initialSideA);
    setMissionSideB(m.initialSideB);
    setMissionAngleDeg(m.initialAngleDeg);
    setMissionRotationDeg(0);
    setMissionFeedback(null);
    setShowMissionHint(false);
    setHighlightPair('both');
  };

  const handleCheckMission = () => {
    const result = evaluateShapesLabMission(currentMission, missionSideA, missionSideB);
    setMissionFeedback({ matched: result.isMatched, text: result.feedbackVi });
    if (result.isMatched) {
      soundFX.playSuccess();
      if (!completedMissions[currentMission.id]) {
        setCompletedMissions((prev) => ({ ...prev, [currentMission.id]: true }));
        onCompleteLabAction();
      }
    } else {
      soundFX.playWrong();
    }
  };

  // Outward edge badge positions that automatically stay crisp and non-overlapping at any 0..360° angle
  const lblAB = getOutwardEdgeLabelPos(vertices.A, vertices.B, CANVAS_CENTER, 24);
  const lblBC = getOutwardEdgeLabelPos(vertices.B, vertices.C, CANVAS_CENTER, 26);
  const lblCD = getOutwardEdgeLabelPos(vertices.C, vertices.D, CANVAS_CENTER, 24);
  const lblDA = getOutwardEdgeLabelPos(vertices.D, vertices.A, CANVAS_CENTER, 26);

  const vLabelA = getOutwardVertexLabelPos(vertices.A, CANVAS_CENTER, 19);
  const vLabelB = getOutwardVertexLabelPos(vertices.B, CANVAS_CENTER, 19);
  const vLabelC = getOutwardVertexLabelPos(vertices.C, CANVAS_CENTER, 19);
  const vLabelD = getOutwardVertexLabelPos(vertices.D, CANVAS_CENTER, 19);

  const completedCount = Object.keys(completedMissions).length;

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-4">
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
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            2. PHÒNG THÍ NGHIỆM KÉO CẠNH VÀ XOAY HÌNH
          </h2>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-[#130E38]/95 border border-indigo-400/50 rounded-2xl p-1">
          <button
            type="button"
            data-testid="shapes-lab-mode-sandbox"
            onClick={() => {
              soundFX.playClick();
              setLabMode('sandbox');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
              labMode === 'sandbox'
                ? 'bg-fuchsia-400 text-slate-950'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            🎚️ Tự do kéo xoay
          </button>
          <button
            type="button"
            data-testid="shapes-lab-mode-missions"
            onClick={() => {
              soundFX.playClick(1.1);
              setLabMode('missions');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer ${
              labMode === 'missions'
                ? 'bg-yellow-400 text-slate-950'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            🎯 6 Nhiệm vụ ({completedCount}/6)
          </button>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT: Interactive Live Geometry SVG Canvas */}
        <div className="lg:col-span-7 card-3d-cosmic rounded-3xl p-4 sm:p-5 border-2 border-fuchsia-400/60 flex flex-col justify-between gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-extrabold text-yellow-300">
              {activeShapeType === 'parallelogram'
                ? '🔷 HÌNH BÌNH HÀNH ABCD'
                : '💎 HÌNH THOI ABCD'}
              <span
                data-testid="shapes-lab-rotation-badge"
                className="ml-2 font-mono-num text-xs bg-amber-400/20 border border-amber-400/50 text-amber-200 px-2 py-0.5 rounded-lg"
              >
                Hướng xoay: {activeRotationDeg}°
              </span>
            </span>

            <div className="flex items-center gap-1.5">
              {[
                { id: 'both' as HighlightPair, label: 'Cả 2 cặp' },
                { id: 'pair1' as HighlightPair, label: 'AB và DC' },
                { id: 'pair2' as HighlightPair, label: 'AD và BC' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    soundFX.playClick(1.1);
                    setHighlightPair(p.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold cursor-pointer ${
                    highlightPair === p.id
                      ? 'bg-sky-400 text-slate-950'
                      : 'bg-indigo-950 text-indigo-200 border border-indigo-400/40'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Dynamic SVG Canvas with Direct Drag-to-Rotate Handle */}
          <div className="bg-[#090621] rounded-2xl p-2 border border-indigo-400/40 relative">
            <svg
              ref={svgRef}
              viewBox="0 0 560 340"
              className="w-full h-auto block touch-none"
              data-testid="shapes-lab-svg"
            >
              <defs>
                <pattern id="shapes-lab-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(129,140,248,0.16)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="560" height="340" rx="12" fill="url(#shapes-lab-grid)" />

              {/* Subtle rotation compass guide circle */}
              <circle
                cx={CANVAS_CENTER.x}
                cy={CANVAS_CENTER.y}
                r="134"
                fill="none"
                stroke="rgba(250,204,21,0.16)"
                strokeWidth="1.5"
                strokeDasharray="6 6"
              />
              <line
                x1={CANVAS_CENTER.x}
                y1={CANVAS_CENTER.y}
                x2={rotateHandlePos.x}
                y2={rotateHandlePos.y}
                stroke="rgba(250,204,21,0.35)"
                strokeWidth="1.8"
                strokeDasharray="4 4"
              />
              <circle cx={CANVAS_CENTER.x} cy={CANVAS_CENTER.y} r="3.5" fill="rgba(250,204,21,0.5)" />

              {/* Shape Fill */}
              <polygon
                points={`${vertices.A.x},${vertices.A.y} ${vertices.B.x},${vertices.B.y} ${vertices.C.x},${vertices.C.y} ${vertices.D.x},${vertices.D.y}`}
                fill={
                  activeShapeType === 'parallelogram'
                    ? 'rgba(56,189,248,0.18)'
                    : 'rgba(232,121,249,0.2)'
                }
              />

              {/* Pair 1: AB and DC */}
              <line
                x1={vertices.A.x}
                y1={vertices.A.y}
                x2={vertices.B.x}
                y2={vertices.B.y}
                stroke={highlightPair === 'both' || highlightPair === 'pair1' ? '#38BDF8' : '#64748B'}
                strokeWidth={highlightPair === 'both' || highlightPair === 'pair1' ? '6' : '3'}
                strokeLinecap="round"
              />
              <line
                x1={vertices.D.x}
                y1={vertices.D.y}
                x2={vertices.C.x}
                y2={vertices.C.y}
                stroke={highlightPair === 'both' || highlightPair === 'pair1' ? '#38BDF8' : '#64748B'}
                strokeWidth={highlightPair === 'both' || highlightPair === 'pair1' ? '6' : '3'}
                strokeLinecap="round"
              />

              {/* Pair 2: AD and BC */}
              <line
                x1={vertices.A.x}
                y1={vertices.A.y}
                x2={vertices.D.x}
                y2={vertices.D.y}
                stroke={highlightPair === 'both' || highlightPair === 'pair2' ? '#F472B6' : '#64748B'}
                strokeWidth={highlightPair === 'both' || highlightPair === 'pair2' ? '6' : '3'}
                strokeLinecap="round"
              />
              <line
                x1={vertices.B.x}
                y1={vertices.B.y}
                x2={vertices.C.x}
                y2={vertices.C.y}
                stroke={highlightPair === 'both' || highlightPair === 'pair2' ? '#F472B6' : '#64748B'}
                strokeWidth={highlightPair === 'both' || highlightPair === 'pair2' ? '6' : '3'}
                strokeLinecap="round"
              />

              {/* Outward Non-Overlapping Edge Length Badges (stay upright at every rotation angle) */}
              {activeShapeType === 'parallelogram' ? (
                <g>
                  <rect x={lblAB.x - 31} y={lblAB.y - 11} width="62" height="22" rx="7" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
                  <text x={lblAB.x} y={lblAB.y + 4} textAnchor="middle" fill="#7DD3FC" fontSize="12" fontWeight="900">
                    a = {activeSideA} cm
                  </text>

                  <rect x={lblCD.x - 26} y={lblCD.y - 11} width="52" height="22" rx="7" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
                  <text x={lblCD.x} y={lblCD.y + 4} textAnchor="middle" fill="#7DD3FC" fontSize="12" fontWeight="900">
                    {activeSideA} cm
                  </text>

                  <rect x={lblDA.x - 31} y={lblDA.y - 11} width="62" height="22" rx="7" fill="#0F172A" stroke="#F472B6" strokeWidth="1.5" />
                  <text x={lblDA.x} y={lblDA.y + 4} textAnchor="middle" fill="#F9A8D4" fontSize="12" fontWeight="900">
                    b = {activeSideB} cm
                  </text>

                  <rect x={lblBC.x - 26} y={lblBC.y - 11} width="52" height="22" rx="7" fill="#0F172A" stroke="#F472B6" strokeWidth="1.5" />
                  <text x={lblBC.x} y={lblBC.y + 4} textAnchor="middle" fill="#F9A8D4" fontSize="12" fontWeight="900">
                    {activeSideB} cm
                  </text>
                </g>
              ) : (
                <g>
                  {[
                    { pos: lblAB, stroke: '#38BDF8', fill: '#BAE6FD' },
                    { pos: lblBC, stroke: '#F472B6', fill: '#FBCFE8' },
                    { pos: lblCD, stroke: '#38BDF8', fill: '#BAE6FD' },
                    { pos: lblDA, stroke: '#F472B6', fill: '#FBCFE8' },
                  ].map((item, idx) => (
                    <g key={idx}>
                      <rect
                        x={item.pos.x - 26}
                        y={item.pos.y - 11}
                        width="52"
                        height="22"
                        rx="7"
                        fill="#0F172A"
                        stroke={item.stroke}
                        strokeWidth="1.5"
                      />
                      <text
                        x={item.pos.x}
                        y={item.pos.y + 4}
                        textAnchor="middle"
                        fill={item.fill}
                        fontSize="12"
                        fontWeight="900"
                      >
                        {activeSideA} cm
                      </text>
                    </g>
                  ))}
                </g>
              )}

              {/* Vertices A, B, C, D with outward upright letters */}
              {(
                [
                  { id: 'A', pt: vertices.A, lbl: vLabelA },
                  { id: 'B', pt: vertices.B, lbl: vLabelB },
                  { id: 'C', pt: vertices.C, lbl: vLabelC },
                  { id: 'D', pt: vertices.D, lbl: vLabelD },
                ] as const
              ).map((v) => (
                <g key={v.id}>
                  <circle cx={v.pt.x} cy={v.pt.y} r="5.5" fill="#FACC15" stroke="#0F172A" strokeWidth="2" />
                  <text
                    x={v.lbl.x}
                    y={v.lbl.y + 5}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="17"
                    fontWeight="900"
                  >
                    {v.id}
                  </text>
                </g>
              ))}

              {/* Interactive Direct-Drag Rotate Handle */}
              <g
                data-testid="shapes-canvas-rotate-handle"
                onPointerDown={handleRotatePointerDown}
                onPointerMove={handleRotatePointerMove}
                onPointerUp={handleRotatePointerUp}
                onPointerCancel={handleRotatePointerUp}
                className={isDraggingRotate ? 'cursor-grabbing' : 'cursor-grab'}
              >
                <circle
                  cx={rotateHandlePos.x}
                  cy={rotateHandlePos.y}
                  r="17"
                  fill={isDraggingRotate ? '#FACC15' : '#1E1B4B'}
                  stroke="#FACC15"
                  strokeWidth="2.8"
                />
                <text
                  x={rotateHandlePos.x}
                  y={rotateHandlePos.y + 5}
                  textAnchor="middle"
                  fill={isDraggingRotate ? '#0F172A' : '#FDE047'}
                  fontSize="15"
                  fontWeight="900"
                >
                  ↻
                </text>
              </g>

              {/* Corner instruction hint */}
              <text x="14" y="328" fill="rgba(253,224,71,0.85)" fontSize="11" fontWeight="700">
                💡 Kéo nút ↻ màu vàng trên hình hoặc dùng thanh trượt Xoay hình để xoay 360°!
              </text>
            </svg>
          </div>

          {/* Live Perimeter Formula Bar */}
          <div className="bg-gradient-to-r from-indigo-950 via-[#1A1348] to-indigo-950 border-2 border-yellow-400/60 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold text-indigo-200 uppercase">
                Công thức Chu vi (Lớp 4) · Luôn giữ nguyên dù xoay mọi hướng
              </div>
              <div
                data-testid="shapes-lab-perimeter-readout"
                className="text-lg sm:text-xl font-mono-num font-extrabold text-yellow-300"
              >
                {activeShapeType === 'parallelogram'
                  ? `P = (${activeSideA} + ${activeSideB}) × 2 = ${currentPerimeter} cm`
                  : `P = ${activeSideA} × 4 = ${currentPerimeter} cm`}
              </div>
            </div>
            <div className="text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/40 rounded-xl px-3 py-1.5">
              {activeShapeType === 'parallelogram'
                ? 'AB song song với DC · AD song song với BC'
                : '4 cạnh bằng nhau · Hai cặp cạnh song song'}
            </div>
          </div>
        </div>

        {/* RIGHT: Sliders Control Panel (Sandbox OR 6 Missions) */}
        <div className="lg:col-span-5 card-3d-cosmic rounded-3xl p-4 sm:p-5 border-2 border-indigo-400/60 flex flex-col justify-between gap-3.5">
          {labMode === 'sandbox' ? (
            <>
              <div className="space-y-3.5">
                <div>
                  <div className="text-xs font-extrabold text-sky-300 uppercase mb-2">
                    Bước 1: Chọn hình muốn thí nghiệm
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      data-testid="shapes-lab-select-parallelogram"
                      onClick={() => {
                        soundFX.playClick(1.05);
                        setShapeType('parallelogram');
                      }}
                      className={`py-2.5 px-3 rounded-xl font-extrabold text-sm cursor-pointer ${
                        shapeType === 'parallelogram'
                          ? 'bg-sky-400 text-slate-950 shadow-md'
                          : 'bg-indigo-950 text-indigo-200 border border-indigo-400/40'
                      }`}
                    >
                      🔷 Hình bình hành
                    </button>
                    <button
                      type="button"
                      data-testid="shapes-lab-select-rhombus"
                      onClick={() => {
                        soundFX.playClick(1.15);
                        setShapeType('rhombus');
                      }}
                      className={`py-2.5 px-3 rounded-xl font-extrabold text-sm cursor-pointer ${
                        shapeType === 'rhombus'
                          ? 'bg-fuchsia-400 text-slate-950 shadow-md'
                          : 'bg-indigo-950 text-indigo-200 border border-indigo-400/40'
                      }`}
                    >
                      💎 Hình thoi
                    </button>
                  </div>
                </div>

                {/* Edge Length & Tilt Sliders */}
                <div className="space-y-3 bg-[#090621] rounded-2xl p-3.5 border border-indigo-500/40">
                  <div className="text-xs font-extrabold text-yellow-300 uppercase">
                    Bước 2: Kéo thanh trượt điều chỉnh cạnh và góc nghiêng
                  </div>

                  {shapeType === 'parallelogram' ? (
                    <>
                      {/* Slider Side A */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="font-extrabold text-sky-300">
                            Cạnh đáy a (AB = DC):
                          </span>
                          <span className="font-mono-num font-extrabold text-white bg-sky-500/25 px-2.5 py-0.5 rounded-lg">
                            {paraSideA} cm
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const next = Math.max(2, paraSideA - 1);
                              soundFX.playTick(next * 15);
                              setParaSideA(next);
                            }}
                            className="w-7 h-7 rounded-lg bg-indigo-900 text-white font-extrabold cursor-pointer hover:bg-indigo-800"
                          >
                            −
                          </button>
                          <input
                            type="range"
                            data-testid="slider-para-a"
                            min={2}
                            max={10}
                            step={1}
                            value={paraSideA}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              soundFX.playTick(v * 15);
                              setParaSideA(v);
                            }}
                            className="flex-1 h-2.5 accent-sky-400 cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = Math.min(10, paraSideA + 1);
                              soundFX.playTick(next * 15);
                              setParaSideA(next);
                            }}
                            className="w-7 h-7 rounded-lg bg-indigo-900 text-white font-extrabold cursor-pointer hover:bg-indigo-800"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Slider Side B */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="font-extrabold text-pink-300">
                            Cạnh bên b (AD = BC):
                          </span>
                          <span className="font-mono-num font-extrabold text-white bg-pink-500/25 px-2.5 py-0.5 rounded-lg">
                            {paraSideB} cm
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const next = Math.max(2, paraSideB - 1);
                              soundFX.playTick(next * 18);
                              setParaSideB(next);
                            }}
                            className="w-7 h-7 rounded-lg bg-indigo-900 text-white font-extrabold cursor-pointer hover:bg-indigo-800"
                          >
                            −
                          </button>
                          <input
                            type="range"
                            data-testid="slider-para-b"
                            min={2}
                            max={8}
                            step={1}
                            value={paraSideB}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              soundFX.playTick(v * 18);
                              setParaSideB(v);
                            }}
                            className="flex-1 h-2.5 accent-pink-400 cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = Math.min(8, paraSideB + 1);
                              soundFX.playTick(next * 18);
                              setParaSideB(next);
                            }}
                            className="w-7 h-7 rounded-lg bg-indigo-900 text-white font-extrabold cursor-pointer hover:bg-indigo-800"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Tilt Angle Slider */}
                      <div className="space-y-1 pt-1 border-t border-indigo-500/30">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-amber-300">
                            Độ nghiêng góc D:
                          </span>
                          <span className="font-mono-num font-extrabold text-yellow-300">
                            {paraTiltDeg}°
                          </span>
                        </div>
                        <input
                          type="range"
                          data-testid="slider-para-tilt"
                          min={45}
                          max={135}
                          step={5}
                          value={paraTiltDeg}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            soundFX.playTick(v);
                            setParaTiltDeg(v);
                          }}
                          className="w-full h-2 accent-yellow-400 cursor-pointer"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Rhombus Side A Slider */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="font-extrabold text-fuchsia-300">
                            Độ dài 4 cạnh bằng nhau (a):
                          </span>
                          <span className="font-mono-num font-extrabold text-white bg-fuchsia-500/25 px-2.5 py-0.5 rounded-lg">
                            {rhombusSideA} cm
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const next = Math.max(2, rhombusSideA - 1);
                              soundFX.playTick(next * 15);
                              setRhombusSideA(next);
                            }}
                            className="w-7 h-7 rounded-lg bg-indigo-900 text-white font-extrabold cursor-pointer hover:bg-indigo-800"
                          >
                            −
                          </button>
                          <input
                            type="range"
                            data-testid="slider-rhombus-a"
                            min={2}
                            max={10}
                            step={1}
                            value={rhombusSideA}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              soundFX.playTick(v * 15);
                              setRhombusSideA(v);
                            }}
                            className="flex-1 h-2.5 accent-fuchsia-400 cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = Math.min(10, rhombusSideA + 1);
                              soundFX.playTick(next * 15);
                              setRhombusSideA(next);
                            }}
                            className="w-7 h-7 rounded-lg bg-indigo-900 text-white font-extrabold cursor-pointer hover:bg-indigo-800"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Rhombus Opening Angle Slider */}
                      <div className="space-y-1 pt-1 border-t border-indigo-500/30">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-amber-300">
                            Độ mở góc nhọn tại đỉnh A:
                          </span>
                          <span className="font-mono-num font-extrabold text-yellow-300">
                            {rhombusAngleDeg}°
                          </span>
                        </div>
                        <input
                          type="range"
                          data-testid="slider-rhombus-angle"
                          min={40}
                          max={120}
                          step={5}
                          value={rhombusAngleDeg}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            soundFX.playTick(v);
                            setRhombusAngleDeg(v);
                          }}
                          className="w-full h-2 accent-yellow-400 cursor-pointer"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Step 3: Rotate Shape 360° Panel */}
                <div className="space-y-2.5 bg-[#090621] rounded-2xl p-3.5 border border-emerald-400/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-300 uppercase">
                      🔄 Bước 3: Xoay hình nhiều hướng (0° – 360°)
                    </span>
                    <span
                      data-testid="slider-rotation-value"
                      className="font-mono-num text-xs font-extrabold text-yellow-300 bg-yellow-400/15 px-2 py-0.5 rounded-lg"
                    >
                      {rotationDeg}°
                    </span>
                  </div>

                  <input
                    type="range"
                    data-testid="slider-shape-rotation"
                    min={0}
                    max={360}
                    step={5}
                    value={rotationDeg}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      soundFX.playTick(v);
                      setRotationDeg(v);
                    }}
                    className="w-full h-2.5 accent-emerald-400 cursor-pointer"
                  />

                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { deg: 0, label: '0°' },
                      { deg: 45, label: '45°' },
                      { deg: 90, label: '90°' },
                      { deg: 180, label: '180°' },
                    ].map((preset) => (
                      <button
                        key={preset.deg}
                        type="button"
                        data-testid={`rotate-preset-${preset.deg}`}
                        onClick={() => {
                          soundFX.playSnap();
                          setRotationDeg(preset.deg);
                        }}
                        className={`py-1.5 rounded-lg font-mono-num text-xs font-extrabold cursor-pointer ${
                          rotationDeg === preset.deg
                            ? 'bg-emerald-400 text-slate-950'
                            : 'bg-indigo-950 text-indigo-100 border border-indigo-400/40 hover:bg-indigo-900'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      data-testid="rotate-step-30"
                      onClick={() => {
                        soundFX.playClick(1.15);
                        setRotationDeg((prev) => normalizeRotationDeg(prev + 30));
                      }}
                      className="py-1.5 rounded-lg text-xs font-extrabold bg-yellow-400/20 border border-yellow-400/60 text-yellow-200 cursor-pointer hover:bg-yellow-400/35"
                    >
                      ↻ +30°
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Pedagogical Discovery Box */}
              <div className="bg-emerald-500/15 border border-emerald-400/50 rounded-2xl p-3 text-xs text-emerald-100 leading-relaxed font-semibold">
                {rotationDeg === 0 ? (
                  <>
                    🧭 <span className="font-extrabold text-yellow-300">Thử xoay hình nhé:</span> Kéo nút{' '}
                    <span className="font-bold text-white">↻</span> trên hình hoặc thanh trượt xoay để thấy một{' '}
                    <span className="font-bold text-white">
                      {shapeType === 'parallelogram' ? 'hình bình hành' : 'hình thoi'}
                    </span>{' '}
                    có thể đặt theo nhiều hướng khác nhau!
                  </>
                ) : (
                  <>
                    ✨ <span className="font-extrabold text-yellow-300">Khám phá tuyệt vời ({rotationDeg}°):</span> Dù xoay nằm ngang, dựng đứng hay đặt nghiêng, đây vẫn là{' '}
                    <span className="font-bold text-white">
                      {shapeType === 'parallelogram' ? 'Hình bình hành' : 'Hình thoi'}
                    </span>{' '}
                    vì các cặp cạnh đối diện vẫn song song, độ dài cạnh và{' '}
                    <span className="font-bold text-yellow-200">CHU VI không đổi</span>!
                  </>
                )}
              </div>
            </>
          ) : (
            /* MODE 2: 6 SLIDER CONSTRUCTION MISSIONS */
            <>
              <div className="space-y-3">
                {/* Mission Selector Pills */}
                <div className="grid grid-cols-6 gap-1.5">
                  {SHAPES_LAB_MISSIONS.map((m, idx) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        loadMission(idx);
                      }}
                      className={`py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                        idx === missionIdx
                          ? 'bg-yellow-400 text-slate-950'
                          : completedMissions[m.id]
                            ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/60'
                            : 'bg-indigo-950 text-indigo-200 border border-indigo-400/40'
                      }`}
                    >
                      {completedMissions[m.id] ? '✓' : idx + 1}
                    </button>
                  ))}
                </div>

                <div className="bg-[#090621] rounded-2xl p-4 border border-yellow-400/40 space-y-2">
                  <div className="text-xs font-extrabold text-fuchsia-300 uppercase">
                    {currentMission.badgeVi}
                  </div>
                  <div className="text-base font-extrabold text-white">
                    {currentMission.titleVi}
                  </div>
                  <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                    {currentMission.promptVi}
                  </p>
                </div>

                {/* Mission Sliders + Rotation */}
                <div className="bg-[#090621] rounded-2xl p-4 border border-indigo-500/40 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-extrabold text-sky-300">
                        {currentMission.shapeType === 'parallelogram'
                          ? 'Kéo cạnh đáy a:'
                          : 'Kéo độ dài 4 cạnh a:'}
                      </span>
                      <span className="font-mono-num font-extrabold text-white">
                        {missionSideA} cm
                      </span>
                    </div>
                    <input
                      type="range"
                      data-testid="mission-slider-a"
                      min={2}
                      max={10}
                      step={1}
                      value={missionSideA}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        soundFX.playTick(v * 15);
                        setMissionSideA(v);
                        setMissionFeedback(null);
                      }}
                      className="w-full h-2.5 accent-sky-400 cursor-pointer"
                    />
                  </div>

                  {currentMission.shapeType === 'parallelogram' && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-extrabold text-pink-300">Kéo cạnh bên b:</span>
                        <span className="font-mono-num font-extrabold text-white">
                          {missionSideB} cm
                        </span>
                      </div>
                      <input
                        type="range"
                        data-testid="mission-slider-b"
                        min={2}
                        max={8}
                        step={1}
                        value={missionSideB}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          soundFX.playTick(v * 18);
                          setMissionSideB(v);
                          setMissionFeedback(null);
                        }}
                        className="w-full h-2.5 accent-pink-400 cursor-pointer"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-indigo-500/30">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-300">Độ nghiêng:</span>
                        <span className="font-mono-num font-bold text-yellow-300">
                          {missionAngleDeg}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min={45}
                        max={120}
                        step={5}
                        value={missionAngleDeg}
                        onChange={(e) => setMissionAngleDeg(Number(e.target.value))}
                        className="w-full h-2 accent-yellow-400 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-300">🔄 Xoay hình:</span>
                        <span className="font-mono-num font-bold text-emerald-200">
                          {missionRotationDeg}°
                        </span>
                      </div>
                      <input
                        type="range"
                        data-testid="mission-slider-rotation"
                        min={0}
                        max={360}
                        step={5}
                        value={missionRotationDeg}
                        onChange={(e) => setMissionRotationDeg(Number(e.target.value))}
                        className="w-full h-2 accent-emerald-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {showMissionHint && (
                  <div className="bg-amber-500/15 border border-yellow-400/50 rounded-xl p-3 text-xs text-yellow-100 font-semibold">
                    💡 Gợi ý: {currentMission.hintVi}
                  </div>
                )}

                {missionFeedback && (
                  <div
                    data-testid="shapes-lab-feedback"
                    className={`rounded-xl p-3 text-xs sm:text-sm font-bold border ${
                      missionFeedback.matched
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100'
                        : 'bg-rose-500/20 border-rose-400 text-rose-100'
                    }`}
                  >
                    {missionFeedback.text}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  data-testid="shapes-lab-check-btn"
                  onClick={handleCheckMission}
                  className="btn-3d-emerald flex-1 py-2.5 px-4 rounded-xl font-extrabold text-sm cursor-pointer"
                >
                  ✅ Kiểm tra kết quả
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setShowMissionHint((v) => !v);
                  }}
                  className="btn-3d-cobalt py-2.5 px-3.5 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer"
                >
                  💡 Gợi ý
                </button>
                {missionIdx < SHAPES_LAB_MISSIONS.length - 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick(1.1);
                      loadMission(missionIdx + 1);
                    }}
                    className="btn-3d-gold py-2.5 px-3.5 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer"
                  >
                    Tiếp →
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
