/**
 * FocusApp - Main Pomodoro Focus Timer Page
 *
 * Orchestrates the complete focus session flow:
 * 1. Home Screen: Select subject, set focus/break durations
 * 2. Timer: Countdown with pause/resume/stop
 * 3. Quiz: 10 questions after timer completes
 * 4. Results: Pass (>=80%) -> Break, Fail (<80%) -> Review + Retry
 * 5. Retry Quiz: 5 questions on failed topics (one chance)
 * 6. Break: Countdown before returning home
 *
 * State Machine:
 * HOME -> TIMER -> QUIZ -> (PASSED) -> BREAK -> HOME
 *                      -> (FAILED) -> RETRY_QUIZ -> (PASSED) -> BREAK -> HOME
 *                                                -> (FAILED) -> HOME
 */

import React, { useState, useCallback } from 'react';
import { SessionConfig, QuizData, QuizQuestion } from '../types';
import { generateQuiz, generateRetryQuiz } from '../services/geminiService';
import { recordFocusSession, recordQuizResult } from '../services/storageService';
import HomeTimer from '../components/HomeTimer';
import Quiz from '../components/Quiz';
import Break from '../components/Break';
import Stats from '../components/Stats';

// App screens for the focus session flow
type Screen = 'home' | 'quiz' | 'break' | 'stats';

const FocusApp: React.FC = () => {
  // Current screen in the flow
  const [screen, setScreen] = useState<Screen>('home');

  // Session configuration from home screen
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);

  // Quiz state
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isRetryMode, setIsRetryMode] = useState(false);
  const [incorrectQuestions, setIncorrectQuestions] = useState<QuizQuestion[]>([]);

  /**
   * Handle focus session completion
   * Records the session and generates quiz
   */
  const handleSessionComplete = useCallback(async (
    config: SessionConfig,
    actualMinutes: number
  ) => {
    setSessionConfig(config);

    // Record focus session to localStorage
    recordFocusSession(actualMinutes * 60, config.subject);

    // Generate quiz for the subject
    setScreen('quiz');
    setIsLoadingQuiz(true);
    setIsRetryMode(false);

    try {
      const quiz = await generateQuiz(config.subject, 'easy');
      setQuizData(quiz);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    } finally {
      setIsLoadingQuiz(false);
    }
  }, []);

  /**
   * Handle quiz completion
   * Determines next step based on score
   */
  const handleQuizComplete = useCallback((
    score: number,
    passed: boolean,
    wrongQuestions: QuizQuestion[]
  ) => {
    // Record quiz result
    if (sessionConfig) {
      recordQuizResult(score, sessionConfig.subject);
    }

    if (passed) {
      // User passed - go to break
      setScreen('break');
    } else {
      // User failed - either end session or go back home
      setScreen('home');
      resetSession();
    }
  }, [sessionConfig]);

  /**
   * Handle retry request
   * Generates a 5-question quiz on failed topics
   */
  const handleRetryRequest = useCallback(async () => {
    if (!sessionConfig || incorrectQuestions.length === 0) {
      setScreen('home');
      return;
    }

    setIsLoadingQuiz(true);
    setIsRetryMode(true);

    try {
      const retryQuiz = await generateRetryQuiz(
        sessionConfig.subject,
        incorrectQuestions
      );
      setQuizData(retryQuiz);
    } catch (error) {
      console.error('Failed to generate retry quiz:', error);
    } finally {
      setIsLoadingQuiz(false);
    }
  }, [sessionConfig, incorrectQuestions]);

  /**
   * Store incorrect questions for potential retry
   */
  const handleQuizCompleteWithTracking = useCallback((
    score: number,
    passed: boolean,
    wrongQuestions: QuizQuestion[]
  ) => {
    setIncorrectQuestions(wrongQuestions);
    handleQuizComplete(score, passed, wrongQuestions);
  }, [handleQuizComplete]);

  /**
   * Reset session state
   */
  const resetSession = () => {
    setSessionConfig(null);
    setQuizData(null);
    setIsRetryMode(false);
    setIncorrectQuestions([]);
  };

  /**
   * Handle break completion
   * Returns to home screen
   */
  const handleBreakEnd = useCallback(() => {
    setScreen('home');
    resetSession();
  }, []);

  /**
   * Navigate to stats screen
   */
  const goToStats = useCallback(() => {
    setScreen('stats');
  }, []);

  /**
   * Navigate back home from any screen
   */
  const goHome = useCallback(() => {
    setScreen('home');
    resetSession();
  }, []);

  // Render current screen
  switch (screen) {
    case 'quiz':
      return (
        <div className="h-full overflow-y-auto">
          <Quiz
            quizData={quizData}
            isLoading={isLoadingQuiz}
            isRetry={isRetryMode}
            onQuizComplete={handleQuizCompleteWithTracking}
            onRequestRetry={handleRetryRequest}
            onHome={goHome}
          />
        </div>
      );

    case 'break':
      return (
        <div className="h-full">
          <Break
            durationMinutes={sessionConfig?.breakMinutes || 5}
            onEnd={handleBreakEnd}
          />
        </div>
      );

    case 'stats':
      return (
        <div className="h-full overflow-y-auto">
          <Stats onBack={goHome} />
        </div>
      );

    case 'home':
    default:
      return (
        <div className="h-full overflow-y-auto">
          <HomeTimer
            onSessionComplete={handleSessionComplete}
            goToStats={goToStats}
          />
        </div>
      );
  }
};

export default FocusApp;
