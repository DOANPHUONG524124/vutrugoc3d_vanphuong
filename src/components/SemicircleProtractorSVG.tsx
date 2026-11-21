import React, { useRef, useState } from 'react';
import {
  AlignmentCheck,
  AngleModelState,
  classifyAngle,
  polarToSvgCartesian,
  ProtractorState,
  svgCartesianToMathDeg,
} from '../utils/angleMath';
import { ChallengeVisualSpec } from '../utils/challengeGenerator';

interface SemicircleProtractorSVGProps {
  angleState: AngleModelState;
  protractorState: ProtractorState;
  alignment: AlignmentCheck;
  showMeasureValue: boolean;
  allowDragRay: boolean;
  allowDragProtractor: boolean;
  highlightScale?: 'both' | 'inner' | 'outer';
  visualContext?: ChallengeVisualSpec;
  onChangeAngleMeasure?: (newDeg: number) => void;
  onChangeProtractor?: (next: ProtractorState) => void;
}

const PROTRACTOR_RADIUS = 235;
const INNER_SCALE_RADIUS = 165;
const OUTER_SCALE_RADIUS = 205;
const RAY_LENGTH = 265;

export const SemicircleProtractorSVG: React.FC<SemicircleProtractorSVGProps> = ({
  angleState,
  protractorState,
  alignment,
  showMeasureValue,
  allowDragRay,
  allowDragProtractor,
  highlightScale = 'both',
  visualContext,
  onChangeAngleMeasure,
  onChangeProtractor,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragMode, setDragMode] = useState<'none' | 'ray2' | 'protractor-move' | 'protractor-rotate'>('none');
  const dragOffsetRef = useRef({ dx: 0, dy: 0, startRot: 0, startAngle: 0 });

  const getSvgPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const scaleX = 860 / Math.max(1, rect.width);
    const scaleY = 520 / Math.max(1, rect.height);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDownRay2 = (e: React.PointerEvent) => {
    if (!allowDragRay || !onChangeAngleMeasure) return;
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setDragMode('ray2');
  };

  const handlePointerDownProtractorBody = (e: React.PointerEvent) => {
    if (!allowDragProtractor || !onChangeProtractor) return;
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const pt = getSvgPoint(e.clientX, e.clientY);
    dragOffsetRef.current = {
      dx: pt.x - protractorState.x,
      dy: pt.y - protractorState.y,
      startRot: protractorState.rotationDeg,
      startAngle: 0,
    };
    setDragMode('protractor-move');
  };

  const handlePointerDownProtractorRotate = (e: React.PointerEvent) => {
    if (!allowDragProtractor || !onChangeProtractor) return;
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const pt = getSvgPoint(e.clientX, e.clientY);
    const pointerAngle = svgCartesianToMathDeg(protractorState.x, protractorState.y, pt.x, pt.y);
    dragOffsetRef.current = {
      dx: 0,
      dy: 0,
      startRot: protractorState.rotationDeg,
      startAngle: pointerAngle,
    };
    setDragMode('protractor-rotate');
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragMode === 'none') return;
    const pt = getSvgPoint(e.clientX, e.clientY);

    if (dragMode === 'ray2' && onChangeAngleMeasure) {
      const rawDeg = svgCartesianToMathDeg(
        angleState.vertexX,
        angleState.vertexY,
        pt.x,
        pt.y
      );
      let relativeDeg = (rawDeg - angleState.baseRayAngleDeg + 360) % 360;
      if (relativeDeg > 270) relativeDeg = 0;
      else if (relativeDeg > 180) relativeDeg = 180;
      onChangeAngleMeasure(Math.round(relativeDeg));
    } else if (dragMode === 'protractor-move' && onChangeProtractor) {
      let nextX = pt.x - dragOffsetRef.current.dx;
      let nextY = pt.y - dragOffsetRef.current.dy;
      // Magnetic snap when close to vertex O (within 14px)
      if (Math.hypot(nextX - angleState.vertexX, nextY - angleState.vertexY) <= 14) {
        nextX = angleState.vertexX;
        nextY = angleState.vertexY;
      }
      onChangeProtractor({
        ...protractorState,
        x: Math.max(80, Math.min(780, Math.round(nextX))),
        y: Math.max(80, Math.min(480, Math.round(nextY))),
      });
    } else if (dragMode === 'protractor-rotate' && onChangeProtractor) {
      const currentPointerAngle = svgCartesianToMathDeg(
        protractorState.x,
        protractorState.y,
        pt.x,
        pt.y
      );
      const delta = currentPointerAngle - dragOffsetRef.current.startAngle;
      let nextRot = Math.round(dragOffsetRef.current.startRot + delta);
      if (nextRot > 180) nextRot -= 360;
      if (nextRot <= -180) nextRot += 360;
      // Snap to 0° or baseRayAngleDeg if within 2°
      if (Math.abs(nextRot - angleState.baseRayAngleDeg) <= 2) {
        nextRot = angleState.baseRayAngleDeg;
      } else if (Math.abs(nextRot) <= 2) {
        nextRot = 0;
      }
      onChangeProtractor({
        ...protractorState,
        rotationDeg: nextRot,
      });
    }
  };

  const handlePointerUp = () => {
    setDragMode('none');
  };

  // Compute angle rays in SVG coordinates
  const { vertexX, vertexY, baseRayAngleDeg, measureDeg } = angleState;
  const isClockMode = visualContext?.kind === 'clock';
  const isPolygonMode = visualContext?.kind === 'polygon_measure';
  const activeRayLength = isClockMode ? 135 : isPolygonMode ? 215 : RAY_LENGTH;

  const ray1End = polarToSvgCartesian(vertexX, vertexY, activeRayLength, baseRayAngleDeg);
  const ray2MathDeg = baseRayAngleDeg + measureDeg;
  const ray2End = polarToSvgCartesian(
    vertexX,
    vertexY,
    isClockMode ? 158 : activeRayLength,
    ray2MathDeg
  );
  const angleClass = classifyAngle(measureDeg);

  // Build SVG path for the angle sector arc between Side OB and Side OA
  const arcRadius = 74;
  const arcStart = polarToSvgCartesian(vertexX, vertexY, arcRadius, baseRayAngleDeg);
  const arcEnd = polarToSvgCartesian(vertexX, vertexY, arcRadius, ray2MathDeg);
  const largeArcFlag = measureDeg > 180 ? 1 : 0;
  const sectorPath =
    measureDeg === 0
      ? ''
      : `M ${vertexX} ${vertexY} L ${arcStart.x} ${arcStart.y} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} 0 ${arcEnd.x} ${arcEnd.y} Z`;

  // Right angle square marker when measureDeg === 90
  const sqSize = 25;
  const sqP1 = polarToSvgCartesian(vertexX, vertexY, sqSize, baseRayAngleDeg);
  const sqP2 = polarToSvgCartesian(
    sqP1.x,
    sqP1.y,
    sqSize,
    baseRayAngleDeg + 90
  );
  const sqP3 = polarToSvgCartesian(vertexX, vertexY, sqSize, baseRayAngleDeg + 90);

  // Textbook position for angle measure: nestled inside the angle corner near vertex O (between side OB and side OA)
  const labelRadius = measureDeg < 30 ? 84 : measureDeg < 50 ? 54 : measureDeg === 90 ? 48 : 44;
  const labelPos = polarToSvgCartesian(
    vertexX,
    vertexY,
    labelRadius,
    baseRayAngleDeg + measureDeg / 2
  );

  // Precompute 0..180 degree ticks for the semicircular protractor
  const ticks = [];
  for (let d = 0; d <= 180; d++) {
    const isMajor10 = d % 10 === 0;
    const isMedium5 = d % 5 === 0 && !isMajor10;
    const outerR = PROTRACTOR_RADIUS;
    const innerR = isMajor10
      ? PROTRACTOR_RADIUS - 18
      : isMedium5
      ? PROTRACTOR_RADIUS - 12
      : PROTRACTOR_RADIUS - 7;

    const pOut = polarToSvgCartesian(0, 0, outerR, d);
    const pIn = polarToSvgCartesian(0, 0, innerR, d);

    ticks.push(
      <line
        key={`tick-${d}`}
        x1={pOut.x}
        y1={pOut.y}
        x2={pIn.x}
        y2={pIn.y}
        stroke={isMajor10 ? '#FFFFFF' : isMedium5 ? '#38BDF8' : 'rgba(255,255,255,0.45)'}
        strokeWidth={isMajor10 ? 2 : isMedium5 ? 1.4 : 0.8}
      />
    );

    if (isMajor10) {
      // Inner scale: 0° on right (d=0) -> 180° on left (d=180)
      const innerLabelPt = polarToSvgCartesian(0, 0, INNER_SCALE_RADIUS, d);
      // Outer scale: 0° on left (d=180) -> 180° on right (d=0)
      const outerValue = 180 - d;
      const outerLabelPt = polarToSvgCartesian(0, 0, OUTER_SCALE_RADIUS, d);
      const baselineOffsetY = d === 0 || d === 180 ? -9 : 0;

      // Tick connector on inner scale ring
      const pInnerRingOut = polarToSvgCartesian(0, 0, INNER_SCALE_RADIUS + 14, d);
      const pInnerRingIn = polarToSvgCartesian(0, 0, INNER_SCALE_RADIUS + 8, d);

      ticks.push(
        <g key={`labels-${d}`}>
          <line
            x1={pInnerRingOut.x}
            y1={pInnerRingOut.y}
            x2={pInnerRingIn.x}
            y2={pInnerRingIn.y}
            stroke="#FACC15"
            strokeWidth={1.5}
          />
          {/* Outer scale reading (180° -> 0°, Left-to-Right 0°..180°) */}
          <text
            x={outerLabelPt.x}
            y={outerLabelPt.y + baselineOffsetY}
            textAnchor="middle"
            dominantBaseline="central"
            fill={highlightScale === 'inner' ? 'rgba(244, 114, 182, 0.4)' : '#FF77B7'}
            fontSize="11"
            fontWeight="700"
            className="select-none font-mono-num"
          >
            {outerValue}
          </text>
          {/* Inner scale reading (0° -> 180°, Right-to-Left 0°..180°) */}
          <text
            x={innerLabelPt.x}
            y={innerLabelPt.y + baselineOffsetY}
            textAnchor="middle"
            dominantBaseline="central"
            fill={highlightScale === 'outer' ? 'rgba(250, 204, 21, 0.4)' : '#FACC15'}
            fontSize="11"
            fontWeight="700"
            className="select-none font-mono-num"
          >
            {d}
          </text>
        </g>
      );
    }
  }

  // Semicircle path for the 180° protractor body (in local coordinates where (0,0) is protractor center)
  const R = PROTRACTOR_RADIUS;
  const innerHoleR = 115;

  const topBadgeTitle = visualContext?.badgeTitleVi || 'Góc đỉnh O; cạnh OA, OB';
  const vertexLabelText = visualContext?.targetVertexLabel || 'Đỉnh O';
  const ray1LabelText = visualContext?.side1Label || 'B (Cạnh OB)';
  const ray2LabelText =
    visualContext?.side2Label || (allowDragRay ? 'A (Cạnh OA · Kéo)' : 'A (Cạnh OA)');

  const fourthPt =
    isPolygonMode && visualContext?.polygonType === 'quadrilateral' && visualContext.fourthVertexOffset
      ? {
          x: vertexX + visualContext.fourthVertexOffset.dx,
          y: vertexY + visualContext.fourthVertexOffset.dy,
          label: visualContext.fourthVertexOffset.label,
          angleText: visualContext.fourthVertexOffset.angleText,
        }
      : null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border-2 border-indigo-500/40 bg-[#090621]/90 shadow-2xl">
      <svg
        ref={svgRef}
        data-testid="protractor-lab-svg"
        viewBox="0 0 860 520"
        className="w-full h-auto max-h-[58vh] touch-none select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <defs>
          <pattern id="spaceGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(99, 102, 241, 0.14)"
              strokeWidth="1"
            />
          </pattern>
          <radialGradient id="vertexGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FACC15" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Coordinate Grid Background */}
        <rect x="0" y="0" width="860" height="520" fill="url(#spaceGrid)" />

        {/* ================= 1. INDEPENDENT ANGLE / CLOCK / POLYGON OBJECT ================= */}
        <g data-testid="angle-object-group">
          {/* Textbook Angle Name Badge in Top-Left Corner */}
          <g transform="translate(18, 18)">
            <rect
              x="0"
              y="0"
              width="310"
              height="34"
              rx="10"
              fill="rgba(15, 23, 42, 0.92)"
              stroke="rgba(250, 204, 21, 0.65)"
              strokeWidth="1.5"
            />
            <text
              x="155"
              y="17"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#FEF08A"
              fontSize="13"
              fontWeight="800"
            >
              {topBadgeTitle}
            </text>
          </g>

          {/* Optional Clock Face Underlay when measuring Clock Hands */}
          {isClockMode && (
            <g className="pointer-events-none">
              <circle
                cx={vertexX}
                cy={vertexY}
                r={175}
                fill="rgba(15, 23, 42, 0.78)"
                stroke="#FACC15"
                strokeWidth={4}
              />
              <circle
                cx={vertexX}
                cy={vertexY}
                r={166}
                fill="none"
                stroke="rgba(56, 189, 248, 0.35)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                const mathDeg = 90 - num * 30;
                const tickOuter = polarToSvgCartesian(vertexX, vertexY, 172, mathDeg);
                const tickInner = polarToSvgCartesian(vertexX, vertexY, 160, mathDeg);
                const numPos = polarToSvgCartesian(vertexX, vertexY, 142, mathDeg);
                return (
                  <g key={`clock-num-${num}`}>
                    <line
                      x1={tickOuter.x}
                      y1={tickOuter.y}
                      x2={tickInner.x}
                      y2={tickInner.y}
                      stroke="#FACC15"
                      strokeWidth={num % 3 === 0 ? 3 : 1.8}
                    />
                    <text
                      x={numPos.x}
                      y={numPos.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={num % 3 === 0 ? '#FEF08A' : '#E2E8F0'}
                      fontSize={num % 3 === 0 ? '16' : '13'}
                      fontWeight="800"
                      className="font-mono-num"
                    >
                      {num}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Optional Closed Triangle or Quadrilateral Underlay when measuring a Polygon */}
          {isPolygonMode && (
            <g className="pointer-events-none">
              {visualContext?.polygonType === 'triangle' && (
                <>
                  <polygon
                    points={`${vertexX},${vertexY} ${ray1End.x},${ray1End.y} ${ray2End.x},${ray2End.y}`}
                    fill="rgba(56, 189, 248, 0.14)"
                    stroke="#E2E8F0"
                    strokeWidth={3.5}
                    strokeLinejoin="round"
                  />
                  {/* Third closing side of the triangle */}
                  <line
                    x1={ray1End.x}
                    y1={ray1End.y}
                    x2={ray2End.x}
                    y2={ray2End.y}
                    stroke="#FACC15"
                    strokeWidth={4.5}
                    strokeDasharray="8 5"
                  />
                </>
              )}

              {visualContext?.polygonType === 'quadrilateral' && fourthPt && (
                <>
                  <polygon
                    points={`${vertexX},${vertexY} ${ray1End.x},${ray1End.y} ${fourthPt.x},${fourthPt.y} ${ray2End.x},${ray2End.y}`}
                    fill="rgba(56, 189, 248, 0.14)"
                    stroke="#E2E8F0"
                    strokeWidth={3.5}
                    strokeLinejoin="round"
                  />
                  <line
                    x1={ray1End.x}
                    y1={ray1End.y}
                    x2={fourthPt.x}
                    y2={fourthPt.y}
                    stroke="#FACC15"
                    strokeWidth={4.5}
                  />
                  <line
                    x1={fourthPt.x}
                    y1={fourthPt.y}
                    x2={ray2End.x}
                    y2={ray2End.y}
                    stroke="#FACC15"
                    strokeWidth={4.5}
                  />
                  <circle cx={fourthPt.x} cy={fourthPt.y} r={7} fill="#FACC15" />
                  <text
                    x={fourthPt.x + 14}
                    y={fourthPt.y - 10}
                    fill="#FEF08A"
                    stroke="#090621"
                    strokeWidth="4"
                    paintOrder="stroke"
                    fontSize="16"
                    fontWeight="800"
                  >
                    {fourthPt.label} {fourthPt.angleText ? `(${fourthPt.angleText})` : ''}
                  </text>
                </>
              )}
            </g>
          )}

          {/* Colored Angle Sector */}
          {measureDeg > 0 && measureDeg !== 90 && (
            <path
              d={sectorPath}
              fill={angleClass.colorHex}
              fillOpacity={0.26}
              stroke={angleClass.colorHex}
              strokeWidth={2.5}
            />
          )}

          {/* Right Angle 90° Square Symbol */}
          {measureDeg === 90 && (
            <path
              d={`M ${vertexX} ${vertexY} L ${sqP1.x} ${sqP1.y} L ${sqP2.x} ${sqP2.y} L ${sqP3.x} ${sqP3.y} Z`}
              fill="rgba(34, 197, 94, 0.28)"
              stroke="#22C55E"
              strokeWidth={2.5}
            />
          )}

          {/* Side 1 / Base Ray (OB or Hour Hand or Polygon Side 1) */}
          <line
            x1={vertexX}
            y1={vertexY}
            x2={ray1End.x}
            y2={ray1End.y}
            stroke="#38BDF8"
            strokeWidth={isClockMode ? 7 : 5}
            strokeLinecap="round"
          />
          <circle cx={ray1End.x} cy={ray1End.y} r={6} fill="#38BDF8" />
          <text
            x={ray1End.x + 14}
            y={ray1End.y + 18}
            fill="#38BDF8"
            fontSize="15"
            fontWeight="800"
          >
            {ray1LabelText}
          </text>

          {/* Side 2 / Upper Ray (OA or Minute Hand or Polygon Side 2) */}
          <line
            x1={vertexX}
            y1={vertexY}
            x2={ray2End.x}
            y2={ray2End.y}
            stroke={angleClass.colorHex}
            strokeWidth={isClockMode ? 5 : 5}
            strokeLinecap="round"
          />

          {/* Interactive Drag Handle on Side OA */}
          <g
            onPointerDown={handlePointerDownRay2}
            className={allowDragRay ? 'cursor-grab active:cursor-grabbing' : ''}
            role={allowDragRay ? 'slider' : undefined}
            aria-label={
              allowDragRay
                ? 'Kéo cạnh OA để thay đổi độ mở của góc đỉnh O; cạnh OA, OB'
                : undefined
            }
            aria-valuemin={0}
            aria-valuemax={180}
            aria-valuenow={measureDeg}
          >
            <circle
              cx={ray2End.x}
              cy={ray2End.y}
              r={allowDragRay ? 18 : 7}
              fill={angleClass.colorHex}
              fillOpacity={allowDragRay ? 0.28 : 1}
              stroke={angleClass.colorHex}
              strokeWidth={2.5}
            />
            <circle cx={ray2End.x} cy={ray2End.y} r={7} fill="#FFFFFF" />
            <text
              x={ray2End.x + 18}
              y={ray2End.y - 10}
              fill={angleClass.colorHex}
              fontSize="15"
              fontWeight="800"
            >
              {ray2LabelText}
            </text>
          </g>

          {/* Vertex O / Target Vertex */}
          <circle cx={vertexX} cy={vertexY} r={22} fill="url(#vertexGlow)" />
          <circle
            cx={vertexX}
            cy={vertexY}
            r={7}
            fill="#FACC15"
            stroke="#090621"
            strokeWidth={2.5}
          />
          <g transform={`translate(${vertexX}, ${vertexY + 42})`}>
            <rect
              x="-38"
              y="-12"
              width="76"
              height="24"
              rx="6"
              fill="#090621"
              stroke="#FACC15"
              strokeWidth="1.5"
            />
            <text
              x="0"
              y="1"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#FACC15"
              fontSize="13"
              fontWeight="800"
            >
              {vertexLabelText}
            </text>
          </g>
        </g>

        {/* ================= 2. INDEPENDENT 180° SEMICIRCULAR PROTRACTOR OBJECT ================= */}
        {/* Note: SVG rotate(-rotationDeg) because standard math angles are CCW while SVG rotate is CW */}
        <g
          data-testid="semicircle-protractor-group"
          transform={`translate(${protractorState.x}, ${protractorState.y}) rotate(${-protractorState.rotationDeg})`}
          onPointerDown={handlePointerDownProtractorBody}
          className={allowDragProtractor ? 'cursor-move' : ''}
        >
          {/* Outer Semicircular Body (strictly 0° to 180° semicircle + bottom straight ruler edge) */}
          <path
            d={`
              M ${-R} 22
              L ${-R} 0
              A ${R} ${R} 0 0 1 ${R} 0
              L ${R} 22
              Z
            `}
            fill="rgba(30, 41, 99, 0.72)"
            stroke={alignment.isFullyAligned ? '#22C55E' : '#60A5FA'}
            strokeWidth={3}
          />

          {/* Inner D-shaped Cutout Window for clarity */}
          <path
            d={`
              M ${-innerHoleR} -6
              A ${innerHoleR} ${innerHoleR} 0 0 1 ${innerHoleR} -6
              Z
            `}
            fill="rgba(9, 6, 33, 0.65)"
            stroke="rgba(148, 163, 184, 0.35)"
            strokeWidth={1.5}
          />

          {/* Scale Divider Ring between Outer Scale (Pink) and Inner Scale (Gold) */}
          <path
            d={`M ${-185} 0 A 185 185 0 0 1 ${185} 0`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth={1}
          />

          {/* Baseline 0°–180° Reference Line (Đường chuẩn 0° - 180°) */}
          <line
            x1={-R}
            y1={0}
            x2={R}
            y2={0}
            stroke={alignment.isBaselineAligned ? '#22C55E' : '#FACC15'}
            strokeWidth={2.5}
          />

          {/* All 180° Ticks and Dual-Direction Numbers */}
          {ticks}

          {/* Protractor Center Crosshair (Tâm thước) */}
          <circle
            cx={0}
            cy={0}
            r={12}
            fill={alignment.isCenterAligned ? 'rgba(34, 197, 94, 0.35)' : 'rgba(250, 204, 21, 0.25)'}
            stroke={alignment.isCenterAligned ? '#22C55E' : '#FACC15'}
            strokeWidth={2.5}
          />
          <line x1={-10} y1={0} x2={10} y2={0} stroke="#FFFFFF" strokeWidth={2} />
          <line x1={0} y1={-10} x2={0} y2={10} stroke="#FFFFFF" strokeWidth={2} />
          <circle cx={0} cy={0} r={3} fill="#FF2E93" />

          {/* Split Bottom Ruler Labels on Protractor so Center Crosshair (0,0) is 100% unobstructed */}
          <text
            x={-120}
            y={15}
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.85)"
            fontSize="10"
            fontWeight="700"
          >
            THƯỚC ĐO GÓC
          </text>
          <text
            x={120}
            y={15}
            textAnchor="middle"
            fill="rgba(250, 204, 21, 0.9)"
            fontSize="10"
            fontWeight="700"
          >
            KÉO ĐỂ DI CHUYỂN TÂM THƯỚC
          </text>

          {/* Dedicated Rotation Handle at Top 90° Crest of Protractor */}
          {allowDragProtractor && (
            <g
              transform={`translate(0, ${-R - 22})`}
              onPointerDown={handlePointerDownProtractorRotate}
              className="cursor-grab active:cursor-grabbing"
              role="button"
              aria-label="Kéo núm xoay để xoay thước đo góc"
            >
              <line x1={0} y1={0} x2={0} y2={22} stroke="#FF2E93" strokeWidth={2.5} />
              <rect
                x={-64}
                y={-14}
                width={128}
                height={28}
                rx={14}
                fill="#FF2E93"
                stroke="#FFFFFF"
                strokeWidth={2}
              />
              <text
                x={0}
                y={0}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#FFFFFF"
                fontSize="11"
                fontWeight="800"
              >
                ↻ Kéo xoay thước
              </text>
            </g>
          )}
        </g>

        {/* ================= 3. TEXTBOOK-STYLE ANGLE MEASURE INSIDE CORNER NEAR VERTEX O ================= */}
        {showMeasureValue && measureDeg > 0 && (
          <g className="pointer-events-none select-none">
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#FFFFFF"
              stroke="#090621"
              strokeWidth="5"
              paintOrder="stroke"
              fontSize="17"
              fontWeight="800"
              className="font-mono-num"
            >
              {measureDeg}°
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
