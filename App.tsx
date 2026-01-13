/**
 * FocusLearn App
 * A Pomodoro-style focus timer with quiz-based rewards
 *
 * Main Flow:
 * 1. Home: Select subject and set timer durations
 * 2. Timer: Focus countdown with pause/resume
 * 3. Quiz: 10 questions to unlock break
 * 4. Break: Earned break time
 *
 * Features:
 * - Multiple subjects (Math, English, Physics, History, Custom)
 * - AI-generated quizzes via Gemini API
 * - Fallback local question bank
 * - Stats tracking with streak logic
 * - Responsive UI
 */

import React from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { GlobalProvider } from './context/GlobalContext';
import Layout from './components/Layout';
import FocusApp from './pages/FocusApp';
import QuizPage from './pages/QuizPage';
import Flashcards from './pages/Flashcards';
import Shop from './pages/Shop';
import Coach from './pages/Coach';
import Stats from './components/Stats';
import SettingsPage from './pages/SettingsPage';

// Wrapper component for Stats to enable navigation
const StatsWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <Stats onBack={() => navigate('/')} />;
};

const App: React.FC = () => {
  return (
    <GlobalProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Main Focus Timer App */}
            <Route index element={<FocusApp />} />

            {/* Other features */}
            <Route path="quiz" element={<QuizPage />} />
            <Route path="flashcards" element={<Flashcards />} />
            <Route path="shop" element={<Shop />} />
            <Route path="coach" element={<Coach />} />
            <Route path="analytics" element={<StatsWrapper />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </GlobalProvider>
  );
};

export default App;
