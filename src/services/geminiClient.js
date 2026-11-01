// Google Gemini REST Client for AuraLingua AI
// Upgraded with Deep Bilingual ESL Pedagogical Prompts, Multi-mode AI Tutoring, and Comprehensive Mock Intelligence.

import { SEED_ITEMS } from '../data/seedContent.js';
import { StorageService } from './storage.js';

// Default recommended Flash model
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Recommended - Fastest & Smartest)' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
];

const API_TIMEOUT_MS = 28000;

function isValidExtractedItem(item) {
  return (
    item &&
    typeof item.english === 'string' && item.english.trim().length > 0 &&
    typeof item.vietnamese === 'string' && item.vietnamese.trim().length > 0 &&
    typeof item.exampleEn === 'string' && item.exampleEn.trim().length > 0 &&
    typeof item.exampleVi === 'string' && item.exampleVi.trim().length > 0 &&
    typeof item.explanationVi === 'string' && item.explanationVi.trim().length > 0
  );
}

const EXTRACTION_SCHEMA = {
  type: "ARRAY",
  description: "List of high-yield English vocabulary, phrasal verbs, idioms, and collocations with Vietnamese translations.",
  items: {
    type: "OBJECT",
    properties: {
      english: { type: "STRING", description: "The English word, phrase, idiom or collocation" },
      type: { type: "STRING", enum: ["word", "phrasal_verb", "idiom", "collocation"] },
      level: { type: "STRING", enum: ["A1", "A2", "B1", "B2", "C1", "C2"] },
      ipa: { type: "STRING", description: "IPA phonetic transcription, e.g. /həˈloʊ/" },
      vietnamese: { type: "STRING", description: "Direct Vietnamese translation of the term" },
      exampleEn: { type: "STRING", description: "Natural English example sentence demonstrating usage" },
      exampleVi: { type: "STRING", description: "Accurate Vietnamese translation of the example sentence" },
      explanationVi: { type: "STRING", description: "Clear Vietnamese explanation of nuanced usage and common mistakes" },
      sourceContext: { type: "STRING", description: "Original sentence from the input text where this phrase appeared" }
    },
    required: ["english", "type", "level", "ipa", "vietnamese", "exampleEn", "exampleVi", "explanationVi"]
  }
};

async function callGeminiREST({ apiKey, model, contents, systemInstruction, generationConfig }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || DEFAULT_GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  const payload = {
    contents,
    ...(systemInstruction && {
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      }
    }),
    ...(generationConfig && { generationConfig })
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorBody = {};
      try {
        errorBody = await res.json();
      } catch {
        // Ignore
      }

      const message = errorBody?.error?.message || res.statusText;

      if (res.status === 400 || res.status === 403) {
        throw new Error(`Authentication error (${res.status}): Please check your Gemini API key in Settings. (${message})`);
      }
      if (res.status === 429) {
        throw new Error(`Gemini rate limit reached (429). Please wait a few moments and try again.`);
      }
      throw new Error(`Gemini API Error (${res.status}): ${message}`);
    }

    const json = await res.json();
    const candidate = json?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Gemini returned an empty response. Please verify the prompt or try again.');
    }

    return text;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${API_TIMEOUT_MS / 1000}s. Please check your internet connection or try with shorter text.`);
    }
    throw err;
  }
}

export const GeminiClient = {
  hasApiKey() {
    const settings = StorageService.getSettings();
    return !!(settings.apiKey && settings.apiKey.trim().length > 10);
  },

  async testConnection(customKey = null, customModel = null) {
    const settings = StorageService.getSettings();
    const apiKey = customKey || settings.apiKey;
    const model = customModel || settings.model || DEFAULT_GEMINI_MODEL;

    if (!apiKey) {
      throw new Error('No API key provided. Please enter a valid Gemini key.');
    }

    const prompt = 'Respond with exactly: "AuraLingua Connection OK"';
    const text = await callGeminiREST({
      apiKey,
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 20 }
    });

    return text.includes('AuraLingua Connection OK') || text.length > 0;
  },

  async extractContent(textChunk, options = {}) {
    if (!this.hasApiKey()) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return this.mockExtractContent(textChunk);
    }

    const settings = StorageService.getSettings();
    const model = settings.model || DEFAULT_GEMINI_MODEL;

    const systemPrompt = `You are a world-class ESL linguist and curriculum designer specifically aiding Vietnamese learners.
Extract 4 to 8 high-yield items (phrasal verbs, idioms, collocations, advanced vocabulary) from the input text.
MANDATORY 100% RULE:
Every item MUST provide full Vietnamese translations:
- "vietnamese": accurate Vietnamese definition
- "exampleEn": natural English example sentence
- "exampleVi": natural Vietnamese translation of the example
- "explanationVi": clear Vietnamese explanation of usage nuances, collocations, and common mistakes Vietnamese learners make
Strictly output JSON complying with the schema.`;

    const userPrompt = `Extract 4 to 8 high-yield English learning items from this text:\n\n"""\n${textChunk}\n"""`;

    try {
      const responseText = await callGeminiREST({
        apiKey: settings.apiKey,
        model,
        systemInstruction: systemPrompt,
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: EXTRACTION_SCHEMA,
          temperature: 0.2
        }
      });

      const parsed = JSON.parse(responseText);
      if (Array.isArray(parsed) && parsed.every(isValidExtractedItem)) {
        return parsed.map((item, idx) => ({ ...item, id: `ext_${Date.now()}_${idx}` }));
      }
      throw new Error('Some items were missing mandatory Vietnamese fields.');
    } catch (firstErr) {
      console.warn('Gemini extraction attempt 1 failed or missed translations. Retrying once...', firstErr);

      const retryPrompt = `${userPrompt}\n\nATTENTION: In the previous attempt some Vietnamese translations were missing. Ensure ALL fields (vietnamese, exampleVi, explanationVi) are 100% complete.`;
      const retryText = await callGeminiREST({
        apiKey: settings.apiKey,
        model,
        systemInstruction: systemPrompt,
        contents: [{ role: 'user', parts: [{ text: retryPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: EXTRACTION_SCHEMA,
          temperature: 0.1
        }
      });

      const parsed2 = JSON.parse(retryText);
      if (Array.isArray(parsed2)) {
        return parsed2.map((item, idx) => ({ ...item, id: `ext_${Date.now()}_${idx}` }));
      }
      throw new Error('Failed to extract structured items after retry.');
    }
  },

  async generateTopicItems(level, topicName, count = 4) {
    if (!this.hasApiKey()) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return this.mockGenerateTopicItems(level, topicName, count);
    }

    const settings = StorageService.getSettings();
    const model = settings.model || DEFAULT_GEMINI_MODEL;

    const systemPrompt = `You are a curriculum designer for Vietnamese students learning English at CEFR level ${level}.
Create ${count} distinct high-yield vocabulary items, phrasal verbs, idioms, or collocations for the topic: "${topicName}".
RULE: Every item MUST have full Vietnamese translations (vietnamese, exampleVi, explanationVi).`;

    const userPrompt = `Generate ${count} CEFR ${level} items for "${topicName}". Strict JSON format.`;

    const responseText = await callGeminiREST({
      apiKey: settings.apiKey,
      model,
      systemInstruction: systemPrompt,
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: EXTRACTION_SCHEMA,
        temperature: 0.4
      }
    });

    const parsed = JSON.parse(responseText);
    return parsed.map((item, idx) => ({ ...item, id: `gen_${Date.now()}_${idx}`, level, topicId: topicName.toLowerCase().replace(/\s+/g, '_') }));
  },

  /**
   * Upgraded Multi-Mode AI Tutor with Deep Bilingual Formatting
   */
  async chatWithTutor(messages, { userLevel = 'B1', mode = 'general' } = {}) {
    if (!this.hasApiKey()) {
      await new Promise(resolve => setTimeout(resolve, 600));
      return this.mockTutorResponse(messages[messages.length - 1]?.text || '', mode, userLevel);
    }

    const settings = StorageService.getSettings();
    const model = settings.model || DEFAULT_GEMINI_MODEL;

    let modeInstruction = '';
    if (mode === 'correct') {
      modeInstruction = `CORRECTION MODE (Grammar Doctor):
- Identify any grammar, collocation, spelling, awkward phrasing, or Vietnamese false-friends (e.g. "I am agree", "cost money", "look forward to see").
- Structure:
  **English:**
  ✓ Corrected: [The polished, natural English sentence]
  • Breakdown: [Clear explanation in English of what was changed and why]
  **Tiếng Việt:**
  ✓ Câu đã sửa: [Bản dịch chuẩn xác]
  • Phân tích lỗi: [Giải thích chi tiết bằng tiếng Việt lỗi sai và nguyên tắc ngữ pháp]
  • Mẹo cho người Việt: [Mẹo tránh tái phạm lỗi này]`;
    } else if (mode === 'pronunciation') {
      modeInstruction = `PRONUNCIATION & PHONETICS MODE:
- Focus on phonetics, ending sounds (-s, -ed, -t, -k, -d, -θ), word stress, and rhythm.
- Structure:
  **English:**
  • IPA & Syllables: [IPA transcription with stress marks, e.g. /ˈbrek.fəst/]
  • Phonetic Tips: [Specific tongue position and vocal cord advice]
  **Tiếng Việt:**
  • Hướng dẫn khẩu hình: [Mô tả chi tiết vị trí lưỡi, răng, môi bằng tiếng Việt]
  • Lưu ý âm đuôi: [Cảnh báo lỗi nuốt âm cuối mà người Việt hay mắc]`;
    } else if (mode === 'roleplay') {
      modeInstruction = `ROLEPLAY CONVERSATION MODE:
- Maintain an engaging, realistic dialogue in English tailored to CEFR ${userLevel}.
- Prompt the user with natural follow-up questions to keep the conversation flowing.
- Always provide immediate Vietnamese translation for the learner's comprehension.`;
    } else {
      modeInstruction = `GENERAL BILINGUAL COACHING MODE:
- Answer grammar, vocabulary, idiom, and academic writing questions with crystal-clear clarity.
- Every English explanation block MUST be followed immediately by a Vietnamese translation block.`;
    }

    const systemInstruction = `You are "AuraLingua AI Tutor", an elite, empathetic, and encouraging bilingual English coach designed specifically for Vietnamese learners.
The learner's current target CEFR level is ${userLevel}.

${modeInstruction}

CRITICAL RULES:
1. Every major explanation and feedback block in English MUST be accompanied by a natural Vietnamese translation directly underneath.
2. Format cleanly with clear sections:
   **English:** [Content in English]
   **Tiếng Việt:** [Nội dung tương ứng bằng tiếng Việt]
3. Keep formatting clean, engaging, and highly instructive.`;

    const formattedContents = messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const text = await callGeminiREST({
      apiKey: settings.apiKey,
      model,
      systemInstruction,
      contents: formattedContents,
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 900
      }
    });

    return text;
  },

  // ================= MOCK FALLBACK IMPLEMENTATIONS =================

  mockExtractContent(textChunk) {
    const candidates = [...SEED_ITEMS].sort(() => 0.5 - Math.random()).slice(0, 5);
    return candidates.map((item, idx) => ({
      ...item,
      id: `mock_ext_${Date.now()}_${idx}`,
      sourceContext: textChunk ? textChunk.slice(0, 120) + '...' : item.sourceContext
    }));
  },

  mockGenerateTopicItems(level, topicName, count = 4) {
    const matching = SEED_ITEMS.filter(i => i.level === level);
    const pool = matching.length >= count ? matching : SEED_ITEMS;
    return pool.slice(0, count).map((item, idx) => ({
      ...item,
      id: `mock_gen_${Date.now()}_${idx}`,
      level
    }));
  },

  mockTutorResponse(userMessage, mode, level = 'B1') {
    const lower = userMessage.toLowerCase();

    if (mode === 'correct' || lower.includes('correct') || lower.includes('agree') || lower.includes('repair')) {
      let polished = userMessage;
      let explanationEn = 'Ensure subject-verb agreement and natural collocations.';
      let explanationVi = 'Đảm bảo sự hòa hợp giữa chủ ngữ và vị ngữ cũng như dùng cụm từ cố định tự nhiên.';

      if (lower.includes('i am agree')) {
        polished = userMessage.replace(/i am agree/gi, 'I agree');
        explanationEn = 'In English, "agree" is a normal verb, not an adjective. Therefore, say "I agree", never "I am agree".';
        explanationVi = 'Trong tiếng Anh, "agree" là một động từ thường chứ không phải tính từ. Vì vậy chỉ dùng "I agree", tuyệt đối không dùng "I am agree".';
      } else if (lower.includes('she don\'t') || lower.includes('she dont')) {
        polished = userMessage.replace(/she don't/gi, "she doesn't").replace(/she dont/gi, "she doesn't");
        explanationEn = 'Third-person singular subjects (he, she, it) take "does not" / "doesn\'t", not "don\'t".';
        explanationVi = 'Chủ ngữ ngôi thứ ba số ít (he, she, it) phải đi với trợ động từ "doesn\'t", không đi với "don\'t".';
      }

      return `**English:**
✓ Corrected Sentence: "${polished}"
• Grammar Breakdown: ${explanationEn}

**Tiếng Việt:**
✓ Câu chuẩn xác: "${polished}"
• Phân tích lỗi sai: ${explanationVi}
• Mẹo vàng cho người Việt: Hãy chú ý các lỗi "Việt hóa" tư duy từ tiếng Việt sang tiếng Anh. Bạn đang tiến bộ rất nhanh!`;
    }

    if (mode === 'pronunciation' || lower.includes('pronounce') || lower.includes('stress') || lower.includes('ipa')) {
      return `**English:**
• Phonetic & Stress Guide for "${userMessage}":
- IPA: /ˈnaɪs tuː miːt juː/
- Primary stress is placed on the key content words: "Nice" and "meet".
- Avoid dropping the final consonant /s/ on "nice" and /t/ on "meet".

**Tiếng Việt:**
• Hướng dẫn phát âm & Trọng âm:
- Phiên âm IPA: /ˈnaɪs tuː miːt juː/
- Trọng âm chính rơi vào các từ mang nội dung: "Nice" và "meet".
- Cảnh báo âm đuôi: Người Việt rất hay quên bật âm gió /s/ ở từ "Nice" và âm /t/ ở từ "meet". Hãy luyện đọc chậm và ngắt âm rõ ràng!`;
    }

    if (mode === 'roleplay') {
      return `**English:**
Hello there! Welcome to our cafe. What can I get started for you today? Would you like to try our signature iced latte or a hot cappuccino?

**Tiếng Việt:**
Xin chào bạn! Chào mừng bạn đến với quán cà phê của chúng tôi. Hôm nay tôi có thể lấy món gì cho bạn? Bạn muốn thử món latte đá đặc biệt hay một ly cappuccino nóng ạ?

**English:**
(Your turn: Practice replying to order your drink and ask about the price!)

**Tiếng Việt:**
(Đến lượt bạn: Hãy thử nhắn lại câu gọi đồ uống và hỏi giá tiền bằng tiếng Anh nhé!)`;
    }

    return `**English:**
That is an excellent question! At CEFR ${level}, focusing on idiomatic expressions and collocations (words that naturally pair together) will make your English sound effortless and authentic.

**Tiếng Việt:**
Đó là một câu hỏi rất hay! Ở trình độ CEFR ${level}, việc chú trọng vào các thành ngữ và cụm từ cố định (collocation) sẽ giúp tiếng Anh của bạn trở nên tự nhiên và lưu loát như người bản xứ.

**English:**
Feel free to ask me to explain any grammar nuance, correct a sentence you wrote, or practice realistic conversation!

**Tiếng Việt:**
Bạn cứ thoải mái yêu cầu mình giải thích bất kỳ điểm ngữ pháp nào, sửa một câu bạn vừa viết, hoặc luyện tập hội thoại tình huống nhé!`;
  }
};
