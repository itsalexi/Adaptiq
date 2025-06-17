'use client';

import { useState } from 'react';

const questions = [
    {
        id: 1,
        type: 'scenario',
        question: 'How do you best remember information?',
        options: [
            {
                value: 'visual',
                label: 'By seeing pictures, diagrams, or charts',
            },
            { value: 'auditory', label: 'By hearing someone explain it' },
            { value: 'text', label: 'By reading and writing notes' },
            { value: 'mixed', label: 'A combination of different methods' },
        ],
    },
    {
        id: 2,
        type: 'scenario',
        question: 'When studying for a test, you prefer to:',
        options: [
            { value: 'visual', label: 'Create mind maps or diagrams' },
            { value: 'auditory', label: 'Discuss the material with others' },
            { value: 'text', label: 'Read through your notes multiple times' },
            { value: 'mixed', label: 'Use a mix of different study methods' },
        ],
    },
    {
        id: 3,
        type: 'scenario',
        question: 'In a classroom, you learn best when the teacher:',
        options: [
            {
                value: 'visual',
                label: 'Uses slides, videos, or demonstrations',
            },
            { value: 'auditory', label: 'Explains concepts verbally' },
            { value: 'text', label: 'Provides written materials and handouts' },
            { value: 'mixed', label: 'Uses a variety of teaching methods' },
        ],
    },
    {
        id: 4,
        type: 'slider',
        question:
            'Rate how helpful visual aids (diagrams, charts, videos) are for your learning:',
        min: 1,
        max: 5,
        labels: ['Not helpful at all', 'Very helpful'],
    },
    {
        id: 5,
        type: 'slider',
        question:
            'Rate how helpful audio explanations and discussions are for your learning:',
        min: 1,
        max: 5,
        labels: ['Not helpful at all', 'Very helpful'],
    },
    {
        id: 6,
        type: 'slider',
        question:
            'Rate how helpful reading and writing notes are for your learning:',
        min: 1,
        max: 5,
        labels: ['Not helpful at all', 'Very helpful'],
    },
];

export default function LearningStyleQuiz({ onComplete, onBack }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);

    const handleAnswer = (answer) => {
        setAnswers((prev) => ({
            ...prev,
            [questions[currentQuestion].id]: answer,
        }));
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion((prev) => prev + 1);
        } else {
            analyzeResults();
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion((prev) => prev - 1);
        }
    };

    const handleGoBack = () => {
        if (onBack) {
            onBack();
        }
    };

    const analyzeResults = () => {
        setLoading(true);

        // Calculate scores for each learning style
        const scores = { visual: 0, auditory: 0, text: 0 };

        questions.forEach((question) => {
            const answer = answers[question.id];

            if (question.type === 'scenario') {
                if (answer === 'visual') scores.visual += 2;
                else if (answer === 'auditory') scores.auditory += 2;
                else if (answer === 'text') scores.text += 2;
                else if (answer === 'mixed') {
                    scores.visual += 0.5;
                    scores.auditory += 0.5;
                    scores.text += 0.5;
                }
            } else if (question.type === 'slider') {
                if (question.id === 4) scores.visual += answer;
                else if (question.id === 5) scores.auditory += answer;
                else if (question.id === 6) scores.text += answer;
            }
        });

        // Determine primary and secondary learning styles
        const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
        const primary = sortedScores[0][0];
        const secondary =
            sortedScores[1][1] > sortedScores[0][1] * 0.8
                ? sortedScores[1][0]
                : null;

        let learningStyle;
        if (secondary) {
            learningStyle = 'Mixed';
        } else if (primary === 'visual') {
            learningStyle = 'Visual';
        } else if (primary === 'auditory') {
            learningStyle = 'Auditory';
        } else if (primary === 'text') {
            learningStyle = 'Text-Based';
        } else {
            learningStyle = 'Mixed';
        }

        setTimeout(() => {
            onComplete(learningStyle);
            setLoading(false);
        }, 1000);
    };

    const currentQ = questions[currentQuestion];
    const hasAnswer = answers[currentQ.id] !== undefined;

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900">
            <div
                className="fixed inset-x-0 bottom-0 top-16 z-50 bg-white dark:bg-gray-900 pt-2 px-4 flex flex-col items-center justify-start sm:static sm:w-full sm:max-w-2xl sm:min-h-[400px] sm:mx-auto sm:border sm:border-gray-200 sm:dark:border-gray-700 sm:rounded-2xl sm:shadow-xl sm:bg-white sm:dark:bg-gray-800 sm:px-8 sm:py-8 sm:relative sm:z-auto sm:p-0"
                style={{ boxShadow: '0 6px 32px 0 rgba(0,0,0,0.08)' }}
            >
                {/* Progress bar only */}
                <div className="w-full mb-6">
                    <div className="h-2 sm:h-3 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                            className="h-2 sm:h-3 rounded-full bg-blue-600 transition-all duration-300"
                            style={{
                                width: `${
                                    ((currentQuestion + 1) / questions.length) *
                                    100
                                }%`,
                            }}
                        ></div>
                    </div>
                </div>
                {/* Main content */}
                <div className="w-full flex flex-col gap-4 mb-4 min-h-[120px] sm:gap-6 sm:mb-6 sm:min-h-[180px] justify-center flex-1">
                    <h2 className="text-lg sm:text-2xl md:text-3xl text-center mb-2 sm:mb-4 text-gray-900 dark:text-white font-bold break-words whitespace-normal">
                        {currentQ.question}
                    </h2>
                    {currentQ.type === 'scenario' &&
                        currentQ.options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleAnswer(option.value)}
                                className={`w-full py-3 sm:py-4 rounded-xl border-2 transition-all duration-200 text-sm sm:text-base md:text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                                    answers[currentQ.id] === option.value
                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 scale-105 text-blue-900 dark:text-blue-200'
                                        : 'border-gray-300 dark:border-gray-600 hover:scale-105 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    {currentQ.type === 'slider' && (
                        <div className="flex flex-col gap-4 sm:gap-6 items-center w-full px-2 sm:px-0">
                            <div className="flex justify-between w-full text-xs sm:text-base text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">
                                <span>{currentQ.labels[0]}</span>
                                <span>{currentQ.labels[1]}</span>
                            </div>
                            <input
                                type="range"
                                min={currentQ.min}
                                max={currentQ.max}
                                value={answers[currentQ.id] ?? 3}
                                onChange={(e) =>
                                    handleAnswer(Number(e.target.value))
                                }
                                className="slider w-full accent-blue-600"
                                style={{ height: '1.5rem' }}
                            />
                            <div className="text-base sm:text-xl font-semibold text-blue-600 dark:text-blue-400 mt-1 sm:mt-2">
                                {answers[currentQ.id] ?? 3}
                            </div>
                        </div>
                    )}
                </div>
                {/* Navigation buttons - sticky at bottom on mobile */}
                <div className="w-full flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mt-auto pb-2 sm:pb-0">
                    <button
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                        className="px-4 py-2 sm:px-8 sm:py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base shadow"
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!hasAnswer || loading}
                        className="px-6 py-2 sm:px-10 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base shadow"
                    >
                        {loading
                            ? 'Analyzing...'
                            : currentQuestion === questions.length - 1
                            ? 'Get Results'
                            : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
}
