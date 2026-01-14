/**
 * Topbar Component - Linear-inspired header
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import {
  ChevronRight,
  Search,
  Plus,
  Star,
  StarOff,
  Command,
  Bell,
} from 'lucide-react';
import { Button, Kbd, Badge } from './ui';

// Route title mapping
const routeTitles: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Your study overview' },
  '/inbox': { title: 'Inbox', subtitle: 'Quick capture & triage' },
  '/tasks': { title: 'Tasks', subtitle: 'Manage your work' },
  '/projects': { title: 'Projects', subtitle: 'Subjects & cycles' },
  '/notes': { title: 'Notes', subtitle: 'Your knowledge base' },
  '/flashcards': { title: 'Flashcards', subtitle: 'Spaced repetition' },
  '/timer': { title: 'Focus Timer', subtitle: 'Pomodoro sessions' },
  '/sessions': { title: 'Session History', subtitle: 'Review past sessions' },
  '/analytics': { title: 'Analytics', subtitle: 'Track your progress' },
  '/settings': { title: 'Settings', subtitle: 'Configure your workspace' },
};

export const Topbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setCommandPaletteOpen, toggleFavorite, isFavorite, state } = useGlobal();

  const currentPath = location.pathname;
  const { title, subtitle } = routeTitles[currentPath] || { title: 'FocusLearn' };
  const isFav = isFavorite(currentPath);

  // Quick actions based on current route
  const getQuickActions = () => {
    switch (currentPath) {
      case '/tasks':
        return (
          <Button size="sm" onClick={() => setCommandPaletteOpen(true)}>
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        );
      case '/notes':
        return (
          <Button size="sm" onClick={() => setCommandPaletteOpen(true)}>
            <Plus className="w-4 h-4" />
            New Note
          </Button>
        );
      case '/inbox':
        return (
          <Button size="sm" onClick={() => setCommandPaletteOpen(true)}>
            <Plus className="w-4 h-4" />
            Quick Capture
          </Button>
        );
      case '/flashcards':
        return (
          <Button size="sm" onClick={() => setCommandPaletteOpen(true)}>
            <Plus className="w-4 h-4" />
            New Deck
          </Button>
        );
      default:
        return null;
    }
  };

  // Calculate notifications
  const inboxCount = state.inbox.length;
  const dueCards = state.decks.reduce((acc, deck) => {
    const today = new Date().toISOString().split('T')[0];
    return acc + deck.cards.filter((c) => c.nextReviewDate <= today).length;
  }, 0);
  const totalNotifications = inboxCount + (dueCards > 0 ? 1 : 0);

  return (
    <header className="flex items-center justify-between h-14 px-4 bg-white border-b border-gray-200">
      {/* Left: Title & Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <button
            onClick={() => toggleFavorite(currentPath)}
            className={`p-1 rounded transition-colors ${
              isFav ? 'text-amber-500 hover:text-amber-600' : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            {isFav ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
          </button>
        </div>
        {subtitle && (
          <span className="text-sm text-gray-500 hidden md:inline">{subtitle}</span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:border-gray-300 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
          <div className="flex items-center gap-1">
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </div>
        </button>

        {/* Quick Actions */}
        {getQuickActions()}

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
          <Bell className="w-5 h-5" />
          {totalNotifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {totalNotifications}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Topbar;
