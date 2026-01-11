import { AppData, Achievement, UserStats } from '../types';
import { ACHIEVEMENTS_LIST } from '../constants';

const STORAGE_KEY = 'focusLearnPlus_v2';
const CURRENT_VERSION = 2;

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

export const loadData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    
    const data = JSON.parse(raw);
    
    // Simple migration logic
    if (data.version < 2) {
      // Migrate from Lite (v1) to Plus (v2) would go here
      // For now, we just merge with default to ensure structure exists
      return { ...DEFAULT_DATA, ...data, version: CURRENT_VERSION };
    }
    
    return data;
  } catch (e) {
    console.error("Storage load failed", e);
    return DEFAULT_DATA;
  }
};

export const saveData = (data: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Storage save failed", e);
  }
};

export const exportData = () => {
  const data = loadData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `focuslearn_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
};

export const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (!data.version || !data.profile) throw new Error("Invalid schema");
    // Force version update just in case
    data.version = CURRENT_VERSION;
    saveData(data);
    window.location.reload();
    return true;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
};

export const getStats = (): UserStats => {
  const data = loadData();
  
  const totalFocusMinutes = data.history
    .filter(h => h.type === 'focus')
    .reduce((acc, curr) => acc + (curr.durationSeconds / 60), 0);
    
  const sessionsCompleted = data.history.filter(h => h.type === 'focus').length;
  
  const quizzes = data.history.filter(h => h.type === 'quiz' && h.score !== undefined);
  const averageQuizScore = quizzes.length > 0 
    ? Math.round(quizzes.reduce((acc, curr) => acc + (curr.score || 0), 0) / quizzes.length) 
    : 0;

  // Chart History (Last 7 days)
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6-i)); // Go back from 6 days ago to today
    return d.toISOString().split('T')[0];
  });
  
  const chartHistory = last7Days.map(date => {
    const minutes = data.history
      .filter(h => h.date.startsWith(date) && h.type === 'focus')
      .reduce((acc, curr) => acc + (curr.durationSeconds / 60), 0);
    return { date, minutes: Math.round(minutes) };
  });

  // Streak calculation
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
          for (let i = 1; i < uniqueDates.length; i++) {
              currentDate.setDate(currentDate.getDate() - 1);
              const expectedDate = currentDate.toISOString().split('T')[0];
              if (uniqueDates[i] === expectedDate) {
                  streak++;
              } else {
                  break;
              }
          }
      }
  }

  return {
    totalFocusMinutes: Math.round(totalFocusMinutes),
    sessionsCompleted,
    averageQuizScore,
    streakDays: streak,
    history: chartHistory
  };
};