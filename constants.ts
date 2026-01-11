import { QuizData, Achievement, Flashcard } from './types';

export const SUBJECTS = ['Math', 'English', 'Physics', 'History', 'Biology', 'CS', 'Custom'];

export const FOCUS_TIPS = [
  "Turn off phone notifications.",
  "Keep water nearby.",
  "Focus on one thing at a time.",
  "Take deep breaths during breaks.",
  "Visualize the completed task."
];

export const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: 'first_session', title: 'First Steps', description: 'Complete your first focus session', rewardCoins: 50, condition: (d) => d.history.some(h => h.type === 'focus') },
  { id: 'quiz_master', title: 'Quiz Whiz', description: 'Score 100% on a quiz', rewardCoins: 100, condition: (d) => d.history.some(h => h.type === 'quiz' && h.score === 100) },
  { id: 'marathon', title: 'Focus Marathon', description: 'Reach 100 total focus minutes', rewardCoins: 200, condition: (d) => d.history.filter(h => h.type === 'focus').reduce((acc, curr) => acc + (curr.durationSeconds/60), 0) >= 100 },
  { id: 'collector', title: 'Collector', description: 'Buy an item from the shop', rewardCoins: 50, condition: (d) => d.profile.inventory.length > 1 }, // Default has 1
];

export const SHOP_ITEMS = [
  { id: 'theme:navy', name: 'Navy Theme', cost: 150, type: 'theme' },
  { id: 'theme:forest', name: 'Forest Theme', cost: 150, type: 'theme' },
  { id: 'theme:dark', name: 'Dark Mode', cost: 200, type: 'theme' },
  { id: 'item:freeze', name: 'Streak Freeze', cost: 300, type: 'consumable' },
  { id: 'item:hint', name: 'Hint Token', cost: 50, type: 'consumable' },
];

export const FALLBACK_QUIZZES: Record<string, QuizData> = {
  'General': {
    title: "General Knowledge (Offline)",
    questions: [
      { q: "What is the capital of France?", choices: {A: "London", B: "Berlin", C: "Paris", D: "Madrid"}, answer: "C", explanation: "Paris is the capital." },
      { q: "2 + 2 = ?", choices: {A: "3", B: "4", C: "5", D: "6"}, answer: "B", explanation: "Basic math." }
    ]
  }
};

export const FALLBACK_FLASHCARDS: Partial<Flashcard>[] = [
    { front: "Photosynthesis", back: "Process by which plants make food using sunlight." },
    { front: "Mitochondria", back: "Powerhouse of the cell." },
    { front: "Pythagorean Theorem", back: "a^2 + b^2 = c^2" }
];