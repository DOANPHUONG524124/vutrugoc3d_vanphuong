export type TutorTopicId = 'angles' | 'perpendicular' | 'parallel' | 'shapes';

export interface TutorChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface ValidatedTutorPayload {
  messages: TutorChatMessage[];
  activeTopic: TutorTopicId;
}

const VALID_TOPICS: ReadonlySet<string> = new Set([
  'angles',
  'perpendicular',
  'parallel',
  'shapes',
]);

const MAX_HISTORY_MESSAGES = 14;
const MAX_MESSAGE_CHARS = 1200;

export function normalizeTutorTopic(topic?: unknown): TutorTopicId {
  if (typeof topic === 'string' && VALID_TOPICS.has(topic)) {
    return topic as TutorTopicId;
  }
  return 'angles';
}

export function validateTutorRequest(body: unknown): {
  ok: true;
  data: ValidatedTutorPayload;
} | {
  ok: false;
  errorVi: string;
} {
  if (!body || typeof body !== 'object') {
    return { ok: false, errorVi: 'Dữ liệu câu hỏi không hợp lệ.' };
  }

  const record = body as Record<string, unknown>;
  const rawMessages = record.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return { ok: false, errorVi: 'Em hãy nhập câu hỏi Toán lớp 4 trước khi gửi nhé!' };
  }

  const sanitized: TutorChatMessage[] = [];
  for (const item of rawMessages.slice(-MAX_HISTORY_MESSAGES)) {
    if (!item || typeof item !== 'object') continue;
    const msg = item as Record<string, unknown>;
    const role = msg.role === 'assistant' ? 'assistant' : msg.role === 'user' ? 'user' : null;
    if (!role || typeof msg.text !== 'string') continue;
    const trimmed = msg.text.trim();
    if (!trimmed) continue;
    sanitized.push({
      role,
      text: trimmed.slice(0, MAX_MESSAGE_CHARS),
    });
  }

  if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== 'user') {
    return { ok: false, errorVi: 'Em hãy nhập nội dung câu hỏi để Trợ lí AI hỗ trợ nhé!' };
  }

  return {
    ok: true,
    data: {
      messages: sanitized,
      activeTopic: normalizeTutorTopic(record.activeTopic),
    },
  };
}

export function getTopicContextLabelVi(topic: TutorTopicId): string {
  switch (topic) {
    case 'angles':
      return 'Chủ đề 1: Góc và Đo Góc (góc nhọn, góc vuông, góc tù, góc bẹt, thước đo góc 180°)';
    case 'perpendicular':
      return 'Chủ đề 2: Hai Đường Thẳng Vuông Góc (4 góc vuông 90°, đọc tên cạnh vuông góc, vẽ bằng thước Ê Ke)';
    case 'parallel':
      return 'Chủ đề 3: Hai Đường Thẳng Song Song (không bao giờ cắt nhau, 1 cạnh song song với nhiều cạnh, vẽ 2 bước bằng Ê Ke)';
    case 'shapes':
      return 'Chủ đề 4: Hình Thoi, Hình Bình Hành (đặc điểm hai hình và công thức tính Chu vi Lớp 4)';
  }
}

export function buildGrade4MathSystemInstruction(activeTopic: TutorTopicId): string {
  const topicLabel = getTopicContextLabelVi(activeTopic);
  return [
    'Bạn là "Trợ lí AI Toán Lớp 4" (Robot Toán Học thân thiện) đồng hành cùng học sinh lớp 4 (9–10 tuổi) trong ứng dụng Vũ Trụ Hình Học Lớp 4.',
    `Học sinh hiện đang ở mục: ${topicLabel}.`,
    '',
    'QUY TẮC SƯ PHẠM BẮT BUỘC CHO TOÁN TIỂU HỌC LỚP 4 VIỆT NAM:',
    '1. Trả lời bằng tiếng Việt trong sáng, ấm áp, khích lệ, xưng "mình" hoặc "cô/thầy Robot" và gọi học sinh là "em".',
    '2. Hỗ trợ toàn diện môn Toán lớp 4 (hình học: góc, đo góc, hai đường thẳng vuông góc, hai đường thẳng song song, hình bình hành, hình thoi, chu vi; và số học, phân số, giải toán có lời văn lớp 4).',
    '3. TUYỆT ĐỐI KHÔNG dùng kí hiệu "//" hay kí hiệu "⊥" vì học sinh tiểu học chưa học hai kí hiệu này. Luôn viết rõ thành lời: "song song với" và "vuông góc với".',
    '4. Về Hình bình hành và Hình thoi ở chương trình Lớp 4: chỉ hướng dẫn nhận biết đặc điểm các cạnh và tính CHU VI (Chu vi hình bình hành P = (a + b) × 2; Chu vi hình thoi P = a × 4). KHÔNG dạy hay tự ý đưa công thức diện tích hình bình hành hoặc diện tích hình thoi.',
    '5. Khi học sinh hỏi bài tập: hướng dẫn từng bước ngắn gọn, dễ hiểu (dùng gạch đầu dòng hoặc Bước 1, Bước 2), giúp học sinh hiểu bản chất thay vì viết dài dòng khó đọc.',
    '6. Giữ câu trả lời gọn gàng (khoảng 3–7 câu hoặc các bước súc tích), không dùng LaTeX phức tạp như \\frac hay $...$ — dùng kí hiệu toán tiểu học quen thuộc (+, -, ×, :, °, =).',
    '7. Nếu câu hỏi ngoài phạm vi học tập, nhẹ nhàng nhắc học sinh quay lại khám phá Toán lớp 4 nhé!',
  ].join('\n');
}

export function getTopicStarterPrompts(topic: TutorTopicId): string[] {
  switch (topic) {
    case 'angles':
      return [
        'Cách phân biệt góc nhọn, góc vuông, góc tù và góc bẹt?',
        'Làm sao đặt thước đo góc 180° cho thật chính xác?',
        'Kim đồng hồ lúc 3 giờ và 4 giờ tạo thành góc gì?',
        'Giúp em giải một bài toán có lời văn lớp 4 nhé!',
      ];
    case 'perpendicular':
      return [
        'Hai đường thẳng vuông góc tạo ra mấy góc vuông?',
        'Cách dùng thước Ê Ke để vẽ đường thẳng vuông góc?',
        'Cách đọc tên đúng hai cạnh vuông góc trong hình chữ nhật?',
        'Cho em 1 ví dụ vui về góc vuông trong đời sống!',
      ];
    case 'parallel':
      return [
        'Thế nào là hai đường thẳng song song?',
        'Hướng dẫn em 2 bước vẽ hai đường thẳng song song bằng Ê Ke!',
        'Trong hình bình hành có mấy cặp cạnh song song với nhau?',
        'Phân biệt hai đường thẳng song song và vuông góc với nhau?',
      ];
    case 'shapes':
      return [
        'Hình bình hành và hình thoi giống và khác nhau ở điểm nào?',
        'Công thức tính chu vi hình bình hành và hình thoi lớp 4?',
        'Tính chu vi hình thoi có cạnh dài 7 cm giúp em!',
        'Khi xoay hình thoi nghiêng đi thì có còn là hình thoi không?',
      ];
  }
}
