import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { GlobalProvider } from './context/GlobalContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import QuizPage from './pages/QuizPage';
import Flashcards from './pages/Flashcards';
import Shop from './pages/Shop';
import Coach from './pages/Coach';
import Stats from './components/Stats'; // Reuse existing stats component but wrapped
import SettingsPage from './pages/SettingsPage';

const App: React.FC = () => {
  return (
    <GlobalProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="quiz" element={<QuizPage />} />
            <Route path="flashcards" element={<Flashcards />} />
            <Route path="shop" element={<Shop />} />
            <Route path="coach" element={<Coach />} />
            <Route path="analytics" element={<Stats onBack={()=>{}} />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </GlobalProvider>
  );
};

export default App;