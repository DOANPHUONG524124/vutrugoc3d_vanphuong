/**
 * Pure geometric math, 2-step parallel drawing logic (via Ê Ke), multi-parallel check shapes,
 * and 3-level challenge banks for "Chủ đề 3: Hai Đường Thẳng Song Song" (Vũ Trụ Hình Học Lớp 4).
 */

import {
  Point2D,
  LineSpec,
  SetSquareState,
  SetSquareAlignmentResult,
  normalizeDeg360,
  lineAngleDiffDeg,
  mathDegToSvgUnit,
  getLineMathAngleDeg,
  computePerpendicularLineEndpoints,
  evaluateSetSquareAlignment,
  computeSnapSetSquareState,
} from './perpendicularMath';

export type ParallelDrawTaskId =
  | 'par_horiz_h_below'
  | 'par_horiz_h_above'
  | 'par_vert_h_right'
  | 'par_slant_h_above'
  | 'par_track_lane_slant';

export interface ParallelDrawTask {
  id: ParallelDrawTaskId;
  badgeVi: string;
  titleVi: string;
  instructionStep1Vi: string;
  instructionStep2Vi: string;
  baseLine: LineSpec;
  targetPoint: Point2D;
  targetPointLabel: string;
  auxLineLabels: [string, string];
  parallelLineLabels: [string, string];
  initialSetSquare: SetSquareState;
}

export interface ParallelGeometryBundle {
  auxStart: Point2D;
  auxEnd: Point2D;
  footOnBase: Point2D;
  auxLine: LineSpec;
  parStart: Point2D;
  parEnd: Point2D;
  step1Snap: SetSquareState;
  step2Snap: SetSquareState;
}

/**
 * Checks whether two line segments (a1->a2) and (b1->b2) are parallel within `toleranceDeg`.
 */
export function areSegmentsParallel(
  a1: Point2D,
  a2: Point2D,
  b1: Point2D,
  b2: Point2D,
  toleranceDeg = 2.5
): boolean {
  const angA = getLineMathAngleDeg({ p1: a1, p2: a2 });
  const angB = getLineMathAngleDeg({ p1: b1, p2: b2 });
  return lineAngleDiffDeg(angA, angB) <= toleranceDeg;
}

/**
 * Computes the complete 2-step geometric construction for drawing a line CD
 * passing through point H and parallel to base line AB:
 * - Step 1: Auxiliary line MN passing through H and perpendicular to AB
 * - Step 2: Parallel line CD passing through H and perpendicular to MN (hence CD // AB)
 */
export function computeParallelGeometry(task: ParallelDrawTask): ParallelGeometryBundle {
  const { start: auxStart, end: auxEnd, foot: footOnBase } = computePerpendicularLineEndpoints(
    task.baseLine,
    task.targetPoint,
    170
  );

  const auxLine: LineSpec = {
    p1: auxStart,
    p2: auxEnd,
    label1: task.auxLineLabels[0],
    label2: task.auxLineLabels[1],
    nameVi: task.auxLineLabels.join(''),
  };

  // Parallel line through targetPoint perpendicular to auxLine (parallel to baseLine)
  const baseAngle = getLineMathAngleDeg(task.baseLine);
  const baseUnit = mathDegToSvgUnit(baseAngle);
  const parHalfLen = 215;
  const parStart: Point2D = {
    x: task.targetPoint.x - baseUnit.x * parHalfLen,
    y: task.targetPoint.y - baseUnit.y * parHalfLen,
  };
  const parEnd: Point2D = {
    x: task.targetPoint.x + baseUnit.x * parHalfLen,
    y: task.targetPoint.y + baseUnit.y * parHalfLen,
  };

  const step1Snap = computeSnapSetSquareState(task.baseLine, task.targetPoint);
  const step2Snap = computeSnapSetSquareState(auxLine, task.targetPoint);

  return {
    auxStart,
    auxEnd,
    footOnBase,
    auxLine,
    parStart,
    parEnd,
    step1Snap,
    step2Snap,
  };
}

/**
 * Evaluates set-square alignment for either Step 1 (align on baseLine through H)
 * or Step 2 (align on auxiliary perpendicular line MN through H).
 */
export function evaluateParallelStepAlignment(
  setSquare: SetSquareState,
  task: ParallelDrawTask,
  step: 1 | 2
): SetSquareAlignmentResult {
  const geom = computeParallelGeometry(task);
  if (step === 1) {
    return evaluateSetSquareAlignment(setSquare, task.baseLine, task.targetPoint);
  }
  return evaluateSetSquareAlignment(setSquare, geom.auxLine, task.targetPoint);
}

/**
 * 5 Hands-On 2-Step Parallel Drawing Missions (used in Lab & Level 3 Challenge)
 */
export const PARALLEL_DRAW_TASKS: ParallelDrawTask[] = [
  {
    id: 'par_horiz_h_below',
    badgeVi: 'Nhiệm vụ 1 · Đường thẳng nằm ngang (H phía dưới)',
    titleVi: 'Vẽ đường thẳng CD đi qua điểm H và song song với đường thẳng AB',
    instructionStep1Vi:
      'Bước 1: Đặt một cạnh góc vuông ê ke trùng AB, cạnh góc vuông thứ hai gặp H rồi vạch đường thẳng phụ MN vuông góc với AB.',
    instructionStep2Vi:
      'Bước 2: Đặt một cạnh góc vuông ê ke trùng đường phụ MN tại H, rồi vạch đường thẳng CD vuông góc với MN → Ta được CD song song với AB!',
    baseLine: {
      p1: { x: 150, y: 155 },
      p2: { x: 630, y: 155 },
      label1: 'A',
      label2: 'B',
      nameVi: 'AB',
    },
    targetPoint: { x: 390, y: 275 },
    targetPointLabel: 'H',
    auxLineLabels: ['M', 'N'],
    parallelLineLabels: ['C', 'D'],
    initialSetSquare: { x: 205, y: 310, rotationDeg: 25 },
  },
  {
    id: 'par_horiz_h_above',
    badgeVi: 'Nhiệm vụ 2 · Đường thẳng nằm ngang (H phía trên)',
    titleVi: 'Vẽ đường thẳng CD đi qua điểm H (nằm trên) song song với đường thẳng AB',
    instructionStep1Vi:
      'Bước 1: Đặt ê ke trùng đường thẳng AB nằm ngang và hướng cạnh góc vuông thứ hai lên điểm H để vạch đường phụ MN.',
    instructionStep2Vi:
      'Bước 2: Đặt ê ke trùng đường phụ MN tại đỉnh H rồi vạch đường thẳng CD vuông góc với MN (song song với AB).',
    baseLine: {
      p1: { x: 150, y: 300 },
      p2: { x: 630, y: 300 },
      label1: 'A',
      label2: 'B',
      nameVi: 'AB',
    },
    targetPoint: { x: 430, y: 175 },
    targetPointLabel: 'H',
    auxLineLabels: ['M', 'N'],
    parallelLineLabels: ['C', 'D'],
    initialSetSquare: { x: 185, y: 170, rotationDeg: 195 },
  },
  {
    id: 'par_vert_h_right',
    badgeVi: 'Nhiệm vụ 3 · Đường thẳng thẳng đứng',
    titleVi: 'Vẽ đường thẳng CD đi qua điểm H song song với đường thẳng thẳng đứng AB',
    instructionStep1Vi:
      'Bước 1: Xoay ê ke để một cạnh góc vuông trùng đường thẳng đứng AB và cạnh thứ hai chạm điểm H ở bên phải, vạch đường phụ MN.',
    instructionStep2Vi:
      'Bước 2: Đặt ê ke trùng đường phụ MN tại H rồi vạch đường thẳng đứng CD vuông góc với MN (song song với AB).',
    baseLine: {
      p1: { x: 280, y: 75 },
      p2: { x: 280, y: 365 },
      label1: 'A',
      label2: 'B',
      nameVi: 'AB',
    },
    targetPoint: { x: 445, y: 220 },
    targetPointLabel: 'H',
    auxLineLabels: ['M', 'N'],
    parallelLineLabels: ['C', 'D'],
    initialSetSquare: { x: 525, y: 315, rotationDeg: 45 },
  },
  {
    id: 'par_slant_h_above',
    badgeVi: 'Nhiệm vụ 4 · Đường thẳng nằm nghiêng',
    titleVi: 'Vẽ đường thẳng CD đi qua điểm H song song với đường thẳng nghiêng AB',
    instructionStep1Vi:
      'Bước 1: Xoay ê ke khớp độ nghiêng của đường thẳng AB và chạm điểm H, vạch đường thẳng phụ MN vuông góc với AB.',
    instructionStep2Vi:
      'Bước 2: Đặt ê ke trùng đường phụ MN tại điểm H rồi vạch đường thẳng CD song song với AB.',
    baseLine: {
      p1: { x: 190, y: 325 },
      p2: { x: 575, y: 165 },
      label1: 'A',
      label2: 'B',
      nameVi: 'AB',
    },
    targetPoint: { x: 335, y: 148 },
    targetPointLabel: 'H',
    auxLineLabels: ['M', 'N'],
    parallelLineLabels: ['C', 'D'],
    initialSetSquare: { x: 520, y: 325, rotationDeg: 10 },
  },
  {
    id: 'par_track_lane_slant',
    badgeVi: 'Nhiệm vụ 5 · Thiết kế làn đường chạy song song',
    titleVi: 'Vẽ làn chạy CD đi qua điểm H song song với vạch làn chạy AB',
    instructionStep1Vi:
      'Bước 1: Đặt ê ke trùng vạch đường chạy AB và gặp điểm H, vạch đường phụ MN vuông góc với AB.',
    instructionStep2Vi:
      'Bước 2: Đặt ê ke trùng đường phụ MN tại H rồi vạch làn chạy CD song song hoàn hảo với AB!',
    baseLine: {
      p1: { x: 170, y: 145 },
      p2: { x: 575, y: 295 },
      label1: 'A',
      label2: 'B',
      nameVi: 'AB',
    },
    targetPoint: { x: 325, y: 300 },
    targetPointLabel: 'H',
    auxLineLabels: ['M', 'N'],
    parallelLineLabels: ['C', 'D'],
    initialSetSquare: { x: 550, y: 135, rotationDeg: 140 },
  },
];

// =========================================================================
// MULTI-PARALLEL CHECK SHAPES (1 CẠNH SONG SONG VỚI NHIỀU CẠNH KHÁC)
// =========================================================================

export type ParallelCheckShapeId =
  | 'split_rect_amnd_mbcn'
  | 'window_3_panes'
  | 'letter_e_sticks'
  | 'house_grid_abcde';

export interface ParallelSelectableEdge {
  id: string;
  labelVi: string;
  p1: Point2D;
  p2: Point2D;
  labelPos: Point2D;
  isReference?: boolean;
  isParallelToReference: boolean;
}

export interface ParallelCheckShapeTask {
  id: ParallelCheckShapeId;
  badgeVi: string;
  titleVi: string;
  promptVi: string;
  referenceEdgeNameVi: string;
  expectedParallelEdgeIds: string[];
  readingSummaryVi: string;
  edges: ParallelSelectableEdge[];
  vertices: Array<{ label: string; x: number; y: number }>;
}

export const PARALLEL_CHECK_SHAPES: ParallelCheckShapeTask[] = [
  {
    id: 'split_rect_amnd_mbcn',
    badgeVi: '1 cạnh song song với 2 cạnh',
    titleVi: 'Hình chữ nhật ghép AMND và MBCN',
    promptVi:
      'Bấm chọn TẤT CẢ các cạnh song song với cạnh màu vàng MN trong hình chữ nhật ABCD bên dưới!',
    referenceEdgeNameVi: 'MN',
    expectedParallelEdgeIds: ['AD', 'BC'],
    readingSummaryVi:
      'Cạnh MN song song với 2 cạnh là cạnh AD và cạnh BC. Ta đọc: "Cạnh MN song song với cạnh AD; cạnh MN song song với cạnh BC."',
    edges: [
      { id: 'AD', labelVi: 'Cạnh AD', p1: { x: 160, y: 105 }, p2: { x: 160, y: 275 }, labelPos: { x: 118, y: 194 }, isParallelToReference: true },
      { id: 'MN', labelVi: 'Cạnh MN', p1: { x: 405, y: 105 }, p2: { x: 405, y: 275 }, labelPos: { x: 372, y: 194 }, isReference: true, isParallelToReference: false },
      { id: 'BC', labelVi: 'Cạnh BC', p1: { x: 545, y: 105 }, p2: { x: 545, y: 275 }, labelPos: { x: 586, y: 194 }, isParallelToReference: true },
      { id: 'AM', labelVi: 'Cạnh AM', p1: { x: 160, y: 105 }, p2: { x: 405, y: 105 }, labelPos: { x: 282, y: 84 }, isParallelToReference: false },
      { id: 'MB', labelVi: 'Cạnh MB', p1: { x: 405, y: 105 }, p2: { x: 545, y: 105 }, labelPos: { x: 475, y: 84 }, isParallelToReference: false },
      { id: 'DN', labelVi: 'Cạnh DN', p1: { x: 160, y: 275 }, p2: { x: 405, y: 275 }, labelPos: { x: 282, y: 304 }, isParallelToReference: false },
      { id: 'NC', labelVi: 'Cạnh NC', p1: { x: 405, y: 275 }, p2: { x: 545, y: 275 }, labelPos: { x: 475, y: 304 }, isParallelToReference: false },
    ],
    vertices: [
      { label: 'A', x: 138, y: 98 },
      { label: 'M', x: 405, y: 86 },
      { label: 'B', x: 565, y: 98 },
      { label: 'D', x: 138, y: 294 },
      { label: 'N', x: 405, y: 305 },
      { label: 'C', x: 565, y: 294 },
    ],
  },
  {
    id: 'window_3_panes',
    badgeVi: '1 cạnh song song với 3 cạnh',
    titleVi: 'Khung cửa sổ 3 ô thẳng đứng',
    promptVi:
      'Một cạnh có thể song song với nhiều cạnh! Hãy bấm chọn TẤT CẢ các thanh song song với cạnh AD (màu vàng).',
    referenceEdgeNameVi: 'AD',
    expectedParallelEdgeIds: ['MN', 'PQ', 'BC'],
    readingSummaryVi:
      'Cạnh AD song song với 3 cạnh: cạnh MN, cạnh PQ và cạnh BC',
    edges: [
      { id: 'AD', labelVi: 'Cạnh AD', p1: { x: 135, y: 95 }, p2: { x: 135, y: 285 }, labelPos: { x: 96, y: 194 }, isReference: true, isParallelToReference: false },
      { id: 'MN', labelVi: 'Cạnh MN', p1: { x: 280, y: 95 }, p2: { x: 280, y: 285 }, labelPos: { x: 252, y: 194 }, isParallelToReference: true },
      { id: 'PQ', labelVi: 'Cạnh PQ', p1: { x: 425, y: 95 }, p2: { x: 425, y: 285 }, labelPos: { x: 398, y: 194 }, isParallelToReference: true },
      { id: 'BC', labelVi: 'Cạnh BC', p1: { x: 570, y: 95 }, p2: { x: 570, y: 285 }, labelPos: { x: 608, y: 194 }, isParallelToReference: true },
      { id: 'AB', labelVi: 'Cạnh AB', p1: { x: 135, y: 95 }, p2: { x: 570, y: 95 }, labelPos: { x: 352, y: 74 }, isParallelToReference: false },
      { id: 'DC', labelVi: 'Cạnh DC', p1: { x: 135, y: 285 }, p2: { x: 570, y: 285 }, labelPos: { x: 352, y: 314 }, isParallelToReference: false },
    ],
    vertices: [
      { label: 'A', x: 118, y: 88 },
      { label: 'M', x: 280, y: 78 },
      { label: 'P', x: 425, y: 78 },
      { label: 'B', x: 586, y: 88 },
      { label: 'D', x: 118, y: 304 },
      { label: 'N', x: 280, y: 312 },
      { label: 'Q', x: 425, y: 312 },
      { label: 'C', x: 586, y: 304 },
    ],
  },
  {
    id: 'letter_e_sticks',
    badgeVi: 'Que tính chữ E · Song song và Vuông góc',
    titleVi: 'Chữ E xếp bằng que tính',
    promptVi:
      'Hãy bấm chọn TẤT CẢ các que tính song song với que tính ngang trên cùng AB (màu vàng)!',
    referenceEdgeNameVi: 'AB',
    expectedParallelEdgeIds: ['CD', 'EF'],
    readingSummaryVi:
      'Que tính AB song song với cả 2 que tính CD và EF! Ngoài ra cả 3 que tính ngang này đều vuông góc với thanh đứng AE.',
    edges: [
      { id: 'AB', labelVi: 'Que AB', p1: { x: 240, y: 95 }, p2: { x: 485, y: 95 }, labelPos: { x: 362, y: 74 }, isReference: true, isParallelToReference: false },
      { id: 'CD', labelVi: 'Que CD', p1: { x: 240, y: 190 }, p2: { x: 455, y: 190 }, labelPos: { x: 355, y: 170 }, isParallelToReference: true },
      { id: 'EF', labelVi: 'Que EF', p1: { x: 240, y: 285 }, p2: { x: 485, y: 285 }, labelPos: { x: 362, y: 314 }, isParallelToReference: true },
      { id: 'AE', labelVi: 'Thanh AE', p1: { x: 240, y: 95 }, p2: { x: 240, y: 285 }, labelPos: { x: 196, y: 195 }, isParallelToReference: false },
    ],
    vertices: [
      { label: 'A', x: 222, y: 90 },
      { label: 'B', x: 502, y: 100 },
      { label: 'C', x: 218, y: 196 },
      { label: 'D', x: 472, y: 196 },
      { label: 'E', x: 222, y: 300 },
      { label: 'F', x: 502, y: 294 },
    ],
  },
  {
    id: 'house_grid_abcde',
    badgeVi: 'Lưới ô vuông · Ngôi nhà ABCDE',
    titleVi: 'Ngôi nhà ABCDE trên giấy ô li',
    promptVi:
      'Quan sát ngôi nhà ABCDE trên lưới ô vuông. Hãy bấm chọn cạnh song song với cạnh AE (màu vàng)!',
    referenceEdgeNameVi: 'AE',
    expectedParallelEdgeIds: ['CD'],
    readingSummaryVi:
      'Hai cạnh AE và CD song song với nhau! Còn cạnh AB cắt đường kéo dài của CD nên không song song; cạnh AE và ED vuông góc với nhau.',
    edges: [
      { id: 'AE', labelVi: 'Cạnh AE', p1: { x: 235, y: 165 }, p2: { x: 235, y: 295 }, labelPos: { x: 192, y: 234 }, isReference: true, isParallelToReference: false },
      { id: 'CD', labelVi: 'Cạnh CD', p1: { x: 465, y: 165 }, p2: { x: 465, y: 295 }, labelPos: { x: 508, y: 234 }, isParallelToReference: true },
      { id: 'ED', labelVi: 'Cạnh ED', p1: { x: 235, y: 295 }, p2: { x: 465, y: 295 }, labelPos: { x: 350, y: 322 }, isParallelToReference: false },
      { id: 'AB', labelVi: 'Mái AB', p1: { x: 235, y: 165 }, p2: { x: 350, y: 80 }, labelPos: { x: 268, y: 110 }, isParallelToReference: false },
      { id: 'BC', labelVi: 'Mái BC', p1: { x: 350, y: 80 }, p2: { x: 465, y: 165 }, labelPos: { x: 432, y: 110 }, isParallelToReference: false },
    ],
    vertices: [
      { label: 'B', x: 350, y: 65 },
      { label: 'A', x: 210, y: 170 },
      { label: 'C', x: 486, y: 170 },
      { label: 'E', x: 210, y: 308 },
      { label: 'D', x: 486, y: 308 },
    ],
  },
];

// =========================================================================
// 3-LEVEL CHALLENGE QUESTION BANKS (CHỦ ĐỀ 3: HAI ĐƯỜNG THẲNG SONG SONG)
// =========================================================================

export type ParallelChallengeLevel = 1 | 2 | 3;

export type ParallelDiagramPreset =
  | 'train_track_rails'
  | 'rect_abcd_extended_par'
  | 'rocket_parallel_scene'
  | 'viet_matchsticks'
  | 'street_map_robot_mai'
  | 'six_polygons_classify'
  | 'split_rect_amnd_mbcn_q'
  | 'window_3_panes_q'
  | 'ladder_4_rungs_q'
  | 'square_mnpq_read_q'
  | 'house_grid_abcde_q'
  | 'hexagon_abcdef_q'
  | 'two_step_draw_par_q'
  | 'intersecting_vs_parallel_q'
  | 'letter_e_multi_par_q'
  | 'guitar_strings_real'
  | 'zebra_crossing_real'
  | 'bookshelf_real'
  | 'trapezoid_mnpq_q'
  | 'parallelogram_abcd_q'
  | 'rhombus_abcd_q';

export interface ParallelChallengeQuestion {
  id: string;
  level: 1 | 2;
  categoryLabelVi: string;
  badgeTitleVi: string;
  promptVi: string;
  options: string[];
  correctOptionIndex: number;
  explanationVi: string;
  diagramPreset: ParallelDiagramPreset;
}

/**
 * CẤP ĐỘ 1 – NHÀ DU HÀNH TẬP SỰ (10 câu nhận biết đời sống, tính chất & bản đồ)
 */
export const PARALLEL_LEVEL1_QUESTIONS: ParallelChallengeQuestion[] = [
  {
    id: 'par_l1_q1',
    level: 1,
    categoryLabelVi: 'Khái Niệm Cốt Lõi',
    badgeTitleVi: 'Hai đường thẳng song song',
    promptVi: 'Đặc điểm quan trọng nhất của hai đường thẳng song song với nhau là gì?',
    options: [
      'Không bao giờ cắt nhau dù kéo dài mãi về hai phía',
      'Luôn cắt nhau tạo thành 4 góc vuông',
      'Cắt nhau tại đúng 1 điểm chung',
      'Tạo với nhau một góc nhọn nhỏ hơn 90°',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Hai đường thẳng song song với nhau luôn cách đều nhau và không bao giờ cắt nhau dù ta kéo dài mãi về hai phía.',
    diagramPreset: 'rect_abcd_extended_par',
  },
  {
    id: 'par_l1_q2',
    level: 1,
    categoryLabelVi: 'Thực Tế Quanh Em',
    badgeTitleVi: 'Đường ray tàu hỏa',
    promptVi: 'Quan sát hai thanh ray thép màu đỏ của đường tàu hỏa thẳng tắp. Chúng là hình ảnh của:',
    options: [
      'Hai đường thẳng song song với nhau',
      'Hai đường thẳng vuông góc với nhau',
      'Hai đường thẳng cắt nhau tạo góc nhọn',
      'Một góc bẹt 180°',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Hai thanh ray tàu hỏa thẳng tắp luôn cách đều nhau để bánh tàu chạy êm, chúng không bao giờ cắt nhau nên là hai đường thẳng song song.',
    diagramPreset: 'train_track_rails',
  },
  {
    id: 'par_l1_q3',
    level: 1,
    categoryLabelVi: 'Khám Phá Vũ Trụ',
    badgeTitleVi: 'Tên lửa vũ trụ',
    promptVi: 'Trong bức tranh chiếc tên lửa đang bay vào vũ trụ, bộ phận nào gợi lên hình ảnh hai đường thẳng song song?',
    options: [
      'Hai đường viền sọc ngang trên thân tên lửa',
      'Hai cạnh chéo gặp nhau ở chóp nhọn đầu tên lửa',
      'Cửa sổ hình tròn giữa thân tên lửa',
      'Các ngôi sao lấp lánh trên bầu trời',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Hai đường viền ngang trên thân tên lửa (và hai cạnh đối của khung cửa tên lửa) song song với nhau và không bao giờ cắt nhau.',
    diagramPreset: 'rocket_parallel_scene',
  },
  {
    id: 'par_l1_q4',
    level: 1,
    categoryLabelVi: 'Nhận Diện Hình Vẽ',
    badgeTitleVi: 'Kéo dài cạnh hình chữ nhật',
    promptVi: 'Khi kéo dài hai cạnh đối AB và DC của hình chữ nhật ABCD về hai phía, ta thu được gì?',
    options: [
      'Hai đường thẳng song song với nhau',
      'Hai đường thẳng vuông góc với nhau',
      'Hai đường thẳng cắt nhau tại đỉnh A',
      'Một góc tù lớn hơn 90°',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Kéo dài hai cạnh đối AB và DC của hình chữ nhật ABCD, ta được hai đường thẳng song song với nhau.',
    diagramPreset: 'rect_abcd_extended_par',
  },
  {
    id: 'par_l1_q5',
    level: 1,
    categoryLabelVi: 'Thử Tài Que Tính',
    badgeTitleVi: 'Bốn chữ cái V, I, E, T',
    promptVi:
      'Xếp que tính thành 4 chữ cái V, I, E, T như hình vẽ. Chữ cái nào vừa có các que tính song song vừa có các que tính vuông góc?',
    options: ['Chữ E', 'Chữ V', 'Chữ I', 'Chữ T'],
    correctOptionIndex: 0,
    explanationVi:
      'Chữ E có 3 thanh ngang song song với nhau và cả 3 thanh ngang đều vuông góc với thanh thẳng đứng!',
    diagramPreset: 'viet_matchsticks',
  },
  {
    id: 'par_l1_q6',
    level: 1,
    categoryLabelVi: 'Bản Đồ Đường Phố',
    badgeTitleVi: 'Tìm nhà nằm trên đường song song',
    promptVi:
      'Robot Toán Học ở ngôi nhà màu vàng trên con đường ngang giữa bản đồ. Biết nhà bạn Mai nằm trên con đường song song với đường nhà Robot. Đâu là nhà của Mai?',
    options: ['Ngôi nhà A', 'Ngôi nhà B', 'Ngôi nhà C', 'Ngôi nhà D'],
    correctOptionIndex: 0,
    explanationVi:
      'Con đường đi qua ngôi nhà A chạy song song với con đường ngang đi qua ngôi nhà màu vàng của Robot Toán Học!',
    diagramPreset: 'street_map_robot_mai',
  },
  {
    id: 'par_l1_q7',
    level: 1,
    categoryLabelVi: 'Phân Biệt Chính Xác',
    badgeTitleVi: 'Song song hay cắt nhau?',
    promptVi: 'Quan sát hai đường thẳng nghiêng dần lại gần nhau ở hình bên. Khi kéo dài thêm về bên phải, chúng sẽ như thế nào?',
    options: [
      'Chúng sẽ cắt nhau nên KHÔNG phải hai đường thẳng song song',
      'Chúng vẫn là hai đường thẳng song song',
      'Chúng tạo thành 4 góc vuông',
      'Chúng không bao giờ gặp nhau',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Vì khoảng cách giữa hai đường ngày càng hẹp lại, khi kéo dài về bên phải chúng sẽ cắt nhau tại một điểm nên không song song.',
    diagramPreset: 'intersecting_vs_parallel_q',
  },
  {
    id: 'par_l1_q8',
    level: 1,
    categoryLabelVi: 'Đúng Hay Sai?',
    badgeTitleVi: 'Ngôi nhà ABCDE trên lưới ô vuông',
    promptVi: 'Quan sát ngôi nhà ABCDE trên lưới ô vuông. Nhận xét nào sau đây là ĐÚNG?',
    options: [
      'Hai đoạn thẳng CD và AE song song với nhau',
      'Hai đoạn thẳng AB và CD song song với nhau',
      'Hai đoạn thẳng AE và ED song song với nhau',
      'Hai đoạn thẳng AB và BC song song với nhau',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Trên lưới ô vuông, hai bức tường AE và CD cùng thẳng đứng và cách nhau 4 ô li nên hai đoạn thẳng CD và AE song song với nhau.',
    diagramPreset: 'house_grid_abcde_q',
  },
  {
    id: 'par_l1_q9',
    level: 1,
    categoryLabelVi: 'Đồ Vật Thực Tế Quanh Em',
    badgeTitleVi: 'Cây đàn ghi-ta 6 dây',
    promptVi: 'Quan sát 6 dây đàn căng thẳng trên cần cây đàn ghi-ta bên cạnh. Các dây đàn này gợi lên hình ảnh gì?',
    options: [
      'Nhiều đoạn thẳng song song với nhau (1 dây đàn song song với 5 dây còn lại)',
      'Các đoạn thẳng cắt nhau tại một điểm',
      'Các đoạn thẳng vuông góc với nhau tạo thành góc 90°',
      'Không có cặp đoạn thẳng nào song song với nhau',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Trên cần đàn ghi-ta, 6 dây đàn được căng thẳng và cách đều nhau nên chúng song song với nhau — mỗi dây đàn song song với cả 5 dây còn lại!',
    diagramPreset: 'guitar_strings_real',
  },
  {
    id: 'par_l1_q10',
    level: 1,
    categoryLabelVi: 'Đồ Vật Thực Tế Quanh Em',
    badgeTitleVi: 'Vạch kẻ đường cho người đi bộ',
    promptVi: 'Quan sát các vạch sơn màu trắng trên lối sang đường dành cho người đi bộ. Các mép dài của những vạch sơn trắng này có đặc điểm gì?',
    options: [
      'Song song với nhau và cách đều nhau, không bao giờ cắt nhau',
      'Vuông góc với nhau tại giữa mặt đường',
      'Cắt nhau tạo thành góc nhọn',
      'Nghiêng chéo và giao nhau ở mép vỉa hè',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Các vạch kẻ đường dành cho người đi bộ được sơn thẳng hàng, cách đều nhau và song song với nhau để giúp người đi bộ qua đường an toàn.',
    diagramPreset: 'zebra_crossing_real',
  },
  {
    id: 'par_l1_q11',
    level: 1,
    categoryLabelVi: 'Nhận Diện Hình Thang',
    badgeTitleVi: 'Hình thang MNPQ',
    promptVi: 'Quan sát hình thang MNPQ bên cạnh. Em hãy cho biết cặp cạnh nào song song với nhau?',
    options: [
      'Cạnh MN song song với cạnh QP',
      'Cạnh MQ song song với cạnh NP',
      'Cạnh MN song song với cạnh NP',
      'Cả 2 cặp cạnh đối đều song song với nhau',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Hình thang MNPQ chỉ có duy nhất 1 cặp cạnh đối diện song song là cạnh MN song song với cạnh QP. Hai cạnh bên MQ và NP nếu kéo dài lên trên sẽ cắt nhau!',
    diagramPreset: 'trapezoid_mnpq_q',
  },
  {
    id: 'par_l1_q12',
    level: 1,
    categoryLabelVi: 'Phân Loại Hình Học',
    badgeTitleVi: 'Bộ 6 hình đa giác',
    promptVi: 'Quan sát 6 hình vẽ bên cạnh (1: Chữ nhật, 2: Hình thang, 3: Tam giác thường, 4: Tam giác vuông, 5: Lục giác đều, 6: Ngôi nhà). Những hình nào KHÔNG có cặp cạnh song song nào?',
    options: [
      'Hình 3 và Hình 4',
      'Hình 1 và Hình 2',
      'Hình 5 và Hình 6',
      'Hình 2 và Hình 6',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Hình 3 và Hình 4 là các hình tam giác (mọi cặp cạnh đều cắt nhau tại 1 đỉnh), nên không có cặp cạnh song song nào.',
    diagramPreset: 'six_polygons_classify',
  },
];

/**
 * CẤP ĐỘ 2 – NHÀ KHOA HỌC NHÍ (10 câu: Cách đọc chuẩn + 1 cạnh song song NHIỀU cạnh + Quy trình 2 bước vẽ)
 */
export const PARALLEL_LEVEL2_QUESTIONS: ParallelChallengeQuestion[] = [
  {
    id: 'par_l2_q1',
    level: 2,
    categoryLabelVi: 'Cách Đọc Tên Chuẩn',
    badgeTitleVi: 'Hình vuông MNPQ',
    promptVi: 'Quan sát hình vuông MNPQ bên cạnh. Cách đọc đầy đủ các cặp cạnh song song trong hình là:',
    options: [
      'Hai cạnh MN và QP song song với nhau; hai cạnh MQ và NP song song với nhau',
      'Cạnh MN song song với cạnh NP; cạnh QP song song với cạnh MQ',
      'Chỉ có duy nhất cạnh MN song song với cạnh QP',
      'Cạnh MN song song với cạnh MQ tại đỉnh M',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Hình vuông MNPQ có 2 cặp cạnh đối diện song song với nhau: cạnh MN song song với cạnh QP, và cạnh MQ song song với cạnh NP.',
    diagramPreset: 'square_mnpq_read_q',
  },
  {
    id: 'par_l2_q2',
    level: 2,
    categoryLabelVi: 'Mở Rộng: 1 Cạnh Song Song Nhiều Cạnh',
    badgeTitleVi: 'Hình chữ nhật ghép AMND và MBCN',
    promptVi:
      'Trong hình bên, các tứ giác AMND, MBCN, ABCD đều là hình chữ nhật. Hỏi cạnh MN song song với những cạnh nào?',
    options: [
      'Cạnh AD và cạnh BC (2 cạnh)',
      'Chỉ song song với cạnh AD (1 cạnh)',
      'Cạnh AM và cạnh MB',
      'Cạnh DN và cạnh NC',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Một cạnh có thể song song với nhiều cạnh khác! Cạnh thẳng đứng MN song song với cả hai cạnh AD và BC.',
    diagramPreset: 'split_rect_amnd_mbcn_q',
  },
  {
    id: 'par_l2_q3',
    level: 2,
    categoryLabelVi: 'Mở Rộng: 1 Cạnh Song Song 3 Cạnh',
    badgeTitleVi: 'Khung cửa sổ 3 ô dọc',
    promptVi:
      'Quan sát khung cửa sổ hình chữ nhật ABCD có thêm hai thanh dọc MN và PQ song song với khung. Hỏi cạnh AD song song với bao nhiêu cạnh khác trong hình?',
    options: [
      '3 cạnh (cạnh MN, cạnh PQ và cạnh BC)',
      '1 cạnh (chỉ cạnh BC)',
      '2 cạnh (cạnh MN và cạnh PQ)',
      '4 cạnh (AB, DC, MN, PQ)',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Cạnh AD song song với cả 3 cạnh thẳng đứng còn lại trong hình là cạnh MN, cạnh PQ và cạnh BC!',
    diagramPreset: 'window_3_panes_q',
  },
  {
    id: 'par_l2_q4',
    level: 2,
    categoryLabelVi: 'Mở Rộng: Đồ Vật Thực Tế',
    badgeTitleVi: 'Giá sách gỗ 4 tầng',
    promptVi:
      'Quan sát giá sách gỗ có 4 tầng ngang AB, CD, EF, GH và 2 vách đứng AG, BH. Tầng sách AB song song với những tầng nào?',
    options: [
      'Song song với cả 3 tầng: cạnh CD, cạnh EF và cạnh GH',
      'Chỉ song song với tầng CD ngay phía dưới',
      'Song song với hai vách đứng AG và BH',
      'Chỉ song song với tầng đáy GH',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Tầng sách AB song song với TẤT CẢ 3 tầng ngang còn lại là cạnh CD, cạnh EF và cạnh GH vì 4 tầng đều nằm ngang và không bao giờ cắt nhau!',
    diagramPreset: 'bookshelf_real',
  },
  {
    id: 'par_l2_q5',
    level: 2,
    categoryLabelVi: 'Mở Rộng: Chữ Cái Que Tính',
    badgeTitleVi: 'Chữ E có 3 thanh ngang',
    promptVi:
      'Trong chữ E xếp bằng que tính gồm 3 thanh ngang AB, CD, EF và thanh đứng AE. Thanh ngang AB song song với những thanh nào?',
    options: [
      'Song song với cả 2 thanh CD và EF',
      'Chỉ song song với thanh giữa CD',
      'Song song với thanh đứng AE',
      'Không song song với thanh nào',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Cạnh AB song song với cạnh CD và cạnh AB cũng song song với cạnh EF — tức là song song với cả 2 thanh ngang còn lại!',
    diagramPreset: 'letter_e_multi_par_q',
  },
  {
    id: 'par_l2_q6',
    level: 2,
    categoryLabelVi: 'Hình Bình Hành',
    badgeTitleVi: 'Hình bình hành ABCD',
    promptVi:
      'Quan sát hình bình hành ABCD bên cạnh. Em hãy đọc tên ĐẦY ĐỦ tất cả các cặp cạnh song song có trong hình bình hành ABCD:',
    options: [
      'Hai cạnh AB và DC song song với nhau; hai cạnh AD và BC song song với nhau',
      'Chỉ có duy nhất hai cạnh AB và DC song song với nhau',
      'Cạnh AB song song với cạnh BC; cạnh AD song song với cạnh DC',
      'Hình bình hành ABCD không có cặp cạnh song song nào vì các cạnh bị nghiêng',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Hình bình hành ABCD có 2 cặp cạnh đối diện song song với nhau: cạnh AB song song với cạnh DC, và hai cạnh nghiêng đối diện AD và BC cũng song song với nhau!',
    diagramPreset: 'parallelogram_abcd_q',
  },
  {
    id: 'par_l2_q7',
    level: 2,
    categoryLabelVi: 'Hình Thoi',
    badgeTitleVi: 'Hình thoi ABCD',
    promptVi:
      'Quan sát hình thoi ABCD có 4 cạnh bằng nhau bên cạnh. Khẳng định nào sau đây ĐÚNG về các cạnh song song trong hình thoi?',
    options: [
      'Hình thoi có 2 cặp cạnh đối diện song song: cạnh AB song song với cạnh DC và cạnh AD song song với cạnh BC',
      'Hình thoi chỉ có 1 cặp cạnh song song',
      'Cạnh AB song song với cạnh AD',
      'Hình thoi không có cặp cạnh song song nào',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Hình thoi ABCD có hai cặp cạnh đối diện song song với nhau: cạnh AB song song với cạnh DC, và cạnh AD song song với cạnh BC!',
    diagramPreset: 'rhombus_abcd_q',
  },
  {
    id: 'par_l2_q8',
    level: 2,
    categoryLabelVi: 'So Sánh Hình Thang và Hình Bình Hành',
    badgeTitleVi: 'Hình thang MNPQ',
    promptVi:
      'So sánh số cặp cạnh đối diện song song của hình thang MNPQ (bên cạnh) với hình bình hành ABCD:',
    options: [
      'Hình thang MNPQ chỉ có 1 cặp cạnh song song (MN và QP), còn hình bình hành có 2 cặp cạnh song song',
      'Cả hình thang MNPQ và hình bình hành ABCD đều có 2 cặp cạnh song song',
      'Hình thang MNPQ có 2 cặp cạnh song song, còn hình bình hành có 1 cặp',
      'Hình thang MNPQ không có cặp cạnh nào song song',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Đây là điểm khác nhau rất quan trọng: hình thang chỉ có 1 cặp cạnh đối diện song song (hai đáy MN và QP), còn hình bình hành và hình thoi đều có 2 cặp cạnh đối diện song song!',
    diagramPreset: 'trapezoid_mnpq_q',
  },
  {
    id: 'par_l2_q9',
    level: 2,
    categoryLabelVi: 'Đếm Cặp Cạnh Song Song',
    badgeTitleVi: 'Hình lục giác đều ABCDEF',
    promptVi: 'Quan sát hình lục giác đều ABCDEF. Trong hình có tất cả bao nhiêu cặp cạnh song song với nhau?',
    options: ['3 cặp cạnh song song', '1 cặp cạnh song song', '2 cặp cạnh song song', '6 cặp cạnh song song'],
    correctOptionIndex: 0,
    explanationVi:
      'Hình lục giác đều ABCDEF có 3 cặp cạnh đối diện song song với nhau: cạnh AB song song với cạnh ED, cạnh BC song song với cạnh FE và cạnh CD song song với cạnh AF.',
    diagramPreset: 'hexagon_abcdef_q',
  },
  {
    id: 'par_l2_q10',
    level: 2,
    categoryLabelVi: 'Mở Rộng: Đọc Tên Trên Hình Ghép',
    badgeTitleVi: 'Hình ghép AMND và MBCN',
    promptVi:
      'Quan sát lại hình chữ nhật ABCD gồm hai hình chữ nhật AMND và MBCN. Cạnh AM song song với những đoạn thẳng nào ở cạnh đáy DC?',
    options: [
      'Song song với cả cạnh DN, cạnh NC và cả cạnh DC (3 đoạn thẳng)',
      'Chỉ song song với duy nhất cạnh DN',
      'Song song với cạnh AD và cạnh MN',
      'Song song với cạnh BC',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Vì DN, NC và DC đều nằm trên cùng đường thẳng đáy song song với đường thẳng trên AB, nên cạnh AM song song với cả DN, NC và DC!',
    diagramPreset: 'split_rect_amnd_mbcn_q',
  },
  {
    id: 'par_l2_q11',
    level: 2,
    categoryLabelVi: 'Đúng – Sai Tổng Hợp',
    badgeTitleVi: 'Ngôi nhà ABCDE trên lưới ô vuông',
    promptVi: 'Trong hình ngôi nhà ABCDE trên lưới ô vuông, cặp nhận xét nào sau đây ĐÚNG CẢ HAI Ý?',
    options: [
      'Cạnh AE song song với cạnh CD; và cạnh AE vuông góc với cạnh ED',
      'Cạnh AB song song với cạnh CD; và cạnh AE song song với cạnh ED',
      'Cạnh AE vuông góc với cạnh CD; và cạnh AB song song với cạnh BC',
      'Cạnh AB song song với cạnh ED; và cạnh CD vuông góc với cạnh BC',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Hai vách tường AE và CD song song với nhau; đồng thời vách AE gặp nền nhà ED tạo thành góc vuông tại đỉnh E nên cạnh AE vuông góc với cạnh ED.',
    diagramPreset: 'house_grid_abcde_q',
  },
  {
    id: 'par_l2_q12',
    level: 2,
    categoryLabelVi: 'Quy Trình 2 Bước Vẽ Ê Ke',
    badgeTitleVi: 'Vẽ CD qua H song song với AB',
    promptVi:
      'Để vẽ đường thẳng CD đi qua điểm H (nằm ngoài AB) và song song với đường thẳng AB bằng ê ke, thứ tự 2 bước chuẩn là gì?',
    options: [
      'Bước 1: Vẽ đường phụ MN qua H vuông góc với AB → Bước 2: Vẽ CD qua H vuông góc với MN',
      'Bước 1: Nối điểm H với điểm A → Bước 2: Nối điểm H với điểm B',
      'Bước 1: Đặt góc nhọn ê ke trùng AB → Bước 2: Vẽ dọc theo cạnh huyền',
      'Chỉ cần vẽ một đường thẳng bất kì đi qua H là được',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Vẽ 2 lần vuông góc bằng ê ke (MN vuông góc với AB tại bước 1, rồi CD vuông góc với MN qua H tại bước 2) bảo đảm đường thẳng CD song song chính xác tuyệt đối với đường thẳng AB!',
    diagramPreset: 'two_step_draw_par_q',
  },
];

export function getParallelQuestionsByLevel(level: 1 | 2): ParallelChallengeQuestion[] {
  return level === 1 ? PARALLEL_LEVEL1_QUESTIONS : PARALLEL_LEVEL2_QUESTIONS;
}

export { normalizeDeg360 };
