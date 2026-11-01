import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Maximize2,
  Minimize2,
  User,
  Bot,
  Volume2,
  Copy,
  Check,
  Stethoscope,
  Mic,
  Drama
} from 'lucide-react';
import RainbowBorder from '../../components/common/RainbowBorder';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { GeminiClient } from '../../services/geminiClient';
import { StorageService } from '../../services/storage';
import { useSpeech } from '../../hooks/useSpeech';
import { SFX } from '../../services/sfx';

const MODE_PROMPTS = {
  general: [
    { text: "Phân biệt 'make' và 'do' khi nào dùng?", en: "Explain the difference between 'make' and 'do' with examples." },
    { text: "3 thành ngữ ghi điểm cao trong thuyết trình", en: "Give me 3 high-yield idioms for business presentations." },
  ],
  correct: [
    { text: "Sửa câu: 'I am agree with your opinion.'", en: "Correct my sentence: 'I am agree with your opinion.'" },
    { text: "Sửa câu: 'She don't like eating spicy food.'", en: "Correct my sentence: 'She don't like eating spicy food.'" },
  ],
  pronunciation: [
    { text: "Hướng dẫn bật âm đuôi từ: 'breakfast' & 'laughed'", en: "How should I pronounce the ending sounds of 'breakfast' and 'laughed'?" },
    { text: "Mẹo phát âm âm /θ/ trong 'think' vs 'this'", en: "Teach me how to position tongue for /θ/ in 'think' vs /ð/ in 'this'." },
  ],
  roleplay: [
    { text: "Đóng vai: Gọi đồ uống tại quán cà phê", en: "Let's roleplay ordering drinks at a coffee shop." },
    { text: "Đóng vai: Làm thủ tục check-in tại sân bay quốc tế", en: "Let's roleplay checking in at the international airport." },
  ]
};

export default function TutorFloatingWidget({
  uiLang,
  t
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState(() => StorageService.getTutorChat());
  const [inputText, setInputText] = useState('');
  const [targetLevel, setTargetLevel] = useState('B1');
  const [mode, setMode] = useState('general'); // 'general' | 'correct' | 'pronunciation' | 'roleplay'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const { speak } = useSpeech();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    StorageService.saveTutorChat(messages);
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isLoading) return;

    setErrorMsg(null);
    const userMsg = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toISOString()
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputText('');
    setIsLoading(true);
    SFX.playClick();

    try {
      const response = await GeminiClient.chatWithTutor(nextMessages, {
        userLevel: targetLevel,
        mode
      });

      const tutorMsg = {
        id: `msg_${Date.now() + 1}`,
        sender: 'tutor',
        text: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, tutorMsg]);
      SFX.playCorrect();
    } catch (err) {
      console.error('Tutor error:', err);
      setErrorMsg(err.message || 'Failed to get a response from AI Tutor.');
      SFX.playWrong();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    StorageService.saveTutorChat([]);
    SFX.playClick();
  };

  const handleCopy = (text, id) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      SFX.playClick();
    } catch {
      // Ignore
    }
  };

  const speakEnglishPart = (text) => {
    // Extract English paragraphs
    const parts = text.split('\n\n');
    const englishLines = parts
      .filter(p => p.includes('English:') || !p.includes('Tiếng Việt:'))
      .map(p => p.replace(/\*\*/g, '').replace(/English:/g, '').trim())
      .join('. ');
    speak(englishLines || text);
  };

  const renderMessageContent = (text) => {
    return text.split('\n\n').map((paragraph, idx) => {
      if (paragraph.startsWith('**English:**') || paragraph.includes('English:')) {
        return (
          <div key={idx} className="font-semibold text-slate-100 mb-1 leading-relaxed">
            {paragraph.replace(/\*\*/g, '')}
          </div>
        );
      }
      if (paragraph.startsWith('**Tiếng Việt:**') || paragraph.includes('Tiếng Việt:')) {
        return (
          <div key={idx} className="text-cyan-300 font-normal text-xs sm:text-sm leading-relaxed mb-2 bg-cyan-950/30 p-2.5 rounded-xl border border-cyan-500/20">
            {paragraph.replace(/\*\*/g, '')}
          </div>
        );
      }
      return (
        <p key={idx} className="mb-2 leading-relaxed whitespace-pre-wrap">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            SFX.playClick();
          }}
          className="relative group p-4 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 text-slate-950 shadow-neon-cyan hover:scale-105 active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-cyan-400/40 cursor-pointer"
          aria-label="Open AI Tutor Chat"
        >
          <span className="absolute -inset-1 rounded-full rainbow-gradient-bar opacity-75 blur-sm group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-slate-950 fill-slate-950" />
            <span className="hidden sm:inline font-black text-xs text-slate-950 uppercase tracking-wider pr-1">
              Gia Sư AI
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className={`glass-panel border border-cyan-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-all ${
            isExpanded
              ? 'fixed inset-3 sm:inset-8 z-50'
              : 'w-[94vw] sm:w-[440px] h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-white/10 bg-ocean-950/85 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-slate-950 shadow-sm font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-100">
                    AuraLingua AI Tutor
                  </h3>
                  <Badge level={targetLevel} size="xs" />
                </div>
                <p className="text-[10px] text-cyan-300 font-medium">
                  Trợ lý song ngữ thông minh & Sửa lỗi chuyên sâu
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Xóa lịch sử chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(prev => !prev)}
                className="hidden sm:block p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title={isExpanded ? 'Thu nhỏ' : 'Phóng to'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Tabs Bar */}
          <div className="px-3 py-2 border-b border-white/5 bg-ocean-900/50 flex flex-wrap items-center justify-between gap-1 text-[11px]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMode('general')}
                className={`px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  mode === 'general' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Hội thoại</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('correct')}
                className={`px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  mode === 'correct' ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Stethoscope className="w-3 h-3" />
                <span>Sửa câu</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('pronunciation')}
                className={`px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  mode === 'pronunciation' ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="w-3 h-3" />
                <span>Phát âm</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('roleplay')}
                className={`px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  mode === 'roleplay' ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Drama className="w-3 h-3" />
                <span>Đóng vai</span>
              </button>
            </div>

            {/* Level selection */}
            <select
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value)}
              className="glass-input px-2 py-0.5 rounded-md text-[10px] bg-ocean-950 text-slate-200 font-bold focus:outline-none"
              title="Chọn cấp độ mục tiêu"
            >
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
            </select>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-xs sm:text-sm">
            {messages.length === 0 ? (
              <div className="my-auto flex flex-col items-center text-center gap-3 p-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="max-w-xs">
                  <h4 className="font-bold text-slate-100 text-sm mb-1">
                    Xin chào! Mình là Gia Sư AI AuraLingua
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Hãy đặt bất kỳ câu hỏi nào về ngữ pháp, phát âm âm đuôi, gửi câu cần sửa, hoặc chọn một chủ đề gợi ý bên dưới:
                  </p>
                </div>

                {/* Dynamic Quick Prompts depending on mode */}
                <div className="w-full flex flex-col gap-1.5 mt-2 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Gợi ý nhanh ({mode}):
                  </span>
                  {(MODE_PROMPTS[mode] || MODE_PROMPTS.general).map((qp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(qp.en)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/15 border border-white/5 hover:border-cyan-500/30 text-left text-xs text-slate-200 hover:text-cyan-200 transition-colors flex items-center justify-between"
                    >
                      <span>💡 {qp.text}</span>
                      <span className="text-[10px] opacity-60 font-mono">Gửi ngay &rarr;</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 group ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                        isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-cyan-400 text-slate-950'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`relative p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                          : 'bg-ocean-950/80 border border-white/10 text-slate-200 rounded-tl-none shadow-md'
                      }`}
                    >
                      {/* Tutor Message Action Buttons (Read aloud, Copy) */}
                      {!isUser && (
                        <div className="flex items-center justify-end gap-1 mb-2 pb-1 border-b border-white/5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => speakEnglishPart(msg.text)}
                            className="p-1 rounded-md hover:bg-white/10 text-cyan-300"
                            title="Nghe phát âm tiếng Anh của AI"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white"
                            title="Sao chép nội dung"
                          >
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}

                      {isUser ? (
                        <span>{msg.text}</span>
                      ) : (
                        renderMessageContent(msg.text)
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-cyan-300 text-xs italic animate-pulse">
                <Bot className="w-4 h-4 animate-bounce" />
                <span>Gia Sư AI đang soạn giải thích song ngữ chuẩn xác...</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-white/10 bg-ocean-950/90 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                mode === 'correct' ? 'Nhập câu tiếng Anh cần sửa lỗi...' :
                mode === 'pronunciation' ? 'Nhập từ hoặc cụm từ cần hướng dẫn phát âm & trọng âm...' :
                mode === 'roleplay' ? 'Nhập câu phản hồi để tiếp tục hội thoại...' :
                'Hỏi ngữ pháp, từ vựng hoặc bài học...'
              }
              className="glass-input flex-1 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none"
            />
            <Button
              variant="neon"
              size="sm"
              type="submit"
              disabled={isLoading || !inputText.trim()}
              icon={Send}
            >
              {t.tutorSend}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
