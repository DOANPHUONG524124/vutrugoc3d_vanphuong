import React, { useMemo, useRef, useState } from 'react';
import {
  CheckShapeTask,
  computePerpendicularLineEndpoints,
  evaluateSetSquareAlignment,
  mathDegToSvgUnit,
  normalizeDeg360,
  PerpendicularDrawTask,
  SetSquareAlignmentResult,
  SetSquareState,
} from '../utils/perpendicularMath';
import { soundFX } from '../utils/soundEffects';

export interface InteractiveSetSquareSVGProps {
  mode: 'draw' | 'check';
  drawTask?: PerpendicularDrawTask;
  checkTask?: CheckShapeTask;
  setSquare: SetSquareState;
  onChangeSetSquare: (next: SetSquareState) => void;
  hasDrawnPerp?: boolean;
  checkedVertexIds?: string[];
  activeVertexId?: string | null;
  onSelectCheckVertex?: (vertexId: string) => void;
  alignment?: SetSquareAlignmentResult;
}

const SVG_W = 780;
const SVG_H = 460;
const LEG1_LEN = 145;
const LEG2_LEN = 180;

/**
 * Helper to draw a crisp square right-angle marker at vertex (vx, vy)
 * given two unit direction vectors u1 and u2 (in SVG coordinates).
 */
function buildRightAngleSquarePath(
  vx: number,
  vy: number,
  u1: { x: number; y: number },
  u2: { x: number; y: number },
  size = 16
): string {
  const p1x = vx + u1.x * size;
  const p1y = vy + u1.y * size;
  const p2x = vx + (u1.x + u2.x) * size;
  const p2y = vy + (u1.y + u2.y) * size;
  const p3x = vx + u2.x * size;
  const p3y = vy + u2.y * size;
  return `M ${p1x.toFixed(1)} ${p1y.toFixed(1)} L ${p2x.toFixed(1)} ${p2y.toFixed(1)} L ${p3x.toFixed(1)} ${p3y.toFixed(1)}`;
}

export const InteractiveSetSquareSVG: React.FC<InteractiveSetSquareSVGProps> = ({
  mode,
  drawTask,
  checkTask,
  setSquare,
  onChangeSetSquare,
  hasDrawnPerp = false,
  checkedVertexIds = [],
  activeVertexId = null,
  onSelectCheckVertex,
  alignment,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragMode, setDragMode] = useState<'none' | 'move' | 'rotate'>('none');
  const dragOffsetRef = useRef({ dx: 0, dy: 0 });
  const rotateStartRef = useRef({ pointerAngle: 0, initialRot: 0 });

  const computedAlignment = useMemo(() => {
    if (alignment) return alignment;
    if (mode === 'draw' && drawTask) {
      return evaluateSetSquareAlignment(
        setSquare,
        drawTask.line,
        drawTask.targetPoint,
        LEG1_LEN,
        LEG2_LEN
      );
    }
    return undefined;
  }, [alignment, mode, drawTask, setSquare]);

  const perpResult = useMemo(() => {
    if (mode !== 'draw' || !drawTask) return null;
    return computePerpendicularLineEndpoints(drawTask.line, drawTask.targetPoint, 160);
  }, [mode, drawTask]);

  const getSvgPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * SVG_W,
      y: ((clientY - rect.top) / rect.height) * SVG_H,
    };
  };

  const handleStartMove = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const pt = getSvgPoint(e.clientX, e.clientY);
    dragOffsetRef.current = {
      dx: pt.x - setSquare.x,
      dy: pt.y - setSquare.y,
    };
    setDragMode('move');
    soundFX.playClick(1.1);
  };

  const handleStartRotate = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const pt = getSvgPoint(e.clientX, e.clientY);
    const pointerAngle = (Math.atan2(-(pt.y - setSquare.y), pt.x - setSquare.x) * 180) / Math.PI;
    rotateStartRef.current = {
      pointerAngle,
      initialRot: setSquare.rotationDeg,
    };
    setDragMode('rotate');
    soundFX.playClick(1.25);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragMode === 'none') return;
    const pt = getSvgPoint(e.clientX, e.clientY);
    if (dragMode === 'move') {
      const nextX = Math.max(40, Math.min(SVG_W - 40, pt.x - dragOffsetRef.current.dx));
      const nextY = Math.max(40, Math.min(SVG_H - 40, pt.y - dragOffsetRef.current.dy));
      onChangeSetSquare({
        ...setSquare,
        x: Math.round(nextX),
        y: Math.round(nextY),
      });
    } else if (dragMode === 'rotate') {
      const pointerAngle = (Math.atan2(-(pt.y - setSquare.y), pt.x - setSquare.x) * 180) / Math.PI;
      const delta = pointerAngle - rotateStartRef.current.pointerAngle;
      let nextRot = normalizeDeg360(rotateStartRef.current.initialRot + delta);
      // Gentle magnetic snap to clean 15° steps when within 2.5°
      const nearest15 = Math.round(nextRot / 15) * 15;
      if (Math.abs(nextRot - nearest15) < 2.5) {
        nextRot = normalizeDeg360(nearest15);
      }
      onChangeSetSquare({
        ...setSquare,
        rotationDeg: Math.round(nextRot * 10) / 10,
      });
    }
  };

  const handlePointerUp = () => {
    if (dragMode !== 'none') {
      setDragMode('none');
    }
  };

  // Compute rotation handle position in SVG world space (beyond the top of leg2)
  const leg2Unit = mathDegToSvgUnit(setSquare.rotationDeg + 90);
  const rotateKnobPos = {
    x: setSquare.x + leg2Unit.x * (LEG2_LEN + 20),
    y: setSquare.y + leg2Unit.y * (LEG2_LEN + 20),
  };
  const isLabelUpsideDown = setSquare.rotationDeg > 95 && setSquare.rotationDeg < 265;

  // Ticks along leg1 and leg2 (local coords)
  const leg1Ticks = useMemo(() => {
    const arr: { pos: number; major: boolean; label?: string }[] = [];
    for (let i = 15; i <= LEG1_LEN - 15; i += 10) {
      const major = (i - 15) % 30 === 0;
      arr.push({
        pos: i,
        major,
        label: major ? String((i - 15) / 30 + 1) : undefined,
      });
    }
    return arr;
  }, []);

  const leg2Ticks = useMemo(() => {
    const arr: { pos: number; major: boolean; label?: string }[] = [];
    for (let i = 15; i <= LEG2_LEN - 20; i += 10) {
      const major = (i - 15) % 30 === 0;
      arr.push({
        pos: i,
        major,
        label: major ? String((i - 15) / 30 + 1) : undefined,
      });
    }
    return arr;
  }, []);

  // Build crisp right-angle marker for drawn line in Draw Mode
  const drawnRightAnglePath = useMemo(() => {
    if (!drawTask || !perpResult) return '';
    const lineDx = drawTask.line.p2.x - drawTask.line.p1.x;
    const lineDy = drawTask.line.p2.y - drawTask.line.p1.y;
    const lineLen = Math.hypot(lineDx, lineDy) || 1;
    const uLine = { x: lineDx / lineLen, y: lineDy / lineLen };
    const perpDx = perpResult.start.x - perpResult.foot.x;
    const perpDy = perpResult.start.y - perpResult.foot.y;
    const perpLen = Math.hypot(perpDx, perpDy) || 1;
    const uPerp = { x: perpDx / perpLen, y: perpDy / perpLen };
    return buildRightAngleSquarePath(perpResult.foot.x, perpResult.foot.y, uLine, uPerp, 18);
  }, [drawTask, perpResult]);

  // Helper to extend a line slightly past p1 and p2 for textbook look
  const extendedBaseLine = useMemo(() => {
    if (!drawTask) return null;
    const { p1, p2 } = drawTask.line;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    return {
      x1: p1.x - ux * 36,
      y1: p1.y - uy * 36,
      x2: p2.x + ux * 36,
      y2: p2.y + uy * 36,
    };
  }, [drawTask]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#0A0724] border-2 border-indigo-400/50 shadow-2xl select-none touch-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full h-auto block"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <defs>
          <pattern id="cosmic-grid-eke" width="32" height="32" patternUnits="userSpaceOnUse">
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="rgba(129, 140, 248, 0.14)"
              strokeWidth="1"
            />
          </pattern>
          <linearGradient id="eke-body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.48" />
          </linearGradient>
          <linearGradient id="eke-aligned-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.52" />
          </linearGradient>
          <filter id="glow-perp-red" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Grid */}
        <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#cosmic-grid-eke)" />

        {/* Subtle Top-left Canvas Legend */}
        <text x="18" y="28" fill="#A5B4FC" fontSize="13" fontWeight="700">
          {mode === 'draw'
            ? 'Kéo thân ê ke để di chuyển · Kéo nút vàng xoay ê ke · Đặt đúng 2 cạnh góc vuông!'
            : 'Kéo ê ke vào từng đỉnh hoặc bấm nút đỉnh để kiểm tra góc vuông 90°!'}
        </text>

        {/* ======================================================= */}
        {/* MODE 1: DRAW PERPENDICULAR LINE (BÀI 28 – 1a & 1b)      */}
        {/* ======================================================= */}
        {mode === 'draw' && drawTask && extendedBaseLine && perpResult && (
          <g>
            {/* Base Line (AB or CD) */}
            <line
              x1={extendedBaseLine.x1}
              y1={extendedBaseLine.y1}
              x2={extendedBaseLine.x2}
              y2={extendedBaseLine.y2}
              stroke={computedAlignment?.isLegOnLine ? '#34D399' : '#F8FAFC'}
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* Base Line Endpoints & Labels */}
            <circle cx={drawTask.line.p1.x} cy={drawTask.line.p1.y} r="5.5" fill="#FACC15" />
            <text
              x={drawTask.line.p1.x - 16}
              y={drawTask.line.p1.y + 24}
              fill="#FDE047"
              fontSize="20"
              fontWeight="800"
            >
              {drawTask.line.label1}
            </text>

            <circle cx={drawTask.line.p2.x} cy={drawTask.line.p2.y} r="5.5" fill="#FACC15" />
            <text
              x={drawTask.line.p2.x + 12}
              y={drawTask.line.p2.y + 24}
              fill="#FDE047"
              fontSize="20"
              fontWeight="800"
            >
              {drawTask.line.label2}
            </text>

            {/* Target Point (M or H) */}
            <circle
              cx={drawTask.targetPoint.x}
              cy={drawTask.targetPoint.y}
              r="14"
              fill={computedAlignment?.isOtherLegAtPoint ? 'rgba(52,211,153,0.28)' : 'rgba(244,114,182,0.25)'}
            />
            <circle
              cx={drawTask.targetPoint.x}
              cy={drawTask.targetPoint.y}
              r="6.5"
              fill={computedAlignment?.isOtherLegAtPoint ? '#34D399' : '#F472B6'}
              stroke="#FFFFFF"
              strokeWidth="2"
            />

            {/* Dashed preview line when aligned before drawing */}
            {computedAlignment?.isFullyAligned && !hasDrawnPerp && (
              <line
                x1={perpResult.start.x}
                y1={perpResult.start.y}
                x2={perpResult.end.x}
                y2={perpResult.end.y}
                stroke="#FACC15"
                strokeWidth="3"
                strokeDasharray="8 6"
                opacity="0.85"
              />
            )}

            {/* Drawn Perpendicular Line (Red/Coral Glowing Line with Crisp Right-Angle Square) */}
            {hasDrawnPerp && (
              <g filter="url(#glow-perp-red)">
                <line
                  x1={perpResult.start.x}
                  y1={perpResult.start.y}
                  x2={perpResult.end.x}
                  y2={perpResult.end.y}
                  stroke="#FB7185"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* Crisp square right-angle marker at foot of perpendicular */}
                <path
                  d={drawnRightAnglePath}
                  fill="none"
                  stroke="#FACC15"
                  strokeWidth="3.2"
                  strokeLinejoin="miter"
                />
                {/* Labels for drawn line (H, K or C, D) offset to left side with dark halo */}
                <circle
                  cx={perpResult.foot.x + (perpResult.start.x - perpResult.foot.x) * 0.72}
                  cy={perpResult.foot.y + (perpResult.start.y - perpResult.foot.y) * 0.72}
                  r="4.5"
                  fill="#FB7185"
                  stroke="#FFF"
                  strokeWidth="1.5"
                />
                <text
                  x={perpResult.foot.x + (perpResult.start.x - perpResult.foot.x) * 0.78 - 22}
                  y={perpResult.foot.y + (perpResult.start.y - perpResult.foot.y) * 0.78 + 6}
                  fill="#FDA4AF"
                  stroke="#0A0724"
                  strokeWidth="4"
                  paintOrder="stroke"
                  fontSize="22"
                  fontWeight="900"
                >
                  {drawTask.drawnLineLabels[0]}
                </text>

                <circle
                  cx={perpResult.foot.x + (perpResult.end.x - perpResult.foot.x) * 0.72}
                  cy={perpResult.foot.y + (perpResult.end.y - perpResult.foot.y) * 0.72}
                  r="4.5"
                  fill="#FB7185"
                  stroke="#FFF"
                  strokeWidth="1.5"
                />
                <text
                  x={perpResult.foot.x + (perpResult.end.x - perpResult.foot.x) * 0.78 - 22}
                  y={perpResult.foot.y + (perpResult.end.y - perpResult.foot.y) * 0.78 + 6}
                  fill="#FDA4AF"
                  stroke="#0A0724"
                  strokeWidth="4"
                  paintOrder="stroke"
                  fontSize="22"
                  fontWeight="900"
                >
                  {drawTask.drawnLineLabels[1]}
                </text>
              </g>
            )}
          </g>
        )}

        {/* ======================================================= */}
        {/* MODE 2: CHECK RIGHT ANGLES ON TEXTBOOK SHAPES (BÀI 27)  */}
        {/* ======================================================= */}
        {mode === 'check' && checkTask && (
          <g>
            {/* Shape 1: Pentagon ABCDE (Bài 27 Hoạt động 2) */}
            {checkTask.id === 'pentagon_abcde' && (
              <g>
                <polygon
                  points="230,280 310,141.4 520,141.4 520,326.4 310,326.4"
                  fill="rgba(99, 102, 241, 0.16)"
                  stroke="#E2E8F0"
                  strokeWidth="4"
                  strokeLinejoin="miter"
                />
                {/* Revealed Crisp Right-Angle Squares at A, C, D */}
                {checkedVertexIds.includes('A') && (
                  <path
                    d={buildRightAngleSquarePath(
                      230,
                      280,
                      mathDegToSvgUnit(60),
                      mathDegToSvgUnit(330),
                      18
                    )}
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="3.5"
                  />
                )}
                {checkedVertexIds.includes('C') && (
                  <path
                    d={buildRightAngleSquarePath(
                      520,
                      141.4,
                      mathDegToSvgUnit(180),
                      mathDegToSvgUnit(270),
                      18
                    )}
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="3.5"
                  />
                )}
                {checkedVertexIds.includes('D') && (
                  <path
                    d={buildRightAngleSquarePath(
                      520,
                      326.4,
                      mathDegToSvgUnit(90),
                      mathDegToSvgUnit(180),
                      18
                    )}
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="3.5"
                  />
                )}
              </g>
            )}

            {/* Shape 2: Right Trapezoid ABCD (Bài 27 Luyện tập 2) */}
            {checkTask.id === 'trapezoid_abcd' && (
              <g>
                <polygon
                  points="240,150 440,150 590,300 240,300"
                  fill="rgba(56, 189, 248, 0.14)"
                  stroke="#E2E8F0"
                  strokeWidth="4"
                  strokeLinejoin="miter"
                />
                {checkedVertexIds.includes('A') && (
                  <path
                    d={buildRightAngleSquarePath(
                      240,
                      150,
                      mathDegToSvgUnit(0),
                      mathDegToSvgUnit(270),
                      18
                    )}
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="3.5"
                  />
                )}
                {checkedVertexIds.includes('D') && (
                  <path
                    d={buildRightAngleSquarePath(
                      240,
                      300,
                      mathDegToSvgUnit(0),
                      mathDegToSvgUnit(90),
                      18
                    )}
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="3.5"
                  />
                )}
              </g>
            )}

            {/* Shape 3: Windmill Crossed Blades (Bài 27 Hoạt động 3) */}
            {checkTask.id === 'windmill_blades' && (
              <g>
                {/* Decorative windmill tower silhouette behind blades */}
                <polygon
                  points="350,415 370,245 410,245 430,415"
                  fill="rgba(148,163,184,0.22)"
                  stroke="rgba(148,163,184,0.5)"
                  strokeWidth="2"
                />
                <polygon
                  points="355,250 390,205 425,250"
                  fill="rgba(249,115,22,0.45)"
                  stroke="#FB923C"
                  strokeWidth="2"
                />
                {/* Crossed Perpendicular Windmill Blades at O (390, 235), tilted 45° and 135° */}
                <line
                  x1={390 - 130}
                  y1={235 - 130}
                  x2={390 + 130}
                  y2={235 + 130}
                  stroke="#FDBA74"
                  strokeWidth="12"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                <line
                  x1={390 - 130}
                  y1={235 + 130}
                  x2={390 + 130}
                  y2={235 - 130}
                  stroke="#FDBA74"
                  strokeWidth="12"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                <line
                  x1={390 - 145}
                  y1={235 - 145}
                  x2={390 + 145}
                  y2={235 + 145}
                  stroke="#FFF"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                />
                <line
                  x1={390 - 145}
                  y1={235 + 145}
                  x2={390 + 145}
                  y2={235 - 145}
                  stroke="#FFF"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                />
                {/* Crisp Right-Angle Squares for the 4 quadrants around O */}
                {checkedVertexIds.includes('O1') && (
                  <path
                    d={buildRightAngleSquarePath(
                      390,
                      235,
                      mathDegToSvgUnit(45),
                      mathDegToSvgUnit(135),
                      20
                    )}
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="3.5"
                  />
                )}
                {checkedVertexIds.includes('O2') && (
                  <path
                    d={buildRightAngleSquarePath(
                      390,
                      235,
                      mathDegToSvgUnit(315),
                      mathDegToSvgUnit(45),
                      20
                    )}
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="3.5"
                  />
                )}
                {checkedVertexIds.includes('O3') && (
                  <path
                    d={buildRightAngleSquarePath(
                      390,
                      235,
                      mathDegToSvgUnit(225),
                      mathDegToSvgUnit(315),
                      20
                    )}
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="3.5"
                  />
                )}
                {checkedVertexIds.includes('O4') && (
                  <path
                    d={buildRightAngleSquarePath(
                      390,
                      235,
                      mathDegToSvgUnit(135),
                      mathDegToSvgUnit(225),
                      20
                    )}
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="3.5"
                  />
                )}
                <circle cx="390" cy="235" r="8" fill="#F97316" stroke="#FFFFFF" strokeWidth="2.5" />
                <text x="410" y="241" fill="#FDE047" fontSize="20" fontWeight="900">
                  O
                </text>
              </g>
            )}

            {/* Clickable Vertex Markers (for pentagon & trapezoid) */}
            {checkTask.id !== 'windmill_blades' &&
              checkTask.vertices.map((v) => {
                const isChecked = checkedVertexIds.includes(v.id);
                const isActive = activeVertexId === v.id;
                const fillColor = isChecked
                  ? v.isRightAngle
                    ? '#10B981'
                    : '#F97316'
                  : isActive
                    ? '#FACC15'
                    : '#38BDF8';
                // Position label slightly away from center (380, 230)
                const dx = v.point.x - 380;
                const dy = v.point.y - 230;
                const len = Math.hypot(dx, dy) || 1;
                const lx = v.point.x + (dx / len) * 28;
                const ly = v.point.y + (dy / len) * 28 + 6;
                return (
                  <g
                    key={v.id}
                    className="cursor-pointer"
                    onClick={() => onSelectCheckVertex?.(v.id)}
                  >
                    <circle
                      cx={v.point.x}
                      cy={v.point.y}
                      r={isActive ? 17 : 13}
                      fill={fillColor}
                      fillOpacity="0.25"
                    />
                    <circle
                      cx={v.point.x}
                      cy={v.point.y}
                      r="7"
                      fill={fillColor}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    <text
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="21"
                      fontWeight="900"
                    >
                      {v.label}
                    </text>
                  </g>
                );
              })}
          </g>
        )}

        {/* ======================================================= */}
        {/* INTERACTIVE DRAGGABLE & ROTATABLE SET SQUARE (Ê KE)     */}
        {/* ======================================================= */}
        <g
          transform={`translate(${setSquare.x}, ${setSquare.y}) rotate(${-setSquare.rotationDeg})`}
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={handleStartMove}
        >
          {/* Outer Triangle + Inner Cutout (Even-Odd Fill) */}
          <path
            d={`M 0 0 L ${LEG1_LEN} 0 L 0 ${-LEG2_LEN} Z M 26 -26 L ${LEG1_LEN - 54} -26 L 26 ${-(LEG2_LEN - 66)} Z`}
            fillRule="evenodd"
            fill={
              computedAlignment?.isFullyAligned
                ? 'url(#eke-aligned-grad)'
                : 'url(#eke-body-grad)'
            }
            stroke={computedAlignment?.isFullyAligned ? '#6EE7B7' : '#7DD3FC'}
            strokeWidth="3"
            strokeLinejoin="miter"
          />

          {/* Crisp 90° Right-Angle Square Indicator at Corner (0,0) */}
          <path
            d="M 18 0 L 18 -18 L 0 -18"
            fill="rgba(250, 204, 21, 0.25)"
            stroke="#FACC15"
            strokeWidth="2.6"
          />
          <text x="5" y="-4" fill="#FEF08A" fontSize="9.5" fontWeight="900">
            90°
          </text>

          {/* Highlighted Leg 1 Edge (0,0 -> LEG1_LEN,0) */}
          <line
            x1="0"
            y1="0"
            x2={LEG1_LEN}
            y2="0"
            stroke={
              computedAlignment?.isLegOnLine && computedAlignment.alignedLeg === 1
                ? '#34D399'
                : '#E0F2FE'
            }
            strokeWidth="3.5"
          />

          {/* Highlighted Leg 2 Edge (0,0 -> 0,-LEG2_LEN) */}
          <line
            x1="0"
            y1="0"
            x2="0"
            y2={-LEG2_LEN}
            stroke={
              computedAlignment?.isOtherLegAtPoint ||
              (computedAlignment?.isLegOnLine && computedAlignment.alignedLeg === 2)
                ? '#FACC15'
                : '#E0F2FE'
            }
            strokeWidth="3.5"
          />

          {/* Tick Marks on Leg 1 */}
          {leg1Ticks.map((t, i) => (
            <g key={`t1-${i}`}>
              <line
                x1={t.pos}
                y1="0"
                x2={t.pos}
                y2={t.major ? -11 : -6}
                stroke="#FFFFFF"
                strokeWidth={t.major ? '1.8' : '1.1'}
                opacity="0.9"
              />
              {t.label && (
                <text
                  x={t.pos}
                  y="-14"
                  textAnchor="middle"
                  fill="#F8FAFC"
                  fontSize="9"
                  fontWeight="700"
                >
                  {t.label}
                </text>
              )}
            </g>
          ))}

          {/* Tick Marks on Leg 2 */}
          {leg2Ticks.map((t, i) => (
            <g key={`t2-${i}`}>
              <line
                x1="0"
                y1={-t.pos}
                x2={t.major ? 11 : 6}
                y2={-t.pos}
                stroke="#FFFFFF"
                strokeWidth={t.major ? '1.8' : '1.1'}
                opacity="0.9"
              />
              {t.label && (
                <text
                  x="15"
                  y={-t.pos + 3}
                  fill="#F8FAFC"
                  fontSize="9"
                  fontWeight="700"
                >
                  {t.label}
                </text>
              )}
            </g>
          ))}

          {/* Label on Ê Ke Body (stays upright even when rotated 180°) */}
          <text
            x="48"
            y="-44"
            textAnchor="middle"
            transform={isLabelUpsideDown ? 'rotate(180 48 -48)' : undefined}
            fill="#FFFFFF"
            fontSize="13"
            fontWeight="900"
            opacity="0.95"
          >
            Ê KE
          </text>

          {/* Vertex Right-Angle Target Dot */}
          <circle cx="0" cy="0" r="5" fill="#FACC15" stroke="#0F172A" strokeWidth="1.8" />
        </g>

        {/* High-Visibility Target Point Label Rendered Above Ê Ke in Draw Mode */}
        {mode === 'draw' && drawTask && (
          <g className="pointer-events-none">
            <text
              x={drawTask.targetPoint.x - 24}
              y={drawTask.targetPoint.y - 14}
              fill="#FFFFFF"
              stroke="#0A0724"
              strokeWidth="5"
              paintOrder="stroke"
              fontSize="22"
              fontWeight="900"
            >
              {drawTask.targetPointLabel}
            </text>
          </g>
        )}

        {/* Rotation Handle (World Space so text/icon stays upright) */}
        <g
          className="cursor-pointer"
          onPointerDown={handleStartRotate}
        >
          <line
            x1={setSquare.x + leg2Unit.x * LEG2_LEN}
            y1={setSquare.y + leg2Unit.y * LEG2_LEN}
            x2={rotateKnobPos.x}
            y2={rotateKnobPos.y}
            stroke="#FACC15"
            strokeWidth="2.5"
            strokeDasharray="3 3"
          />
          <circle
            cx={rotateKnobPos.x}
            cy={rotateKnobPos.y}
            r="16"
            fill="#FACC15"
            stroke="#0F172A"
            strokeWidth="2.5"
          />
          <text
            x={rotateKnobPos.x}
            y={rotateKnobPos.y + 5}
            textAnchor="middle"
            fill="#0F172A"
            fontSize="15"
            fontWeight="900"
          >
            ↻
          </text>
        </g>

        {/* Subtle Angle Readout Badge in Bottom-Right */}
        <g transform={`translate(${SVG_W - 148}, ${SVG_H - 38})`}>
          <rect
            x="0"
            y="0"
            width="134"
            height="28"
            rx="10"
            fill="rgba(15, 23, 42, 0.85)"
            stroke="rgba(129, 140, 248, 0.45)"
            strokeWidth="1.5"
          />
          <text
            x="67"
            y="18"
            textAnchor="middle"
            fill="#E0E7FF"
            fontSize="12"
            fontWeight="700"
            fontFamily="JetBrains Mono, monospace"
          >
            Góc ê ke: {Math.round(setSquare.rotationDeg)}°
          </text>
        </g>
      </svg>
    </div>
  );
};
