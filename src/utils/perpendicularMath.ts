/**
 * Pure geometric math, set-square (ê ke) alignment logic, and 3-level challenge banks
 * for "Hai Đường Thẳng Vuông Góc" (Vũ Trụ Hình Học Lớp 4).
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface LineSpec {
  p1: Point2D;
  p2: Point2D;
  label1: string;
  label2: string;
  nameVi: string;
}

export interface SetSquareState {
  /** SVG X coordinate of the 90° right-angle vertex of the set square */
  x: number;
  /** SVG Y coordinate of the 90° right-angle vertex of the set square */
  y: number;
  /**
   * Rotation angle in degrees (math convention: 0° = leg1 points right (+x),
   * +90° = leg1 points up (-y), and leg2 is always +90° CCW from leg1).
   */
  rotationDeg: number;
}

export interface SetSquareAlignmentResult {
  isLegOnLine: boolean;
  isOtherLegAtPoint: boolean;
  isFullyAligned: boolean;
  angleErrorDeg: number;
  lineDistancePx: number;
  pointDistancePx: number;
  alignedLeg: 1 | 2;
}

export type DrawTaskId =
  | 'b28_cd_horizontal_m_on'
  | 'b28_cd_slanted_m_on'
  | 'b28_cd_vertical_m_off'
  | 'b28_ab_horizontal_h_on'
  | 'b28_ab_horizontal_h_off'
  | 'lvl3_ab_slanted_p_off';

export interface PerpendicularDrawTask {
  id: DrawTaskId;
  badgeVi: string;
  titleVi: string;
  instructionVi: string;
  line: LineSpec;
  targetPoint: Point2D;
  targetPointLabel: string;
  drawnLineLabels: [string, string];
  pointPositionType: 'on_line' | 'off_line';
  initialSetSquare: SetSquareState;
}

export type CheckShapeId = 'pentagon_abcde' | 'trapezoid_abcd' | 'windmill_blades';

export interface CheckVertexSpec {
  id: string;
  label: string;
  point: Point2D;
  isRightAngle: boolean;
  pairNameVi: string;
  snapRotationDeg: number;
}

export interface CheckShapeTask {
  id: CheckShapeId;
  badgeVi: string;
  titleVi: string;
  instructionVi: string;
  vertices: CheckVertexSpec[];
  expectedRightPairsVi: string[];
  nonRightPairsVi: string[];
  initialSetSquare: SetSquareState;
}

export type PerpendicularChallengeLevel = 1 | 2 | 3;

export type PerpendicularDiagramPreset =
  | 'rect_abcd_extended'
  | 'om_on_four_rights'
  | 'pentagon_abcde_check'
  | 'trapezoid_abcd_check'
  | 'windmill_scene'
  | 'eke_step1_h_on'
  | 'eke_step1_h_off'
  | 'eke_wrong_acute_corner'
  | 'slanted_cd_m'
  | 'vertical_cd_m_off'
  | 'daily_objects_grid'
  | 'two_lines_intersect_non_perp'
  | 'right_triangle_abc_read'
  | 'rect_mnpq_read'
  | 'two_lines_xy_pq'
  | 'kite_bamboo_sticks'
  | 'crossroad_scene';

export interface PerpendicularChallengeQuestion {
  id: string;
  level: 1 | 2;
  categoryLabelVi: string;
  badgeTitleVi: string;
  promptVi: string;
  options: string[];
  correctOptionIndex: number;
  explanationVi: string;
  diagramPreset: PerpendicularDiagramPreset;
}

/** Normalize angle to [0, 360) */
export function normalizeDeg360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Minimal angular difference between two undirected lines in [0, 90] */
export function lineAngleDiffDeg(aDeg: number, bDeg: number): number {
  const diff = Math.abs(normalizeDeg360(aDeg) - normalizeDeg360(bDeg)) % 180;
  return diff > 90 ? 180 - diff : diff;
}

/** Convert math-convention angle (0° right, +90° up) to SVG unit vector */
export function mathDegToSvgUnit(deg: number): Point2D {
  const rad = (deg * Math.PI) / 180;
  return { x: Math.cos(rad), y: -Math.sin(rad) };
}

/** Direction angle of line p1->p2 in math convention (0° right, +90° up) */
export function getLineMathAngleDeg(line: Pick<LineSpec, 'p1' | 'p2'>): number {
  const dx = line.p2.x - line.p1.x;
  const dy = -(line.p2.y - line.p1.y);
  return normalizeDeg360((Math.atan2(dy, dx) * 180) / Math.PI);
}

/** Perpendicular distance from point P to infinite line through p1 and p2 */
export function distancePointToInfiniteLine(pt: Point2D, p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) return Math.hypot(pt.x - p1.x, pt.y - p1.y);
  return Math.abs(dy * pt.x - dx * pt.y + p2.x * p1.y - p2.y * p1.x) / len;
}

/** Orthogonal projection (foot of perpendicular) of point P onto infinite line p1->p2 */
export function projectPointOntoLine(pt: Point2D, p1: Point2D, p2: Point2D): Point2D {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-6) return { ...p1 };
  const t = ((pt.x - p1.x) * dx + (pt.y - p1.y) * dy) / lenSq;
  return {
    x: p1.x + t * dx,
    y: p1.y + t * dy,
  };
}

/**
 * Computes the two endpoints of the perpendicular line passing through targetPoint
 * perpendicular to `line`, extending `halfLength` on both sides of the foot of perpendicular.
 */
export function computePerpendicularLineEndpoints(
  line: Pick<LineSpec, 'p1' | 'p2'>,
  targetPoint: Point2D,
  halfLength = 155
): { start: Point2D; end: Point2D; foot: Point2D } {
  const foot = projectPointOntoLine(targetPoint, line.p1, line.p2);
  const lineAngle = getLineMathAngleDeg(line);
  const perpDir = mathDegToSvgUnit(lineAngle + 90);
  const distToFoot = Math.hypot(targetPoint.x - foot.x, targetPoint.y - foot.y);
  const extent = Math.max(halfLength, distToFoot + 80);
  return {
    foot,
    start: {
      x: foot.x + perpDir.x * extent,
      y: foot.y + perpDir.y * extent,
    },
    end: {
      x: foot.x - perpDir.x * extent,
      y: foot.y - perpDir.y * extent,
    },
  };
}

/**
 * Evaluates whether the set square (ê ke) is correctly aligned for drawing a perpendicular line:
 * - One right-angle leg lies along `line` (vertex on `line`, leg direction matches `line`).
 * - The second right-angle leg passes through `targetPoint` (and extends toward it).
 */
export function evaluateSetSquareAlignment(
  setSquare: SetSquareState,
  line: Pick<LineSpec, 'p1' | 'p2'>,
  targetPoint: Point2D,
  leg1Length = 145,
  leg2Length = 180
): SetSquareAlignmentResult {
  const lineAngle = getLineMathAngleDeg(line);
  const leg1DirDeg = normalizeDeg360(setSquare.rotationDeg);
  const leg2DirDeg = normalizeDeg360(setSquare.rotationDeg + 90);

  const lineDist = distancePointToInfiniteLine(
    { x: setSquare.x, y: setSquare.y },
    line.p1,
    line.p2
  );

  const checkCase = (
    onLineDeg: number,
    otherLegDeg: number,
    otherLegLen: number,
    alignedLeg: 1 | 2
  ) => {
    const angleErr = lineAngleDiffDeg(onLineDeg, lineAngle);
    const otherUnit = mathDegToSvgUnit(otherLegDeg);
    const vx = targetPoint.x - setSquare.x;
    const vy = targetPoint.y - setSquare.y;
    const along = vx * otherUnit.x + vy * otherUnit.y;
    const perpDist = Math.abs(vx * -otherUnit.y + vy * otherUnit.x);
    const rangePenalty =
      along < -18 ? -18 - along : along > otherLegLen + 25 ? along - (otherLegLen + 25) : 0;
    const pointErr = Math.hypot(perpDist, rangePenalty);

    const isLegOnLine = lineDist <= 14 && angleErr <= 6;
    const isOtherLegAtPoint = pointErr <= 16;

    return {
      isLegOnLine,
      isOtherLegAtPoint,
      isFullyAligned: isLegOnLine && isOtherLegAtPoint,
      angleErrorDeg: Math.round(angleErr * 10) / 10,
      lineDistancePx: Math.round(lineDist),
      pointDistancePx: Math.round(pointErr),
      alignedLeg,
      score: lineDist + angleErr * 3 + pointErr,
    };
  };

  const caseA = checkCase(leg1DirDeg, leg2DirDeg, leg2Length, 1);
  const caseB = checkCase(leg2DirDeg, leg1DirDeg, leg1Length, 2);
  const best = caseA.score <= caseB.score ? caseA : caseB;

  return {
    isLegOnLine: best.isLegOnLine,
    isOtherLegAtPoint: best.isOtherLegAtPoint,
    isFullyAligned: best.isFullyAligned,
    angleErrorDeg: best.angleErrorDeg,
    lineDistancePx: best.lineDistancePx,
    pointDistancePx: best.pointDistancePx,
    alignedLeg: best.alignedLeg,
  };
}

/**
 * Computes an exact snapped SetSquareState so leg1 lies along `line`
 * and leg2 passes directly through `targetPoint` (at the foot of perpendicular).
 */
export function computeSnapSetSquareState(
  line: Pick<LineSpec, 'p1' | 'p2'>,
  targetPoint: Point2D
): SetSquareState {
  const foot = projectPointOntoLine(targetPoint, line.p1, line.p2);
  const lineAngle = getLineMathAngleDeg(line);

  const dx = targetPoint.x - foot.x;
  const dy = targetPoint.y - foot.y;
  const dist = Math.hypot(dx, dy);

  let rotDeg = lineAngle;
  if (dist > 2) {
    const leg2Unit = mathDegToSvgUnit(lineAngle + 90);
    const dot = dx * leg2Unit.x + dy * leg2Unit.y;
    if (dot < 0) {
      rotDeg = normalizeDeg360(lineAngle + 180);
    }
  } else {
    const leg2Unit = mathDegToSvgUnit(lineAngle + 90);
    if (foot.y < 190 && leg2Unit.y < 0) {
      rotDeg = normalizeDeg360(lineAngle + 180);
    } else if (foot.y > 280 && leg2Unit.y > 0) {
      rotDeg = normalizeDeg360(lineAngle + 180);
    }
  }

  return {
    x: Math.round(foot.x * 10) / 10,
    y: Math.round(foot.y * 10) / 10,
    rotationDeg: Math.round(rotDeg * 10) / 10,
  };
}

/**
 * 5 Core Drawing Tasks for Phòng Thí Nghiệm Ê Ke
 */
export const PERPENDICULAR_DRAW_TASKS: PerpendicularDrawTask[] = [
  {
    id: 'b28_cd_horizontal_m_on',
    badgeVi: 'Nhiệm vụ 1 · Đường thẳng nằm ngang',
    titleVi: 'Vẽ đường thẳng HK đi qua M vuông góc với CD (CD nằm ngang)',
    instructionVi:
      'Đặt một cạnh góc vuông của ê ke trùng đường thẳng CD nằm ngang và cạnh góc vuông thứ hai gặp điểm M, sau đó bấm vạch đường thẳng HK.',
    line: {
      p1: { x: 140, y: 245 },
      p2: { x: 640, y: 245 },
      label1: 'C',
      label2: 'D',
      nameVi: 'CD',
    },
    targetPoint: { x: 390, y: 245 },
    targetPointLabel: 'M',
    drawnLineLabels: ['H', 'K'],
    pointPositionType: 'on_line',
    initialSetSquare: { x: 210, y: 345, rotationDeg: 18 },
  },
  {
    id: 'b28_cd_slanted_m_on',
    badgeVi: 'Nhiệm vụ 2 · Đường thẳng nằm nghiêng',
    titleVi: 'Vẽ đường thẳng HK đi qua M vuông góc với CD (CD nằm nghiêng)',
    instructionVi:
      'Đường thẳng CD nằm nghiêng! Em hãy kéo và xoay ê ke sao cho cạnh góc vuông trùng khít với CD và cạnh còn lại đi qua điểm M.',
    line: {
      p1: { x: 225, y: 385 },
      p2: { x: 535, y: 95 },
      label1: 'D',
      label2: 'C',
      nameVi: 'CD',
    },
    targetPoint: { x: 380, y: 240 },
    targetPointLabel: 'M',
    drawnLineLabels: ['H', 'K'],
    pointPositionType: 'on_line',
    initialSetSquare: { x: 180, y: 200, rotationDeg: 0 },
  },
  {
    id: 'b28_cd_vertical_m_off',
    badgeVi: 'Nhiệm vụ 3 · Điểm nằm ngoài đường thẳng đứng',
    titleVi: 'Vẽ đường thẳng HK đi qua M ngoài đường thẳng đứng CD',
    instructionVi:
      'Điểm M nằm ngoài đường thẳng đứng CD. Đặt một cạnh góc vuông ê ke trượt dọc theo CD cho đến khi cạnh góc vuông thứ hai chạm điểm M!',
    line: {
      p1: { x: 340, y: 65 },
      p2: { x: 340, y: 415 },
      label1: 'C',
      label2: 'D',
      nameVi: 'CD',
    },
    targetPoint: { x: 455, y: 240 },
    targetPointLabel: 'M',
    drawnLineLabels: ['H', 'K'],
    pointPositionType: 'off_line',
    initialSetSquare: { x: 180, y: 310, rotationDeg: 25 },
  },
  {
    id: 'b28_ab_horizontal_h_on',
    badgeVi: 'Nhiệm vụ 4 · Điểm H nằm trên đường thẳng',
    titleVi: 'Vẽ đường thẳng CD đi qua điểm H nằm trên đường thẳng AB',
    instructionVi:
      'Điểm H ở trên đường thẳng AB: Đặt đỉnh góc vuông ê ke tại H, một cạnh trùng AB rồi vạch đường thẳng CD theo cạnh góc vuông thứ hai.',
    line: {
      p1: { x: 140, y: 235 },
      p2: { x: 640, y: 235 },
      label1: 'A',
      label2: 'B',
      nameVi: 'AB',
    },
    targetPoint: { x: 360, y: 235 },
    targetPointLabel: 'H',
    drawnLineLabels: ['C', 'D'],
    pointPositionType: 'on_line',
    initialSetSquare: { x: 220, y: 350, rotationDeg: 345 },
  },
  {
    id: 'b28_ab_horizontal_h_off',
    badgeVi: 'Nhiệm vụ 5 · Điểm H nằm ngoài đường thẳng',
    titleVi: 'Vẽ đường thẳng CD đi qua điểm H nằm ngoài đường thẳng AB',
    instructionVi:
      'Điểm H ở ngoài đường thẳng AB: Đặt một cạnh góc vuông ê ke trùng đường thẳng AB, trượt ê ke để cạnh góc vuông kia gặp điểm H rồi vạch CD.',
    line: {
      p1: { x: 140, y: 180 },
      p2: { x: 640, y: 180 },
      label1: 'A',
      label2: 'B',
      nameVi: 'AB',
    },
    targetPoint: { x: 410, y: 275 },
    targetPointLabel: 'H',
    drawnLineLabels: ['C', 'D'],
    pointPositionType: 'off_line',
    initialSetSquare: { x: 220, y: 340, rotationDeg: 10 },
  },
];

/**
 * 6 Hands-On Interactive Ê Ke Tasks for Level 3 Challenge (Bậc Thầy Ê Ke)
 */
export const PERPENDICULAR_LEVEL3_TASKS: PerpendicularDrawTask[] = [
  ...PERPENDICULAR_DRAW_TASKS,
  {
    id: 'lvl3_ab_slanted_p_off',
    badgeVi: 'Thử thách đặc biệt · Đường nghiêng và điểm ngoài',
    titleVi: 'Vẽ đường thẳng EF đi qua điểm P nằm ngoài đường thẳng nghiêng AB',
    instructionVi:
      'Thử thách đỉnh cao! Đường thẳng AB nằm nghiêng và điểm P ở ngoài AB. Hãy xoay ê ke trùng AB và trượt để cạnh góc vuông kia chạm điểm P rồi vạch EF!',
    line: {
      p1: { x: 170, y: 325 },
      p2: { x: 560, y: 145 },
      label1: 'A',
      label2: 'B',
      nameVi: 'AB',
    },
    targetPoint: { x: 425, y: 300 },
    targetPointLabel: 'P',
    drawnLineLabels: ['E', 'F'],
    pointPositionType: 'off_line',
    initialSetSquare: { x: 165, y: 220, rotationDeg: 10 },
  },
];

/**
 * 3 Interactive Right-Angle Checking Shapes
 */
export const PERPENDICULAR_CHECK_TASKS: CheckShapeTask[] = [
  {
    id: 'pentagon_abcde',
    badgeVi: 'Kiểm tra hình ngũ giác',
    titleVi: 'Dùng ê ke kiểm tra góc vuông trên hình ABCDE',
    instructionVi:
      'Kéo và xoay chiếc ê ke (hoặc bấm vào từng đỉnh A, B, C, D, E để ướm nhanh ê ke) rồi đọc tên các cặp đoạn thẳng vuông góc với nhau!',
    vertices: [
      {
        id: 'A',
        label: 'A',
        point: { x: 230, y: 280 },
        isRightAngle: true,
        pairNameVi: 'Cạnh AB vuông góc với cạnh AE tại đỉnh A',
        snapRotationDeg: 330,
      },
      {
        id: 'B',
        label: 'B',
        point: { x: 310, y: 141.4 },
        isRightAngle: false,
        pairNameVi: 'Cạnh AB và cạnh BC cắt nhau tại đỉnh B nhưng không vuông góc (góc tù 120°)',
        snapRotationDeg: 270,
      },
      {
        id: 'C',
        label: 'C',
        point: { x: 520, y: 141.4 },
        isRightAngle: true,
        pairNameVi: 'Cạnh BC vuông góc với cạnh CD tại đỉnh C',
        snapRotationDeg: 180,
      },
      {
        id: 'D',
        label: 'D',
        point: { x: 520, y: 326.4 },
        isRightAngle: true,
        pairNameVi: 'Cạnh CD vuông góc với cạnh DE tại đỉnh D',
        snapRotationDeg: 90,
      },
      {
        id: 'E',
        label: 'E',
        point: { x: 310, y: 326.4 },
        isRightAngle: false,
        pairNameVi: 'Cạnh AE và cạnh DE cắt nhau tại đỉnh E nhưng không vuông góc (góc tù 150°)',
        snapRotationDeg: 0,
      },
    ],
    expectedRightPairsVi: [
      'Cạnh AB vuông góc với cạnh AE tại đỉnh A',
      'Cạnh BC vuông góc với cạnh CD tại đỉnh C',
      'Cạnh CD vuông góc với cạnh DE tại đỉnh D',
    ],
    nonRightPairsVi: [
      'Cạnh AB và cạnh BC (góc tù tại đỉnh B)',
      'Cạnh AE và cạnh DE (góc tù tại đỉnh E)',
    ],
    initialSetSquare: { x: 165, y: 390, rotationDeg: 0 },
  },
  {
    id: 'trapezoid_abcd',
    badgeVi: 'Kiểm tra hình tứ giác',
    titleVi: 'Kiểm tra các cặp cạnh trên hình tứ giác ABCD',
    instructionVi:
      'Cho hình tứ giác ABCD có góc đỉnh A và đỉnh D là góc vuông. Dùng ê ke kiểm tra từng đỉnh để phân biệt cặp cạnh vuông góc và cặp cạnh cắt nhau không vuông góc.',
    vertices: [
      {
        id: 'A',
        label: 'A',
        point: { x: 240, y: 150 },
        isRightAngle: true,
        pairNameVi: 'Cạnh AB vuông góc với cạnh AD tại đỉnh A',
        snapRotationDeg: 270,
      },
      {
        id: 'B',
        label: 'B',
        point: { x: 440, y: 150 },
        isRightAngle: false,
        pairNameVi: 'Cạnh AB và cạnh BC cắt nhau không vuông góc tại đỉnh B (góc tù 135°)',
        snapRotationDeg: 180,
      },
      {
        id: 'C',
        label: 'C',
        point: { x: 590, y: 300 },
        isRightAngle: false,
        pairNameVi: 'Cạnh BC và cạnh CD cắt nhau không vuông góc tại đỉnh C (góc nhọn 45°)',
        snapRotationDeg: 90,
      },
      {
        id: 'D',
        label: 'D',
        point: { x: 240, y: 300 },
        isRightAngle: true,
        pairNameVi: 'Cạnh AD vuông góc với cạnh DC tại đỉnh D',
        snapRotationDeg: 0,
      },
    ],
    expectedRightPairsVi: [
      'Cạnh AB vuông góc với cạnh AD tại đỉnh A',
      'Cạnh AD vuông góc với cạnh DC tại đỉnh D',
    ],
    nonRightPairsVi: [
      'Cạnh AB và cạnh BC (cắt nhau tại đỉnh B)',
      'Cạnh BC và cạnh CD (cắt nhau tại đỉnh C)',
    ],
    initialSetSquare: { x: 160, y: 390, rotationDeg: 0 },
  },
  {
    id: 'windmill_blades',
    badgeVi: 'Kiểm tra vật thể thực tế',
    titleVi: 'Kiểm tra hai thanh cánh quạt cối xay gió',
    instructionVi:
      'Hãy đặt ê ke vào tâm O của chiếc cối xay gió để kiểm tra xem hai thanh cánh quạt cắt nhau tạo thành mấy góc vuông nhé!',
    vertices: [
      {
        id: 'O1',
        label: 'Góc trên (tâm O)',
        point: { x: 390, y: 235 },
        isRightAngle: true,
        pairNameVi: 'Hai cánh quạt phía trên vuông góc với nhau tại tâm O (90°)',
        snapRotationDeg: 45,
      },
      {
        id: 'O2',
        label: 'Góc phải (tâm O)',
        point: { x: 390, y: 235 },
        isRightAngle: true,
        pairNameVi: 'Hai cánh quạt bên phải vuông góc với nhau tại tâm O (90°)',
        snapRotationDeg: 315,
      },
      {
        id: 'O3',
        label: 'Góc dưới (tâm O)',
        point: { x: 390, y: 235 },
        isRightAngle: true,
        pairNameVi: 'Hai cánh quạt phía dưới vuông góc với nhau tại tâm O (90°)',
        snapRotationDeg: 225,
      },
      {
        id: 'O4',
        label: 'Góc trái (tâm O)',
        point: { x: 390, y: 235 },
        isRightAngle: true,
        pairNameVi: 'Hai cánh quạt bên trái vuông góc với nhau tại tâm O (90°)',
        snapRotationDeg: 135,
      },
    ],
    expectedRightPairsVi: [
      'Hai thanh cánh quạt cối xay gió vuông góc nhau tạo thành 4 góc vuông chung tâm O',
    ],
    nonRightPairsVi: [],
    initialSetSquare: { x: 170, y: 360, rotationDeg: 0 },
  },
];

/**
 * LEVEL 1: Nhà Du Hành Tập Sự (10 câu hỏi nhận biết thực tế và khái niệm cơ bản)
 */
export const PERPENDICULAR_LEVEL1_QUESTIONS: PerpendicularChallengeQuestion[] = [
  {
    id: 'perp-l1-1',
    level: 1,
    categoryLabelVi: '🪁 Quan Sát Thực Tế',
    badgeTitleVi: 'Khung tre làm con diều',
    promptVi:
      'Để con diều bay thăng bằng trên bầu trời, hai thanh tre làm khung diều trong hình được buộc với nhau như thế nào?',
    options: [
      'Vuông góc với nhau (tạo thành góc vuông 90°)',
      'Không bao giờ cắt nhau',
      'Tạo thành góc nhọn rất bé',
      'Trùng khít hoàn toàn lên nhau',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Hai thanh tre khung diều cắt nhau tạo thành góc vuông 90°, đó là hình ảnh quen thuộc của hai đường thẳng vuông góc với nhau.',
    diagramPreset: 'kite_bamboo_sticks',
  },
  {
    id: 'perp-l1-2',
    level: 1,
    categoryLabelVi: '📐 Khái Niệm Cơ Bản',
    badgeTitleVi: 'Kéo dài cạnh hình chữ nhật ABCD',
    promptVi:
      'Khi kéo dài hai cạnh kề nhau AB và AD của hình chữ nhật ABCD, ta được hai đường thẳng như thế nào với nhau?',
    options: [
      'Hai đường thẳng vuông góc với nhau',
      'Hai đường thẳng không bao giờ gặp nhau',
      'Hai đường thẳng tạo thành góc nhọn 60°',
      'Hai đường thẳng tạo thành góc tù 120°',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Vì góc đỉnh A của hình chữ nhật ABCD là góc vuông (90°), nên khi kéo dài hai cạnh AB và AD ta được hai đường thẳng vuông góc với nhau tại đỉnh A.',
    diagramPreset: 'rect_abcd_extended',
  },
  {
    id: 'perp-l1-3',
    level: 1,
    categoryLabelVi: '➕ Bốn Góc Vuông Chung Đỉnh',
    badgeTitleVi: 'Hai đường thẳng OM và ON',
    promptVi:
      'Hai đường thẳng OM và ON vuông góc với nhau tại O sẽ tạo thành bao nhiêu góc vuông có chung đỉnh O?',
    options: ['4 góc vuông', '1 góc vuông', '2 góc vuông', '3 góc vuông'],
    correctOptionIndex: 0,
    explanationVi:
      'Hai đường thẳng OM và ON cắt nhau vuông góc tại O luôn tạo thành đúng 4 góc vuông có chung đỉnh O.',
    diagramPreset: 'om_on_four_rights',
  },
  {
    id: 'perp-l1-4',
    level: 1,
    categoryLabelVi: '📏 Dụng Cụ Học Tập',
    badgeTitleVi: 'Chọn dụng cụ kiểm tra và vẽ',
    promptVi:
      'Trong hộp bút học Toán, ta thường dùng dụng cụ nào để kiểm tra hoặc vẽ hai đường thẳng vuông góc với nhau?',
    options: ['Thước ê ke', 'Compa', 'Thước dây cuộn', 'Cục tẩy'],
    correctOptionIndex: 0,
    explanationVi:
      'Thước ê ke có 1 góc vuông chuẩn 90° nên rất thuận tiện để kiểm tra góc vuông và vẽ hai đường thẳng vuông góc.',
    diagramPreset: 'eke_step1_h_on',
  },
  {
    id: 'perp-l1-5',
    level: 1,
    categoryLabelVi: '🌻 Toán Học Quanh Em',
    badgeTitleVi: 'Bức tranh cối xay gió',
    promptVi:
      'Quan sát bức tranh cối xay gió bên cạnh, chi tiết nào thể hiện rõ hình ảnh hai đường thẳng vuông góc?',
    options: [
      'Hai thanh cánh quạt bắt chéo nhau và khung tranh hình chữ nhật',
      'Những đám mây trắng tròn trên bầu trời',
      'Ngọn đồi xanh uốn lượn phía dưới',
      'Tán lá tròn của các cây xanh',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Hai thanh cánh quạt cối xay gió bắt chéo vuông góc nhau tại tâm, đồng thời 4 góc khung tranh hình chữ nhật và nan cửa sổ cũng vuông góc với nhau.',
    diagramPreset: 'windmill_scene',
  },
  {
    id: 'perp-l1-6',
    level: 1,
    categoryLabelVi: '🌍 Đồ Vật Quanh Em',
    badgeTitleVi: 'Nhận diện trong lớp học',
    promptVi:
      'Nhóm đồ vật nào dưới đây đều có hình ảnh hai đường thẳng vuông góc với nhau?',
    options: [
      'Hai cạnh kề nhau của bảng lớp, khung cửa sổ và góc quyển vở',
      'Mặt bánh xe đạp, chiếc đĩa tròn và quả bóng đá',
      'Quả cam, viên bi ve và mặt đồng hồ hình tròn',
      'Hạt đậu, giọt nước và chiếc vòng tay tròn',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Góc bảng lớp học, khung cửa sổ hình chữ nhật và góc quyển vở đều tạo thành góc vuông 90° của hai cạnh vuông góc.',
    diagramPreset: 'daily_objects_grid',
  },
  {
    id: 'perp-l1-7',
    level: 1,
    categoryLabelVi: '🚦 Đời Sống Quanh Em',
    badgeTitleVi: 'Ngã tư đường phố',
    promptVi:
      'Quan sát mô hình ngã tư hình chữ thập bên cạnh. Hai con đường cắt nhau tạo thành 4 góc bằng nhau đều bằng 90°. Hai con đường đó như thế nào?',
    options: [
      'Vuông góc với nhau',
      'Song song không bao giờ gặp nhau',
      'Cắt nhau tạo góc nhọn',
      'Không cắt nhau',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Hai con đường cắt nhau tạo thành góc 90° (góc vuông) là hình ảnh thực tế của hai đường thẳng vuông góc với nhau.',
    diagramPreset: 'crossroad_scene',
  },
  {
    id: 'perp-l1-8',
    level: 1,
    categoryLabelVi: '🔍 Phân Biệt Cắt Nhau',
    badgeTitleVi: 'Hai đường thẳng cắt nhau',
    promptVi:
      'Quan sát hai đường thẳng cắt nhau tạo thành góc 60° và góc 120° trong hình bên. Hai đường thẳng này có vuông góc với nhau không?',
    options: [
      'Không vuông góc, vì góc tạo thành không phải góc vuông (90°)',
      'Có vuông góc, vì hai đường thẳng có cắt nhau',
      'Có vuông góc, vì có góc tù 120°',
      'Hai đường thẳng này không cắt nhau',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Hai đường thẳng cắt nhau chỉ vuông góc khi chúng tạo thành góc vuông 90°. Góc 60° (góc nhọn) và 120° (góc tù) không phải góc vuông.',
    diagramPreset: 'two_lines_intersect_non_perp',
  },
  {
    id: 'perp-l1-9',
    level: 1,
    categoryLabelVi: '🔺 Cấu Tạo Chiếc Ê Ke',
    badgeTitleVi: 'Các góc của thước ê ke',
    promptVi: 'Trên một chiếc thước ê ke hình tam giác có bao nhiêu góc vuông?',
    options: ['Chỉ có 1 góc vuông', 'Có 2 góc vuông', 'Có 3 góc vuông', 'Không có góc vuông nào'],
    correctOptionIndex: 0,
    explanationVi:
      'Một chiếc thước ê ke chỉ có duy nhất 1 góc vuông (90°) và 2 góc nhọn. Ta luôn dùng góc vuông này để kiểm tra và vẽ vuông góc.',
    diagramPreset: 'eke_step1_h_on',
  },
  {
    id: 'perp-l1-10',
    level: 1,
    categoryLabelVi: '⚠️ Tránh Nhầm Lẫn',
    badgeTitleVi: 'Kiểm tra cách đặt ê ke',
    promptVi:
      'Bạn Nam đặt góc nhọn của thước ê ke vào đường thẳng như hình bên để vẽ đường vuông góc. Cách đặt đó đúng hay sai?',
    options: [
      'Sai, vì phải dùng đúng góc vuông 90° của ê ke',
      'Đúng, vì góc nào của ê ke cũng vẽ được đường vuông góc',
      'Đúng, miễn là ê ke chạm vào điểm H',
      'Không thể kiểm tra được',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Nếu đặt góc nhọn của ê ke thì đường vạch ra sẽ bị nghiêng (không tạo góc 90°). Phải dùng đúng 2 cạnh góc vuông của ê ke!',
    diagramPreset: 'eke_wrong_acute_corner',
  },
];

/**
 * LEVEL 2: Nhà Khoa Học Nhí (10 câu hỏi đọc tên cạnh vuông góc, đếm cặp cạnh và quy trình 2 bước vẽ)
 */
export const PERPENDICULAR_LEVEL2_QUESTIONS: PerpendicularChallengeQuestion[] = [
  {
    id: 'perp-l2-1',
    level: 2,
    categoryLabelVi: '🗣️ Cách Đọc Tên Cạnh Vuông Góc',
    badgeTitleVi: 'Hình tam giác vuông ABC',
    promptVi:
      'Quan sát hình tam giác ABC có kí hiệu góc vuông tại đỉnh A. Cách đọc nào sau đây chính xác nhất?',
    options: [
      'Cạnh AB vuông góc với cạnh AC tại đỉnh A',
      'Cạnh AB vuông góc với cạnh BC tại đỉnh B',
      'Cạnh AC vuông góc với cạnh BC tại đỉnh C',
      'Cả 3 cạnh đều vuông góc với nhau',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Góc vuông nằm tại đỉnh A do cạnh AB và cạnh AC tạo thành, nên ta đọc: "Cạnh AB vuông góc với cạnh AC tại đỉnh A".',
    diagramPreset: 'right_triangle_abc_read',
  },
  {
    id: 'perp-l2-2',
    level: 2,
    categoryLabelVi: '🗣️ Đọc Tên Trong Hình Chữ Nhật',
    badgeTitleVi: 'Hình chữ nhật MNPQ',
    promptVi:
      'Trong hình chữ nhật MNPQ bên cạnh, cạnh MN vuông góc với những cạnh nào?',
    options: [
      'Cạnh MQ (tại đỉnh M) và cạnh NP (tại đỉnh N)',
      'Chỉ có cạnh PQ',
      'Chỉ có cạnh MQ, không vuông góc cạnh NP',
      'Không vuông góc với cạnh nào',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Trong hình chữ nhật MNPQ có 4 góc vuông tại M, N, P, Q nên cạnh MN vuông góc với cạnh MQ tại đỉnh M và vuông góc với cạnh NP tại đỉnh N.',
    diagramPreset: 'rect_mnpq_read',
  },
  {
    id: 'perp-l2-3',
    level: 2,
    categoryLabelVi: '🔢 Đếm Cặp Cạnh Vuông Góc',
    badgeTitleVi: 'Hình chữ nhật MNPQ',
    promptVi:
      'Hình chữ nhật MNPQ có tất cả bao nhiêu cặp cạnh vuông góc với nhau?',
    options: ['4 cặp cạnh vuông góc', '1 cặp cạnh vuông góc', '2 cặp cạnh vuông góc', '3 cặp cạnh vuông góc'],
    correctOptionIndex: 0,
    explanationVi:
      '4 cặp cạnh vuông góc tại 4 đỉnh là: MN vuông góc NP (đỉnh N), NP vuông góc PQ (đỉnh P), PQ vuông góc QM (đỉnh Q) và QM vuông góc MN (đỉnh M).',
    diagramPreset: 'rect_mnpq_read',
  },
  {
    id: 'perp-l2-4',
    level: 2,
    categoryLabelVi: '🔺 Phân Tích Hình Ngũ Giác',
    badgeTitleVi: 'Hình ngũ giác ABCDE',
    promptVi:
      'Quan sát hình ngũ giác ABCDE bên cạnh. Cặp cạnh nào sau đây vuông góc với nhau?',
    options: [
      'Cạnh BC vuông góc với cạnh CD tại đỉnh C',
      'Cạnh AB vuông góc với cạnh BC tại đỉnh B',
      'Cạnh AE vuông góc với cạnh DE tại đỉnh E',
      'Không có cặp cạnh nào vuông góc',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Khi dùng ê ke kiểm tra, góc đỉnh C là góc vuông 90° nên cạnh BC vuông góc với cạnh CD tại đỉnh C (ngoài ra còn có CD vuông góc DE tại D và AB vuông góc AE tại A).',
    diagramPreset: 'pentagon_abcde_check',
  },
  {
    id: 'perp-l2-5',
    level: 2,
    categoryLabelVi: '🔢 Đếm Cặp Cạnh Trong Hình',
    badgeTitleVi: 'Hình ngũ giác ABCDE',
    promptVi:
      'Khi kiểm tra đầy đủ 5 đỉnh A, B, C, D, E của hình ABCDE bằng ê ke, trong hình có tất cả mấy cặp cạnh vuông góc với nhau?',
    options: [
      '3 cặp (tại đỉnh A, đỉnh C và đỉnh D)',
      '1 cặp (chỉ tại đỉnh C)',
      '2 cặp (tại đỉnh C và đỉnh D)',
      '5 cặp (tại cả 5 đỉnh)',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Hình ABCDE có đúng 3 góc vuông tại A, C và D, tương ứng với 3 cặp cạnh vuông góc: AB và AE (tại A), BC và CD (tại C), CD và DE (tại D).',
    diagramPreset: 'pentagon_abcde_check',
  },
  {
    id: 'perp-l2-6',
    level: 2,
    categoryLabelVi: '📐 Phân Tích Hình Tứ Giác',
    badgeTitleVi: 'Hình tứ giác ABCD',
    promptVi:
      'Cho hình tứ giác ABCD có góc đỉnh A và góc đỉnh D là góc vuông. Hãy chọn cách đọc đúng các cặp cạnh vuông góc!',
    options: [
      'Cạnh AB vuông góc cạnh AD (tại A) và cạnh AD vuông góc cạnh DC (tại D)',
      'Cạnh AB vuông góc cạnh BC (tại B) và cạnh BC vuông góc cạnh CD (tại C)',
      'Chỉ có cạnh AB vuông góc cạnh DC',
      'Cả 4 cặp cạnh đều vuông góc với nhau',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Vì góc đỉnh A là góc vuông nên cạnh AB vuông góc với cạnh AD tại đỉnh A; vì góc đỉnh D là góc vuông nên cạnh AD vuông góc với cạnh DC tại đỉnh D.',
    diagramPreset: 'trapezoid_abcd_check',
  },
  {
    id: 'perp-l2-7',
    level: 2,
    categoryLabelVi: '🔍 Cắt Nhau Không Vuông Góc',
    badgeTitleVi: 'Hình tứ giác ABCD',
    promptVi:
      'Trên hình tứ giác ABCD (vuông tại A và D), những cặp cạnh nào CẮT NHAU MÀ KHÔNG VUÔNG GÓC với nhau?',
    options: [
      'Cạnh AB và cạnh BC (tại B); cạnh BC và cạnh CD (tại C)',
      'Cạnh AB và cạnh AD (tại A); cạnh AD và cạnh DC (tại D)',
      'Cạnh AB và cạnh DC',
      'Không có cặp cạnh nào',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Tại đỉnh B (góc tù) cạnh AB cắt cạnh BC nhưng không vuông góc; tại đỉnh C (góc nhọn) cạnh BC cắt cạnh CD nhưng không vuông góc.',
    diagramPreset: 'trapezoid_abcd_check',
  },
  {
    id: 'perp-l2-8',
    level: 2,
    categoryLabelVi: '🗣️ Đọc Tên Hai Đường Thẳng',
    badgeTitleVi: 'Hai đường thẳng XY và PQ',
    promptVi:
      'Quan sát hình hai đường thẳng XY và PQ cắt nhau tạo góc vuông tại điểm O. Cách đọc nào sau đây đúng?',
    options: [
      'Đường thẳng XY vuông góc với đường thẳng PQ tại điểm O',
      'Đường thẳng XP vuông góc với đường thẳng YQ tại điểm O',
      'Đường thẳng XY song song với đường thẳng PQ',
      'Hai đường thẳng XY và PQ không cắt nhau',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Ta đọc tên từng đường thẳng kèm giao điểm: "Đường thẳng XY vuông góc với đường thẳng PQ tại điểm O".',
    diagramPreset: 'two_lines_xy_pq',
  },
  {
    id: 'perp-l2-9',
    level: 2,
    categoryLabelVi: '✏️ Quy Trình Vẽ Bằng Ê Ke',
    badgeTitleVi: 'Bước 1 đặt thước ê ke',
    promptVi:
      'Để vẽ đường thẳng CD đi qua điểm H (nằm trên AB) và vuông góc với đường thẳng AB, ở Bước 1 ta đặt ê ke như thế nào?',
    options: [
      'Đặt một cạnh góc vuông của ê ke trùng đường thẳng AB và cạnh góc vuông thứ hai gặp điểm H',
      'Đặt cạnh dài nhất (cạnh huyền) của ê ke trùng đường thẳng AB',
      'Đặt góc nhọn của ê ke chạm vào điểm H',
      'Đặt ê ke cách xa điểm H rồi vẽ tự do',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Bước 1: Đặt một cạnh góc vuông của ê ke trùng khít đường thẳng AB và cạnh góc vuông thứ hai đi qua đúng điểm H.',
    diagramPreset: 'eke_step1_h_on',
  },
  {
    id: 'perp-l2-10',
    level: 2,
    categoryLabelVi: '✏️ Quy Trình Vẽ Bằng Ê Ke',
    badgeTitleVi: 'Điểm H nằm ngoài đường thẳng AB',
    promptVi:
      'Khi điểm H nằm NGOÀI đường thẳng AB và em đã đặt chuẩn ê ke ở Bước 1, ở Bước 2 em làm gì để vẽ xong đường thẳng CD?',
    options: [
      'Giữ cố định ê ke, vạch một đường thẳng theo cạnh góc vuông thứ hai đi qua điểm H',
      'Nhấc ê ke ra rồi dùng tay nối tự do',
      'Vạch đường thẳng dọc theo cạnh dài nhất (cạnh huyền) của ê ke',
      'Kéo dài đường thẳng AB sang hai bên',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Bước 2: Giữ cố định ê ke, vạch đường thẳng dọc theo cạnh góc vuông thứ hai đi qua H, ta được đường thẳng CD vuông góc với AB.',
    diagramPreset: 'eke_step1_h_off',
  },
];

/** Combined bank for convenience */
export const PERPENDICULAR_CHALLENGES: PerpendicularChallengeQuestion[] = [
  ...PERPENDICULAR_LEVEL1_QUESTIONS,
  ...PERPENDICULAR_LEVEL2_QUESTIONS,
];

export function getPerpendicularQuestionsByLevel(
  level: 1 | 2
): PerpendicularChallengeQuestion[] {
  return level === 1 ? PERPENDICULAR_LEVEL1_QUESTIONS : PERPENDICULAR_LEVEL2_QUESTIONS;
}
