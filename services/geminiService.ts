import { GoogleGenAI, Type } from "@google/genai";
import { QuizData, FlashcardDeck } from "../types";
import { FALLBACK_QUIZZES, FALLBACK_FLASHCARDS } from "../constants";

const getAi = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// Generic JSON fetcher with retry
async function fetchJson<T>(
  model: string, 
  prompt: string, 
  schema: any, 
  fallback: T
): Promise<T> {
  const ai = getAi();
  if (!ai) return fallback;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty AI response");
    return JSON.parse(text) as T;
  } catch (e) {
    console.warn("AI generation failed, using fallback", e);
    return fallback;
  }
}

// --- Specific Generators ---

export const generateQuiz = async (subject: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<QuizData> => {
  const schema = {
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
              properties: { A: { type: Type.STRING }, B: { type: Type.STRING }, C: { type: Type.STRING }, D: { type: Type.STRING } },
              required: ["A", "B", "C", "D"]
            },
            answer: { type: Type.STRING, enum: ["A", "B", "C", "D"] },
            explanation: { type: Type.STRING }
          },
          required: ["q", "choices", "answer", "explanation"]
        }
      }
    },
    required: ["title", "questions"]
  };

  const prompt = `Generate a 10-question multiple-choice quiz about "${subject}". 
  Difficulty: ${difficulty}. 
  Ensure questions are accurate and educational.`;

  return fetchJson<QuizData>(
    "gemini-3-flash-preview", 
    prompt, 
    schema, 
    FALLBACK_QUIZZES[subject] || FALLBACK_QUIZZES['General']
  );
};

export const generateFlashcards = async (subject: string, topic: string, count: number): Promise<{deckTitle: string, cards: any[]}> => {
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
            example: { type: Type.STRING }
          },
          required: ["front", "back"]
        }
      }
    },
    required: ["deckTitle", "cards"]
  };

  const prompt = `Create ${count} flashcards for Subject: "${subject}", Topic: "${topic}". 
  Front should be a term or question, Back should be the definition or answer.`;

  return fetchJson(
    "gemini-3-flash-preview", 
    prompt, 
    schema, 
    { deckTitle: `${subject} (Offline)`, cards: FALLBACK_FLASHCARDS }
  );
};

export const generateCoachTips = async (subject: string, distractions: string[], score: number): Promise<{tips: string[]}> => {
  const schema = {
    type: Type.OBJECT,
    properties: { tips: { type: Type.ARRAY, items: { type: Type.STRING } } },
    required: ["tips"]
  };
  
  const prompt = `Student studied ${subject}. Quiz score: ${score}%. 
  Distractions reported: ${distractions.join(', ') || 'None'}.
  Give 3 short, actionable study tips.`;

  return fetchJson(
    "gemini-3-flash-preview", 
    prompt, 
    schema, 
    { tips: ["Focus on one concept at a time.", "Take regular breaks.", "Review your mistakes."] }
  );
};

export const chatWithCoach = async (message: string): Promise<string> => {
    const ai = getAi();
    if(!ai) return "I'm currently offline. Please check your API key.";
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `You are a helpful study coach. 
            User asks: "${message}". 
            Keep answer under 50 words. Be encouraging. 
            Do not give medical advice.`,
        });
        return response.text || "I couldn't think of a response.";
    } catch (e) {
        return "Sorry, I'm having trouble connecting right now.";
    }
}
