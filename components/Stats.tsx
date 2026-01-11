import React, { useEffect, useState } from 'react';
import { getStats } from '../services/storageService';
import { UserStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Button from './Button';

const Stats: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    setStats(getStats());
  }, []);

  if (!stats) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 pt-8">
      <div className="flex items-center mb-8">
        <Button onClick={onBack} variant="outline" className="mr-4">← Back</Button>
        <h1 className="text-2xl font-bold text-gray-800">Your Progress</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs uppercase font-bold">Total Focus</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.totalFocusMinutes} <span className="text-sm text-gray-400">min</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs uppercase font-bold">Sessions</p>
          <p className="text-2xl font-bold text-gray-800">{stats.sessionsCompleted}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs uppercase font-bold">Avg Score</p>
          <p className="text-2xl font-bold text-teal-600">{stats.averageQuizScore}%</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs uppercase font-bold">Streak</p>
          <p className="text-2xl font-bold text-amber-500">{stats.streakDays} <span className="text-sm text-gray-400">days</span></p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-80">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Last 7 Days Activity (Minutes)</h3>
        {stats.history.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={(val) => val.slice(5)} />
                <YAxis hide />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    cursor={{fill: '#f3f4f6'}}
                />
                <Bar dataKey="minutes" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            No activity yet. Complete a session to see charts!
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;