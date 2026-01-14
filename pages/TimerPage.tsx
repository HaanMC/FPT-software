/**
 * Timer Page - Focus Timer with Zen Mode & Distraction Logging
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { Card, Button, Badge, Select, Modal } from '../components/ui';
import { SessionConfig, DistractionLog } from '../types';
import { SUBJECTS, FOCUS_TIPS, DISTRACTION_CATEGORIES, BREAK_ACTIVITIES } from '../constants';
import { generateQuiz, generateRetryQuiz } from '../lib/ai/geminiClient';
import {
  Play,
  Pause,
  Square,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Coffee,
  Timer as TimerIcon,
  Zap,
  Volume2,
  X,
  Check,
} from 'lucide-react';

type TimerState = 'idle' | 'running' | 'paused' | 'completed';
type FlowState = 'setup' | 'focus' | 'quiz' | 'break';

export const TimerPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, addSession, setZenMode, isZenMode, showToast } = useGlobal();

  // Timer state
  const [flowState, setFlowState] = useState<FlowState>('setup');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [config, setConfig] = useState<SessionConfig>({
    subject: SUBJECTS[0],
    focusMinutes: 25,
    breakMinutes: 5,
  });

  // Session tracking
  const [distractions, setDistractions] = useState<DistractionLog[]>([]);
  const [showDistractionModal, setShowDistractionModal] = useState(false);
  const [breakPlan, setBreakPlan] = useState<string[]>([]);
  const [showBreakPlanModal, setShowBreakPlanModal] = useState(false);
  const [currentTip, setCurrentTip] = useState(FOCUS_TIPS[0]);

  // Refs
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          if (flowState === 'focus') {
            timerState === 'running' ? handlePause() : handleResume();
          }
          break;
        case 'r':
          if (flowState === 'focus' && timerState !== 'running') {
            handleReset();
          }
          break;
        case 'z':
          setZenMode(!isZenMode);
          break;
        case 'escape':
          if (isZenMode) setZenMode(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timerState, flowState, isZenMode, setZenMode]);

  // Timer countdown
  useEffect(() => {
    if (timerState === 'running' && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState]);

  const handleStart = () => {
    setTimeLeft(config.focusMinutes * 60);
    startTimeRef.current = Date.now();
    setTimerState('running');
    setFlowState('focus');
    setCurrentTip(FOCUS_TIPS[Math.floor(Math.random() * FOCUS_TIPS.length)]);
    setDistractions([]);
    setBreakPlan([]);
  };

  const handlePause = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerState('paused');
  };

  const handleResume = () => {
    setTimerState('running');
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(config.focusMinutes * 60);
    setTimerState('idle');
    setFlowState('setup');
    setDistractions([]);
  };

  const handleTimerComplete = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerState('completed');

    // Calculate actual focus time
    const actualSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

    // Record the session
    const session = addSession({
      startTime: new Date(startTimeRef.current).toISOString(),
      endTime: new Date().toISOString(),
      type: 'focus',
      durationSeconds: actualSeconds,
      projectId: state.projects.find((p) => p.name === config.subject)?.id || null,
      linkedTaskId: config.linkedTaskId || null,
      linkedNoteId: null,
      subject: config.subject,
      distractions: distractions,
      quizScore: null,
      phaseCount: 1,
      breakPlan: breakPlan.map((b) => ({ activity: b, completed: false })),
      notes: '',
    });

    sessionIdRef.current = session.id;
    showToast('Focus session completed!', 'success');

    // Go to quiz
    setFlowState('quiz');
    navigate('/quiz');
  }, [config, distractions, breakPlan, addSession, showToast, navigate, state.projects]);

  const handleLogDistraction = (category: string, note: string = '') => {
    const log: DistractionLog = {
      id: `dist_${Date.now()}`,
      category,
      note,
      timestamp: new Date().toISOString(),
    };
    setDistractions((prev) => [...prev, log]);
    setShowDistractionModal(false);
    showToast('Distraction logged', 'info');
  };

  const toggleBreakActivity = (activityId: string) => {
    setBreakPlan((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    );
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = flowState === 'focus'
    ? 100 - (timeLeft / (config.focusMinutes * 60)) * 100
    : 0;

  // Project options
  const projectOptions = state.projects.map((p) => ({ value: p.name, label: p.name }));

  // ============================================
  // Zen Mode (Fullscreen Timer)
  // ============================================
  if (isZenMode && flowState === 'focus') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-indigo-900 flex flex-col items-center justify-center z-50">
        {/* Exit button */}
        <button
          onClick={() => setZenMode(false)}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors"
        >
          <Minimize2 className="w-6 h-6" />
        </button>

        {/* Timer */}
        <div className="text-center">
          <p className="text-white/60 text-lg mb-4">{config.subject}</p>
          <div className="text-[10rem] font-mono font-bold text-white tracking-tight">
            {formatTime(timeLeft)}
          </div>
          <p className="text-white/40 mt-4 italic max-w-md mx-auto">"{currentTip}"</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-12">
          {timerState === 'running' ? (
            <button
              onClick={handlePause}
              className="p-6 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <Pause className="w-8 h-8 text-white" />
            </button>
          ) : (
            <button
              onClick={handleResume}
              className="p-6 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <Play className="w-8 h-8 text-white" />
            </button>
          )}

          <button
            onClick={() => setShowDistractionModal(true)}
            className="p-4 bg-amber-500/20 rounded-full hover:bg-amber-500/30 transition-colors"
          >
            <AlertTriangle className="w-6 h-6 text-amber-400" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-indigo-500 transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Keyboard hints */}
        <div className="absolute bottom-6 text-white/30 text-xs flex gap-6">
          <span>Space: Pause/Resume</span>
          <span>Z: Exit Zen</span>
        </div>

        {/* Distraction Modal */}
        {showDistractionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
            <Card className="w-full max-w-sm p-4 bg-gray-800 border-gray-700">
              <h3 className="font-semibold text-white mb-4">Log Distraction</h3>
              <div className="grid grid-cols-2 gap-2">
                {DISTRACTION_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleLogDistraction(cat.id)}
                    className="p-3 bg-gray-700 rounded-lg text-white text-sm hover:bg-gray-600 transition-colors"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <Button
                variant="ghost"
                fullWidth
                className="mt-4 text-gray-400"
                onClick={() => setShowDistractionModal(false)}
              >
                Cancel
              </Button>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // ============================================
  // Setup Screen
  // ============================================
  if (flowState === 'setup') {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Focus Timer</h1>
          <p className="text-gray-500 mt-2">Configure and start your study session</p>
        </div>

        <Card className="p-6 space-y-6">
          {/* Subject */}
          <Select
            label="Subject"
            options={projectOptions}
            value={config.subject}
            onChange={(e) => setConfig({ ...config, subject: e.target.value })}
          />

          {/* Focus Duration */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Focus Duration: <span className="text-indigo-600 font-bold">{config.focusMinutes} min</span>
            </label>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={config.focusMinutes}
              onChange={(e) => setConfig({ ...config, focusMinutes: parseInt(e.target.value) })}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5 min</span>
              <span>25 min</span>
              <span>60 min</span>
            </div>
          </div>

          {/* Break Duration */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Break Duration: <span className="text-teal-600 font-bold">{config.breakMinutes} min</span>
            </label>
            <input
              type="range"
              min="1"
              max="15"
              value={config.breakMinutes}
              onChange={(e) => setConfig({ ...config, breakMinutes: parseInt(e.target.value) })}
              className="w-full accent-teal-500"
            />
          </div>

          {/* Break Plan */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Plan Your Break (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {BREAK_ACTIVITIES.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => toggleBreakActivity(activity.id)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    breakPlan.includes(activity.id)
                      ? 'bg-teal-50 border-teal-500 text-teal-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {activity.label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleStart} fullWidth size="lg">
            <Play className="w-5 h-5" />
            Start Focus Session
          </Button>
        </Card>

        {/* Keyboard shortcuts hint */}
        <p className="text-xs text-gray-400 text-center mt-6">
          Keyboard: Space = Pause/Resume, Z = Zen Mode, R = Reset
        </p>
      </div>
    );
  }

  // ============================================
  // Focus Timer Screen
  // ============================================
  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <Badge variant="primary">{config.subject}</Badge>
        <p className="text-gray-500 mt-2 italic text-sm">"{currentTip}"</p>
      </div>

      {/* Circular Timer */}
      <div className="relative w-72 h-72 mb-8">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="6"
          />
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={timerState === 'paused' ? '#9ca3af' : '#6366f1'}
            strokeWidth="6"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * progressPercent) / 100}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-6xl font-mono font-bold ${timerState === 'paused' ? 'text-gray-400' : 'text-gray-900'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-8">
        {timerState === 'running' ? (
          <Button variant="secondary" size="lg" onClick={handlePause}>
            <Pause className="w-5 h-5" />
            Pause
          </Button>
        ) : (
          <Button size="lg" onClick={handleResume}>
            <Play className="w-5 h-5" />
            Resume
          </Button>
        )}

        <Button variant="ghost" onClick={handleReset}>
          <Square className="w-5 h-5" />
          Stop
        </Button>

        <Button variant="ghost" onClick={() => setZenMode(true)}>
          <Maximize2 className="w-5 h-5" />
          Zen
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDistractionModal(true)}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Log Distraction
          {distractions.length > 0 && (
            <Badge variant="warning" size="sm">{distractions.length}</Badge>
          )}
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mt-8">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          {Math.round(progressPercent)}% complete
        </p>
      </div>

      {/* Distraction Modal */}
      <Modal
        open={showDistractionModal}
        onClose={() => setShowDistractionModal(false)}
        title="Log Distraction"
      >
        <p className="text-sm text-gray-500 mb-4">
          What distracted you? This helps identify patterns.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {DISTRACTION_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleLogDistraction(cat.id)}
              className="p-3 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition-colors text-left"
            >
              {cat.label}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default TimerPage;
