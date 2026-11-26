/**
 * Pure geometry, perimeter, interactive slider missions, and 3-level challenge bank
 * for Grade 4 Topic 4: Hình Thoi, Hình Bình Hành (Rhombus & Parallelogram).
 *
 * Pedagogical rules strictly enforced:
 * - Grade 4 studies properties (opposite parallel/equal sides) and PERIMETER ONLY (no area).
 * - Never use shorthand symbols "//" or "⊥" — always write "song song với" and "vuông góc với".
 * - Never include textbook citations (e.g., "Bài 31", "SGK").
 */

export interface ShapePoint2D {
  x: number;
  y: number;
}

export interface QuadVertices {
  A: ShapePoint2D;
  B: ShapePoint2D;
  C: ShapePoint2D;
  D: ShapePoint2D;
}

export function distance2D(p1: ShapePoint2D, p2: ShapePoint2D): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * Computes exact SVG vertices for Parallelogram ABCD:
 * - A (top-left), B (top-right), C (bottom-right), D (bottom-left)
 * - AB = DC = sideA, AD = BC = sideB
 * - AB song song với DC, AD song song với BC
 * - Interior angle at D is tiltDeg (clamped 45..135)
 */
export function computeParallelogramVertices(
  sideA: number,
  sideB: number,
  tiltDeg: number,
  centerX = 280,
  centerY = 175,
  pxPerCm = 24
): QuadVertices {
  const clampedTilt = Math.max(45, Math.min(135, tiltDeg));
  const rad = (clampedTilt * Math.PI) / 180;
  const aPx = sideA * pxPerCm;
  const bPx = sideB * pxPerCm;
  const dx = Math.cos(rad) * bPx;
  const dy = Math.sin(rad) * bPx;

  // Raw coordinates with D at origin, C at (aPx, 0), A at (dx, -dy), B at (dx + aPx, -dy)
  const rawD = { x: 0, y: 0 };
  const rawC = { x: aPx, y: 0 };
  const rawA = { x: dx, y: -dy };
  const rawB = { x: dx + aPx, y: -dy };

  // Center bounding box around (centerX, centerY)
  const minX = Math.min(rawA.x, rawB.x, rawC.x, rawD.x);
  const maxX = Math.max(rawA.x, rawB.x, rawC.x, rawD.x);
  const minY = Math.min(rawA.y, rawB.y, rawC.y, rawD.y);
  const maxY = Math.max(rawA.y, rawB.y, rawC.y, rawD.y);

  const offsetX = centerX - (minX + maxX) / 2;
  const offsetY = centerY - (minY + maxY) / 2;

  return {
    A: { x: rawA.x + offsetX, y: rawA.y + offsetY },
    B: { x: rawB.x + offsetX, y: rawB.y + offsetY },
    C: { x: rawC.x + offsetX, y: rawC.y + offsetY },
    D: { x: rawD.x + offsetX, y: rawD.y + offsetY },
  };
}

/**
 * Computes exact SVG vertices for Rhombus ABCD (diamond orientation matching Grade 4 curriculum):
 * - A (left), B (top), C (right), D (bottom)
 * - AB = BC = CD = DA = sideA
 * - AB song song với DC, AD song song với BC
 * - angleAtADeg controls the left/right vertex angle (clamped 40..120)
 */
export function computeRhombusVertices(
  sideA: number,
  angleAtADeg: number,
  centerX = 280,
  centerY = 175,
  pxPerCm = 24
): QuadVertices {
  const clampedAngle = Math.max(40, Math.min(120, angleAtADeg));
  const halfRad = ((clampedAngle / 2) * Math.PI) / 180;
  const aPx = sideA * pxPerCm;

  const halfHorizontalDiag = Math.cos(halfRad) * aPx;
  const halfVerticalDiag = Math.sin(halfRad) * aPx;

  return {
    A: { x: centerX - halfHorizontalDiag, y: centerY },
    B: { x: centerX, y: centerY - halfVerticalDiag },
    C: { x: centerX + halfHorizontalDiag, y: centerY },
    D: { x: centerX, y: centerY + halfVerticalDiag },
  };
}

/**
 * Normalizes any rotation angle into [0, 360) degrees.
 */
export function normalizeRotationDeg(deg: number): number {
  const mod = deg % 360;
  return mod < 0 ? mod + 360 : mod;
}

/**
 * Rotates a 2D point clockwise around (centerX, centerY) in SVG coordinates.
 */
export function rotatePoint2D(
  pt: ShapePoint2D,
  centerX: number,
  centerY: number,
  rotationDeg: number
): ShapePoint2D {
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = pt.x - centerX;
  const dy = pt.y - centerY;
  return {
    x: centerX + dx * cos - dy * sin,
    y: centerY + dx * sin + dy * cos,
  };
}

/**
 * Rotates all 4 vertices of a quadrilateral around (centerX, centerY),
 * preserving exact side lengths, opposite parallelism, and perimeter.
 */
export function rotateQuadVertices(
  vertices: QuadVertices,
  rotationDeg: number,
  centerX = 280,
  centerY = 170
): QuadVertices {
  if (normalizeRotationDeg(rotationDeg) === 0) return vertices;
  return {
    A: rotatePoint2D(vertices.A, centerX, centerY, rotationDeg),
    B: rotatePoint2D(vertices.B, centerX, centerY, rotationDeg),
    C: rotatePoint2D(vertices.C, centerX, centerY, rotationDeg),
    D: rotatePoint2D(vertices.D, centerX, centerY, rotationDeg),
  };
}

/**
 * Computes an outward label position offset perpendicular to edge p1-p2,
 * always pointing away from the polygon center so badges stay crisp at any 0..360° angle.
 */
export function getOutwardEdgeLabelPos(
  p1: ShapePoint2D,
  p2: ShapePoint2D,
  center: ShapePoint2D,
  offsetPx = 24
): ShapePoint2D {
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  const ex = p2.x - p1.x;
  const ey = p2.y - p1.y;
  const len = Math.hypot(ex, ey) || 1;
  // Two perpendicular unit normals
  let nx = -ey / len;
  let ny = ex / len;
  // Ensure normal points away from polygon center
  if (nx * (midX - center.x) + ny * (midY - center.y) < 0) {
    nx = -nx;
    ny = -ny;
  }
  return {
    x: midX + nx * offsetPx,
    y: midY + ny * offsetPx,
  };
}

/**
 * Computes an outward position for a vertex letter (A, B, C, D) along the ray from center.
 */
export function getOutwardVertexLabelPos(
  pt: ShapePoint2D,
  center: ShapePoint2D,
  offsetPx = 20
): ShapePoint2D {
  const dx = pt.x - center.x;
  const dy = pt.y - center.y;
  const len = Math.hypot(dx, dy) || 1;
  return {
    x: pt.x + (dx / len) * offsetPx,
    y: pt.y + (dy / len) * offsetPx,
  };
}

/**
 * Computes a safe pixels-per-cm scale so a rotated parallelogram or rhombus
 * never clips outside its SVG viewport regardless of 0..360° orientation.
 */
export function computeSafePxPerCm(
  shapeType: ShapesLabMissionType,
  sideA: number,
  sideB: number,
  angleDeg: number,
  maxRadiusPx = 112,
  maxPxPerCm = 24
): number {
  const unitVerts =
    shapeType === 'parallelogram'
      ? computeParallelogramVertices(sideA, sideB, angleDeg, 0, 0, 1)
      : computeRhombusVertices(sideA, angleDeg, 0, 0, 1);

  const maxR = Math.max(
    Math.hypot(unitVerts.A.x, unitVerts.A.y),
    Math.hypot(unitVerts.B.x, unitVerts.B.y),
    Math.hypot(unitVerts.C.x, unitVerts.C.y),
    Math.hypot(unitVerts.D.x, unitVerts.D.y),
    1
  );

  return Math.min(maxPxPerCm, maxRadiusPx / maxR);
}

/**
 * Grade 4 Perimeter Formula for Parallelogram: P = (a + b) × 2
 */
export function calculateParallelogramPerimeter(sideA: number, sideB: number): number {
  return (sideA + sideB) * 2;
}

/**
 * Grade 4 Perimeter Formula for Rhombus: P = a × 4
 */
export function calculateRhombusPerimeter(sideA: number): number {
  return sideA * 4;
}

/**
 * Inverse perimeter helpers for Grade 4 word problems
 */
export function calculateSideFromRhombusPerimeter(perimeter: number): number {
  return perimeter / 4;
}

export function calculateOtherSideFromParallelogramPerimeter(
  perimeter: number,
  knownSide: number
): number {
  return perimeter / 2 - knownSide;
}

// =========================================================================
// INTERACTIVE SLIDER CONSTRUCTION MISSIONS (Used in Lab Mode 2 & Level 3)
// =========================================================================

export type ShapesLabMissionType = 'parallelogram' | 'rhombus';

export interface ShapesLabMission {
  id: string;
  badgeVi: string;
  shapeType: ShapesLabMissionType;
  titleVi: string;
  promptVi: string;
  hintVi: string;
  targetSideA: number;
  targetSideB?: number; // only for parallelogram
  targetPerimeter: number;
  allowSwappedSides?: boolean; // true if only perimeter + one constraint or (a,b) interchangeable
  initialSideA: number;
  initialSideB: number;
  initialAngleDeg: number;
}

export const SHAPES_LAB_MISSIONS: ShapesLabMission[] = [
  {
    id: 'shape_m1',
    badgeVi: 'Nhiệm vụ 1 · Hình bình hành',
    shapeType: 'parallelogram',
    titleVi: 'Dựng hình bình hành cạnh 6 cm và 4 cm',
    promptVi: 'Em hãy kéo thanh trượt cạnh đáy a = 6 cm và cạnh bên b = 4 cm để tạo hình bình hành ABCD có chu vi 20 cm.',
    hintVi: 'Kéo thanh trượt cạnh đáy a đến đúng 6 cm, và thanh trượt cạnh bên b đến đúng 4 cm!',
    targetSideA: 6,
    targetSideB: 4,
    targetPerimeter: 20,
    initialSideA: 4,
    initialSideB: 3,
    initialAngleDeg: 68,
  },
  {
    id: 'shape_m2',
    badgeVi: 'Nhiệm vụ 2 · Hình thoi',
    shapeType: 'rhombus',
    titleVi: 'Dựng hình thoi có cạnh 5 cm',
    promptVi: 'Em hãy kéo thanh trượt độ dài cạnh a của hình thoi ABCD đến 5 cm để tạo chiếc kim la bàn có chu vi 20 cm.',
    hintVi: 'Hình thoi có 4 cạnh bằng nhau, chỉ cần kéo thanh trượt cạnh a đến đúng 5 cm!',
    targetSideA: 5,
    targetPerimeter: 20,
    initialSideA: 3,
    initialSideB: 3,
    initialAngleDeg: 62,
  },
  {
    id: 'shape_m3',
    badgeVi: 'Nhiệm vụ 3 · Suy luận Chu vi Hình bình hành',
    shapeType: 'parallelogram',
    titleVi: 'Hình bình hành có chu vi 24 cm, đáy 7 cm',
    promptVi: 'Hãy tạo hình bình hành ABCD có cạnh đáy a = 7 cm sao cho CHU VI đúng bằng 24 cm. Cạnh bên b cần kéo tới bao nhiêu cm?',
    hintVi: 'Nửa chu vi là 24 : 2 = 12 (cm). Cạnh đáy a = 7 cm nên cạnh bên b = 12 − 7 = 5 (cm)!',
    targetSideA: 7,
    targetSideB: 5,
    targetPerimeter: 24,
    initialSideA: 7,
    initialSideB: 2,
    initialAngleDeg: 65,
  },
  {
    id: 'shape_m4',
    badgeVi: 'Nhiệm vụ 4 · Suy luận Chu vi Hình thoi',
    shapeType: 'rhombus',
    titleVi: 'Hình thoi có chu vi 28 cm',
    promptVi: 'Bác thợ uốn sợi dây thép dài 28 cm thành một khung con diều hình thoi. Em hãy kéo thanh trượt cạnh a cho đúng kích thước!',
    hintVi: 'Hình thoi có 4 cạnh bằng nhau: a = 28 : 4 = 7 (cm)!',
    targetSideA: 7,
    targetPerimeter: 28,
    initialSideA: 4,
    initialSideB: 4,
    initialAngleDeg: 66,
  },
  {
    id: 'shape_m5',
    badgeVi: 'Nhiệm vụ 5 · Hình bình hành mảnh',
    shapeType: 'parallelogram',
    titleVi: 'Dựng hình bình hành cạnh 8 cm và 3 cm',
    promptVi: 'Hãy kéo thanh trượt để dựng hình bình hành có cạnh đáy a = 8 cm, cạnh bên b = 3 cm (Chu vi = 22 cm).',
    hintVi: 'Đặt cạnh đáy a = 8 cm và cạnh bên b = 3 cm, sau đó thử thay đổi độ nghiêng để thấy chu vi luôn bằng 22 cm!',
    targetSideA: 8,
    targetSideB: 3,
    targetPerimeter: 22,
    initialSideA: 5,
    initialSideB: 5,
    initialAngleDeg: 70,
  },
  {
    id: 'shape_m6',
    badgeVi: 'Nhiệm vụ 6 · Thử thách Chu vi Hình thoi',
    shapeType: 'rhombus',
    titleVi: 'Vườn hoa hình thoi chu vi 36 cm (mô hình)',
    promptVi: 'Mô hình vườn hoa hình thoi có tổng chu vi đúng bằng 36 cm. Em hãy tính độ dài một cạnh rồi kéo thanh trượt cho chính xác!',
    hintVi: 'Độ dài mỗi cạnh hình thoi là 36 : 4 = 9 (cm)!',
    targetSideA: 9,
    targetPerimeter: 36,
    initialSideA: 5,
    initialSideB: 5,
    initialAngleDeg: 60,
  },
];

export function evaluateShapesLabMission(
  mission: ShapesLabMission,
  currentSideA: number,
  currentSideB: number
): { isMatched: boolean; currentPerimeter: number; feedbackVi: string } {
  if (mission.shapeType === 'rhombus') {
    const p = calculateRhombusPerimeter(currentSideA);
    const matched = currentSideA === mission.targetSideA;
    return {
      isMatched: matched,
      currentPerimeter: p,
      feedbackVi: matched
        ? `🎉 Chính xác tuyệt đối! Hình thoi có 4 cạnh bằng ${currentSideA} cm, chu vi = ${currentSideA} × 4 = ${p} cm!`
        : `Hiện tại cạnh a = ${currentSideA} cm nên chu vi là ${p} cm. Em hãy kéo thanh trượt sao cho chu vi đạt ${mission.targetPerimeter} cm nhé!`,
    };
  }
  const p = calculateParallelogramPerimeter(currentSideA, currentSideB);
  const matched =
    currentSideA === mission.targetSideA && currentSideB === (mission.targetSideB ?? 0);
  return {
    isMatched: matched,
    currentPerimeter: p,
    feedbackVi: matched
      ? `🎉 Xuất sắc! Hình bình hành có a = ${currentSideA} cm, b = ${currentSideB} cm và chu vi = (${currentSideA} + ${currentSideB}) × 2 = ${p} cm!`
      : `Hiện tại a = ${currentSideA} cm, b = ${currentSideB} cm (chu vi = ${p} cm). Kiểm tra lại yêu cầu a = ${mission.targetSideA} cm và b = ${mission.targetSideB} cm nhé!`,
  };
}

// =========================================================================
// 3-LEVEL CHALLENGE QUESTION BANKS (Level 1: 10 Qs, Level 2: 10 Qs, Level 3: 6 Slider Missions)
// =========================================================================

export type ShapesChallengeLevel = 1 | 2 | 3;

export type ShapesDiagramPreset =
  | 'tangram_rooster_para'
  | 'compass_needle_rhombus'
  | 'grid_parallelogram_abcd'
  | 'grid_rhombus_abcd'
  | 'compare_para_vs_rhombus'
  | 'real_lattice_fence_rhombus'
  | 'real_traffic_sign_rhombus'
  | 'four_quads_identify'
  | 'para_perimeter_6_4'
  | 'rhombus_perimeter_7'
  | 'para_perimeter_9_5'
  | 'rhombus_inverse_32'
  | 'para_unit_convert_dm_cm'
  | 'rhombus_kite_ribbon_15'
  | 'para_inverse_perimeter_30'
  | 'compare_perimeters_two_shapes'
  | 'rhombus_garden_fence_12'
  | 'para_tilt_invariant';

export interface ShapesChallengeQuestion {
  id: string;
  level: 1 | 2;
  categoryLabelVi: string;
  badgeTitleVi: string;
  promptVi: string;
  options: string[];
  correctOptionIndex: number;
  explanationVi: string;
  diagramPreset: ShapesDiagramPreset;
}

/**
 * CẤP ĐỘ 1 – NHÀ DU HÀNH TẬP SỰ (10 câu nhận biết hình bình hành, hình thoi trong thực tế và tính chất cạnh)
 */
export const SHAPES_LEVEL1_QUESTIONS: ShapesChallengeQuestion[] = [
  {
    id: 'shp_l1_q1',
    level: 1,
    categoryLabelVi: 'Khám Phá Xếp Hình',
    badgeTitleVi: 'Chú gà xếp hình ghép',
    promptVi: 'Trong hình chú gà được ghép từ các miếng ghép màu sắc bên cạnh, mảnh ghép màu đỏ tạo thành chiếc đuôi con gà có dạng hình gì?',
    options: ['Hình bình hành', 'Hình thoi', 'Hình vuông', 'Hình tam giác'],
    correctOptionIndex: 0,
    explanationVi:
      'Mảnh ghép màu đỏ ở đuôi chú gà có hai cặp cạnh đối diện song song và bằng nhau, hai cạnh kề dài ngắn khác nhau nên đó là hình bình hành!',
    diagramPreset: 'tangram_rooster_para',
  },
  {
    id: 'shp_l1_q2',
    level: 1,
    categoryLabelVi: 'Thực Tế Quanh Em',
    badgeTitleVi: 'Kim nam châm của la bàn',
    promptVi: 'Quan sát chiếc kim nam châm chỉ hướng Bắc – Nam trên mặt chiếc la bàn bên cạnh. Chiếc kim nam châm này có dạng hình gì?',
    options: ['Hình thoi', 'Hình chữ nhật', 'Hình thang', 'Hình tam giác'],
    correctOptionIndex: 0,
    explanationVi:
      'Kim nam châm của chiếc la bàn có hai cặp cạnh đối diện song song và bốn cạnh bằng nhau nên có dạng hình thoi!',
    diagramPreset: 'compass_needle_rhombus',
  },
  {
    id: 'shp_l1_q3',
    level: 1,
    categoryLabelVi: 'Tính Chất Hình Bình Hành',
    badgeTitleVi: 'Hình bình hành ABCD',
    promptVi: 'Quan sát hình bình hành ABCD trên lưới ô vuông. Đặc điểm ĐÚNG NHẤT của hình bình hành là gì?',
    options: [
      'Có hai cặp cạnh đối diện song song và bằng nhau',
      'Chỉ có một cặp cạnh đối diện song song',
      'Có bốn góc đều là góc vuông',
      'Không có cặp cạnh nào song song với nhau',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Ghi nhớ chuẩn: Hình bình hành có hai cặp cạnh đối diện song song và bằng nhau (cạnh AB song song với cạnh DC và AB = DC; cạnh AD song song với cạnh BC và AD = BC).',
    diagramPreset: 'grid_parallelogram_abcd',
  },
  {
    id: 'shp_l1_q4',
    level: 1,
    categoryLabelVi: 'Tính Chất Hình Thoi',
    badgeTitleVi: 'Hình thoi ABCD',
    promptVi: 'Quan sát hình thoi ABCD trên lưới ô vuông. Đặc điểm ĐÚNG NHẤT của hình thoi là gì?',
    options: [
      'Có hai cặp cạnh đối diện song song và bốn cạnh bằng nhau',
      'Chỉ có hai cạnh bằng nhau và không có cạnh song song',
      'Có ba cạnh bằng nhau tạo thành tam giác',
      'Chỉ có một cặp cạnh song song như hình thang',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Ghi nhớ chuẩn: Hình thoi có hai cặp cạnh đối diện song song và bốn cạnh bằng nhau (AB = BC = CD = DA).',
    diagramPreset: 'grid_rhombus_abcd',
  },
  {
    id: 'shp_l1_q5',
    level: 1,
    categoryLabelVi: 'Đọc Tên Cạnh Đối Diện',
    badgeTitleVi: 'Hình bình hành ABCD',
    promptVi: 'Trong hình bình hành ABCD bên cạnh, biết cạnh AB dài 6 cm và cạnh AD dài 4 cm. Độ dài hai cạnh còn lại DC và BC lần lượt là:',
    options: [
      'DC = 6 cm và BC = 4 cm',
      'DC = 4 cm và BC = 6 cm',
      'DC = 6 cm và BC = 6 cm',
      'DC = 10 cm và BC = 10 cm',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Vì hình bình hành có hai cặp cạnh đối diện bằng nhau nên DC = AB = 6 cm và BC = AD = 4 cm.',
    diagramPreset: 'grid_parallelogram_abcd',
  },
  {
    id: 'shp_l1_q6',
    level: 1,
    categoryLabelVi: 'Độ Dài 4 Cạnh Hình Thoi',
    badgeTitleVi: 'Hình thoi ABCD',
    promptVi: 'Trong hình thoi ABCD, biết cạnh AB dài 5 cm. Độ dài của ba cạnh còn lại BC, CD và DA là bao nhiêu?',
    options: [
      'Cả ba cạnh BC, CD, DA đều dài 5 cm',
      'Chỉ có cạnh CD dài 5 cm, còn BC và DA dài 3 cm',
      'Cạnh BC dài 10 cm, cạnh CD dài 5 cm',
      'Không thể biết nếu chưa đo bằng thước',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Hình thoi có bốn cạnh bằng nhau nên khi biết AB = 5 cm, ta biết ngay BC = CD = DA = 5 cm!',
    diagramPreset: 'grid_rhombus_abcd',
  },
  {
    id: 'shp_l1_q7',
    level: 1,
    categoryLabelVi: 'So Sánh Điểm Khác Nhau',
    badgeTitleVi: 'Hình bình hành và Hình thoi',
    promptVi: 'Điểm GIỐNG NHAU giữa hình bình hành và hình thoi là gì?',
    options: [
      'Cả hai hình đều có hai cặp cạnh đối diện song song và bằng nhau',
      'Cả hai hình luôn luôn có 4 góc vuông',
      'Cả hai hình chỉ có 3 cạnh',
      'Cả hai hình chỉ có 1 cặp cạnh song song',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Cả hình bình hành và hình thoi đều là tứ giác có hai cặp cạnh đối diện song song và bằng nhau. Riêng hình thoi đặc biệt hơn là có cả 4 cạnh đều bằng nhau!',
    diagramPreset: 'compare_para_vs_rhombus',
  },
  {
    id: 'shp_l1_q8',
    level: 1,
    categoryLabelVi: 'Đồ Vật Thực Tế',
    badgeTitleVi: 'Khung lưới rào sắt mắt cáo',
    promptVi: 'Quan sát các ô lưới trên cánh cổng sắt mắt cáo bên cạnh. Mỗi ô lưới đều có 4 thanh ngắn bằng nhau và các cạnh đối diện song song. Mỗi ô lưới có dạng hình gì?',
    options: ['Hình thoi', 'Hình thang', 'Hình tam giác', 'Hình tròn'],
    correctOptionIndex: 0,
    explanationVi:
      'Mỗi ô lưới mắt cáo trên cổng sắt đều có hai cặp cạnh đối diện song song và bốn cạnh bằng nhau nên có dạng hình thoi!',
    diagramPreset: 'real_lattice_fence_rhombus',
  },
  {
    id: 'shp_l1_q9',
    level: 1,
    categoryLabelVi: 'Đồ Vật Thực Tế',
    badgeTitleVi: 'Biển báo giao thông',
    promptVi: 'Quan sát tấm biển báo giao thông màu vàng đặt dựng đứng hình viên kim cương bên cạnh với 4 cạnh viền bằng nhau và đối diện song song. Tấm biển báo có dạng hình gì?',
    options: ['Hình thoi', 'Hình thang vuông', 'Hình tam giác đều', 'Hình tròn'],
    correctOptionIndex: 0,
    explanationVi:
      'Tấm biển báo giao thông đặt theo hình viên kim cương có hai cặp cạnh đối diện song song và 4 cạnh bằng nhau là hình ảnh quen thuộc của hình thoi trong đời sống!',
    diagramPreset: 'real_traffic_sign_rhombus',
  },
  {
    id: 'shp_l1_q10',
    level: 1,
    categoryLabelVi: 'Phân Loại Tứ Giác',
    badgeTitleVi: 'Bộ 4 hình tứ giác',
    promptVi: 'Quan sát 4 hình đánh số 1, 2, 3, 4 bên cạnh. Hình nào là HÌNH BÌNH HÀNH và hình nào là HÌNH THOI?',
    options: [
      'Hình 1 là hình bình hành; Hình 3 là hình thoi',
      'Hình 2 là hình bình hành; Hình 4 là hình thoi',
      'Hình 3 là hình bình hành; Hình 1 là hình thoi',
      'Hình 4 là hình bình hành; Hình 2 là hình thoi',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Hình 1 có 2 cặp cạnh đối song song và bằng nhau (hai cạnh kề khác độ dài) là hình bình hành; Hình 3 có 4 cạnh bằng nhau và 2 cặp cạnh đối song song là hình thoi (Hình 2 là hình thang, Hình 4 là tứ giác thường).',
    diagramPreset: 'four_quads_identify',
  },
];

/**
 * CẤP ĐỘ 2 – NHÀ KHOA HỌC NHÍ (10 câu tính CHU VI Hình bình hành & Hình thoi, đổi đơn vị, toán ngược & thực tế)
 */
export const SHAPES_LEVEL2_QUESTIONS: ShapesChallengeQuestion[] = [
  {
    id: 'shp_l2_q1',
    level: 2,
    categoryLabelVi: 'Công Thức Chu Vi',
    badgeTitleVi: 'Chu vi Hình bình hành ABCD',
    promptVi: 'Tính chu vi của hình bình hành ABCD biết hai cạnh kề nhau có độ dài là 6 cm và 4 cm:',
    options: ['20 cm', '10 cm', '24 cm', '16 cm'],
    correctOptionIndex: 0,
    explanationVi:
      'Chu vi hình bình hành bằng tổng độ dài hai cạnh kề nhau nhân với 2: (6 + 4) × 2 = 10 × 2 = 20 (cm).',
    diagramPreset: 'para_perimeter_6_4',
  },
  {
    id: 'shp_l2_q2',
    level: 2,
    categoryLabelVi: 'Công Thức Chu Vi',
    badgeTitleVi: 'Chu vi Hình thoi MNPQ',
    promptVi: 'Tính chu vi của hình thoi MNPQ biết độ dài mỗi cạnh là 7 cm:',
    options: ['28 cm', '14 cm', '49 cm', '21 cm'],
    correctOptionIndex: 0,
    explanationVi:
      'Vì hình thoi có 4 cạnh bằng nhau nên chu vi hình thoi bằng độ dài một cạnh nhân với 4: 7 × 4 = 28 (cm).',
    diagramPreset: 'rhombus_perimeter_7',
  },
  {
    id: 'shp_l2_q3',
    level: 2,
    categoryLabelVi: 'Tính Chu Vi Nhanh',
    badgeTitleVi: 'Hình bình hành cạnh 9 cm và 5 cm',
    promptVi: 'Một tấm bìa hình bình hành có cạnh đáy dài 9 cm và cạnh bên dài 5 cm. Chu vi tấm bìa đó là bao nhiêu?',
    options: ['28 cm', '14 cm', '45 cm', '23 cm'],
    correctOptionIndex: 0,
    explanationVi:
      'Áp dụng công thức P = (a + b) × 2: Chu vi tấm bìa là (9 + 5) × 2 = 14 × 2 = 28 (cm).',
    diagramPreset: 'para_perimeter_9_5',
  },
  {
    id: 'shp_l2_q4',
    level: 2,
    categoryLabelVi: 'Đổi Cùng Đơn Vị Đo',
    badgeTitleVi: 'Cẩn thận đơn vị dm và cm!',
    promptVi: 'Tính chu vi hình bình hành có hai cạnh kề dài 2 dm và 15 cm (tính theo đơn vị cm):',
    options: ['70 cm', '34 cm', '35 cm', '60 cm'],
    correctOptionIndex: 0,
    explanationVi:
      'Trước hết phải đổi về cùng đơn vị cm: 2 dm = 20 cm. Sau đó tính chu vi: (20 + 15) × 2 = 35 × 2 = 70 (cm)!',
    diagramPreset: 'para_unit_convert_dm_cm',
  },
  {
    id: 'shp_l2_q5',
    level: 2,
    categoryLabelVi: 'Bài Toán Thực Tế',
    badgeTitleVi: 'Trang trí viền con diều hình thoi',
    promptVi: 'Nam muốn dán dây ruy băng bọc kín xung quanh 4 cạnh của chiếc diều hình thoi có độ dài mỗi cạnh là 15 cm. Nam cần đoạn dây ruy băng dài bao nhiêu xăng-ti-mét?',
    options: ['60 cm', '30 cm', '45 cm', '75 cm'],
    correctOptionIndex: 0,
    explanationVi:
      'Độ dài dây ruy băng chính bằng chu vi của chiếc diều hình thoi: 15 × 4 = 60 (cm).',
    diagramPreset: 'rhombus_kite_ribbon_15',
  },
  {
    id: 'shp_l2_q6',
    level: 2,
    categoryLabelVi: 'Bài Toán Ngược · Hình Thoi',
    badgeTitleVi: 'Biết chu vi, tìm độ dài cạnh',
    promptVi: 'Một khung tranh hình thoi có chu vi bằng 32 cm. Hỏi mỗi cạnh của khung tranh hình thoi đó dài bao nhiêu xăng-ti-mét?',
    options: ['8 cm', '16 cm', '6 cm', '4 cm'],
    correctOptionIndex: 0,
    explanationVi:
      'Vì chu vi hình thoi bằng cạnh nhân 4, nên muốn tìm độ dài 1 cạnh ta lấy chu vi chia cho 4: 32 : 4 = 8 (cm).',
    diagramPreset: 'rhombus_inverse_32',
  },
  {
    id: 'shp_l2_q7',
    level: 2,
    categoryLabelVi: 'Bài Toán Ngược · Hình Bình Hành',
    badgeTitleVi: 'Tìm cạnh bên khi biết chu vi',
    promptVi: 'Hình bình hành ABCD có chu vi bằng 30 cm, biết cạnh đáy AB dài 10 cm. Hỏi cạnh bên AD dài bao nhiêu xăng-ti-mét?',
    options: ['5 cm', '10 cm', '20 cm', '15 cm'],
    correctOptionIndex: 0,
    explanationVi:
      'Nửa chu vi hình bình hành (tổng cạnh đáy và cạnh bên) là 30 : 2 = 15 (cm). Vậy cạnh bên AD dài 15 − 10 = 5 (cm)!',
    diagramPreset: 'para_inverse_perimeter_30',
  },
  {
    id: 'shp_l2_q8',
    level: 2,
    categoryLabelVi: 'So Sánh Chu Vi Hai Hình',
    badgeTitleVi: 'Hình bình hành hay Hình thoi lớn hơn?',
    promptVi: 'So sánh chu vi của Hình bình hành (hai cạnh kề 8 cm và 4 cm) với chu vi của Hình thoi (cạnh 6 cm):',
    options: [
      'Chu vi hai hình bằng nhau (đều bằng 24 cm)',
      'Chu vi hình bình hành lớn hơn chu vi hình thoi',
      'Chu vi hình thoi lớn hơn chu vi hình bình hành',
      'Chu vi hình bình hành gấp đôi chu vi hình thoi',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Chu vi hình bình hành là (8 + 4) × 2 = 24 (cm). Chu vi hình thoi là 6 × 4 = 24 (cm). Vậy chu vi hai hình bằng nhau!',
    diagramPreset: 'compare_perimeters_two_shapes',
  },
  {
    id: 'shp_l2_q9',
    level: 2,
    categoryLabelVi: 'Bài Toán Thực Tế',
    badgeTitleVi: 'Hàng rào vườn hoa hình thoi',
    promptVi: 'Sân trường có một bồn hoa hình thoi, mỗi cạnh dài 12 m. Cô giáo muốn làm hàng rào gỗ bao quanh bồn hoa đó. Tổng chiều dài hàng rào cần làm là bao nhiêu mét?',
    options: ['48 m', '24 m', '36 m', '60 m'],
    correctOptionIndex: 0,
    explanationVi:
      'Tổng chiều dài hàng rào bao quanh chính là chu vi bồn hoa hình thoi: 12 × 4 = 48 (m).',
    diagramPreset: 'rhombus_garden_fence_12',
  },
  {
    id: 'shp_l2_q10',
    level: 2,
    categoryLabelVi: 'Tư Duy Thực Nghiệm',
    badgeTitleVi: 'Nghiêng khung hình bình hành',
    promptVi: 'Một khung gỗ hình chữ nhật ghép bằng 4 thanh gỗ dài 7 cm và 5 cm bị xô nghiêng thành hình bình hành (độ dài các thanh gỗ không đổi). Chu vi của khung gỗ lúc này thay đổi thế nào?',
    options: [
      'Chu vi KHÔNG ĐỔI, vẫn bằng (7 + 5) × 2 = 24 cm',
      'Chu vi tăng lên vì hình bị nghiêng ra',
      'Chu vi giảm đi một nửa còn 12 cm',
      'Không thể tính được chu vi khi khung bị nghiêng',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Khi xô nghiêng khung gỗ, độ dài 4 cạnh không hề thay đổi (vẫn là 7 cm, 5 cm, 7 cm, 5 cm), nên chu vi luôn giữ nguyên bằng 24 cm!',
    diagramPreset: 'para_tilt_invariant',
  },
];

export function getShapesQuestionsByLevel(level: 1 | 2): ShapesChallengeQuestion[] {
  return level === 1 ? SHAPES_LEVEL1_QUESTIONS : SHAPES_LEVEL2_QUESTIONS;
}
