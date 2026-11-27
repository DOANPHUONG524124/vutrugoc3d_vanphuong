import 'dotenv/config';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  buildGrade4MathSystemInstruction,
  validateTutorRequest,
} from './src/utils/mathTutorPrompt.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_MODEL = 'gemini-4-hydrogen';

function createGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function classifyGeminiError(err: unknown): { status: number; messageVi: string } {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  const lower = raw.toLowerCase();

  if (lower.includes('api_key_invalid') || lower.includes('permission_denied') || lower.includes('403') || lower.includes('401')) {
    return {
      status: 403,
      messageVi:
        'Khóa API Gemini chưa hợp lệ hoặc thiếu quyền truy cập. Thầy/cô vui lòng kiểm tra lại GEMINI_API_KEY trong mục Settings > Secrets nhé!',
    };
  }
  if (lower.includes('resource_exhausted') || lower.includes('429') || lower.includes('quota')) {
    return {
      status: 429,
      messageVi:
        'Trợ lí AI đang tạm thời hết lượt gọi miễn phí. Em hãy đợi một lát rồi hỏi lại, hoặc kiểm tra hạn mức khóa API trong Settings > Secrets nhé!',
    };
  }
  if (lower.includes('not_found') || lower.includes('404')) {
    return {
      status: 404,
      messageVi: 'Không tìm thấy mô hình AI yêu cầu. Vui lòng thử lại sau ít phút.',
    };
  }
  return {
    status: 502,
    messageVi:
      'Trợ lí AI tạm thời chưa kết nối được tới máy chủ Gemini. Em hãy thử gửi lại câu hỏi sau giây lát nhé!',
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', aiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()) });
  });

  app.post('/api/math-tutor', async (req, res) => {
    const validated = validateTutorRequest(req.body);
    if (!validated.ok) {
      res.status(400).json({ error: validated.errorVi });
      return;
    }

    const ai = createGeminiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'Chưa thiết lập khóa GEMINI_API_KEY cho Trợ lí AI. Vui lòng cấu hình khóa API trong mục Settings > Secrets rồi thử lại nhé!',
      });
      return;
    }

    const { messages, activeTopic } = validated.data;
    const contents = messages.map((m) => ({
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
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
          },
        });
        const replyText = (response.text ?? '').trim();
        if (!replyText) {
          throw new Error('Empty response from Gemini model');
        }
        res.json({ reply: replyText });
        return;
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message.toLowerCase() : '';
        // Do not retry auth/invalid-key/400 errors
        if (
          msg.includes('api_key') ||
          msg.includes('permission') ||
          msg.includes('400') ||
          msg.includes('401') ||
          msg.includes('403') ||
          msg.includes('404')
        ) {
          break;
        }
        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 450));
        }
      }
    }

    const mapped = classifyGeminiError(lastError);
    res.status(mapped.status).json({ error: mapped.messageVi });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
