import React, { useEffect, useRef, useState } from 'react';
import {
  getTopicStarterPrompts,
  TutorChatMessage,
  TutorTopicId,
} from '../utils/mathTutorPrompt';
import { soundFX } from '../utils/soundEffects';

interface MathTutorWidgetProps {
  activeTopic: TutorTopicId;
}

const WELCOME_MESSAGE: TutorChatMessage = {
  role: 'assistant',
  text: 'Xin chào Nhà Toán Học Nhí! Mình là Trợ lí AI Toán Lớp 4. Em muốn hỏi về đo góc, hai đường thẳng vuông góc, song song, hình bình hành, hình thoi hay bài toán lớp 4 nào? Cứ gõ câu hỏi hoặc bấm gợi ý bên dưới nhé!',
};

export const MathTutorWidget: React.FC<MathTutorWidgetProps> = ({ activeTopic }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<TutorChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const starterPrompts = getTopicStarterPrompts(activeTopic);

  useEffect(() => {
    if (isOpen) {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen, messages.length, isLoading]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const sendMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isLoading) return;

    soundFX.playClick(1.12);
    setErrorMsg(null);
    const nextMessages: TutorChatMessage[] = [...messages, { role: 'user', text: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Send only real conversation turns (skip static welcome greeting)
      const apiMessages = nextMessages.filter((_, idx) => idx > 0);
      const res = await fetch('/api/math-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          activeTopic,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
      };

      if (!res.ok || !data.reply) {
        setErrorMsg(
          data.error ||
            'Trợ lí AI chưa thể trả lời lúc này. Em hãy thử lại sau ít giây nhé!'
        );
        return;
      }

      soundFX.playSuccess();
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply! }]);
    } catch {
      setErrorMsg(
        'Không thể kết nối tới máy chủ Trợ lí AI. Em hãy kiểm tra kết nối và thử lại nhé!'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleResetChat = () => {
    soundFX.playClick();
    setMessages([WELCOME_MESSAGE]);
    setErrorMsg(null);
    setInput('');
  };

  return (
    <>
      {/* Floating Bottom-Right Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          data-testid="btn-open-ai-tutor"
          onClick={() => {
            soundFX.playClick(1.15);
            setIsOpen(true);
          }}
          className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-fuchsia-500 text-white font-extrabold text-xs sm:text-sm border-2 border-cyan-300/80 shadow-[0_0_24px_rgba(56,189,248,0.45)] cursor-pointer transition-all hover:scale-[1.03]"
          aria-label="Mở Trợ lí AI Hỗ Trợ Toán Lớp 4"
        >
          <span className="w-8 h-8 rounded-full bg-indigo-950/90 border border-yellow-300 overflow-hidden flex items-center justify-center shrink-0">
            <img
              src="/assets/aistudio/Th_m_ti_u____9352a9ad.png"
              alt="Trợ lí AI Toán Lớp 4"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover scale-[1.35]"
            />
          </span>
          <span className="text-left leading-tight">
            <span className="block text-[10px] font-bold text-cyan-100 uppercase tracking-wider">
              Hỏi đáp thông minh
            </span>
            <span>Trợ lí AI Toán 4</span>
          </span>
        </button>
      )}

      {/* Interactive Grade 4 Math AI Chat Drawer */}
      {isOpen && (
        <aside
          data-testid="ai-tutor-panel"
          aria-label="Trợ lí AI Hỗ Trợ Toán Lớp 4"
          className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 w-[calc(100vw-2rem)] sm:w-[410px] max-h-[min(620px,calc(100vh-5.5rem))] flex flex-col rounded-3xl bg-[#0D082B]/98 border-2 border-cyan-400/75 shadow-[0_0_40px_rgba(34,211,238,0.28)] overflow-hidden select-text"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-950 via-[#19104B] to-fuchsia-950/90 border-b border-cyan-400/35 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-950 border-2 border-cyan-300 overflow-hidden shrink-0">
                <img
                  src="/assets/aistudio/Th_m_ti_u____9352a9ad.png"
                  alt="Robot Trợ lí AI"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover scale-[1.35]"
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-extrabold text-white truncate">
                  Trợ lí AI Toán Lớp 4
                </h2>
                <p className="text-[11px] font-semibold text-cyan-200 truncate">
                  Giải đáp Hình học &amp; Toán Lớp 4 dễ hiểu
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleResetChat}
                title="Cuộc trò chuyện mới"
                aria-label="Cuộc trò chuyện mới"
                className="px-2.5 py-1 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 border border-indigo-400/40 text-indigo-100 text-xs font-bold cursor-pointer"
              >
                ↺ Mới
              </button>
              <button
                type="button"
                data-testid="btn-close-ai-tutor"
                onClick={() => {
                  soundFX.playClick();
                  setIsOpen(false);
                }}
                aria-label="Đóng Trợ lí AI Toán Lớp 4"
                className="w-8 h-8 rounded-xl bg-indigo-950 hover:bg-rose-500/30 border border-indigo-400/40 hover:border-rose-400 text-white text-sm font-extrabold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 bg-[#090620]/90">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const parts = msg.text.split(/(\*\*[^*]+\*\*)/g);
              return (
                <div
                  key={idx}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-semibold rounded-br-md shadow-md'
                        : 'bg-[#151042] border border-indigo-400/40 text-indigo-50 font-medium rounded-bl-md'
                    }`}
                  >
                    {isUser
                      ? msg.text
                      : parts.map((segment, segIdx) =>
                          segment.startsWith('**') && segment.endsWith('**') ? (
                            <strong key={segIdx} className="font-extrabold text-yellow-200">
                              {segment.slice(2, -2)}
                            </strong>
                          ) : (
                            <React.Fragment key={segIdx}>{segment}</React.Fragment>
                          )
                        )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md px-3.5 py-2.5 bg-[#151042] border border-cyan-400/40 text-cyan-200 text-xs font-bold flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
                  <span>Trợ lí AI đang suy nghĩ cách giải dễ hiểu...</span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div
                data-testid="ai-tutor-error"
                role="alert"
                className="rounded-2xl px-3.5 py-2.5 bg-rose-950/85 border border-rose-400/60 text-rose-100 text-xs font-semibold leading-relaxed"
              >
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Quick Starter Suggestions when chat is fresh */}
            {messages.length <= 2 && !isLoading && (
              <div className="pt-1 space-y-1.5">
                <div className="text-[11px] font-bold text-cyan-300">
                  💡 Gợi ý câu hỏi nhanh theo chủ đề đang xem:
                </div>
                <div className="flex flex-col gap-1.5">
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="text-left text-xs font-semibold px-3 py-2 rounded-xl bg-indigo-950/90 hover:bg-indigo-800/80 border border-indigo-400/35 hover:border-cyan-300 text-indigo-100 hover:text-white cursor-pointer transition-colors"
                    >
                      ✨ {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={scrollEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-[#110B36] border-t border-indigo-400/35 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              data-testid="ai-tutor-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi Toán lớp 4 của em..."
              disabled={isLoading}
              aria-label="Nhập câu hỏi Toán lớp 4"
              className="flex-1 bg-[#08051D] border border-indigo-400/50 focus:border-cyan-300 focus:outline-none rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-white placeholder:text-indigo-300/60"
            />
            <button
              type="submit"
              data-testid="ai-tutor-send"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 disabled:opacity-45 disabled:cursor-not-allowed text-slate-950 font-extrabold text-xs sm:text-sm cursor-pointer transition-all shrink-0"
            >
              Gửi
            </button>
          </form>
        </aside>
      )}
    </>
  );
};
