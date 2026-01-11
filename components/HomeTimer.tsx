import React, { useState, useEffect, useRef } from 'react';
import { SessionConfig, AppScreen } from '../types';
import { SUBJECTS, FOCUS_TIPS } from '../constants';
import Button from './Button';

interface HomeTimerProps {
  onSessionComplete: (config: SessionConfig) => void;
  goToStats: () => void;
}

const HomeTimer: React.FC<HomeTimerProps> = ({ onSessionComplete, goToStats }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [config, setConfig] = useState<SessionConfig>({
    subject: SUBJECTS[0],
    focusMinutes: 25,
    breakMinutes: 5
  });
  const [customSubject, setCustomSubject] = useState("");
  
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [tip, setTip] = useState(FOCUS_TIPS[0]);
  
  const timerRef = useRef<number | null>(null);

  // Random tip every session start
  useEffect(() => {
    setTip(FOCUS_TIPS[Math.floor(Math.random() * FOCUS_TIPS.length)]);
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Timer finished
      handleStop();
      onSessionComplete(config);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, timeLeft, onSessionComplete, config]);

  const handleStart = () => {
    const minutes = config.focusMinutes;
    setTimeLeft(minutes * 60);
    setIsRunning(true);
    setIsPaused(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = 100 - (timeLeft / (config.focusMinutes * 60)) * 100;

  if (isRunning) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-700">Focusing: {config.subject === 'Custom' ? customSubject : config.subject}</h2>
          <p className="text-gray-500 text-sm italic">"{tip}"</p>
        </div>

        {/* Timer Circle or Bar */}
        <div className="relative w-64 h-64 flex items-center justify-center bg-white rounded-full shadow-xl border-4 border-indigo-100">
            <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e7ff" strokeWidth="6" />
              <circle 
                cx="50" cy="50" r="45" fill="none" stroke="#4f46e5" strokeWidth="6" 
                strokeDasharray="283" 
                strokeDashoffset={283 - (283 * progressPercent) / 100}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="text-5xl font-mono font-bold text-indigo-600">
                {formatTime(timeLeft)}
            </div>
        </div>

        <div className="flex space-x-4">
          {!isPaused ? (
            <Button onClick={() => setIsPaused(true)} variant="secondary">Pause</Button>
          ) : (
            <Button onClick={() => setIsPaused(false)} variant="primary">Resume</Button>
          )}
          <Button onClick={handleStop} variant="danger">Stop</Button>
        </div>
      </div>
    );
  }

  // Setup Screen
  return (
    <div className="max-w-md mx-auto space-y-8 pt-10 px-4">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-indigo-600 tracking-tight">FocusLearn</h1>
        <p className="text-gray-500">Master your subjects, one session at a time.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6 border border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <div className="grid grid-cols-3 gap-2">
            {SUBJECTS.map((sub) => (
              <button
                key={sub}
                onClick={() => setConfig({ ...config, subject: sub })}
                className={`p-2 text-sm rounded-lg border ${
                  config.subject === sub 
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
          {config.subject === 'Custom' && (
             <input
             type="text"
             placeholder="Enter topic..."
             className="mt-2 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
             value={customSubject}
             onChange={(e) => setCustomSubject(e.target.value)}
           />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Focus Duration: <span className="text-indigo-600 font-bold">{config.focusMinutes} min</span>
          </label>
          <input
            type="range"
            min="1"
            max="60"
            value={config.focusMinutes}
            onChange={(e) => setConfig({ ...config, focusMinutes: parseInt(e.target.value) })}
            className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Break Duration: <span className="text-teal-600 font-bold">{config.breakMinutes} min</span>
          </label>
          <input
            type="range"
            min="1"
            max="15"
            value={config.breakMinutes}
            onChange={(e) => setConfig({ ...config, breakMinutes: parseInt(e.target.value) })}
            className="w-full accent-teal-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <Button onClick={handleStart} fullWidth size="lg">Start Focus Session</Button>
      </div>
      
      <div className="text-center">
        <button onClick={goToStats} className="text-sm text-gray-500 hover:text-indigo-600 underline">
            View Stats
        </button>
      </div>
    </div>
  );
};

export default HomeTimer;