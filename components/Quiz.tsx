import React, { useState, useEffect } from 'react';
import { QuizData, AppScreen } from '../types';
import Button from './Button';

interface QuizProps {
  quizData: QuizData | null;
  isLoading: boolean;
  isRetry: boolean;
  onQuizComplete: (score: number, passed: boolean) => void;
  onRetry: () => void;
  onHome: () => void;
}

const Quiz: React.FC<QuizProps> = ({ 
  quizData, 
  isLoading, 
  isRetry, 
  onQuizComplete, 
  onRetry,
  onHome 
}) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Reset state when new quiz data loads
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  }, [quizData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Generating your quiz with AI...</p>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500">Failed to load quiz.</p>
        <Button onClick={onHome} className="mt-4">Back Home</Button>
      </div>
    );
  }

  const handleSelect = (qIndex: number, choice: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: choice }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    quizData.questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) correctCount++;
    });

    const finalScore = (correctCount / quizData.questions.length) * 100;
    setScore(finalScore);
    setSubmitted(true);
  };

  const passed = score >= 80;

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-6 pb-20">
        <div className={`text-center p-6 rounded-xl shadow-md text-white ${passed ? 'bg-green-500' : 'bg-amber-500'}`}>
          <h2 className="text-3xl font-bold">{passed ? 'Break Unlocked!' : 'Keep Trying!'}</h2>
          <p className="text-lg mt-2">You scored {Math.round(score)}%</p>
          <p className="text-sm opacity-90">{passed ? 'Great job! Enjoy your break.' : 'Review your mistakes below.'}</p>
        </div>

        {/* Review Section */}
        <div className="space-y-6">
          {quizData.questions.map((q, idx) => {
            const userAnswer = answers[idx];
            const isCorrect = userAnswer === q.answer;
            // Only show wrong answers if failed, or show all if desired. 
            // Prompt implies listing incorrect ones for review. Let's show all with highlighting.
            return (
              <div key={idx} className={`bg-white p-4 rounded-lg shadow border-l-4 ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                <p className="font-medium text-gray-800 mb-2">{idx + 1}. {q.q}</p>
                <div className="space-y-1 text-sm">
                   {/* Show User Choice */}
                   <p className={isCorrect ? 'text-green-700' : 'text-red-600'}>
                     You selected: {userAnswer ? `${userAnswer}: ${q.choices[userAnswer as keyof typeof q.choices]}` : 'No Answer'}
                   </p>
                   {!isCorrect && (
                     <p className="text-green-700 font-semibold">
                       Correct Answer: {q.answer}: {q.choices[q.answer]}
                     </p>
                   )}
                   <p className="text-gray-500 mt-2 text-xs italic bg-gray-50 p-2 rounded">
                     💡 {q.explanation}
                   </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex justify-center space-x-4 shadow-lg">
            {passed ? (
                <Button onClick={() => onQuizComplete(score, true)} fullWidth className="max-w-xs">Start Break</Button>
            ) : (
                <>
                  {!isRetry ? (
                      <Button onClick={onRetry} variant="secondary" fullWidth className="max-w-xs">Retry (Mini Quiz)</Button>
                  ) : (
                      <div className="text-sm text-gray-500 flex items-center">No more retries this session.</div>
                  )}
                  <Button onClick={() => onQuizComplete(score, false)} variant="outline" fullWidth className="max-w-xs">Finish Session</Button>
                </>
            )}
        </div>
      </div>
    );
  }

  // Question List UI
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 pb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{quizData.title}</h2>
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
          {isRetry ? 'Retry Mode' : 'Quiz Mode'}
        </span>
      </div>
      
      {quizData.questions.map((q, qIdx) => (
        <div key={qIdx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-lg font-medium text-gray-800 mb-4">{qIdx + 1}. {q.q}</p>
          <div className="space-y-3">
            {Object.entries(q.choices).map(([key, text]) => (
              <label 
                key={key} 
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                  answers[qIdx] === key 
                    ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={`q-${qIdx}`}
                  value={key}
                  checked={answers[qIdx] === key}
                  onChange={() => handleSelect(qIdx, key)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-3 text-gray-700">
                  <span className="font-bold text-gray-400 mr-2">{key}.</span> {text}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex justify-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <Button 
            onClick={handleSubmit} 
            fullWidth 
            className="max-w-md"
            disabled={Object.keys(answers).length < quizData.questions.length}
        >
          Submit Answers
        </Button>
      </div>
    </div>
  );
};

export default Quiz;