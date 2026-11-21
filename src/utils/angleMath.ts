/**
 * Pure geometric and educational math logic for Vũ Trụ Góc Học – Angle Explorer 3D
 */

export type AngleCategoryId = 'acute' | 'right' | 'obtuse' | 'straight' | 'reflex' | 'full';

export interface AngleClassification {
  id: AngleCategoryId;
  nameVi: string;
  rangeVi: string;
  colorHex: string;
  badgeBg: string;
  descriptionVi: string;
  isCoreCurriculum: boolean;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface ProtractorState {
  /** Center position of the semicircular protractor in SVG canvas coordinates */
  x: number;
  y: number;
  /** Rotation of the protractor baseline in degrees (-180 to 180, where 0 means horizontal with 0° on right, 180° on left) */
  rotationDeg: number;
}

export interface AngleModelState {
  /** Vertex position in SVG canvas coordinates */
  vertexX: number;
  vertexY: number;
  /** Direction of Ray 1 (base ray OA) in standard screen degrees (0 = right +X, counter-clockwise positive in math space) */
  baseRayAngleDeg: number;
  /** Opening measure of the angle in degrees (0 to 180 for lab, up to 360 for explore) */
  measureDeg: number;
}

export interface AlignmentCheck {
  isCenterAligned: boolean;
  centerDistancePx: number;
  isBaselineAligned: boolean;
  baselineErrorDeg: number;
  /** Which scale on the 180° semicircular protractor should be read ('inner' = 0° on right CCW, 'outer' = 0° on left CW) */
  recommendedScale: 'inner' | 'outer';
  /** The reading on the inner scale (0° right -> 180° left) where Ray 2 intersects */
  innerScaleReading: number;
  /** The reading on the outer scale (0° left -> 180° right) where Ray 2 intersects */
  outerScaleReading: number;
  /** Whether the second ray actually intersects the 0°..180° semicircle arc of the protractor */
  ray2OnProtractorArc: boolean;
  /** True when center, baseline, and arc coverage are all properly aligned for an accurate measurement */
  isFullyAligned: boolean;
  /** Diagnostic message in Vietnamese for the student */
  feedbackVi: string;
}

/**
 * Clamp angle measure within [min, max] and round to integer degrees
 */
export function clampAngle(deg: number, min = 0, max = 180): number {
  if (Number.isNaN(deg)) return min;
  return Math.max(min, Math.min(max, Math.round(deg)));
}

/**
 * Normalize any angle in degrees into [0, 360)
 */
export function normalizeDeg360(deg: number): number {
  const mod = deg % 360;
  return mod < 0 ? mod + 360 : mod;
}

/**
 * Normalize any angle in degrees into (-180, 180]
 */
export function normalizeSignedDeg180(deg: number): number {
  let a = ((deg + 180) % 360);
  if (a <= 0) a += 360;
  return a - 180;
}

/**
 * Classify an angle measure in degrees according to Vietnamese primary school curriculum
 */
export function classifyAngle(deg: number): AngleClassification {
  const rounded = Math.round(deg);

  if (rounded < 90) {
    return {
      id: 'acute',
      nameVi: 'Góc nhọn',
      rangeVi: '0° < Góc nhọn < 90°',
      colorHex: '#FACC15', // Gold/Yellow
      badgeBg: 'rgba(250, 204, 21, 0.2)',
      descriptionVi: 'Góc nhọn có số đo lớn hơn 0° và nhỏ hơn góc vuông (90°).',
      isCoreCurriculum: true,
    };
  }
  if (rounded === 90) {
    return {
      id: 'right',
      nameVi: 'Góc vuông',
      rangeVi: 'Bằng 90°',
      colorHex: '#22C55E', // Green
      badgeBg: 'rgba(34, 197, 94, 0.2)',
      descriptionVi: 'Góc vuông có số đo chính xác bằng 90° (có ký hiệu ô vuông tại đỉnh).',
      isCoreCurriculum: true,
    };
  }
  if (rounded > 90 && rounded < 180) {
    return {
      id: 'obtuse',
      nameVi: 'Góc tù',
      rangeVi: '90° < Góc tù < 180°',
      colorHex: '#FF2E93', // Neon Pink
      badgeBg: 'rgba(255, 46, 147, 0.2)',
      descriptionVi: 'Góc tù lớn hơn góc vuông (90°) nhưng nhỏ hơn góc bẹt (180°).',
      isCoreCurriculum: true,
    };
  }
  if (rounded === 180) {
    return {
      id: 'straight',
      nameVi: 'Góc bẹt',
      rangeVi: 'Bằng 180°',
      colorHex: '#38BDF8', // Sky/Cobalt Blue
      badgeBg: 'rgba(56, 189, 248, 0.2)',
      descriptionVi: 'Góc bẹt có số đo bằng 180° (bằng hai góc vuông ghép lại, hai cạnh tạo thành đường thẳng).',
      isCoreCurriculum: true,
    };
  }
  if (rounded > 180 && rounded < 360) {
    return {
      id: 'reflex',
      nameVi: 'Góc phản (Mở rộng)',
      rangeVi: '180° < Góc phản < 360°',
      colorHex: '#A855F7',
      badgeBg: 'rgba(168, 85, 247, 0.2)',
      descriptionVi: 'Kiến thức mở rộng: Góc phản lớn hơn góc bẹt (180°) và nhỏ hơn góc tròn (360°).',
      isCoreCurriculum: false,
    };
  }
  return {
    id: 'full',
    nameVi: 'Góc tròn (Mở rộng)',
    rangeVi: 'Bằng 360°',
    colorHex: '#F97316',
    badgeBg: 'rgba(249, 115, 22, 0.2)',
    descriptionVi: 'Kiến thức mở rộng: Tia quay đúng một vòng quanh đỉnh tạo thành góc tròn 360°.',
    isCoreCurriculum: false,
  };
}

/**
 * Convert polar angle (in standard mathematical degrees: 0° = right +X, 90° = up -Y in SVG)
 * to 2D SVG coordinates.
 */
export function polarToSvgCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleMathDeg: number
): Point2D {
  const rad = (angleMathDeg * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(rad),
    y: centerY - radius * Math.sin(rad),
  };
}

/**
 * Compute standard mathematical angle in degrees [0, 360) from a vertex to a pointer (x, y) in SVG coordinates
 */
export function svgCartesianToMathDeg(
  vertexX: number,
  vertexY: number,
  pointX: number,
  pointY: number
): number {
  const dx = pointX - vertexX;
  const dy = vertexY - pointY; // Invert Y because SVG Y grows downward
  const rad = Math.atan2(dy, dx);
  return normalizeDeg360((rad * 180) / Math.PI);
}

/**
 * Evaluate how accurately the student placed the 180° semicircular protractor over the angle
 * and calculate the true geometric readings on both scales.
 *
 * Protractor coordinate convention:
 * - When `rotationDeg === 0`, the protractor's 0°–180° baseline is horizontal:
 *   - Right side of baseline is at math angle `0°` (Inner scale = 0°, Outer scale = 180°)
 *   - Top of semicircle is at math angle `90°` (Inner scale = 90°, Outer scale = 90°)
 *   - Left side of baseline is at math angle `180°` (Inner scale = 180°, Outer scale = 0°)
 * - When `rotationDeg` increases positively (CCW in math space), the entire semicircle rotates CCW by `rotationDeg`.
 */
export function evaluateProtractorAlignment(
  protractor: ProtractorState,
  angle: AngleModelState,
  centerTolerancePx = 18,
  angleToleranceDeg = 3
): AlignmentCheck {
  const dx = protractor.x - angle.vertexX;
  const dy = protractor.y - angle.vertexY;
  const centerDistancePx = Math.hypot(dx, dy);
  const isCenterAligned = centerDistancePx <= centerTolerancePx;

  // Ray 1 (base ray) and Ray 2 (second ray) in global math degrees [0, 360)
  const ray1Global = normalizeDeg360(angle.baseRayAngleDeg);
  const ray2Global = normalizeDeg360(angle.baseRayAngleDeg + angle.measureDeg);

  // Convert Ray 1 and Ray 2 into the protractor's local coordinate frame
  // In local frame: 0° is right baseline, 90° is top of semicircle, 180° is left baseline
  const ray1Local = normalizeDeg360(ray1Global - protractor.rotationDeg);
  const ray2Local = normalizeDeg360(ray2Global - protractor.rotationDeg);

  // Distance of Ray 1 or Ray 2 to the right baseline (local 0°) or left baseline (local 180°)
  const errRay1ToRight0 = Math.abs(normalizeSignedDeg180(ray1Local - 0));
  const errRay1ToLeft0 = Math.abs(normalizeSignedDeg180(ray1Local - 180));
  const errRay2ToRight0 = Math.abs(normalizeSignedDeg180(ray2Local - 0));
  const errRay2ToLeft0 = Math.abs(normalizeSignedDeg180(ray2Local - 180));

  // Determine whether the student aligned one of the rays with the right 0° mark (inner scale)
  // or the left 0° mark (outer scale)
  const minBaselineError = Math.min(
    errRay1ToRight0,
    errRay1ToLeft0,
    errRay2ToRight0,
    errRay2ToLeft0
  );
  const isBaselineAligned = minBaselineError <= angleToleranceDeg;

  // Check if the other ray lies on the upper semicircle [0°, 180°] of the protractor
  // (allowing a small tolerance of angleToleranceDeg at the ends)
  const isLocalAngleOnArc = (localDeg: number) =>
    localDeg <= 180 + angleToleranceDeg || localDeg >= 360 - angleToleranceDeg;

  const bothRaysOnArc = isLocalAngleOnArc(ray1Local) && isLocalAngleOnArc(ray2Local);

  // Determine which scale is the active 0° reference and where the measuring ray points
  let recommendedScale: 'inner' | 'outer' = 'inner';
  let measuringRayLocal = ray2Local;

  if (errRay1ToRight0 <= errRay1ToLeft0 && errRay1ToRight0 <= errRay2ToLeft0) {
    // Ray 1 is near the right baseline (Inner scale 0°)
    recommendedScale = 'inner';
    measuringRayLocal = ray2Local;
  } else if (errRay1ToLeft0 <= errRay2ToRight0 && errRay1ToLeft0 <= errRay2ToLeft0) {
    // Ray 1 is near the left baseline (Outer scale 0°)
    recommendedScale = 'outer';
    measuringRayLocal = ray2Local;
  } else if (errRay2ToLeft0 <= errRay2ToRight0) {
    // Ray 2 is aligned with the left baseline (Outer scale 0°), so Ray 1 is the measuring ray!
    recommendedScale = 'outer';
    measuringRayLocal = ray1Local;
  } else {
    // Ray 2 is aligned with the right baseline (Inner scale 0°), so Ray 1 is the measuring ray!
    recommendedScale = 'inner';
    measuringRayLocal = ray1Local;
  }

  // Clamp local angle into [0, 180] for scale readout
  const clampedLocal =
    measuringRayLocal > 270
      ? 0
      : Math.max(0, Math.min(180, Math.round(measuringRayLocal)));

  const innerScaleReading = clampedLocal; // 0° on right -> 180° on left
  const outerScaleReading = 180 - clampedLocal; // 0° on left -> 180° on right

  const isFullyAligned = isCenterAligned && isBaselineAligned && bothRaysOnArc;

  let feedbackVi = '';
  if (!isCenterAligned) {
    feedbackVi = `Bước 1 chưa chuẩn: Hãy kéo tâm thước trùng khít với đỉnh góc O (còn lệch ${Math.round(
      centerDistancePx
    )} px).`;
  } else if (!isBaselineAligned) {
    feedbackVi = `Bước 2 chưa chuẩn: Hãy xoay thước để vạch 0° trùng khít với một cạnh của góc (còn lệch ${Math.round(
      minBaselineError
    )}°).`;
  } else if (!bothRaysOnArc) {
    feedbackVi =
      'Thước đang bị ngược chiều mở của góc! Hãy xoay thước để cạnh còn lại nằm trên vùng vạch chia 0°–180° của thước.';
  } else {
    const scaleName =
      recommendedScale === 'inner'
        ? 'vòng số màu vàng (0° bên phải)'
        : 'vòng số màu hồng (0° bên trái)';
    const correctReading =
      recommendedScale === 'inner' ? innerScaleReading : outerScaleReading;
    feedbackVi = `Tuyệt vời! Bạn đã đặt thước chính xác. Hãy đọc theo ${scaleName}: kết quả là ${correctReading}°.`;
  }

  return {
    isCenterAligned,
    centerDistancePx: Math.round(centerDistancePx),
    isBaselineAligned,
    baselineErrorDeg: Math.round(minBaselineError),
    recommendedScale,
    innerScaleReading,
    outerScaleReading,
    ray2OnProtractorArc: bothRaysOnArc,
    isFullyAligned,
    feedbackVi,
  };
}
