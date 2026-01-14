/**
 * Global Context for FocusLearn Study OS
 * Manages application state with localStorage persistence
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  AppState,
  Task,
  Project,
  Cycle,
  Note,
  InboxItem,
  FlashcardDeck,
  Session,
  Achievement,
  TaskStatus,
  TaskPriority,
} from '../types';
import { loadState, saveState, generateId } from '../lib/storage/store';

// Toast types
interface Toast {
  id: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'warning';
}

interface GlobalContextType {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;

  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;

  // Projects
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Cycles
  addCycle: (cycle: Omit<Cycle, 'id' | 'createdAt'>) => Cycle;
  updateCycle: (id: string, updates: Partial<Cycle>) => void;
  getActiveCycle: () => Cycle | null;

  // Notes
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'backlinks'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // Inbox
  addInboxItem: (content: string) => InboxItem;
  convertInboxToTask: (id: string, taskData: Partial<Task>) => Task;
  convertInboxToNote: (id: string, noteData: Partial<Note>) => Note;
  archiveInboxItem: (id: string) => void;

  // Decks
  addDeck: (deck: Omit<FlashcardDeck, 'id' | 'createdAt' | 'lastReviewedAt'>) => void;
  updateDeck: (id: string, updates: Partial<FlashcardDeck>) => void;
  deleteDeck: (id: string) => void;

  // Sessions
  addSession: (session: Omit<Session, 'id'>) => Session;
  updateSession: (id: string, updates: Partial<Session>) => void;

  // Achievements
  checkAchievements: () => void;

  // Settings
  updateSettings: (updates: Partial<AppState['settings']['timer']>) => void;

  // Favorites
  toggleFavorite: (path: string) => void;
  isFavorite: (path: string) => boolean;

  // Toast
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;

  // UI state
  isZenMode: boolean;
  setZenMode: (value: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (value: boolean) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => loadState());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isZenMode, setZenMode] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Persist state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Update state helper
  const updateState = useCallback((updates: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Toast helpers
  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const toast: Toast = { id: generateId('toast'), message, type };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ============================================
  // Task Operations
  // ============================================
  const addTask = useCallback(
    (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>): Task => {
      const now = new Date().toISOString();
      const task: Task = {
        ...taskData,
        id: generateId('task'),
        createdAt: now,
        updatedAt: now,
        completedAt: null,
      };
      setState((prev) => ({ ...prev, tasks: [...prev.tasks, task] }));
      return task;
    },
    []
  );

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              ...updates,
              updatedAt: new Date().toISOString(),
              completedAt: updates.status === 'done' && t.status !== 'done' ? new Date().toISOString() : t.completedAt,
            }
          : t
      ),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  }, []);

  const moveTask = useCallback((id: string, status: TaskStatus) => {
    updateTask(id, { status });
  }, [updateTask]);

  // ============================================
  // Project Operations
  // ============================================
  const addProject = useCallback(
    (projectData: Omit<Project, 'id' | 'createdAt'>): Project => {
      const project: Project = {
        ...projectData,
        id: generateId('proj'),
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, projects: [...prev.projects, project] }));
      return project;
    },
    []
  );

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id && !p.isDefault),
      tasks: prev.tasks.map((t) => (t.projectId === id ? { ...t, projectId: null } : t)),
    }));
  }, []);

  // ============================================
  // Cycle Operations
  // ============================================
  const addCycle = useCallback((cycleData: Omit<Cycle, 'id' | 'createdAt'>): Cycle => {
    const cycle: Cycle = {
      ...cycleData,
      id: generateId('cycle'),
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      cycles: prev.cycles.map((c) => ({ ...c, isActive: false })),
    }));
    setState((prev) => ({ ...prev, cycles: [...prev.cycles, cycle] }));
    return cycle;
  }, []);

  const updateCycle = useCallback((id: string, updates: Partial<Cycle>) => {
    setState((prev) => ({
      ...prev,
      cycles: prev.cycles.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  const getActiveCycle = useCallback((): Cycle | null => {
    return state.cycles.find((c) => c.isActive) || null;
  }, [state.cycles]);

  // ============================================
  // Note Operations
  // ============================================
  const addNote = useCallback(
    (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'backlinks'>): Note => {
      const now = new Date().toISOString();
      const note: Note = {
        ...noteData,
        id: generateId('note'),
        backlinks: [],
        createdAt: now,
        updatedAt: now,
      };
      setState((prev) => ({ ...prev, notes: [...prev.notes, note] }));
      return note;
    },
    []
  );

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
      ),
    }));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
  }, []);

  // ============================================
  // Inbox Operations
  // ============================================
  const addInboxItem = useCallback((content: string): InboxItem => {
    const item: InboxItem = {
      id: generateId('inbox'),
      content,
      createdAt: new Date().toISOString(),
      type: 'capture',
    };
    setState((prev) => ({ ...prev, inbox: [...prev.inbox, item] }));
    return item;
  }, []);

  const convertInboxToTask = useCallback(
    (id: string, taskData: Partial<Task>): Task => {
      const inboxItem = state.inbox.find((i) => i.id === id);
      if (!inboxItem) throw new Error('Inbox item not found');

      const task = addTask({
        title: inboxItem.content,
        description: '',
        status: 'todo',
        priority: 'medium',
        projectId: null,
        cycleId: null,
        dueDate: null,
        estimateMinutes: null,
        tags: [],
        ...taskData,
      });

      setState((prev) => ({
        ...prev,
        inbox: prev.inbox.filter((i) => i.id !== id),
      }));

      return task;
    },
    [state.inbox, addTask]
  );

  const convertInboxToNote = useCallback(
    (id: string, noteData: Partial<Note>): Note => {
      const inboxItem = state.inbox.find((i) => i.id === id);
      if (!inboxItem) throw new Error('Inbox item not found');

      const note = addNote({
        title: inboxItem.content.slice(0, 50),
        content: inboxItem.content,
        tags: [],
        projectId: null,
        linkedTaskIds: [],
        linkedSessionIds: [],
        ...noteData,
      });

      setState((prev) => ({
        ...prev,
        inbox: prev.inbox.filter((i) => i.id !== id),
      }));

      return note;
    },
    [state.inbox, addNote]
  );

  const archiveInboxItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      inbox: prev.inbox.filter((i) => i.id !== id),
    }));
  }, []);

  // ============================================
  // Deck Operations
  // ============================================
  const addDeck = useCallback(
    (deckData: Omit<FlashcardDeck, 'id' | 'createdAt' | 'lastReviewedAt'>) => {
      const deck: FlashcardDeck = {
        ...deckData,
        id: generateId('deck'),
        createdAt: new Date().toISOString(),
        lastReviewedAt: null,
      };
      setState((prev) => ({ ...prev, decks: [...prev.decks, deck] }));
    },
    []
  );

  const updateDeck = useCallback((id: string, updates: Partial<FlashcardDeck>) => {
    setState((prev) => ({
      ...prev,
      decks: prev.decks.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }));
  }, []);

  const deleteDeck = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      decks: prev.decks.filter((d) => d.id !== id),
    }));
  }, []);

  // ============================================
  // Session Operations
  // ============================================
  const addSession = useCallback((sessionData: Omit<Session, 'id'>): Session => {
    const session: Session = {
      ...sessionData,
      id: generateId('session'),
    };
    setState((prev) => ({ ...prev, sessions: [...prev.sessions, session] }));
    return session;
  }, []);

  const updateSession = useCallback((id: string, updates: Partial<Session>) => {
    setState((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  // ============================================
  // Achievement Operations
  // ============================================
  const checkAchievements = useCallback(() => {
    const achievements = [...state.achievements];
    let updated = false;

    // Calculate stats
    const totalFocusMinutes = state.sessions
      .filter((s) => s.type === 'focus')
      .reduce((acc, s) => acc + s.durationSeconds / 60, 0);

    const completedTasks = state.tasks.filter((t) => t.status === 'done').length;

    const perfectQuizzes = state.sessions.filter((s) => s.quizScore === 100).length;

    // Check each achievement
    achievements.forEach((ach, idx) => {
      if (ach.unlockedAt) return;

      let unlocked = false;
      switch (ach.id) {
        case 'first_session':
          unlocked = state.sessions.some((s) => s.type === 'focus');
          break;
        case 'quiz_master':
          unlocked = perfectQuizzes > 0;
          break;
        case 'marathon':
          unlocked = totalFocusMinutes >= 100;
          break;
        case 'task_complete':
          unlocked = completedTasks >= 25;
          break;
        case 'note_taker':
          unlocked = state.notes.length >= 10;
          break;
      }

      if (unlocked) {
        achievements[idx] = { ...ach, unlockedAt: new Date().toISOString() };
        updated = true;
        showToast(`Achievement Unlocked: ${ach.title}`, 'success');
      }
    });

    if (updated) {
      setState((prev) => ({ ...prev, achievements }));
    }
  }, [state, showToast]);

  // Check achievements on relevant state changes
  useEffect(() => {
    checkAchievements();
  }, [state.sessions.length, state.tasks.length, state.notes.length]);

  // ============================================
  // Settings Operations
  // ============================================
  const updateSettings = useCallback((updates: Partial<AppState['settings']['timer']>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        timer: {
          ...prev.settings.timer,
          ...updates,
        },
      },
    }));
  }, []);

  // ============================================
  // Favorites Operations
  // ============================================
  const toggleFavorite = useCallback((path: string) => {
    setState((prev) => {
      const favorites = prev.favorites.includes(path)
        ? prev.favorites.filter((f) => f !== path)
        : [...prev.favorites, path];
      return { ...prev, favorites };
    });
  }, []);

  const isFavorite = useCallback(
    (path: string) => state.favorites.includes(path),
    [state.favorites]
  );

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value: GlobalContextType = {
    state,
    updateState,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addProject,
    updateProject,
    deleteProject,
    addCycle,
    updateCycle,
    getActiveCycle,
    addNote,
    updateNote,
    deleteNote,
    addInboxItem,
    convertInboxToTask,
    convertInboxToNote,
    archiveInboxItem,
    addDeck,
    updateDeck,
    deleteDeck,
    addSession,
    updateSession,
    checkAchievements,
    updateSettings,
    toggleFavorite,
    isFavorite,
    toasts,
    showToast,
    dismissToast,
    isZenMode,
    setZenMode,
    commandPaletteOpen,
    setCommandPaletteOpen,
  };

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal must be used within GlobalProvider');
  }
  return context;
};
