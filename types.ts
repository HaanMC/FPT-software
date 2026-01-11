export type Theme = 'light' | 'dark' | 'navy' | 'forest';

export interface AppData {
  version: number;
  profile: UserProfile;
  settings: AppSettings;
  tasks: Task[];
  decks: FlashcardDeck[];
  history: SessionRecord[];
  achievements: Achievement[];
}

export interface UserProfile {
  coins: number;
  inventory: string[]; // e.g., 'item:freeze', 'theme:navy'
  activeTheme: Theme;
}

export interface AppSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLongBreak: number;
  isDarkMode: boolean;
}

export interface Task {
  id: string;
  title: string;
  subject: string;
  completed: boolean;
  createdAt: string;
}

export interface SessionRecord {
  id: string;
  date: string; // ISO date string
  type: 'focus' | 'quiz' | 'flashcard';
  durationSeconds: number;
  score?: number; // For quizzes
  subject?: string;
  distractions?: DistractionLog[];
}

export interface DistractionLog {
  category: string;
  note: string;
  timestamp: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  condition: (data: AppData) => boolean;
  unlockedAt?: string;
  rewardCoins: number;
}

// --- Flashcards (SM-2) ---
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  example?: string;
  easeFactor: number; // SM-2 default 2.5
  interval: number; // Days
  reviews: number;
  nextReviewDate: string; // YYYY-MM-DD
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  cards: Flashcard[];
}

// --- Quiz ---
export interface QuizQuestion {
  q: string;
  choices: { A: string; B: string; C: string; D: string };
  answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

// --- New Types needed for fixes ---
export type AppScreen = 'home' | 'quiz' | 'stats' | 'settings' | 'shop' | 'coach' | 'flashcards';

export interface SessionConfig {
  subject: string;
  focusMinutes: number;
  breakMinutes: number;
}

export interface UserStats {
  totalFocusMinutes: number;
  sessionsCompleted: number;
  averageQuizScore: number;
  streakDays: number;
  history: { date: string; minutes: number }[];
}