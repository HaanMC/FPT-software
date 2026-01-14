/**
 * FocusLearn v3.0 - Study OS
 * A Notion/Linear-inspired productivity app for focused study
 *
 * Features:
 * - Dashboard with stats and quick access
 * - Inbox for quick capture
 * - Tasks with status/priority management
 * - Projects (subjects) and weekly cycles
 * - Notes with markdown and [[backlinks]]
 * - Flashcards with SM-2 spaced repetition
 * - Focus Timer with Zen mode and distraction logging
 * - Quiz-based break rewards
 * - Session history and analytics
 * - AI features via Gemini (optional)
 */

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalProvider } from './context/GlobalContext';
import AppShell from './components/AppShell';

// Pages
import DashboardPage from './pages/DashboardPage';
import InboxPage from './pages/InboxPage';
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import NotesPage from './pages/NotesPage';
import FlashcardsPage from './pages/FlashcardsPage';
import TimerPage from './pages/TimerPage';
import QuizPage from './pages/QuizPage';
import SessionsPage from './pages/SessionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

const App: React.FC = () => {
  return (
    <GlobalProvider>
      <HashRouter>
        <Routes>
          {/* Main app with sidebar/topbar */}
          <Route path="/" element={<AppShell />}>
            {/* Dashboard as default */}
            <Route index element={<DashboardPage />} />

            {/* Core features */}
            <Route path="inbox" element={<InboxPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="flashcards" element={<FlashcardsPage />} />

            {/* Timer & Quiz flow */}
            <Route path="timer" element={<TimerPage />} />
            <Route path="quiz" element={<QuizPage />} />

            {/* History & Analytics */}
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />

            {/* Settings */}
            <Route path="settings" element={<SettingsPage />} />

            {/* Legacy redirects */}
            <Route path="shop" element={<Navigate to="/" replace />} />
            <Route path="coach" element={<Navigate to="/" replace />} />
          </Route>

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </GlobalProvider>
  );
};

export default App;
