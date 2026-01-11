import React, { useState, useEffect } from 'react';
import Button from './Button';

interface BreakProps {
  durationMinutes: number;
  onEnd: () => void;
}

const Break: React.FC<BreakProps> = ({ durationMinutes, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
        onEnd();
        return;
    }
    const timer = setInterval(() => {
      setTimeLeft(p => p - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onEnd]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-teal-50 space-y-8 animate-in zoom-in duration-300">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-teal-800">Break Time!</h2>
        <p className="text-teal-600 mt-2">Relax, stretch, and breathe.</p>
      </div>
      
      <div className="text-6xl font-mono font-bold text-teal-600 bg-white px-8 py-4 rounded-2xl shadow-sm border border-teal-100">
        {formatTime(timeLeft)}
      </div>

      <Button onClick={onEnd} variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
        Skip Break
      </Button>
    </div>
  );
};

export default Break;