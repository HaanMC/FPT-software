/**
 * Storage Service for Focus Timer App
 * Handles localStorage persistence for user data and statistics
 * Includes streak calculation and 7-day activity tracking
 */

import { AppData, Achievement, UserStats } from '../types';
import { ACHIEVEMENTS_LIST } from '../constants';

const STORAGE_KEY = 'focusLearnPlus_v2';
const CURRENT_VERSION = 2;

// Default app data structure
const DEFAULT_DATA: AppData = {
  version: CURRENT_VERSION,
  profile: {
    coins: 0,
    inventory: ['theme:light'],
    activeTheme: 'light',
  },
  settings: {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    cyclesBeforeLongBreak: 4,
    isDarkMode: false,
  },
  tasks: [],
  decks: [],
  history: [],
  achievements: ACHIEVEMENTS_LIST,
};

/**
 * Load app data from localStorage
 * Returns default data if none exists or on error
 */
export const loadData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;

    const data = JSON.parse(raw);

    // Migration logic for older versions
    if (data.version < 2) {
      return { ...DEFAULT_DATA, ...data, version: CURRENT_VERSION };
    }

    return data;
  } catch (e) {
    console.error("Storage load failed", e);
    return DEFAULT_DATA;
  }
};

/**
 * Save app data to localStorage
 */
export const saveData = (data: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Storage save failed", e);
  }
};

/**
 * Export data as a downloadable JSON file
 */
export const exportData = () => {
  const data = loadData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `focuslearn_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
};

/**
 * Import data from a JSON string
 * Returns true on success, false on failure
 */
export const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (!data.version || !data.profile) throw new Error("Invalid schema");
    data.version = CURRENT_VERSION;
    saveData(data);
    window.location.reload();
    return true;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
};

/**
 * Calculate and return user statistics
 * Includes:
 * - Total focus minutes
 * - Sessions completed
 * - Average quiz score
 * - Streak days (consecutive days with at least 1 session)
 * - Last session date
 * - 7-day activity history
 */
export const getStats = (): UserStats => {
  const data = loadData();

  // Calculate total focus minutes from all focus sessions
  const totalFocusMinutes = data.history
    .filter(h => h.type === 'focus')
    .reduce((acc, curr) => acc + (curr.durationSeconds / 60), 0);

  // Count completed focus sessions
  const sessionsCompleted = data.history.filter(h => h.type === 'focus').length;

  // Calculate average quiz score
  const quizzes = data.history.filter(h => h.type === 'quiz' && h.score !== undefined);
  const averageQuizScore = quizzes.length > 0
    ? Math.round(quizzes.reduce((acc, curr) => acc + (curr.score || 0), 0) / quizzes.length)
    : 0;

  // Get last session date
  const focusSessions = data.history.filter(h => h.type === 'focus');
  const lastSessionDate = focusSessions.length > 0
    ? focusSessions[focusSessions.length - 1].date
    : '';

  // Build 7-day activity chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i)); // From 6 days ago to today
    return d.toISOString().split('T')[0];
  });

  const chartHistory = last7Days.map(date => {
    const minutes = data.history
      .filter(h => h.date.startsWith(date) && h.type === 'focus')
      .reduce((acc, curr) => acc + (curr.durationSeconds / 60), 0);
    return { date, minutes: Math.round(minutes) };
  });

  // Calculate streak (consecutive days with at least 1 completed session)
  // Streak is maintained if there's activity today or yesterday
  const uniqueDates = Array.from(new Set(
    data.history
      .filter(h => h.type === 'focus')
      .map(h => h.date.split('T')[0])
  )).sort().reverse();

  let streak = 0;
  if (uniqueDates.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if streak is active (activity today or yesterday)
    if (uniqueDates[0] === today || uniqueDates[0] === yesterdayStr) {
      streak = 1;
      let currentDate = new Date(uniqueDates[0]);

      // Count consecutive days backwards
      for (let i = 1; i < uniqueDates.length; i++) {
        currentDate.setDate(currentDate.getDate() - 1);
        const expectedDate = currentDate.toISOString().split('T')[0];
        if (uniqueDates[i] === expectedDate) {
          streak++;
        } else {
          break; // Streak broken
        }
      }
    }
  }

  return {
    totalFocusMinutes: Math.round(totalFocusMinutes),
    sessionsCompleted,
    averageQuizScore,
    streakDays: streak,
    lastSessionDate,
    history: chartHistory
  };
};

/**
 * Add a focus session to history
 * Also updates streak logic automatically
 */
export const recordFocusSession = (
  durationSeconds: number,
  subject: string
) => {
  const data = loadData();

  data.history.push({
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    type: 'focus',
    durationSeconds,
    subject
  });

  saveData(data);
};

/**
 * Add a quiz result to history
 */
export const recordQuizResult = (score: number, subject: string) => {
  const data = loadData();

  data.history.push({
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    type: 'quiz',
    durationSeconds: 0,
    score,
    subject
  });

  saveData(data);
};
