/**
 * Stats Component
 * Displays user statistics including:
 * - Total focus minutes
 * - Sessions completed
 * - Average quiz score
 * - Streak days
 * - 7-day activity chart (plain HTML/CSS bars)
 */

import React, { useEffect, useState } from 'react';
import { getStats } from '../services/storageService';
import { UserStats } from '../types';
import Button from './Button';

interface StatsProps {
  onBack: () => void;
}

const Stats: React.FC<StatsProps> = ({ onBack }) => {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    setStats(getStats());
  }, []);

  if (!stats) return null;

  // Get the maximum minutes for scaling the chart bars
  const maxMinutes = Math.max(...stats.history.map(h => h.minutes), 1);

  // Format date for display (e.g., "Mon", "Tue")
  const formatDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Format date for tooltip (e.g., "Jan 15")
  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pt-8 pb-20">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button onClick={onBack} variant="outline" className="mr-4">
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Your Progress</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Total Focus */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs uppercase font-bold tracking-wide">
            Total Focus
          </p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {stats.totalFocusMinutes}
            <span className="text-sm text-gray-400 ml-1">min</span>
          </p>
        </div>

        {/* Sessions */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs uppercase font-bold tracking-wide">
            Sessions
          </p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {stats.sessionsCompleted}
          </p>
        </div>

        {/* Average Score */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs uppercase font-bold tracking-wide">
            Avg Score
          </p>
          <p className="text-2xl font-bold text-teal-600 mt-1">
            {stats.averageQuizScore}%
          </p>
        </div>

        {/* Streak */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs uppercase font-bold tracking-wide">
            Streak
          </p>
          <p className="text-2xl font-bold text-amber-500 mt-1">
            {stats.streakDays}
            <span className="text-sm text-gray-400 ml-1">days</span>
          </p>
        </div>
      </div>

      {/* 7-Day Activity Chart (Plain HTML/CSS) */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-6">
          Last 7 Days Activity
        </h3>

        {stats.history.some(h => h.minutes > 0) ? (
          <div className="space-y-4">
            {/* Bar Chart */}
            <div className="flex items-end justify-between h-40 gap-2">
              {stats.history.map((day, idx) => {
                const heightPercent = maxMinutes > 0 ? (day.minutes / maxMinutes) * 100 : 0;
                const isToday = idx === stats.history.length - 1;

                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center group"
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {day.minutes} min
                    </div>

                    {/* Bar */}
                    <div className="w-full flex items-end justify-center h-32">
                      <div
                        className={`w-8 md:w-12 rounded-t-lg transition-all duration-300 ${
                          isToday ? 'bg-indigo-500' : 'bg-indigo-300'
                        } ${day.minutes === 0 ? 'bg-gray-100' : ''}`}
                        style={{
                          height: `${Math.max(heightPercent, day.minutes > 0 ? 8 : 4)}%`,
                          minHeight: day.minutes > 0 ? '8px' : '4px'
                        }}
                      />
                    </div>

                    {/* Day label */}
                    <p className={`text-xs mt-2 ${isToday ? 'font-bold text-indigo-600' : 'text-gray-400'}`}>
                      {formatDayName(day.date)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-indigo-500 rounded" />
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-indigo-300 rounded" />
                  <span>Past days</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Total: {stats.history.reduce((acc, h) => acc + h.minutes, 0)} min this week
              </p>
            </div>
          </div>
        ) : (
          <div className="h-40 flex flex-col items-center justify-center text-gray-400">
            <div className="text-4xl mb-2">:(</div>
            <p>No activity yet. Complete a session to see charts!</p>
          </div>
        )}
      </div>

      {/* Activity List (Alternative lightweight view) */}
      <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Daily Breakdown
        </h3>
        <div className="space-y-2">
          {stats.history.slice().reverse().map((day, idx) => (
            <div
              key={day.date}
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    day.minutes > 0 ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
                <span className="text-sm text-gray-600">
                  {formatDateShort(day.date)}
                </span>
                {idx === 0 && (
                  <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </div>
              <div className="text-sm font-medium text-gray-800">
                {day.minutes > 0 ? `${day.minutes} min` : '-'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;
