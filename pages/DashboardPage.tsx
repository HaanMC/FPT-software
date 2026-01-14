/**
 * Dashboard Page - Study OS Overview
 * Shows: Now, Today's tasks, Due reviews, Current cycle, Recent sessions
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { Card, StatCard, Button, Badge, Progress, EmptyState } from '../components/ui';
import {
  Timer,
  CheckSquare,
  GraduationCap,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  Play,
  ArrowRight,
  Flame,
  BookOpen,
  Brain,
  Inbox,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, getActiveCycle } = useGlobal();

  const today = new Date().toISOString().split('T')[0];

  // Calculate stats
  const stats = useMemo(() => {
    // Today's tasks
    const todayTasks = state.tasks.filter(
      (t) => t.status !== 'done' && t.dueDate === today
    );
    const inProgressTasks = state.tasks.filter((t) => t.status === 'in_progress');

    // Due flashcards
    const dueCards = state.decks.reduce((acc, deck) => {
      return acc + deck.cards.filter((c) => c.nextReviewDate <= today).length;
    }, 0);

    // Today's focus time
    const todayMinutes = state.sessions
      .filter((s) => s.startTime.split('T')[0] === today && s.type === 'focus')
      .reduce((acc, s) => acc + s.durationSeconds / 60, 0);

    // Weekly focus time
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekMinutes = state.sessions
      .filter(
        (s) => new Date(s.startTime) >= weekStart && s.type === 'focus'
      )
      .reduce((acc, s) => acc + s.durationSeconds / 60, 0);

    // Streak calculation
    const focusDates = [...new Set(
      state.sessions
        .filter((s) => s.type === 'focus')
        .map((s) => s.startTime.split('T')[0])
    )].sort().reverse();

    let streak = 0;
    if (focusDates.length > 0) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (focusDates[0] === today || focusDates[0] === yesterdayStr) {
        streak = 1;
        let currentDate = new Date(focusDates[0]);
        for (let i = 1; i < focusDates.length; i++) {
          currentDate.setDate(currentDate.getDate() - 1);
          if (focusDates[i] === currentDate.toISOString().split('T')[0]) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    // Average quiz score
    const quizSessions = state.sessions.filter((s) => s.quizScore !== null);
    const avgQuizScore = quizSessions.length > 0
      ? Math.round(quizSessions.reduce((acc, s) => acc + (s.quizScore || 0), 0) / quizSessions.length)
      : 0;

    return {
      todayTasks,
      inProgressTasks,
      dueCards,
      todayMinutes: Math.round(todayMinutes),
      weekMinutes: Math.round(weekMinutes),
      streak,
      avgQuizScore,
      totalSessions: state.sessions.filter((s) => s.type === 'focus').length,
    };
  }, [state, today]);

  const activeCycle = getActiveCycle();

  // Cycle progress
  const cycleProgress = useMemo(() => {
    if (!activeCycle) return { completed: 0, total: 0, percent: 0 };
    const cycleTasks = state.tasks.filter((t) => t.cycleId === activeCycle.id);
    const completed = cycleTasks.filter((t) => t.status === 'done').length;
    return {
      completed,
      total: cycleTasks.length,
      percent: cycleTasks.length > 0 ? Math.round((completed / cycleTasks.length) * 100) : 0,
    };
  }, [state.tasks, activeCycle]);

  // Recent sessions
  const recentSessions = state.sessions
    .filter((s) => s.type === 'focus')
    .slice(-5)
    .reverse();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}
          </h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button onClick={() => navigate('/timer')}>
          <Play className="w-4 h-4" />
          Start Focus Session
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Today's Focus"
          value={`${stats.todayMinutes} min`}
          icon={<Timer className="w-5 h-5" />}
        />
        <StatCard
          label="Current Streak"
          value={`${stats.streak} days`}
          icon={<Flame className="w-5 h-5 text-orange-500" />}
        />
        <StatCard
          label="Cards Due"
          value={stats.dueCards}
          icon={<GraduationCap className="w-5 h-5" />}
        />
        <StatCard
          label="Avg Quiz Score"
          value={`${stats.avgQuizScore}%`}
          icon={<Target className="w-5 h-5" />}
        />
      </div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              Today's Tasks
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')}>
              View All
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>

          {stats.todayTasks.length === 0 && stats.inProgressTasks.length === 0 ? (
            <EmptyState
              icon={<CheckSquare className="w-12 h-12" />}
              title="No tasks for today"
              description="Add tasks with due dates to see them here"
              action={{ label: 'Add Task', onClick: () => navigate('/tasks') }}
            />
          ) : (
            <div className="space-y-2">
              {[...stats.inProgressTasks, ...stats.todayTasks].slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate('/tasks')}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      task.status === 'in_progress' ? 'bg-amber-500' : 'bg-gray-300'
                    }`}
                  />
                  <span className="flex-1 text-sm truncate">{task.title}</span>
                  <Badge
                    variant={task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'default'}
                    size="sm"
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Review Cards */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-green-600" />
              Flashcard Review
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/flashcards')}>
              Review
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>

          {stats.dueCards === 0 ? (
            <EmptyState
              icon={<Brain className="w-12 h-12" />}
              title="All caught up!"
              description="No flashcards due for review today"
            />
          ) : (
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-green-600">{stats.dueCards}</p>
                <p className="text-sm text-gray-500">cards due today</p>
              </div>
              <Button fullWidth onClick={() => navigate('/flashcards')}>
                <BookOpen className="w-4 h-4" />
                Start Review Session
              </Button>
            </div>
          )}
        </Card>

        {/* Current Cycle */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              Current Cycle
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
              Manage
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>

          {activeCycle ? (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{activeCycle.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(activeCycle.startDate).toLocaleDateString()} -{' '}
                  {new Date(activeCycle.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{cycleProgress.completed}/{cycleProgress.total} tasks</span>
                </div>
                <Progress value={cycleProgress.percent} />
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Calendar className="w-12 h-12" />}
              title="No active cycle"
              description="Create a weekly cycle to track your sprint"
            />
          )}
        </Card>

        {/* Inbox */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Inbox className="w-4 h-4 text-blue-600" />
              Inbox
              {state.inbox.length > 0 && (
                <Badge variant="primary">{state.inbox.length}</Badge>
              )}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/inbox')}>
              Triage
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>

          {state.inbox.length === 0 ? (
            <EmptyState
              icon={<Inbox className="w-12 h-12" />}
              title="Inbox zero!"
              description="Quick captures will appear here"
            />
          ) : (
            <div className="space-y-2">
              {state.inbox.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-2 bg-gray-50 rounded-md text-sm truncate"
                >
                  {item.content}
                </div>
              ))}
              {state.inbox.length > 4 && (
                <p className="text-xs text-gray-500 text-center">
                  +{state.inbox.length - 4} more items
                </p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-600" />
            Recent Sessions
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/sessions')}>
            View All
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>

        {recentSessions.length === 0 ? (
          <EmptyState
            icon={<Timer className="w-12 h-12" />}
            title="No sessions yet"
            description="Start a focus session to begin tracking your progress"
            action={{ label: 'Start Session', onClick: () => navigate('/timer') }}
          />
        ) : (
          <div className="grid md:grid-cols-5 gap-3">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="p-3 bg-gray-50 rounded-lg text-center hover:bg-gray-100 cursor-pointer"
                onClick={() => navigate('/sessions')}
              >
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(session.durationSeconds / 60)}m
                </p>
                <p className="text-xs text-gray-500">{session.subject}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(session.startTime).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Weekly Summary */}
      <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              This Week
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {stats.weekMinutes} minutes focused across {stats.totalSessions} sessions
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/analytics')}>
            View Analytics
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
