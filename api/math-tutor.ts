import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  buildGrade4MathSystemInstruction,
  validateTutorRequest,
} from '../src/utils/mathTutorPrompt.js';

const GEMINI_MODEL = 'gemini-4-hydrogen';

function classifyGeminiError(err: unknown): { status: number; messageVi: string } {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  const lower = raw.toLowerCase();

  if (lower.includes('api_key_invalid') || lower.includes('permission_denied') || lower.includes('403') || lower.includes('401')) {
    return { status: 403, messageVi: 'Khóa API Gemini chưa hợp lệ hoặc thiếu quyền truy cập. Thầy/cô vui lòng kiểm tra lại GEMINI_API_KEY trên Vercel nhé!' };
  }
  if (lower.includes('resource_exhausted') || lower.includes('429') || lower.includes('quota')) {
    return { status: 429, messageVi: 'Trợ lí AI đang tạm thời hết lượt gọi. Em hãy đợi một lát rồi hỏi lại nhé!' };
  }
  if (lower.includes('not_found') || lower.includes('404')) {
    return { status: 404, messageVi: 'Không tìm thấy mô hình AI yêu cầu. Vui lòng thử lại sau ít phút.' };
  }
  return { status: 502, messageVi: 'Trợ lí AI tạm thời chưa kết nối được tới máy chủ Gemini. Em hãy thử gửi lại câu hỏi sau giây lát nhé!' };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const validated = validateTutorRequest(req.body);
  if (!validated.ok) {
    res.status(400).json({ error: validated.errorVi });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    res.status(503).json({ error: 'Chưa thiết lập khóa GEMINI_API_KEY cho Trợ lí AI.' });
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const { messages, activeTopic } = validated.data;
  const contents = messages.map((m: any) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.text }],
  }));
  const systemInstruction = buildGrade4MathSystemInstruction(activeTopic);

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });
      const replyText = (response.text ?? '').trim();
      if (!replyText) throw new Error('Empty response from Gemini model');
      res.status(200).json({ reply: replyText });
      return;
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (['api_key', 'permission', '400', '401', '403', '404'].some((k) => msg.includes(k))) break;
      if (attempt === 0) await new Promise((r) => setTimeout(r, 450));
    }
  }

  const mapped = classifyGeminiError(lastError);
  res.status(mapped.status).json({ error: mapped.messageVi });
}
