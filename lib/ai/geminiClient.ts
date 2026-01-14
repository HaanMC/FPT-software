/**
 * Gemini AI Client for FocusLearn
 * Handles AI features with graceful degradation when API key is missing
 *
 * Uses Vite environment variables: import.meta.env.VITE_GEMINI_API_KEY
 */

import { GoogleGenAI, Type } from '@google/genai';
import { QuizData, QuizQuestion } from '../../types';
import { FALLBACK_QUIZZES, FALLBACK_FLASHCARDS } from '../../constants';

// Toast callback for showing messages
let toastCallback: ((message: string, type: 'info' | 'error' | 'success') => void) | null = null;

export function setToastCallback(callback: typeof toastCallback) {
  toastCallback = callback;
}

function showToast(message: string, type: 'info' | 'error' | 'success' = 'info') {
  if (toastCallback) {
    toastCallback(message, type);
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

/**
 * Get Gemini API key from environment variables
 * Detects build tool (Vite/CRA/Next) and uses appropriate env access
 */
export function getGeminiKeyFromEnv(): string | null {
  // Vite: import.meta.env.VITE_*
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (key) return key;
  }

  // Fallback to process.env (injected by vite.config.ts)
  if (typeof process !== 'undefined' && process.env) {
    const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (key) return key;
  }

  return null;
}

/**
 * Check if AI features are enabled
 */
export function isAiEnabled(): boolean {
  const key = getGeminiKeyFromEnv();
  return !!key && key.length > 0;
}

/**
 * Get AI client instance (or null if not available)
 */
function getAiClient(): GoogleGenAI | null {
  const apiKey = getGeminiKeyFromEnv();
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Generic JSON fetcher with error handling and retry
 */
async function callGeminiJson<T>(
  prompt: string,
  schema: any,
  fallback: T,
  retries: number = 1
): Promise<T> {
  const ai = getAiClient();
  if (!ai) {
    return fallback;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      const text = response.text;
      if (!text) throw new Error('Empty AI response');

      const parsed = JSON.parse(text) as T;
      return parsed;
    } catch (e) {
      console.warn(`AI generation attempt ${attempt + 1} failed:`, e);
      if (attempt === retries) {
        return fallback;
      }
    }
  }

  return fallback;
}

// Quiz schema for structured output
const QUIZ_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          q: { type: Type.STRING },
          choices: {
            type: Type.OBJECT,
            properties: {
              A: { type: Type.STRING },
              B: { type: Type.STRING },
              C: { type: Type.STRING },
              D: { type: Type.STRING },
            },
            required: ['A', 'B', 'C', 'D'],
          },
          answer: { type: Type.STRING, enum: ['A', 'B', 'C', 'D'] },
          explanation: { type: Type.STRING },
        },
        required: ['q', 'choices', 'answer', 'explanation'],
      },
    },
  },
  required: ['title', 'questions'],
};

/**
 * Select random questions from fallback bank
 */
function selectRandomQuestions(questions: QuizQuestion[], count: number): QuizQuestion[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Generate a quiz for a subject
 */
export async function generateQuiz(
  subject: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'easy'
): Promise<QuizData> {
  const fallbackQuiz = FALLBACK_QUIZZES[subject] || FALLBACK_QUIZZES['General'];
  const fallbackData: QuizData = {
    title: fallbackQuiz.title,
    questions: selectRandomQuestions(fallbackQuiz.questions, 10),
  };

  if (!isAiEnabled()) {
    return fallbackData;
  }

  const prompt = `Generate a 10-question multiple-choice quiz about "${subject}".
Difficulty: ${difficulty}.
Each question must have exactly 4 choices (A, B, C, D) with only one correct answer.
Make questions educational and appropriate for students.
Ensure questions are accurate and have clear, unambiguous correct answers.
Return ONLY valid JSON matching the schema provided.`;

  return callGeminiJson<QuizData>(prompt, QUIZ_SCHEMA, fallbackData);
}

/**
 * Generate a retry quiz based on incorrect questions
 */
export async function generateRetryQuiz(
  subject: string,
  incorrectQuestions: QuizQuestion[]
): Promise<QuizData> {
  const fallbackQuiz = FALLBACK_QUIZZES[subject] || FALLBACK_QUIZZES['General'];
  const fallbackData: QuizData = {
    title: `${subject} Retry Quiz (Offline)`,
    questions: selectRandomQuestions(fallbackQuiz.questions, 5),
  };

  if (!isAiEnabled()) {
    return fallbackData;
  }

  const topics = incorrectQuestions.map((q) => q.q).join('; ');
  const prompt = `Generate a 5-question multiple-choice quiz about "${subject}".
The student struggled with these topics: ${topics}
Create 5 NEW questions (different from the originals) testing similar concepts.
Difficulty: easy.
Each question must have exactly 4 choices (A, B, C, D) with only one correct answer.
Return ONLY valid JSON matching the schema provided.`;

  return callGeminiJson<QuizData>(prompt, QUIZ_SCHEMA, fallbackData);
}

/**
 * Generate flashcards for a topic
 */
export async function generateFlashcards(
  subject: string,
  topic: string,
  count: number
): Promise<{ deckTitle: string; cards: any[] }> {
  const schema = {
    type: Type.OBJECT,
    properties: {
      deckTitle: { type: Type.STRING },
      cards: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            front: { type: Type.STRING },
            back: { type: Type.STRING },
            example: { type: Type.STRING },
          },
          required: ['front', 'back'],
        },
      },
    },
    required: ['deckTitle', 'cards'],
  };

  const fallback = { deckTitle: `${subject} (Offline)`, cards: FALLBACK_FLASHCARDS };

  if (!isAiEnabled()) {
    showToast('AI unavailable - using template flashcards', 'info');
    return fallback;
  }

  const prompt = `Create ${count} flashcards for Subject: "${subject}", Topic: "${topic}".
Front should be a term or question, Back should be the definition or answer.`;

  return callGeminiJson(prompt, schema, fallback);
}

/**
 * Generate study coach tips
 */
export async function generateCoachTips(
  subject: string,
  distractions: string[],
  score: number
): Promise<{ tips: string[] }> {
  const schema = {
    type: Type.OBJECT,
    properties: { tips: { type: Type.ARRAY, items: { type: Type.STRING } } },
    required: ['tips'],
  };

  const fallback = {
    tips: [
      'Focus on one concept at a time.',
      'Take regular breaks to maintain concentration.',
      'Review your mistakes to improve.',
    ],
  };

  if (!isAiEnabled()) {
    return fallback;
  }

  const prompt = `Student studied ${subject}. Quiz score: ${score}%.
Distractions reported: ${distractions.join(', ') || 'None'}.
Give 3 short, actionable study tips.`;

  return callGeminiJson(prompt, schema, fallback);
}

/**
 * Chat message type for conversations
 */
interface ChatMessageInput {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Send a chat message with full conversation context
 */
export async function sendChatMessage(
  messages: ChatMessageInput[],
  options: {
    language?: 'en' | 'vi';
    context?: string;
  } = {}
): Promise<string> {
  if (!isAiEnabled()) {
    return options.language === 'vi'
      ? "AI hiện không khả dụng. Vui lòng thêm API key Gemini vào biến môi trường."
      : "AI is currently unavailable. Please add your Gemini API key to environment variables.";
  }

  const ai = getAiClient();
  if (!ai) {
    return options.language === 'vi'
      ? "AI hiện không khả dụng."
      : "AI is currently unavailable.";
  }

  const languageInstruction = options.language === 'vi'
    ? 'Respond in Vietnamese. '
    : 'Respond in English. ';

  const systemPrompt = `You are a helpful, focused study coach for students using FocusLearn.
${languageInstruction}
Your role:
- Help students understand concepts, create study plans, and stay motivated
- Provide structured, practical answers
- Ask clarifying questions if the request is ambiguous
- Keep responses concise but thorough

Rules:
- Do NOT provide medical, therapy, or mental health advice - suggest professional help instead
- Do NOT collect personal data beyond what's needed for study context
- Stay focused on academic and learning topics
- Be encouraging but honest

${options.context ? `Student context:\n${options.context}\n` : ''}`;

  // Build conversation for Gemini
  const conversationParts = messages.map(msg => {
    if (msg.role === 'user') {
      return { role: 'user', parts: [{ text: msg.content }] };
    } else {
      return { role: 'model', parts: [{ text: msg.content }] };
    }
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'I understand. I am ready to help as a study coach.' }] },
        ...conversationParts,
      ],
    });
    return response.text || (options.language === 'vi' ? "Tôi không thể trả lời." : "I couldn't generate a response.");
  } catch (e) {
    console.error('Chat error:', e);
    return options.language === 'vi'
      ? "Xin lỗi, tôi đang gặp sự cố kết nối."
      : "Sorry, I'm having trouble connecting right now.";
  }
}

/**
 * Chat with AI coach (legacy function for compatibility)
 */
export async function chatWithCoach(message: string): Promise<string> {
  return sendChatMessage([{ role: 'user', content: message }]);
}

/**
 * Generate study suggestions based on user data
 */
export async function generateStudySuggestions(
  todayTasks: number,
  recentWrongAnswers: string[],
  topDistractions: string[]
): Promise<{ suggestions: string[] }> {
  const schema = {
    type: Type.OBJECT,
    properties: { suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } },
    required: ['suggestions'],
  };

  const fallback = {
    suggestions: [
      'Start with your most challenging subject while your energy is high.',
      'Break large tasks into 25-minute focus sessions.',
      'Review flashcards for topics you struggled with recently.',
    ],
  };

  if (!isAiEnabled()) {
    return fallback;
  }

  const prompt = `Create 3 personalized study suggestions.
Tasks pending today: ${todayTasks}
Recent topics struggled with: ${recentWrongAnswers.slice(0, 3).join(', ') || 'None'}
Common distractions: ${topDistractions.join(', ') || 'None'}
Keep each suggestion under 20 words.`;

  return callGeminiJson(prompt, schema, fallback);
}
