import React, { useRef, useState } from 'react';
import {
  SetSquareState,
  SetSquareAlignmentResult,
  normalizeDeg360,
  mathDegToSvgUnit,
  getLineMathAngleDeg,
} from '../utils/perpendicularMath';
import { ParallelDrawTask, computeParallelGeometry } from '../utils/parallelMath';
import { soundFX } from '../utils/soundEffects';

interface InteractiveParallelSetSquareSVGProps {
  task: ParallelDrawTask;
  activeStep: 1 | 2;
  hasDrawnStep1: boolean;
  hasDrawnStep2: boolean;
  setSquare: SetSquareState;
  onChangeSetSquare: (next: SetSquareState) => void;
  alignment: SetSquareAlignmentResult;
}

const SVG_W = 780;
const SVG_H = 420;
const LEG1_LEN = 145;
const LEG2_LEN = 180;

export const InteractiveParallelSetSquareSVG: React.FC<InteractiveParallelSetSquareSVGProps> = ({
  task,
  activeStep,
  hasDrawnStep1,
  hasDrawnStep2,
  setSquare,
  onChangeSetSquare,
  alignment,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragMode, setDragMode] = useState<'none' | 'move' | 'rotate'>('none');
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const rotStartRef = useRef<{ startPointerAngle: number; startRotDeg: number }>({
    startPointerAngle: 0,
    startRotDeg: 0,
  });

  const toSvgCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * SVG_W,
      y: ((clientY - rect.top) / rect.height) * SVG_H,
    };
  };

  const handleMoveStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const pt = toSvgCoords(e.clientX, e.clientY);
    dragOffsetRef.current = { dx: pt.x - setSquare.x, dy: pt.y - setSquare.y };
    setDragMode('move');
  };

  const handleRotateStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const pt = toSvgCoords(e.clientX, e.clientY);
    const ptrAngle = (Math.atan2(-(pt.y - setSquare.y), pt.x - setSquare.x) * 180) / Math.PI;
    rotStartRef.current = {
      startPointerAngle: ptrAngle,
      startRotDeg: setSquare.rotationDeg,
    };
    setDragMode('rotate');
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragMode === 'none') return;
    const pt = toSvgCoords(e.clientX, e.clientY);
    if (dragMode === 'move') {
      const nx = Math.max(40, Math.min(SVG_W - 40, pt.x - dragOffsetRef.current.dx));
      const ny = Math.max(40, Math.min(SVG_H - 40, pt.y - dragOffsetRef.current.dy));
      onChangeSetSquare({ ...setSquare, x: nx, y: ny });
    } else if (dragMode === 'rotate') {
      const ptrAngle = (Math.atan2(-(pt.y - setSquare.y), pt.x - setSquare.x) * 180) / Math.PI;
      const delta = ptrAngle - rotStartRef.current.startPointerAngle;
      const nextRot = normalizeDeg360(Math.round(rotStartRef.current.startRotDeg + delta));
      if (Math.abs(nextRot - setSquare.rotationDeg) >= 4) {
        soundFX.playTick(nextRot % 90);
      }
      onChangeSetSquare({ ...setSquare, rotationDeg: nextRot });
    }
  };

  const handlePointerUp = () => {
    setDragMode('none');
  };

  const geom = computeParallelGeometry(task);
  const baseAngle = getLineMathAngleDeg(task.baseLine);
  const baseUnit = mathDegToSvgUnit(baseAngle);
  const perpUnit = mathDegToSvgUnit(baseAngle + 90);

  // Crisp square right-angle symbol helper at any point along baseUnit & perpUnit
  const buildRightSquarePath = (origin: { x: number; y: number }, size = 16) => {
    const pA = { x: origin.x + baseUnit.x * size, y: origin.y + baseUnit.y * size };
    const pB = {
      x: origin.x + baseUnit.x * size + perpUnit.x * size,
      y: origin.y + baseUnit.y * size + perpUnit.y * size,
    };
    const pC = { x: origin.x + perpUnit.x * size, y: origin.y + perpUnit.y * size };
    return `M ${pA.x} ${pA.y} L ${pB.x} ${pB.y} L ${pC.x} ${pC.y}`;
  };

  // Set square geometry in local coordinates (origin at right-angle vertex, leg1 along +x, leg2 along -y)
  const svgRotateDeg = -setSquare.rotationDeg;
  const strokeColor = alignment.isFullyAligned ? '#34D399' : '#38BDF8';
  const fillColor = alignment.isFullyAligned
    ? 'rgba(16, 185, 129, 0.24)'
    : 'rgba(56, 189, 248, 0.22)';

  return (
    <div className="relative bg-[#0B0826] rounded-3xl border-2 border-indigo-400/50 overflow-hidden shadow-2xl select-none">
      <div className="px-4 py-2 bg-[#130E38]/95 border-b border-indigo-400/30 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-indigo-200">
        <span>
          {activeStep === 1
            ? 'Bước 1: Kéo và xoay Ê Ke sao cho 1 cạnh góc vuông trùng đường thẳng AB, cạnh kia gặp điểm H'
            : 'Bước 2: Đặt 1 cạnh góc vuông Ê Ke trùng đường phụ MN tại H rồi vạch đường thẳng CD song song với AB!'}
        </span>
        <span className="font-mono-num text-sky-300 bg-indigo-950 px-2.5 py-0.5 rounded-lg border border-indigo-400/40">
          Góc ê ke: {Math.round(setSquare.rotationDeg)}°
        </span>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full h-auto block touch-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <defs>
          <pattern id="par-lab-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(129,140,248,0.12)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#par-lab-grid)" />

        {/* Base line AB */}
        <line
          x1={task.baseLine.p1.x - baseUnit.x * 35}
          y1={task.baseLine.p1.y - baseUnit.y * 35}
          x2={task.baseLine.p2.x + baseUnit.x * 35}
          y2={task.baseLine.p2.y + baseUnit.y * 35}
          stroke="#38BDF8"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <circle cx={task.baseLine.p1.x} cy={task.baseLine.p1.y} r="5.5" fill="#FACC15" />
        <circle cx={task.baseLine.p2.x} cy={task.baseLine.p2.y} r="5.5" fill="#FACC15" />
        <text
          x={task.baseLine.p1.x - perpUnit.x * 22}
          y={task.baseLine.p1.y - perpUnit.y * 22 + 6}
          textAnchor="middle"
          fill="#38BDF8"
          fontSize="21"
          fontWeight="900"
        >
          {task.baseLine.label1}
        </text>
        <text
          x={task.baseLine.p2.x - perpUnit.x * 22}
          y={task.baseLine.p2.y - perpUnit.y * 22 + 6}
          textAnchor="middle"
          fill="#38BDF8"
          fontSize="21"
          fontWeight="900"
        >
          {task.baseLine.label2}
        </text>

        {/* STEP 1 RESULT: Auxiliary perpendicular line MN (dashed red/pink with square 90° mark) */}
        {hasDrawnStep1 && (
          <g>
            <line
              x1={geom.auxStart.x}
              y1={geom.auxStart.y}
              x2={geom.auxEnd.x}
              y2={geom.auxEnd.y}
              stroke="#FB7185"
              strokeWidth="3.5"
              strokeDasharray="10 7"
              strokeLinecap="round"
            />
            {/* Crisp square 90° symbol at intersection with AB */}
            <path
              d={buildRightSquarePath(geom.footOnBase, 17)}
              fill="rgba(251, 113, 133, 0.25)"
              stroke="#FB7185"
              strokeWidth="2.8"
            />
            <text
              x={geom.auxStart.x - baseUnit.x * 22}
              y={geom.auxStart.y - baseUnit.y * 22 + 6}
              textAnchor="middle"
              fill="#FDA4AF"
              fontSize="19"
              fontWeight="900"
            >
              {task.auxLineLabels[0]}
            </text>
            <text
              x={geom.auxEnd.x - baseUnit.x * 22}
              y={geom.auxEnd.y - baseUnit.y * 22 + 6}
              textAnchor="middle"
              fill="#FDA4AF"
              fontSize="19"
              fontWeight="900"
            >
              {task.auxLineLabels[1]}
            </text>
          </g>
        )}

        {/* STEP 2 RESULT: Final Parallel Line CD (glowing emerald with crisp 90° square at H) */}
        {hasDrawnStep2 && (
          <g>
            <line
              x1={geom.parStart.x}
              y1={geom.parStart.y}
              x2={geom.parEnd.x}
              y2={geom.parEnd.y}
              stroke="#34D399"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Crisp square 90° symbol at H between CD and MN */}
            <path
              d={buildRightSquarePath(task.targetPoint, 17)}
              fill="rgba(52, 211, 153, 0.35)"
              stroke="#34D399"
              strokeWidth="3"
            />
            <circle cx={geom.parStart.x + baseUnit.x * 45} cy={geom.parStart.y + baseUnit.y * 45} r="5" fill="#FACC15" />
            <circle cx={geom.parEnd.x - baseUnit.x * 45} cy={geom.parEnd.y - baseUnit.y * 45} r="5" fill="#FACC15" />
            <text
              x={geom.parStart.x + baseUnit.x * 45 + perpUnit.x * 22}
              y={geom.parStart.y + baseUnit.y * 45 + perpUnit.y * 22 + 6}
              textAnchor="middle"
              fill="#6EE7B7"
              fontSize="21"
              fontWeight="900"
            >
              {task.parallelLineLabels[0]}
            </text>
            <text
              x={geom.parEnd.x - baseUnit.x * 45 + perpUnit.x * 22}
              y={geom.parEnd.y - baseUnit.y * 45 + perpUnit.y * 22 + 6}
              textAnchor="middle"
              fill="#6EE7B7"
              fontSize="21"
              fontWeight="900"
            >
              {task.parallelLineLabels[1]}
            </text>
          </g>
        )}

        {/* Target Point H */}
        <g>
          <circle
            cx={task.targetPoint.x}
            cy={task.targetPoint.y}
            r="13"
            fill="#FACC15"
            fillOpacity="0.22"
          />
          <circle
            cx={task.targetPoint.x}
            cy={task.targetPoint.y}
            r="6.5"
            fill="#FACC15"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          <text
            x={task.targetPoint.x + 18}
            y={task.targetPoint.y - 12}
            fill="#FACC15"
            fontSize="22"
            fontWeight="900"
          >
            {task.targetPointLabel}
          </text>
        </g>

        {/* INTERACTIVE DRAGGABLE & ROTATABLE SET SQUARE (Ê KE) */}
        <g
          transform={`translate(${setSquare.x}, ${setSquare.y}) rotate(${svgRotateDeg})`}
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={handleMoveStart}
        >
          {/* Hollow triangular set-square body */}
          <path
            d={`M 0 0 L ${LEG1_LEN} 0 L 0 ${-LEG2_LEN} Z M 26 -26 L 26 ${-LEG2_LEN + 62} L ${LEG1_LEN - 54} -26 Z`}
            fill={fillColor}
            fillRule="evenodd"
            stroke={strokeColor}
            strokeWidth="3"
          />

          {/* Crisp 90° right-angle square inside the Ê Ke corner */}
          <path
            d="M 18 0 L 18 -18 L 0 -18"
            fill="rgba(250,204,21,0.32)"
            stroke="#FACC15"
            strokeWidth="2.5"
          />
          <text x="22" y="-7" fill="#FACC15" fontSize="10" fontWeight="900">
            90°
          </text>

          {/* Ruler ticks along Leg 1 (horizontal) */}
          {[20, 40, 60, 80, 100, 120].map((tx, idx) => (
            <g key={`h-${tx}`}>
              <line x1={tx} y1={0} x2={tx} y2={-9} stroke="#E0F2FE" strokeWidth="1.6" />
              <text x={tx} y={-12} textAnchor="middle" fill="#BAE6FD" fontSize="8.5" fontWeight="700">
                {idx + 1}
              </text>
            </g>
          ))}

          {/* Ruler ticks along Leg 2 (vertical) */}
          {[25, 50, 75, 100, 125, 150].map((ty, idx) => (
            <g key={`v-${ty}`}>
              <line x1={0} y1={-ty} x2={9} y2={-ty} stroke="#E0F2FE" strokeWidth="1.6" />
              <text x={15} y={-ty + 3} fill="#BAE6FD" fontSize="8.5" fontWeight="700">
                {idx + 1}
              </text>
            </g>
          ))}

          <text
            x="45"
            y="-48"
            fill="#FFFFFF"
            fontSize="12"
            fontWeight="900"
            letterSpacing="0.06em"
            opacity="0.92"
          >
            Ê KE
          </text>

          {/* Right-angle vertex marker */}
          <circle cx="0" cy="0" r="5" fill="#FACC15" stroke="#0B0826" strokeWidth="1.5" />

          {/* Yellow Rotation Handle at top of Leg 2 */}
          <g
            transform={`translate(0, ${-LEG2_LEN - 16})`}
            className="cursor-pointer"
            onPointerDown={handleRotateStart}
          >
            <circle cx="0" cy="0" r="14" fill="#FACC15" stroke="#0B0826" strokeWidth="2.5" />
            <text
              x="0"
              y="5"
              textAnchor="middle"
              fill="#0B0826"
              fontSize="15"
              fontWeight="900"
            >
              ↻
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};
