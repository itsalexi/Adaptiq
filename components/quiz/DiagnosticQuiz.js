'use client';
import { useState, useEffect } from 'react';

export default function DiagnosticQuiz({ topic, onComplete, onSkip, isOpen }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Move generateQuiz above useEffect
  const generateQuiz = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generateDiagnosticQuiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicTitle: topic.title,
          materials: topic.materials || [],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate quiz: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.quiz) {
        setQuiz(data.quiz);
        setCurrentQuestion(0);
        setAnswers({});
      } else {
        throw new Error(data.error || 'Failed to generate quiz');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate quiz when component opens
  useEffect(() => {
    if (isOpen && !quiz) {
      generateQuiz();
    }
  }, [isOpen, quiz]);

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      completeQuiz();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const completeQuiz = () => {
    // Calculate results
    let correctAnswers = 0;
    const topicScores = {};
    const detailedResults = [];
    const knowledgeGaps = [];

    quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      const isCorrect = checkAnswer(question, userAnswer);

      if (isCorrect) correctAnswers++;

      // Track by topic
      if (!topicScores[question.topic]) {
        topicScores[question.topic] = { correct: 0, total: 0 };
      }
      topicScores[question.topic].total++;
      if (isCorrect) topicScores[question.topic].correct++;

      // Track incorrect answers as knowledge gaps
      if (!isCorrect) {
        knowledgeGaps.push({
          topic: question.topic,
          question: question.question,
          difficulty: question.difficulty,
          userAnswer: userAnswer || 'No answer',
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
        });
      }

      detailedResults.push({
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        topic: question.topic,
        difficulty: question.difficulty,
      });
    });

    const overallScore = Math.round(
      (correctAnswers / quiz.questions.length) * 100
    );

    // Calculate topic proficiencies
    const topicProficiencies = Object.keys(topicScores).map((topic) => ({
      topic,
      score: Math.round(
        (topicScores[topic].correct / topicScores[topic].total) * 100
      ),
      questionsAnswered: topicScores[topic].total,
      questionsCorrect: topicScores[topic].correct,
    }));

    // Identify weak areas (topics with < 60% score)
    const weakAreas = topicProficiencies
      .filter((tp) => tp.score < 60)
      .map((tp) => tp.topic);

    const quizResults = {
      overallScore,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      topicProficiencies,
      detailedResults,
      knowledgeGaps,
      weakAreas,
      completedAt: new Date().toISOString(),
      isOnboarded: true, // Mark as onboarded when quiz is completed
    };

    setResults(quizResults);
    setShowResults(true);
  };

  const checkAnswer = (question, userAnswer) => {
    if (!userAnswer) return false;

    // Only handle multiple choice questions now
    if (question.type === 'multiple_choice') {
      return userAnswer === question.correctAnswer;
    }

    return false;
  };

  const finishDiagnostic = () => {
    if (!results) return;
    onComplete(results);
  };

  if (!isOpen) return null;

  const renderResults = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h3>
        <div className="text-4xl font-bold text-blue-400 mb-4">
          {results.overallScore}%
        </div>
        <p className="text-gray-300">
          You got {results.correctAnswers} out of {results.totalQuestions}{' '}
          questions correct
        </p>
      </div>

      {/* Overall Performance */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-3">
          Overall Performance
        </h4>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              results.overallScore >= 80
                ? 'bg-green-500'
                : results.overallScore >= 60
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${results.overallScore}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          {results.overallScore >= 80
            ? 'Excellent! You have a strong foundation.'
            : results.overallScore >= 60
            ? 'Good! Some areas need attention.'
            : 'Keep studying! Focus on the areas below.'}
        </p>
      </div>

      {/* Topic Breakdown */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-3">
          Topic Breakdown
        </h4>
        <div className="space-y-3">
          {results.topicProficiencies.map((topic, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-300 text-sm flex-1">
                {topic.topic}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      topic.score >= 80
                        ? 'bg-green-500'
                        : topic.score >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${topic.score}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-400 w-12 text-right">
                  {topic.score}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge Gaps */}
      {results.knowledgeGaps && results.knowledgeGaps.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-3">
            Areas for Improvement
          </h4>
          <div className="space-y-3">
            {results.knowledgeGaps.slice(0, 5).map((gap, index) => (
              <div key={index} className="border-l-4 border-red-500 pl-4">
                <p className="text-sm text-gray-300 mb-1">
                  <strong>{gap.topic}</strong>
                </p>
                <p className="text-xs text-gray-400 mb-1">{gap.question}</p>
                <p className="text-xs text-gray-500">{gap.explanation}</p>
              </div>
            ))}
            {results.knowledgeGaps.length > 5 && (
              <p className="text-xs text-gray-500 text-center">
                And {results.knowledgeGaps.length - 5} more areas to review...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Weak Areas Summary */}
      {results.weakAreas && results.weakAreas.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-3">
            Priority Study Areas
          </h4>
          <div className="flex flex-wrap gap-2">
            {results.weakAreas.map((area, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded-full"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={finishDiagnostic}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue to Study Plan
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Generating your diagnostic quiz...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-4">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={generateQuiz}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={onSkip}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Skip Quiz
              </button>
            </div>
          </div>
        )}

        {!loading && !error && !quiz && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Diagnostic Quiz for {topic?.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Let&apos;s assess your knowledge
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={generateQuiz}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Start Diagnostic Quiz
              </button>
              <button
                onClick={onSkip}
                className="px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Skip for Now
              </button>
            </div>
          </div>
        )}

        {quiz && !showResults && (
          <div>
            {/* Quiz Header */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {quiz.title}
                </h2>
                <button
                  onClick={onSkip}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Skip Quiz
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {quiz.description}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      ((currentQuestion + 1) / quiz.questions.length) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </p>
            </div>

            {/* Current Question */}
            {quiz.questions[currentQuestion] && (
              <div className="mb-8">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    {quiz.questions[currentQuestion].question}
                  </h3>

                  {quiz.questions[currentQuestion].type ===
                  'multiple_choice' ? (
                    <div className="space-y-3">
                      {quiz.questions[currentQuestion].options.map(
                        (option, index) => (
                          <label
                            key={index}
                            className="flex items-center space-x-3 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`question-${quiz.questions[currentQuestion].id}`}
                              value={option.charAt(0)}
                              checked={
                                answers[quiz.questions[currentQuestion].id] ===
                                option.charAt(0)
                              }
                              onChange={(e) =>
                                handleAnswer(
                                  quiz.questions[currentQuestion].id,
                                  e.target.value
                                )
                              }
                              className="text-blue-600"
                            />
                            <span className="text-gray-700 dark:text-gray-300">
                              {option}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  ) : (
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Enter your answer here..."
                      value={answers[quiz.questions[currentQuestion].id] || ''}
                      onChange={(e) =>
                        handleAnswer(
                          quiz.questions[currentQuestion].id,
                          e.target.value
                        )
                      }
                    />
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={previousQuestion}
                    disabled={currentQuestion === 0}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={nextQuestion}
                    disabled={!answers[quiz.questions[currentQuestion].id]}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {currentQuestion === quiz.questions.length - 1
                      ? 'Finish Quiz'
                      : 'Next'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {showResults && results && renderResults()}
      </div>
    </div>
  );
}
