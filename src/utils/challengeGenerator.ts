import { classifyAngle } from './angleMath';

export type ChallengeLevel = 1 | 2 | 3;

export type ChallengeExerciseCategory =
  | 'all'
  | 'clock'
  | 'polygon'
  | 'count_angles'
  | 'standard';

export type ShapePresetId =
  | 'right_trapezoid_abcd'
  | 'right_triangle_abc'
  | 'obtuse_triangle_mnp'
  | 'parallelogram_pqrs'
  | 'house_pentagon_abcde'
  | 'straight_beam_oab'
  | 'quad_abcd_textbook'
  | 'equilateral_triangle_abc'
  | 'isosceles_trapezoid_mnpq'
  | 'rect_diagonal_abcd'
  | 'straight_vs_right_angles'
  | 'compare_two_angles_op'
  | 'adjacent_supplementary_110_70';

export interface ChallengeVisualSpec {
  kind: 'standard' | 'clock' | 'polygon_measure' | 'count_shape';
  category: Exclude<ChallengeExerciseCategory, 'all'>;
  categoryLabelVi: string;
  badgeTitleVi: string;
  clockHour?: number;
  clockMinute?: number;
  shapePreset?: ShapePresetId;
  hideDiagram?: boolean;
  hideTargetDegreeInShape?: boolean;
  hideAllDegreesInShape?: boolean;
  hide90DegreeLabelsInShape?: boolean;
  hideAngleSymbolInShape?: boolean;
  showProtractorOnStandard?: boolean;
  showDegreeAlways?: boolean;
  targetVertexLabel?: string;
  side1Label?: string;
  side2Label?: string;
  polygonType?: 'triangle' | 'quadrilateral';
  fourthVertexOffset?: { dx: number; dy: number; label: string; angleText?: string };
  otherVerticesLabels?: { v1AngleText?: string; v2AngleText?: string };
}

export interface FillBlanksSpec {
  angleTypeAnswer: string;
  vertexAnswer: string;
  side1Answer: string;
  side2Answer: string;
}

export interface ChallengeQuestion {
  id: string;
  level: ChallengeLevel;
  questionType: 'identify_type' | 'estimate_measure' | 'missing_angle' | 'measure_with_protractor';
  promptVi: string;
  angleDeg: number;
  baseRayAngleDeg: number;
  options?: string[];
  correctOptionIndex?: number;
  alsoAcceptOptionIndex?: number;
  fillBlanksSpec?: FillBlanksSpec;
  targetMeasureDeg?: number;
  explanationVi: string;
  planetNameVi: string;
  visualSpec: ChallengeVisualSpec;
}

export interface PlayerProgress {
  stars: number;
  completedSections: {
    explore: boolean;
    lab: boolean;
    tutorial: boolean;
    library: boolean;
    level1: boolean;
    level2: boolean;
    level3: boolean;
  };
  highScores: {
    level1: number;
    level2: number;
    level3: number;
  };
  badges: string[];
  measuredAnglesCount: number;
}

export const INITIAL_PROGRESS: PlayerProgress = {
  stars: 0,
  completedSections: {
    explore: false,
    lab: false,
    tutorial: false,
    library: false,
    level1: false,
    level2: false,
    level3: false,
  },
  highScores: {
    level1: 0,
    level2: 0,
    level3: 0,
  },
  badges: [],
  measuredAnglesCount: 0,
};

export interface BadgeInfo {
  id: string;
  titleVi: string;
  descVi: string;
  color: string;
  unlocked: (p: PlayerProgress) => boolean;
}

export const BADGE_CATALOG: BadgeInfo[] = [
  {
    id: 'explorer_badge',
    titleVi: 'Nhà Thám Hiểm Góc',
    descVi: 'Khám phá trọn vẹn Bảo tàng các loại góc 3D',
    color: '#FACC15',
    unlocked: (p) => p.completedSections.explore,
  },
  {
    id: 'tutorial_badge',
    titleVi: 'Phi Công Căn Chỉnh',
    descVi: 'Hoàn thành bài học 3 bước đặt thước đo góc chuẩn xác',
    color: '#38BDF8',
    unlocked: (p) => p.completedSections.tutorial,
  },
  {
    id: 'lab_scientist',
    titleVi: 'Chuyên Gia Thí Nghiệm',
    descVi: 'Thực hành đo chính xác ít nhất 3 góc tại Phòng Thí Nghiệm 180°',
    color: '#22C55E',
    unlocked: (p) => p.measuredAnglesCount >= 3 || p.completedSections.lab,
  },
  {
    id: 'planet_1_hero',
    titleVi: 'Nhà Du Hành Tập Sự',
    descVi: 'Vượt qua Cấp độ 1 tại Hành Tinh Sao Thủy',
    color: '#FF2E93',
    unlocked: (p) => p.completedSections.level1,
  },
  {
    id: 'planet_2_hero',
    titleVi: 'Nhà Khoa Học Nhí',
    descVi: 'Vượt qua Cấp độ 2 tại Hành Tinh Sao Mộc',
    color: '#A855F7',
    unlocked: (p) => p.completedSections.level2,
  },
  {
    id: 'master_protractor',
    titleVi: 'Bậc Thầy Đo Góc 180°',
    descVi: 'Chinh phục Cấp độ 3 bằng thước đo góc',
    color: '#F97316',
    unlocked: (p) => p.completedSections.level3,
  },
];

export function calculateStarReward(correctCount: number, totalQuestions = 15): number {
  if (totalQuestions <= 0) return 0;
  const ratio = correctCount / totalQuestions;
  if (ratio >= 0.85) return 3;
  if (ratio >= 0.65) return 2;
  if (ratio >= 0.45) return 1;
  return 0;
}

export function computeOverallProgressPercent(p: PlayerProgress): number {
  const keys = Object.keys(p.completedSections) as Array<keyof PlayerProgress['completedSections']>;
  const doneCount = keys.filter((k) => p.completedSections[k]).length;
  return Math.round((doneCount / keys.length) * 100);
}

const LEVEL1_BANK: Omit<ChallengeQuestion, 'id'>[] = [
  // 1. Đồng hồ 3 giờ
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Quan sát mặt đồng hồ lúc 3 giờ đúng, vậy góc tạo bởi kim giờ và kim phút là góc gì?',
    angleDeg: 90,
    baseRayAngleDeg: 0,
    options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
    correctOptionIndex: 1,
    explanationVi: 'Lúc 3 giờ đúng, kim phút chỉ số 12 và kim giờ chỉ số 3 vuông góc với nhau tạo thành Góc vuông (90°).',
    planetNameVi: 'Trạm Sao Thủy',
    visualSpec: {
      kind: 'clock',
      category: 'clock',
      categoryLabelVi: '🕒 Góc Kim Đồng Hồ',
      badgeTitleVi: 'Đồng hồ lúc 3 giờ đúng',
      clockHour: 3,
      clockMinute: 0,
      hideAllDegreesInShape: true,
    },
  },
  // 2. Đếm số góc vuông trong hình tứ giác ABCD
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Quan sát hình tứ giác ABCD bên cạnh. Trong hình có bao nhiêu GÓC VUÔNG?',
    angleDeg: 90,
    baseRayAngleDeg: 0,
    options: ['1 góc vuông', '2 góc vuông', '3 góc vuông', '4 góc vuông'],
    correctOptionIndex: 1,
    explanationVi: 'Hình tứ giác ABCD có 2 góc vuông tại đỉnh A (90°) và đỉnh B (90°). Góc đỉnh D là góc tù và góc đỉnh C là góc nhọn.',
    planetNameVi: 'Trạm Sao Thủy',
    visualSpec: {
      kind: 'count_shape',
      category: 'count_angles',
      categoryLabelVi: '🔢 Đếm Góc Trong Hình',
      badgeTitleVi: 'Hình tứ giác ABCD',
      shapePreset: 'right_trapezoid_abcd',
      hideAllDegreesInShape: true,
    },
  },
  // 3. Đo/nhận biết góc trong hình tứ giác ABCD theo SGK
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Trong hình tứ giác ABCD, góc đỉnh D; cạnh DA, DC có số đo 120° được gọi là góc nào?',
    angleDeg: 120,
    baseRayAngleDeg: 0,
    options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
    correctOptionIndex: 2,
    explanationVi: 'Góc đỉnh D; cạnh DA, DC có số đo 120° lớn hơn 90° và nhỏ hơn 180° nên là Góc tù.',
    planetNameVi: 'Trạm Sao Thủy',
    visualSpec: {
      kind: 'polygon_measure',
      category: 'polygon',
      categoryLabelVi: '📐 Góc Tam Giác · Tứ Giác',
      badgeTitleVi: 'Hình tứ giác ABCD',
      shapePreset: 'quad_abcd_textbook',
      targetVertexLabel: 'D',
      hide90DegreeLabelsInShape: true,
    },
  },
  // 4. Đồng hồ 2 giờ
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Trên mặt đồng hồ lúc 2 giờ đúng, kim giờ và kim phút tạo thành một góc 60°. Đó là loại góc gì?',
    angleDeg: 60,
    baseRayAngleDeg: 30,
    options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
    correctOptionIndex: 0,
    explanationVi: 'Lúc 2 giờ đúng, góc giữa kim giờ và kim phút bằng 60° (bé hơn 90°) nên là Góc nhọn.',
    planetNameVi: 'Trạm Sao Thủy',
    visualSpec: {
      kind: 'clock',
      category: 'clock',
      categoryLabelVi: '🕒 Góc Kim Đồng Hồ',
      badgeTitleVi: 'Đồng hồ lúc 2 giờ đúng',
      clockHour: 2,
      clockMinute: 0,
    },
  },
  // 5. Đếm số góc nhọn trong hình tam giác ABC
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Quan sát hình tam giác ABC, hình tam giác này có bao nhiêu GÓC NHỌN?',
    angleDeg: 60,
    baseRayAngleDeg: 0,
    options: ['1 góc nhọn', '2 góc nhọn', '3 góc nhọn', 'Không có góc nhọn nào'],
    correctOptionIndex: 1,
    explanationVi: 'Tam giác ABC có 1 góc vuông tại đỉnh A và 2 góc nhọn tại đỉnh B và đỉnh C.',
    planetNameVi: 'Trạm Sao Thủy',
    visualSpec: {
      kind: 'count_shape',
      category: 'count_angles',
      categoryLabelVi: '🔢 Đếm Góc Trong Hình',
      badgeTitleVi: 'Hình tam giác ABC',
      shapePreset: 'right_triangle_abc',
      hideAllDegreesInShape: true,
    },
  },
  // 6. Đồng hồ 4 giờ
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Khi đồng hồ chỉ 4 giờ đúng, góc tạo bởi kim giờ và kim phút là góc gì?',
    angleDeg: 120,
    baseRayAngleDeg: -30,
    options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
    correctOptionIndex: 2,
    explanationVi: 'Lúc 4 giờ đúng, kim giờ và kim phút mở rộng hơn góc vuông (90°) nên là Góc tù.',
    planetNameVi: 'Trạm Sao Thủy',
    visualSpec: {
      kind: 'clock',
      category: 'clock',
      categoryLabelVi: '🕒 Góc Kim Đồng Hồ',
      badgeTitleVi: 'Đồng hồ lúc 4 giờ đúng',
      clockHour: 4,
      clockMinute: 0,
      hideAllDegreesInShape: true,
    },
  },
  // 7. Đếm góc tù và góc nhọn trong hình tứ giác PQRS
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Quan sát hình tứ giác PQRS bên cạnh và cho biết trong hình này có bao nhiêu GÓC TÙ và bao nhiêu GÓC NHỌN?',
    angleDeg: 120,
    baseRayAngleDeg: 0,
    options: [
      '2 góc tù và 2 góc nhọn',
      '4 góc vuông',
      '1 góc tù và 3 góc nhọn',
      '3 góc tù và 1 góc nhọn',
    ],
    correctOptionIndex: 0,
    explanationVi: 'Hình tứ giác PQRS có 2 góc nhọn (ở đỉnh P và R) và 2 góc tù (ở đỉnh Q và S).',
    planetNameVi: 'Trạm Sao Thủy',
    visualSpec: {
      kind: 'count_shape',
      category: 'count_angles',
      categoryLabelVi: '🔢 Đếm Góc Trong Hình',
      badgeTitleVi: 'Hình tứ giác PQRS',
      shapePreset: 'parallelogram_pqrs',
      hideAllDegreesInShape: true,
    },
  },
  // 8. Đồng hồ 6 giờ
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Góc tạo bởi kim giờ và kim phút lúc 6 giờ đúng là góc gì?',
    angleDeg: 180,
    baseRayAngleDeg: -90,
    options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
    correctOptionIndex: 3,
    explanationVi: 'Lúc 6 giờ đúng, kim phút chỉ số 12 và kim giờ chỉ số 6 thẳng hàng nhau, tạo thành Góc bẹt.',
    planetNameVi: 'Trạm Sao Thủy',
    visualSpec: {
      kind: 'clock',
      category: 'clock',
      categoryLabelVi: '🕒 Góc Kim Đồng Hồ',
      badgeTitleVi: 'Đồng hồ lúc 6 giờ đúng',
      clockHour: 6,
      clockMinute: 0,
      hideAllDegreesInShape: true,
    },
  },
  // 9. Góc trong tam giác tù MNP
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Quan sát hình tam giác MNP. Góc đỉnh M; cạnh MN, MP là góc gì?',
    angleDeg: 110,
    baseRayAngleDeg: 0,
    options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
    correctOptionIndex: 2,
    explanationVi: 'Trong tam giác MNP, góc đỉnh M; cạnh MN, MP có độ mở lớn hơn góc vuông nên là Góc tù.',
    planetNameVi: 'Trạm Sao Thủy',
    visualSpec: {
      kind: 'polygon_measure',
      category: 'polygon',
      categoryLabelVi: '📐 Góc Tam Giác · Tứ Giác',
      badgeTitleVi: 'Hình tam giác MNP',
      shapePreset: 'obtuse_triangle_mnp',
      targetVertexLabel: 'M',
      hideAllDegreesInShape: true,
    },
  },
  // 10. Đếm góc bẹt trong hình hai tia đối nhau
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Quan sát hình và cho biết góc đỉnh O; cạnh OA, OB là góc gì?',
    angleDeg: 180,
    baseRayAngleDeg: 0,
    options: ['Góc bẹt', 'Góc vuông', 'Góc nhọn', 'Góc tù'],
    correctOptionIndex: 0,
    explanationVi: 'Vì hai cạnh OA và OB tạo thành một đường thẳng đi qua đỉnh O nên góc đỉnh O; cạnh OA, OB là Góc bẹt.',
    planetNameVi: 'Trạm Sao Thủy',
    visualSpec: {
      kind: 'count_shape',
      category: 'count_angles',
      categoryLabelVi: '🔢 Đếm Góc Trong Hình',
      badgeTitleVi: 'Đường thẳng AOB và các tia OC, OD',
      shapePreset: 'straight_beam_oab',
      hideAllDegreesInShape: true,
    },
  },
  // 11. Góc cơ bản 45°
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Quan sát góc đỉnh O; cạnh OA, OB có số đo 45° trong hình bên. Đây là loại góc gì?',
    angleDeg: 45,
    baseRayAngleDeg: 0,
    options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
    correctOptionIndex: 0,
    explanationVi: 'Góc đỉnh O; cạnh OA, OB có độ mở 45° nhỏ hơn góc vuông (90°) nên là Góc nhọn.',
    planetNameVi: 'Trạm Sao Thủy',
    visualSpec: {
      kind: 'standard',
      category: 'standard',
      categoryLabelVi: '🧭 Góc Hai Tia Cơ Bản',
      badgeTitleVi: 'Góc đỉnh O; cạnh OA, OB',
    },
  },
  // 12. Cách đọc tên góc lớp 4
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Hãy đọc tên góc có trong hình?',
    angleDeg: 60,
    baseRayAngleDeg: 0,
    options: [
      'Góc đỉnh O; cạnh OA, OB',
      'Góc đỉnh A; cạnh AO, AB',
      'Góc đỉnh B; cạnh BO, BA',
      'Đoạn thẳng OA, OB',
    ],
    correctOptionIndex: 0,
    explanationVi: 'Theo sách giáo khoa Toán lớp 4, ta nêu tên đỉnh trước rồi nêu tên hai cạnh xuất phát từ đỉnh: "Góc đỉnh O; cạnh OA, OB".',
    planetNameVi: 'Trạm Sao Thủy',
    visualSpec: {
      kind: 'standard',
      category: 'standard',
      categoryLabelVi: '🧭 Góc Hai Tia Cơ Bản',
      badgeTitleVi: 'Quan sát góc trong hình',
      hideAllDegreesInShape: true,
    },
  },
  // 13. Đếm góc tù trong hình ngôi nhà ngũ giác ABCDE
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Quan sát hình ngôi nhà ABCDE, trong hình có mấy góc tù?',
    angleDeg: 120,
    baseRayAngleDeg: 0,
    options: ['3 góc tù', '1 góc tù', '2 góc tù', '4 góc tù'],
    correctOptionIndex: 0,
    explanationVi: 'Hình ngôi nhà ABCDE có 3 góc tù ở phần mái (đỉnh B, đỉnh C, đỉnh D) và 2 góc vuông tại chân tường (đỉnh A, đỉnh E).',
    planetNameVi: 'Trạm Sao Thủy',
    visualSpec: {
      kind: 'count_shape',
      category: 'count_angles',
      categoryLabelVi: '🔢 Đếm Góc Trong Hình',
      badgeTitleVi: 'Hình ngôi nhà ABCDE',
      shapePreset: 'house_pentagon_abcde',
      hideAllDegreesInShape: true,
    },
  },
  // 14. Đồng hồ 9 giờ
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Khi đồng hồ chỉ 9 giờ đúng, kim giờ và kim phút tạo thành góc gì?',
    angleDeg: 90,
    baseRayAngleDeg: 90,
    options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
    correctOptionIndex: 1,
    explanationVi: 'Lúc 9 giờ đúng, kim giờ chỉ số 9 và kim phút chỉ số 12 vuông góc với nhau, tạo thành Góc vuông.',
    planetNameVi: 'Trạm Sao Thủy',
    visualSpec: {
      kind: 'clock',
      category: 'clock',
      categoryLabelVi: '🕒 Góc Kim Đồng Hồ',
      badgeTitleVi: 'Đồng hồ lúc 9 giờ đúng',
      clockHour: 9,
      clockMinute: 0,
      hideAllDegreesInShape: true,
      hideAngleSymbolInShape: true,
    },
  },
  // 15. Góc tù 135°
  {
    level: 1,
    questionType: 'identify_type',
    promptVi: 'Cánh tay Robot Toán học tạo thành góc đỉnh O; cạnh OA, OB bằng 135° đây là góc gì?',
    angleDeg: 135,
    baseRayAngleDeg: 0,
    options: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
    correctOptionIndex: 2,
    explanationVi: '135° lớn hơn 90° và nhỏ hơn 180° nên góc đỉnh O; cạnh OA, OB là Góc tù.',
    planetNameVi: 'Trạm Sao Thủy',
    visualSpec: {
      kind: 'standard',
      category: 'standard',
      categoryLabelVi: '🧭 Góc Hai Tia Cơ Bản',
      badgeTitleVi: 'Góc đỉnh O; cạnh OA, OB',
    },
  },
];

const LEVEL2_BANK: Omit<ChallengeQuestion, 'id'>[] = [
  // 1. Sắp xếp các góc theo thứ tự từ lớn đến bé (không cần hình minh họa)
  {
    level: 2,
    questionType: 'identify_type',
    promptVi: 'Hãy sắp xếp các góc tù, góc bẹt, góc nhọn, góc vuông theo thứ tự từ lớn đến bé.',
    angleDeg: 180,
    baseRayAngleDeg: 0,
    options: [
      'Góc bẹt → Góc tù → Góc vuông → Góc nhọn',
      'Góc nhọn → Góc vuông → Góc tù → Góc bẹt',
      'Góc bẹt → Góc vuông → Góc tù → Góc nhọn',
      'Góc tù → Góc bẹt → Góc vuông → Góc nhọn',
    ],
    correctOptionIndex: 0,
    explanationVi:
      'Thứ tự từ lớn đến bé là: Góc bẹt (180°) → Góc tù (lớn hơn 90° và bé hơn 180°) → Góc vuông (90°) → Góc nhọn (bé hơn 90°).',
    planetNameVi: 'Vành Đai Sao Mộc',
    visualSpec: {
      kind: 'standard',
      category: 'standard',
      categoryLabelVi: '🧭 So Sánh Các Loại Góc',
      badgeTitleVi: 'Sắp xếp góc từ lớn đến bé',
      hideDiagram: true,
    },
  },
  // 2. Góc bẹt gấp mấy lần góc vuông (có hình minh họa góc bẹt và góc vuông)
  {
    level: 2,
    questionType: 'estimate_measure',
    promptVi: 'Góc bẹt gấp mấy lần góc vuông?',
    angleDeg: 180,
    baseRayAngleDeg: 0,
    options: ['Gấp 2 lần', 'Gấp 3 lần', 'Gấp 4 lần', 'Bằng nhau'],
    correctOptionIndex: 0,
    explanationVi:
      'Góc bẹt bằng hai góc vuông (180° : 90° = 2), nên góc bẹt gấp 2 lần góc vuông.',
    planetNameVi: 'Vành Đai Sao Mộc',
    visualSpec: {
      kind: 'count_shape',
      category: 'standard',
      categoryLabelVi: '🧭 So Sánh Góc Bẹt và Góc Vuông',
      badgeTitleVi: 'Hình minh họa: Góc bẹt và Góc vuông',
      shapePreset: 'straight_vs_right_angles',
    },
  },
  // 3. Đo / tìm góc trong hình tứ giác ABCD (SGK Lớp 4)
  {
    level: 2,
    questionType: 'missing_angle',
    promptVi: 'Quan sát hình tứ giác ABCD: biết góc đỉnh A = 90°, góc đỉnh C = 90°, góc đỉnh D = 120°. Góc nhọn đỉnh B; cạnh BA, BC có số đo là bao nhiêu?',
    angleDeg: 60,
    baseRayAngleDeg: 0,
    options: ['60°', '90°', '120°', '45°'],
    correctOptionIndex: 0,
    explanationVi: 'Trong hình tứ giác ABCD chuẩn sách giáo khoa Lớp 4, góc nhọn tại đỉnh B; cạnh BA, BC có số đo bằng 60°.',
    planetNameVi: 'Vành Đai Sao Mộc',
    visualSpec: {
      kind: 'polygon_measure',
      category: 'polygon',
      categoryLabelVi: '📐 Góc Tam Giác · Tứ Giác',
      badgeTitleVi: 'Tìm số đo góc đỉnh B trong tứ giác ABCD',
      shapePreset: 'quad_abcd_textbook',
      targetVertexLabel: 'B',
      hideTargetDegreeInShape: true,
    },
  },
  // 4. Tìm góc trong tam giác đều ABC
  {
    level: 2,
    questionType: 'missing_angle',
    promptVi: 'Hình tam giác đều ABC có 3 cạnh bằng nhau và 3 góc ở đỉnh A, B, C đều bằng nhau. Biết góc đỉnh A = 60°, góc đỉnh B = 60°, hỏi góc đỉnh C bằng bao nhiêu độ?',
    angleDeg: 60,
    baseRayAngleDeg: 0,
    options: ['60°', '45°', '90°', '120°'],
    correctOptionIndex: 0,
    explanationVi: 'Tam giác đều ABC có cả 3 góc nhọn bằng nhau và mỗi góc đều có số đo bằng 60°.',
    planetNameVi: 'Vành Đai Sao Mộc',
    visualSpec: {
      kind: 'polygon_measure',
      category: 'polygon',
      categoryLabelVi: '📐 Góc Tam Giác · Tứ Giác',
      badgeTitleVi: 'Hình tam giác đều ABC',
      shapePreset: 'equilateral_triangle_abc',
      targetVertexLabel: 'C',
      hideTargetDegreeInShape: true,
    },
  },
  // 5. Đếm tổng hợp góc vuông, nhọn, tù trong hình tứ giác ABCD
  {
    level: 2,
    questionType: 'identify_type',
    promptVi: 'Quan sát hình tứ giác ABCD có số đo 4 góc lần lượt là: A = 90°, B = 60°, C = 90°, D = 120°. Nhận xét nào đúng về số lượng các loại góc trong hình?',
    angleDeg: 90,
    baseRayAngleDeg: 0,
    options: [
      '2 góc vuông, 1 góc nhọn, 1 góc tù',
      '1 góc vuông, 2 góc nhọn, 1 góc tù',
      '2 góc vuông, 2 góc nhọn, 0 góc tù',
      '1 góc vuông, 1 góc nhọn, 2 góc tù',
    ],
    correctOptionIndex: 0,
    explanationVi: 'Hình tứ giác ABCD có: 2 góc vuông (A = 90°, C = 90°), 1 góc nhọn (B = 60°) và 1 góc tù (D = 120°).',
    planetNameVi: 'Vành Đai Sao Mộc',
    visualSpec: {
      kind: 'count_shape',
      category: 'count_angles',
      categoryLabelVi: '🔢 Đếm Góc Trong Hình',
      badgeTitleVi: 'Đếm góc trong tứ giác ABCD',
      shapePreset: 'quad_abcd_textbook',
    },
  },
  // 6. Đếm góc trên thanh thẳng AOB có 2 cạnh
  {
    level: 2,
    questionType: 'identify_type',
    promptVi: 'Quan sát hình bên: trên đường thẳng AB lấy đỉnh O, vẽ cạnh OC vuông góc với AB (90°) và cạnh OD tạo góc nhọn 45° với OB. Hãy xác định số góc vuông và góc bẹt tại đỉnh O!',
    angleDeg: 180,
    baseRayAngleDeg: 0,
    options: [
      '2 góc vuông (AOC, BOC) và 1 góc bẹt (AOB)',
      '1 góc vuông và 2 góc bẹt',
      '3 góc vuông và 0 góc bẹt',
      '0 góc vuông và 1 góc bẹt',
    ],
    correctOptionIndex: 0,
    explanationVi: 'Vì cạnh OC vuông góc với đường thẳng AB tại O nên tạo ra 2 góc vuông (góc đỉnh O; cạnh OA, OC = 90° và góc đỉnh O; cạnh OB, OC = 90°) cùng 1 góc bẹt (góc đỉnh O; cạnh OA, OB = 180°).',
    planetNameVi: 'Vành Đai Sao Mộc',
    visualSpec: {
      kind: 'count_shape',
      category: 'count_angles',
      categoryLabelVi: '🔢 Đếm Góc Trong Hình',
      badgeTitleVi: 'Các góc tại đỉnh O trên đường thẳng AB',
      shapePreset: 'straight_beam_oab',
    },
  },
  // 7. Đồng hồ lúc 10 giờ đúng
  {
    level: 2,
    questionType: 'estimate_measure',
    promptVi: 'Vào lúc 11 giờ đúng, kim giờ và kim phút của đồng hồ chỉ tạo thành góc 60 độ, vậy vào lúc 10 giờ đúng thì góc của kim giờ và kim phút tạo với nhau góc bao nhiêu độ?',
    angleDeg: 60,
    baseRayAngleDeg: 90,
    options: ['30°', '60°', '90°', '120°'],
    correctOptionIndex: 3,
    alsoAcceptOptionIndex: 1,
    explanationVi: 'Khoảng cách từ số 12 đến số 10 gấp đôi khoảng cách từ số 12 đến số 11 (2 khoảng số so với 1 khoảng số). Theo đề bài lúc 11 giờ là 60° nên gấp đôi là 120° (trên mặt đồng hồ chuẩn thực tế mỗi khoảng là 30° nên 10 giờ là 60°).',
    planetNameVi: 'Vành Đai Sao Mộc',
    visualSpec: {
      kind: 'clock',
      category: 'clock',
      categoryLabelVi: '🕒 Góc Kim Đồng Hồ',
      badgeTitleVi: 'Đồng hồ lúc 10 giờ đúng',
      clockHour: 10,
      clockMinute: 0,
      hideAllDegreesInShape: true,
    },
  },
  // 8. Đếm góc tù, góc nhọn trong hình thang cân MNPQ (không có số đo góc)
  {
    level: 2,
    questionType: 'identify_type',
    promptVi: 'Trong hình có bao nhiêu góc tù, bao nhiêu góc nhọn?',
    angleDeg: 110,
    baseRayAngleDeg: 0,
    options: [
      '2 góc tù và 2 góc nhọn',
      '1 góc tù và 3 góc nhọn',
      '3 góc tù và 1 góc nhọn',
      '4 góc vuông',
    ],
    correctOptionIndex: 0,
    explanationVi: 'Quan sát hình tứ giác MNPQ, ta thấy có 2 góc tù (ở đỉnh N và đỉnh P) và 2 góc nhọn (ở đỉnh M và đỉnh Q).',
    planetNameVi: 'Vành Đai Sao Mộc',
    visualSpec: {
      kind: 'count_shape',
      category: 'count_angles',
      categoryLabelVi: '🔢 Đếm Góc Trong Hình',
      badgeTitleVi: 'Hình tứ giác MNPQ',
      shapePreset: 'isosceles_trapezoid_mnpq',
      hideAllDegreesInShape: true,
    },
  },
  // 9. Đếm góc trong hình chữ nhật ABCD kẻ đường chéo AC
  {
    level: 2,
    questionType: 'identify_type',
    promptVi: 'Cho hình chữ nhật ABCD có 4 góc vuông tại A, B, C, D. Khi kẻ thêm đường chéo AC nối từ đỉnh A đến đỉnh C, trong hình xuất hiện thêm mấy góc nhọn được tạo bởi đường chéo AC với các cạnh?',
    angleDeg: 45,
    baseRayAngleDeg: 0,
    options: [
      '4 góc nhọn (2 góc nhọn tại đỉnh A và 2 góc nhọn tại đỉnh C)',
      '2 góc nhọn',
      '1 góc nhọn',
      '6 góc tù',
    ],
    correctOptionIndex: 0,
    explanationVi: 'Đường chéo AC chia góc vuông đỉnh A thành 2 góc nhọn (30° và 60°) và chia góc vuông đỉnh C thành 2 góc nhọn (30° và 60°), tổng cộng tạo thêm 4 góc nhọn!',
    planetNameVi: 'Vành Đai Sao Mộc',
    visualSpec: {
      kind: 'count_shape',
      category: 'count_angles',
      categoryLabelVi: '🔢 Đếm Góc Trong Hình',
      badgeTitleVi: 'Hình chữ nhật ABCD và đường chéo AC',
      shapePreset: 'rect_diagonal_abcd',
    },
  },
  // 10. So sánh hai góc SGK (có cả hình góc đỉnh O = 50° và góc đỉnh P = 65°)
  {
    level: 2,
    questionType: 'missing_angle',
    promptVi: 'Biết góc đỉnh O; cạnh OA, OB có số đo 50° và góc đỉnh P; cạnh PM, PN có số đo 65°. Nhận xét nào sau đây đúng?',
    angleDeg: 50,
    baseRayAngleDeg: 0,
    options: [
      'Góc đỉnh O; cạnh OA, OB bé hơn góc đỉnh P; cạnh PM, PN',
      'Góc đỉnh O; cạnh OA, OB lớn hơn góc đỉnh P; cạnh PM, PN',
      'Hai góc bằng nhau',
      'Cả hai đều là góc tù',
    ],
    correctOptionIndex: 0,
    explanationVi: 'Vì 50° < 65° nên góc đỉnh O; cạnh OA, OB bé hơn góc đỉnh P; cạnh PM, PN.',
    planetNameVi: 'Vành Đai Sao Mộc',
    visualSpec: {
      kind: 'count_shape',
      category: 'standard',
      categoryLabelVi: '🧭 So Sánh Hai Góc',
      badgeTitleVi: 'Góc đỉnh O (50°) và Góc đỉnh P (65°)',
      shapePreset: 'compare_two_angles_op',
    },
  },
  // 11. Đơn vị đo góc
  {
    level: 2,
    questionType: 'estimate_measure',
    promptVi: 'Đơn vị để đo góc là gì?',
    angleDeg: 60,
    baseRayAngleDeg: 0,
    options: ['Độ (°)', 'Xăng-ti-mét (cm)', 'Ki-lô-gam (kg)', 'Lít (l)'],
    correctOptionIndex: 0,
    explanationVi: 'Đơn vị đo góc là Độ, ký hiệu là dấu tròn nhỏ ở góc trên bên phải (°).',
    planetNameVi: 'Vành Đai Sao Mộc',
    visualSpec: {
      kind: 'standard',
      category: 'standard',
      categoryLabelVi: '🧭 Kiến Thức Đo Góc',
      badgeTitleVi: 'Góc đỉnh O; cạnh OA, OB (60°)',
      showDegreeAlways: true,
    },
  },
  // 12. Hai góc ghép lại tạo thành góc bẹt (hình minh họa 2 góc kề bù 110° và ?° tạo góc bẹt 180°)
  {
    level: 2,
    questionType: 'missing_angle',
    promptVi: 'Hai góc ghép lại tạo thành một góc bẹt (180°). Biết góc thứ nhất là 110°, góc thứ hai là bao nhiêu?',
    angleDeg: 70,
    baseRayAngleDeg: 0,
    options: ['60°', '70°', '80°', '90°'],
    correctOptionIndex: 1,
    explanationVi: 'Ta lấy số đo góc bẹt trừ đi góc đã biết: 180° - 110° = 70°.',
    planetNameVi: 'Vành Đai Sao Mộc',
    visualSpec: {
      kind: 'count_shape',
      category: 'polygon',
      categoryLabelVi: '📐 Hai Góc Tạo Thành Góc Bẹt',
      badgeTitleVi: 'Hai góc ghép thành góc bẹt 180°',
      shapePreset: 'adjacent_supplementary_110_70',
      hideTargetDegreeInShape: true,
    },
  },
  // 13. Phân biệt vòng số trong và ngoài (có hình cây thước đo độ đặt vào hình ảnh)
  {
    level: 2,
    questionType: 'estimate_measure',
    promptVi: 'Khi đo góc đỉnh O; cạnh OA, OB, cạnh OB trùng với vạch 0° của dãy số trong, cạnh OA đi qua vạch 60° (dãy trong) và 120° (dãy ngoài). Góc đó bằng bao nhiêu độ?',
    angleDeg: 60,
    baseRayAngleDeg: 0,
    options: ['60°', '120°', '180°', '30°'],
    correctOptionIndex: 0,
    explanationVi: 'Vì cạnh OB đặt ở vạch 0° dãy trong, ta phải đọc theo dãy số bắt đầu từ 0° đó, nên kết quả là 60°.',
    planetNameVi: 'Vành Đai Sao Mộc',
    visualSpec: {
      kind: 'standard',
      category: 'standard',
      categoryLabelVi: '🧭 Đọc Thước Đo Độ 180°',
      badgeTitleVi: 'Đặt thước đo độ tại đỉnh O',
      showProtractorOnStandard: true,
    },
  },
  // 14. Bài tập điền vào chỗ trống: Góc ... đỉnh ... cạnh ... và ... (có số đo độ 150° trên hình vẽ)
  {
    level: 2,
    questionType: 'identify_type',
    promptVi: 'Điền vào chỗ trống: Góc …. đỉnh …. cạnh … và …..',
    angleDeg: 150,
    baseRayAngleDeg: 0,
    options: [
      'Góc tù đỉnh O; cạnh OA và OB',
      'Góc nhọn đỉnh O; cạnh OA và OB',
      'Góc vuông đỉnh A; cạnh AO và AB',
      'Góc bẹt đỉnh B; cạnh BO và BA',
    ],
    correctOptionIndex: 0,
    fillBlanksSpec: {
      angleTypeAnswer: 'tù',
      vertexAnswer: 'O',
      side1Answer: 'OA',
      side2Answer: 'OB',
    },
    explanationVi: 'Góc trên hình vẽ có số đo 150° (lớn hơn 90°), đỉnh O và hai cạnh OA, OB nên ta điền: Góc tù đỉnh O, cạnh OA và OB.',
    planetNameVi: 'Vành Đai Sao Mộc',
    visualSpec: {
      kind: 'standard',
      category: 'standard',
      categoryLabelVi: '🧭 Điền Khuyết Đọc Tên Góc',
      badgeTitleVi: 'Quan sát góc 150° và điền vào chỗ trống',
      showDegreeAlways: true,
    },
  },
  // 15. Thứ tự tăng dần (bỏ hình minh họa)
  {
    level: 2,
    questionType: 'estimate_measure',
    promptVi: 'Sắp xếp các loại góc theo thứ tự số đo TĂNG DẦN (từ bé đến lớn):',
    angleDeg: 90,
    baseRayAngleDeg: 0,
    options: [
      'Góc nhọn → Góc vuông → Góc tù → Góc bẹt',
      'Góc vuông → Góc nhọn → Góc tù → Góc bẹt',
      'Góc nhọn → Góc tù → Góc vuông → Góc bẹt',
      'Góc bẹt → Góc tù → Góc vuông → Góc nhọn',
    ],
    correctOptionIndex: 0,
    explanationVi: 'Thứ tự tăng dần đúng là: Góc nhọn (<90°) → Góc vuông (90°) → Góc tù (90°..180°) → Góc bẹt (180°).',
    planetNameVi: 'Vành Đai Sao Mộc',
    visualSpec: {
      kind: 'standard',
      category: 'standard',
      categoryLabelVi: '🧭 So Sánh 4 Loại Góc Cơ Bản',
      badgeTitleVi: 'So sánh 4 loại góc cơ bản',
      hideDiagram: true,
    },
  },
];

interface Level3Seed {
  deg: number;
  baseRay: number;
  promptVi: string;
  explanationVi: string;
  visualSpec: ChallengeVisualSpec;
}

const LEVEL3_SEEDS: Level3Seed[] = [
  // 1. Đo góc kim đồng hồ lúc 2 giờ (60°)
  {
    deg: 60,
    baseRay: 30,
    promptVi:
      'Câu 1 (Đồng hồ 2 giờ): Hãy kéo tâm thước trùng tâm đồng hồ O, xoay vạch 0° trùng kim giờ (số 2) để đo góc giữa kim giờ và kim phút!',
    explanationVi:
      'Lúc 2 giờ đúng, khi đặt tâm thước trùng tâm đồng hồ O và vạch 0° trùng kim giờ (số 2), kim phút (số 12) đi qua vạch 60°. Vậy góc giữa hai kim là 60° (Góc nhọn).',
    visualSpec: {
      kind: 'clock',
      category: 'clock',
      categoryLabelVi: '🕒 Đo Góc Kim Đồng Hồ',
      badgeTitleVi: 'Đồng hồ lúc 2 giờ · Đo góc giữa 2 kim',
      clockHour: 2,
      clockMinute: 0,
      targetVertexLabel: 'Tâm O',
      side1Label: 'Kim giờ (Số 2)',
      side2Label: 'Kim phút (Số 12)',
    },
  },
  // 2. Đo góc đỉnh A của hình tam giác đều ABC (60°)
  {
    deg: 60,
    baseRay: 0,
    promptVi:
      'Câu 2 (Hình tam giác ABC): Hãy dùng thước đo góc 180° đặt vào đỉnh A để đo số đo góc đỉnh A; cạnh AB, AC của hình tam giác ABC!',
    explanationVi:
      'Đặt tâm thước tại đỉnh A và vạch 0° trùng cạnh AC, cạnh AB đi qua vạch 60°. Vậy góc đỉnh A; cạnh AB, AC của tam giác ABC bằng 60°.',
    visualSpec: {
      kind: 'polygon_measure',
      category: 'polygon',
      categoryLabelVi: '📐 Đo Góc Hình Tam Giác',
      badgeTitleVi: 'Hình tam giác ABC · Đo góc đỉnh A',
      polygonType: 'triangle',
      targetVertexLabel: 'Đỉnh A',
      side1Label: 'C (Cạnh AC)',
      side2Label: 'B (Cạnh AB)',
      otherVerticesLabels: { v1AngleText: '60°', v2AngleText: '60°' },
    },
  },
  // 3. Đo góc đỉnh D của hình tứ giác ABCD (120°)
  {
    deg: 120,
    baseRay: 0,
    promptVi:
      'Câu 3 (Hình tứ giác ABCD): Hãy kéo thước đo góc 180° đến đỉnh D để đo góc tù đỉnh D; cạnh DC, DA của hình tứ giác ABCD!',
    explanationVi:
      'Đặt tâm thước tại đỉnh D và vạch 0° trùng cạnh DC, cạnh DA đi qua vạch 120°. Vậy góc đỉnh D; cạnh DC, DA của hình tứ giác ABCD bằng 120° (Góc tù).',
    visualSpec: {
      kind: 'polygon_measure',
      category: 'polygon',
      categoryLabelVi: '📐 Đo Góc Hình Tứ Giác',
      badgeTitleVi: 'Hình tứ giác ABCD · Đo góc đỉnh D',
      polygonType: 'quadrilateral',
      targetVertexLabel: 'Đỉnh D',
      side1Label: 'C (Cạnh DC)',
      side2Label: 'A (Cạnh DA)',
      fourthVertexOffset: { dx: 115, dy: -195, label: 'B', angleText: '90°' },
      otherVerticesLabels: { v1AngleText: '60°', v2AngleText: '90°' },
    },
  },
  // 4. Đo góc kim đồng hồ lúc 3 giờ (90°)
  {
    deg: 90,
    baseRay: 0,
    promptVi:
      'Câu 4 (Đồng hồ 3 giờ): Hãy đặt thước đo góc vào tâm O của đồng hồ lúc 3 giờ đúng và đo số đo góc tạo bởi kim giờ và kim phút!',
    explanationVi:
      'Lúc 3 giờ đúng, kim giờ (số 3) và kim phút (số 12) tạo thành Góc vuông có số đo chính xác là 90°.',
    visualSpec: {
      kind: 'clock',
      category: 'clock',
      categoryLabelVi: '🕒 Đo Góc Kim Đồng Hồ',
      badgeTitleVi: 'Đồng hồ lúc 3 giờ · Đo góc giữa 2 kim',
      clockHour: 3,
      clockMinute: 0,
      targetVertexLabel: 'Tâm O',
      side1Label: 'Kim giờ (Số 3)',
      side2Label: 'Kim phút (Số 12)',
    },
  },
  // 5. Đo góc nhọn đỉnh B của hình tam giác cân ABC (45°)
  {
    deg: 45,
    baseRay: 0,
    promptVi:
      'Câu 5 (Hình tam giác vuông cân ABC): Hãy dùng thước đo góc 180° đo góc nhọn đỉnh B; cạnh BC, BA của hình tam giác ABC!',
    explanationVi:
      'Khi đặt tâm thước trùng đỉnh B và vạch 0° trùng cạnh BC, cạnh BA đi qua vạch 45°. Vậy góc đỉnh B; cạnh BC, BA bằng 45°.',
    visualSpec: {
      kind: 'polygon_measure',
      category: 'polygon',
      categoryLabelVi: '📐 Đo Góc Hình Tam Giác',
      badgeTitleVi: 'Hình tam giác ABC · Đo góc đỉnh B',
      polygonType: 'triangle',
      targetVertexLabel: 'Đỉnh B',
      side1Label: 'C (Cạnh BC)',
      side2Label: 'A (Cạnh BA)',
      otherVerticesLabels: { v1AngleText: '45°', v2AngleText: '90°' },
    },
  },
  // 6. Đo góc kim đồng hồ lúc 4 giờ (120°)
  {
    deg: 120,
    baseRay: -30,
    promptVi:
      'Câu 6 (Đồng hồ 4 giờ): Hãy kéo tâm thước vào tâm đồng hồ O và xoay thước để đo góc tạo bởi kim giờ (số 4) và kim phút (số 12)!',
    explanationVi:
      'Khi xoay vạch 0° của thước trùng với kim giờ tại số 4 (-30°), kim phút tại số 12 đi qua đúng vạch 120°. Vậy góc giữa hai kim lúc 4 giờ là 120°.',
    visualSpec: {
      kind: 'clock',
      category: 'clock',
      categoryLabelVi: '🕒 Đo Góc Kim Đồng Hồ',
      badgeTitleVi: 'Đồng hồ lúc 4 giờ · Đo góc giữa 2 kim',
      clockHour: 4,
      clockMinute: 0,
      targetVertexLabel: 'Tâm O',
      side1Label: 'Kim giờ (Số 4)',
      side2Label: 'Kim phút (Số 12)',
    },
  },
  // 7. Đo góc đỉnh M của hình thang cân MNPQ (75°)
  {
    deg: 75,
    baseRay: 0,
    promptVi:
      'Câu 7 (Hình tứ giác MNPQ): Hãy đặt thước đo góc vào đỉnh M để đo góc nhọn đỉnh M; cạnh MQ, MN của hình thang cân MNPQ!',
    explanationVi:
      'Đặt tâm thước tại đỉnh M và vạch 0° trùng cạnh đáy MQ, cạnh bên MN đi qua vạch 75°. Vậy góc đỉnh M; cạnh MQ, MN bằng 75°.',
    visualSpec: {
      kind: 'polygon_measure',
      category: 'polygon',
      categoryLabelVi: '📐 Đo Góc Hình Tứ Giác',
      badgeTitleVi: 'Hình tứ giác MNPQ · Đo góc đỉnh M',
      polygonType: 'quadrilateral',
      targetVertexLabel: 'Đỉnh M',
      side1Label: 'Q (Cạnh MQ)',
      side2Label: 'N (Cạnh MN)',
      fourthVertexOffset: { dx: 185, dy: -212, label: 'P', angleText: '105°' },
      otherVerticesLabels: { v1AngleText: '75°', v2AngleText: '105°' },
    },
  },
  // 8. Đo góc kim đồng hồ lúc 1 giờ (30°)
  {
    deg: 30,
    baseRay: 60,
    promptVi:
      'Câu 8 (Đồng hồ 1 giờ): Hãy dùng thước đo góc 180° (hoặc nút Đặt tâm O và Khớp vạch 0°) để đo góc nhọn giữa kim giờ và kim phút lúc 1 giờ đúng!',
    explanationVi:
      'Lúc 1 giờ đúng, góc tạo bởi kim giờ (số 1) và kim phút (số 12) có số đo bằng 30°.',
    visualSpec: {
      kind: 'clock',
      category: 'clock',
      categoryLabelVi: '🕒 Đo Góc Kim Đồng Hồ',
      badgeTitleVi: 'Đồng hồ lúc 1 giờ · Đo góc giữa 2 kim',
      clockHour: 1,
      clockMinute: 0,
      targetVertexLabel: 'Tâm O',
      side1Label: 'Kim giờ (Số 1)',
      side2Label: 'Kim phút (Số 12)',
    },
  },
  // 9. Đo góc tù đỉnh M của hình tam giác MNP (105°)
  {
    deg: 105,
    baseRay: 0,
    promptVi:
      'Câu 9 (Hình tam giác MNP): Hãy đo số đo của góc tù đỉnh M; cạnh MP, MN trong hình tam giác MNP!',
    explanationVi:
      'Đặt tâm thước tại đỉnh M và vạch 0° trùng cạnh MP, cạnh MN chỉ vào vạch 105°. Vậy góc đỉnh M; cạnh MP, MN bằng 105° (Góc tù).',
    visualSpec: {
      kind: 'polygon_measure',
      category: 'polygon',
      categoryLabelVi: '📐 Đo Góc Hình Tam Giác',
      badgeTitleVi: 'Hình tam giác MNP · Đo góc đỉnh M',
      polygonType: 'triangle',
      targetVertexLabel: 'Đỉnh M',
      side1Label: 'P (Cạnh MP)',
      side2Label: 'N (Cạnh MN)',
      otherVerticesLabels: { v1AngleText: '35°', v2AngleText: '40°' },
    },
  },
  // 10. Đo góc tù đỉnh P của hình bình hành PQRS (135°)
  {
    deg: 135,
    baseRay: 0,
    promptVi:
      'Câu 10 (Hình bình hành PQRS): Hãy đặt thước đo góc vào đỉnh P để đo góc tù đỉnh P; cạnh PS, PQ của hình bình hành PQRS!',
    explanationVi:
      'Khi đặt tâm thước tại đỉnh P và vạch 0° trùng cạnh PS, cạnh PQ đi qua vạch 135°. Vậy góc đỉnh P; cạnh PS, PQ bằng 135°.',
    visualSpec: {
      kind: 'polygon_measure',
      category: 'polygon',
      categoryLabelVi: '📐 Đo Góc Hình Tứ Giác',
      badgeTitleVi: 'Hình bình hành PQRS · Đo góc đỉnh P',
      polygonType: 'quadrilateral',
      targetVertexLabel: 'Đỉnh P',
      side1Label: 'S (Cạnh PS)',
      side2Label: 'Q (Cạnh PQ)',
      fourthVertexOffset: { dx: 95, dy: -155, label: 'R', angleText: '135°' },
      otherVerticesLabels: { v1AngleText: '45°', v2AngleText: '45°' },
    },
  },
  // 11. Đo góc kim đồng hồ lúc 5 giờ (150°)
  {
    deg: 150,
    baseRay: -60,
    promptVi:
      'Câu 11 (Đồng hồ 5 giờ): Hãy xoay thước đo góc để đo góc tù tạo bởi kim giờ (số 5) và kim phút (số 12) lúc 5 giờ đúng!',
    explanationVi:
      'Lúc 5 giờ đúng, kim giờ và kim phút cách nhau 5 khoảng số trên đồng hồ, tạo thành góc tù 150°.',
    visualSpec: {
      kind: 'clock',
      category: 'clock',
      categoryLabelVi: '🕒 Đo Góc Kim Đồng Hồ',
      badgeTitleVi: 'Đồng hồ lúc 5 giờ · Đo góc giữa 2 kim',
      clockHour: 5,
      clockMinute: 0,
      targetVertexLabel: 'Tâm O',
      side1Label: 'Kim giờ (Số 5)',
      side2Label: 'Kim phút (Số 12)',
    },
  },
  // 12. Đo góc vuông đỉnh A của hình tứ giác ABCD (90°)
  {
    deg: 90,
    baseRay: 0,
    promptVi:
      'Câu 12 (Hình tứ giác ABCD): Hãy đo góc đỉnh A; cạnh AD, AB của hình tứ giác ABCD bên dưới!',
    explanationVi:
      'Đặt tâm thước tại đỉnh A và vạch 0° trùng cạnh AD, cạnh AB đi thẳng lên vạch 90°. Vậy góc đỉnh A; cạnh AD, AB là góc vuông 90°.',
    visualSpec: {
      kind: 'polygon_measure',
      category: 'polygon',
      categoryLabelVi: '📐 Đo Góc Hình Tứ Giác',
      badgeTitleVi: 'Hình tứ giác ABCD · Đo góc đỉnh A',
      polygonType: 'quadrilateral',
      targetVertexLabel: 'Đỉnh A',
      side1Label: 'D (Cạnh AD)',
      side2Label: 'B (Cạnh AB)',
      fourthVertexOffset: { dx: 220, dy: -155, label: 'C', angleText: '90°' },
      otherVerticesLabels: { v1AngleText: '120°', v2AngleText: '60°' },
    },
  },
  // 13. Đo góc cơ bản nghiêng 15° (75°)
  {
    deg: 75,
    baseRay: 15,
    promptVi:
      'Câu 13 (Góc hai tia nghiêng): Cạnh OB đang nghiêng 15°. Hãy đặt tâm thước trùng đỉnh O, xoay vạch 0° trùng cạnh OB và đo góc đỉnh O; cạnh OA, OB!',
    explanationVi:
      'Khi xoay thước 15° để vạch 0° trùng khít với cạnh OB, cạnh OA đi qua vạch 75°. Vậy góc đỉnh O; cạnh OA, OB bằng 75°.',
    visualSpec: {
      kind: 'standard',
      category: 'standard',
      categoryLabelVi: '🧭 Đo Góc Hai Tia',
      badgeTitleVi: 'Góc đỉnh O; cạnh OA, OB',
    },
  },
  // 14. Đo góc kim đồng hồ lúc 6 giờ (180°)
  {
    deg: 180,
    baseRay: 0,
    promptVi:
      'Câu 14 (Góc bẹt 180°): Hai tia OA và OB tạo thành một đường thẳng đi qua đỉnh O. Hãy đặt thước kiểm tra và nhập số đo của góc bẹt này!',
    explanationVi:
      'Khi hai cạnh OA và OB thẳng hàng ngược chiều nhau, chúng trùng khít với đường chuẩn 0° - 180° của thước đo góc. Số đo là 180°.',
    visualSpec: {
      kind: 'standard',
      category: 'standard',
      categoryLabelVi: '🧭 Đo Góc Hai Tia',
      badgeTitleVi: 'Góc bẹt đỉnh O; cạnh OA, OB',
    },
  },
  // 15. Đo góc tù nghiêng (120°)
  {
    deg: 120,
    baseRay: 10,
    promptVi:
      'Câu 15 (Thử thách cuối): Hãy căn chỉnh tâm thước và xoay vạch 0° trùng cạnh OB (nghiêng 10°) để đo chính xác số đo góc đỉnh O; cạnh OA, OB!',
    explanationVi: `Khi đặt tâm thước tại đỉnh O và xoay vạch 0° trùng cạnh OB, cạnh OA đi qua vạch 120° (${classifyAngle(120).nameVi}).`,
    visualSpec: {
      kind: 'standard',
      category: 'standard',
      categoryLabelVi: '🧭 Đo Góc Hai Tia',
      badgeTitleVi: 'Góc đỉnh O; cạnh OA, OB',
    },
  },
];

/**
 * Generate a 15-question set for the requested challenge level, optionally filtered by exercise category
 */
export function generateChallengeQuestions(
  level: ChallengeLevel,
  categoryFilter: ChallengeExerciseCategory = 'all'
): ChallengeQuestion[] {
  let fullList: ChallengeQuestion[];

  if (level === 1) {
    fullList = LEVEL1_BANK.map((q, idx) => ({
      ...q,
      id: `l1_q_${idx + 1}`,
    }));
  } else if (level === 2) {
    fullList = LEVEL2_BANK.map((q, idx) => ({
      ...q,
      id: `l2_q_${idx + 1}`,
    }));
  } else {
    fullList = LEVEL3_SEEDS.map((seed, idx) => ({
      id: `l3_q_${idx + 1}`,
      level: 3,
      questionType: 'measure_with_protractor',
      promptVi: seed.promptVi,
      angleDeg: seed.deg,
      baseRayAngleDeg: seed.baseRay,
      targetMeasureDeg: seed.deg,
      explanationVi: seed.explanationVi,
      planetNameVi: 'Tinh Vân Thước Đo 180°',
      visualSpec: seed.visualSpec,
    }));
  }

  if (categoryFilter === 'all') {
    return fullList;
  }

  const filtered = fullList.filter((q) => q.visualSpec.category === categoryFilter);
  return filtered.length > 0 ? filtered : fullList;
}
