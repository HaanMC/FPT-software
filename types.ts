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

// --- Focus App Types ---
export type AppScreen = 'home' | 'timer' | 'quiz' | 'break' | 'stats' | 'settings' | 'shop' | 'coach' | 'flashcards';

// Timer states for the focus session
export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

// Quiz result states
export type QuizResultState = 'pending' | 'passed' | 'failed' | 'retry_passed' | 'retry_failed';

// Session configuration for starting a focus session
export interface SessionConfig {
  subject: string;
  focusMinutes: number;
  breakMinutes: number;
}

// User statistics tracked in localStorage
export interface UserStats {
  totalFocusMinutes: number;
  sessionsCompleted: number;
  averageQuizScore: number;
  streakDays: number;
  lastSessionDate: string; // ISO date for streak calculation
  history: { date: string; minutes: number }[]; // Last 7 days activity
}

// Quiz session state for tracking user answers and retry logic
export interface QuizSession {
  quizData: QuizData;
  answers: Record<number, string>;
  score: number;
  submitted: boolean;
  isRetry: boolean;
  incorrectQuestions: QuizQuestion[];
}
