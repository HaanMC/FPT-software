/**
 * Settings Page - App Configuration
 * Timer settings, appearance, data management
 */

import React, { useRef } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { exportData, importData } from '../lib/storage/store';
import { isAiEnabled } from '../lib/ai/geminiClient';
import { Card, Button, Input, Badge } from '../components/ui';
import {
  Settings,
  Timer,
  Database,
  Download,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Trash2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { state, updateSettings, showToast } = useGlobal();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        const success = importData(ev.target.result as string);
        if (success) {
          showToast('Data imported successfully', 'success');
        } else {
          showToast('Failed to import data', 'error');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    exportData();
    showToast('Data exported', 'success');
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          Settings
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Configure your FocusLearn experience
        </p>
      </div>

      {/* Timer Settings */}
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Timer className="w-5 h-5 text-gray-400" />
          Timer Configuration
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Focus Duration (min)
            </label>
            <input
              type="number"
              min="5"
              max="120"
              value={state.settings.timer.focusMinutes}
              onChange={(e) =>
                updateSettings({ focusMinutes: parseInt(e.target.value) || 25 })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Short Break (min)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={state.settings.timer.shortBreakMinutes}
              onChange={(e) =>
                updateSettings({ shortBreakMinutes: parseInt(e.target.value) || 5 })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Long Break (min)
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={state.settings.timer.longBreakMinutes}
              onChange={(e) =>
                updateSettings({ longBreakMinutes: parseInt(e.target.value) || 15 })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Cycles Before Long Break
            </label>
            <input
              type="number"
              min="2"
              max="8"
              value={state.settings.timer.cyclesBeforeLongBreak}
              onChange={(e) =>
                updateSettings({ cyclesBeforeLongBreak: parseInt(e.target.value) || 4 })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <p className="text-xs text-gray-400">
          After {state.settings.timer.cyclesBeforeLongBreak} focus sessions, you'll get a {state.settings.timer.longBreakMinutes} minute break.
        </p>
      </Card>

      {/* AI Features */}
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gray-400" />
          AI Features
        </h2>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {isAiEnabled() ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">AI Enabled</p>
                  <p className="text-xs text-gray-500">Gemini API key configured</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-medium text-gray-900">AI Disabled</p>
                  <p className="text-xs text-gray-500">
                    Set VITE_GEMINI_API_KEY in your .env file
                  </p>
                </div>
              </>
            )}
          </div>
          <Badge variant={isAiEnabled() ? 'success' : 'warning'}>
            {isAiEnabled() ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <p className="text-xs text-gray-400">
          AI features include quiz generation, flashcard creation, and study coaching.
          Get your API key from{' '}
          <a
            href="https://ai.google.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          >
            Google AI Studio
          </a>
        </p>
      </Card>

      {/* Data Management */}
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-gray-400" />
          Data Management
        </h2>

        <p className="text-sm text-gray-500">
          Export your progress to transfer devices or keep a backup. All data is stored locally in your browser.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export Data
          </Button>

          <div className="relative">
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4" />
              Import Data
            </Button>
            <input
              type="file"
              ref={fileRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
          </div>

          <Button variant="danger" onClick={handleClearData}>
            <Trash2 className="w-4 h-4" />
            Clear All Data
          </Button>
        </div>

        <div className="text-xs text-gray-400 space-y-1 pt-2">
          <p>Storage used: ~{(JSON.stringify(state).length / 1024).toFixed(1)} KB</p>
          <p>Schema version: {state.schemaVersion}</p>
        </div>
      </Card>

      {/* Stats Summary */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Data Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Tasks</p>
            <p className="text-xl font-bold text-gray-900">{state.tasks.length}</p>
          </div>
          <div>
            <p className="text-gray-500">Notes</p>
            <p className="text-xl font-bold text-gray-900">{state.notes.length}</p>
          </div>
          <div>
            <p className="text-gray-500">Flashcard Decks</p>
            <p className="text-xl font-bold text-gray-900">{state.decks.length}</p>
          </div>
          <div>
            <p className="text-gray-500">Sessions</p>
            <p className="text-xl font-bold text-gray-900">{state.sessions.length}</p>
          </div>
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 pt-4">
        <p>FocusLearn v3.0 - Study OS</p>
        <p className="mt-1">Built with React, TypeScript, and Tailwind CSS</p>
      </div>
    </div>
  );
};

export default SettingsPage;
