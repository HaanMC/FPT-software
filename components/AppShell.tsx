/**
 * AppShell - Main application layout
 * Combines Sidebar, Topbar, and main content area
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CommandPalette from './CommandPalette';
import ToastContainer from './ToastContainer';

export const AppShell: React.FC = () => {
  const { isZenMode, state } = useGlobal();

  // Theme classes
  const themeClasses: Record<string, string> = {
    light: 'bg-gray-50 text-gray-900',
    dark: 'bg-gray-900 text-gray-100',
    navy: 'bg-slate-900 text-slate-100',
    forest: 'bg-stone-900 text-emerald-50',
  };

  const theme = state.settings.theme || 'light';

  // Zen mode - hide sidebar and topbar for distraction-free focus
  if (isZenMode) {
    return (
      <div className={`h-full w-full ${themeClasses[theme]}`}>
        <main className="h-full w-full overflow-hidden">
          <Outlet />
        </main>
        <CommandPalette />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className={`h-full w-full flex ${themeClasses[theme]}`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Command Palette (Global) */}
      <CommandPalette />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default AppShell;
