'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    FiArrowLeft,
    FiCheck,
    FiClock,
    FiBookOpen,
    FiRepeat,
    FiEdit3,
    FiLoader,
} from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

// Helper function to find a gap in knowledgeGaps
const findGap = (knowledgeGaps, targetTopic) => {
    if (!knowledgeGaps) return null;

    // Convert to array if it's an object
    const gapsArray = Array.isArray(knowledgeGaps)
        ? knowledgeGaps
        : Object.values(knowledgeGaps);

    // Find the gap by comparing topics
    return gapsArray.find((g) => g.topic === targetTopic);
};

export default function StudySession() {
    const { id, gapId } = useParams();
    const router = useRouter();
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingState, setLoadingState] = useState('initializing'); // 'initializing', 'fetching-topic', 'generating-materials', 'ready'
    const [currentSection, setCurrentSection] = useState(0);
    const [showingFlashcard, setShowingFlashcard] = useState(false);
    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
    const [showingAnswer, setShowingAnswer] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState([]);
    const [studyMaterials, setStudyMaterials] = useState(null);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const fetchTopicAndMaterials = async () => {
            try {
                setLoadingState('fetching-topic');
                console.log('Fetching topic:', id);
                console.log('Raw Gap ID from URL:', gapId);

                const topicDoc = await getDoc(doc(db, 'topics', id));
                if (!topicDoc.exists()) {
                    throw new Error('Topic not found');
                }

                const topicData = { id: topicDoc.id, ...topicDoc.data() };
                console.log('Topic data:', topicData);
                console.log(
                    'Current study session:',
                    topicData.currentStudySession
                );

                // Verify there's an active study session
                if (!topicData.currentStudySession) {
                    throw new Error('No active study session');
                }

                // Decode the gapId from the URL
                const decodedGapId = decodeURIComponent(gapId);
                console.log('Decoded Gap ID:', decodedGapId);
                console.log(
                    'Session Gap ID:',
                    topicData.currentStudySession.gapId
                );

                if (topicData.currentStudySession.gapId !== decodedGapId) {
                    console.log('Mismatch details:', {
                        fromURL: decodedGapId,
                        fromSession: topicData.currentStudySession.gapId,
                    });
                    throw new Error('Study session mismatch');
                }

                if (topicData.currentStudySession.completed) {
                    throw new Error('Study session already completed');
                }

                setTopic(topicData);

                // Find the gap using the helper function
                const gap = findGap(topicData.knowledgeGaps, decodedGapId);
                console.log('Knowledge gaps:', topicData.knowledgeGaps);
                console.log('Looking for gap with topic:', decodedGapId);
                console.log('Found gap:', gap);

                if (!gap) {
                    throw new Error(`Knowledge gap not found: ${decodedGapId}`);
                }

                setLoadingState('generating-materials');
                // Generate study materials
                const response = await fetch('/api/generateStudyMaterials', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        topic: gap.topic,
                        explanation: gap.explanation,
                        question: gap.question,
                        correctAnswer: gap.correctAnswer,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to generate study materials');
                }

                const data = await response.json();
                if (!data.success) {
                    throw new Error(
                        data.error || 'Failed to generate study materials'
                    );
                }

                setStudyMaterials(data.studyMaterials);
                setLoadingState('ready');
            } catch (error) {
                console.error('Error:', error);
                toast.error(error.message);
                // Redirect back to topic page on error
                router.push(`/topics/${id}`);
            } finally {
                setLoading(false);
            }
        };

        fetchTopicAndMaterials();
    }, [id, gapId, router]);

    const completeStudySession = async () => {
        try {
            await updateDoc(doc(db, 'topics', id), {
                'currentStudySession.completed': true,
                'currentStudySession.completedAt': new Date().toISOString(),
                [`completedSessions.${gapId}`]: {
                    completedAt: new Date().toISOString(),
                    type: 'text-based',
                    score: quizScore,
                    answers: quizAnswers,
                },
            });

            setShowResults(true);
        } catch (error) {
            console.error('Error completing study session:', error);
            toast.error('Failed to complete study session');
        }
    };

    const handleQuizAnswer = (answer, isCorrect) => {
        setQuizAnswers((prev) => [...prev, { answer, isCorrect }]);
        if (isCorrect) {
            setQuizScore((prev) => prev + 1);
        }
    };

    // Generate study content based on the knowledge gap
    const generateStudyContent = (gap) => {
        return [
            {
                title: 'Introduction',
                content: `Let's dive into ${gap.topic}. We'll start by understanding the core concepts and then move on to practical applications.`,
                duration: '5 mins',
                type: 'text',
            },
            {
                title: 'Core Concepts',
                content: gap.explanation,
                duration: '10 mins',
                type: 'text',
            },
            {
                title: 'Flashcards',
                content: 'Review key concepts with flashcards',
                duration: '10 mins',
                type: 'flashcards',
            },
            {
                title: 'Practice Quiz',
                content: 'Test your understanding with a short quiz',
                duration: '10 mins',
                type: 'quiz',
            },
            {
                title: 'Summary',
                content: `Let's review what we've learned about ${gap.topic}:\n\n1. We understood the core concepts\n2. We practiced with flashcards\n3. We tested our knowledge\n\nKeep these points in mind as you continue your learning journey.`,
                duration: '5 mins',
                type: 'text',
            },
        ];
    };

    const renderLoadingState = () => {
        const loadingMessages = {
            initializing: 'Initializing study session...',
            'fetching-topic': 'Loading your topic...',
            'generating-materials':
                'Generating personalized study materials...',
            ready: 'Ready to start learning!',
        };

        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="animate-spin text-blue-500">
                            <FiLoader className="w-8 h-8" />
                        </div>
                        <p className="text-lg font-medium">
                            {loadingMessages[loadingState]}
                        </p>
                        <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{
                                    width: `${
                                        loadingState === 'initializing'
                                            ? '25'
                                            : loadingState === 'fetching-topic'
                                            ? '50'
                                            : loadingState ===
                                              'generating-materials'
                                            ? '75'
                                            : '100'
                                    }%`,
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderQuizResults = () => {
        if (!showResults) return null;

        const totalQuestions = quizAnswers.length;
        const correctAnswers = quizAnswers.filter((a) => a.isCorrect).length;
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                        Quiz Results
                    </h2>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600 dark:text-gray-400">
                                Score
                            </span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {percentage}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full ${
                                    percentage >= 80
                                        ? 'bg-green-500'
                                        : percentage >= 60
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-gray-600 dark:text-gray-400">
                            You got {correctAnswers} out of {totalQuestions}{' '}
                            questions correct.
                        </p>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => router.push(`/topics/${id}`)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Continue Learning
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading || loadingState !== 'ready') {
        return renderLoadingState();
    }

    if (!topic || !topic.knowledgeGaps || !studyMaterials) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold mb-2">
                            Study Session Not Found
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {!topic
                                ? 'Loading topic...'
                                : !topic.knowledgeGaps
                                ? 'No knowledge gaps found'
                                : !studyMaterials
                                ? 'Generating study materials...'
                                : 'Unknown error'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Decode the gapId from the URL if needed
    const decodedGapId = decodeURIComponent(gapId);

    // Find the gap using the helper function
    const gap = findGap(topic.knowledgeGaps, decodedGapId);

    if (!gap) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold mb-2">
                            Knowledge Gap Not Found
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Could not find the specified topic: {decodedGapId}
                        </p>
                        <Link
                            href={`/topics/${id}`}
                            className="mt-4 inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                            <FiArrowLeft className="mr-2" />
                            Back to Topic
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const studyContent = generateStudyContent(gap);
    const flashcards = studyMaterials.flashcards;
    const quiz = studyMaterials.practiceQuestions;

    const renderFlashcards = () => (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">
                    Flashcard {currentFlashcardIndex + 1} of {flashcards.length}
                </h2>
                <button
                    onClick={() => setShowingAnswer(!showingAnswer)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                    <FiRepeat className="w-5 h-5" />
                </button>
            </div>
            <div
                className="min-h-[200px] flex items-center justify-center p-8 bg-white dark:bg-gray-700 rounded-lg cursor-pointer"
                onClick={() => setShowingAnswer(!showingAnswer)}
            >
                <p className="text-lg text-center">
                    {showingAnswer
                        ? flashcards[currentFlashcardIndex].answer
                        : flashcards[currentFlashcardIndex].question}
                </p>
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Concept: {flashcards[currentFlashcardIndex].concept}
            </div>
            <div className="flex justify-between mt-4">
                <button
                    onClick={() => {
                        setCurrentFlashcardIndex((prev) =>
                            Math.max(0, prev - 1)
                        );
                        setShowingAnswer(false);
                    }}
                    disabled={currentFlashcardIndex === 0}
                    className={`px-4 py-2 rounded-lg ${
                        currentFlashcardIndex === 0
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                    Previous
                </button>
                <button
                    onClick={() => {
                        if (currentFlashcardIndex === flashcards.length - 1) {
                            setCurrentSection((prev) => prev + 1);
                        } else {
                            setCurrentFlashcardIndex((prev) => prev + 1);
                            setShowingAnswer(false);
                        }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    {currentFlashcardIndex === flashcards.length - 1
                        ? 'Complete Flashcards'
                        : 'Next'}
                </button>
            </div>
        </div>
    );

    const renderQuiz = () => (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
            {!quizStarted ? (
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-4">
                        Ready for the Quiz?
                    </h2>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        Test your understanding with {quiz.length} questions.
                    </p>
                    <button
                        onClick={() => setQuizStarted(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Start Quiz
                    </button>
                </div>
            ) : (
                <>
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">
                            Question {currentQuestionIndex + 1} of {quiz.length}
                        </h2>
                        <p className="text-lg mb-4">
                            {quiz[currentQuestionIndex].question}
                        </p>
                        <div className="space-y-3">
                            {quiz[currentQuestionIndex].options.map(
                                (option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            const isCorrect =
                                                option ===
                                                quiz[currentQuestionIndex]
                                                    .options[
                                                    quiz[
                                                        currentQuestionIndex
                                                    ].correctAnswer.charCodeAt(
                                                        0
                                                    ) - 65
                                                ];
                                            handleQuizAnswer(option, isCorrect);
                                            if (
                                                currentQuestionIndex ===
                                                quiz.length - 1
                                            ) {
                                                setCurrentSection(
                                                    (prev) => prev + 1
                                                );
                                            } else {
                                                setCurrentQuestionIndex(
                                                    (prev) => prev + 1
                                                );
                                            }
                                        }}
                                        className="w-full p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        {option}
                                    </button>
                                )
                            )}
                        </div>
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                            Difficulty: {quiz[currentQuestionIndex].difficulty}
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    const renderContent = () => {
        const currentContent = studyContent[currentSection];

        switch (currentContent.type) {
            case 'flashcards':
                return renderFlashcards();
            case 'quiz':
                return renderQuiz();
            default:
                return (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-semibold">
                                {currentContent.title}
                            </h2>
                            <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <FiClock className="mr-1" />
                                {currentContent.duration}
                            </span>
                        </div>
                        <div className="prose dark:prose-invert max-w-none">
                            {currentContent.content
                                .split('\n')
                                .map((paragraph, index) => (
                                    <p
                                        key={index}
                                        className="mb-4 text-gray-700 dark:text-gray-300"
                                    >
                                        {paragraph}
                                    </p>
                                ))}
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={`/topics/${id}`}
                            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                        >
                            <FiArrowLeft className="mr-2" />
                            Back to Topic
                        </Link>
                        <h1 className="text-3xl font-bold mb-2">
                            Studying: {gap.topic}
                        </h1>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <FiBookOpen className="mr-2" />
                            Text-Based Learning Module
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>Progress</span>
                            <span>
                                {Math.round(
                                    ((currentSection + 1) /
                                        studyContent.length) *
                                        100
                                )}
                                %
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: `${
                                        ((currentSection + 1) /
                                            studyContent.length) *
                                        100
                                    }%`,
                                }}
                            ></div>
                        </div>
                    </div>

                    {/* Study Content */}
                    {renderContent()}

                    {/* Navigation */}
                    <div className="flex justify-between">
                        <button
                            onClick={() => {
                                setCurrentSection((prev) =>
                                    Math.max(0, prev - 1)
                                );
                                // Reset interactive section states
                                setShowingFlashcard(false);
                                setCurrentFlashcardIndex(0);
                                setShowingAnswer(false);
                                setQuizStarted(false);
                                setCurrentQuestionIndex(0);
                            }}
                            disabled={currentSection === 0}
                            className={`px-4 py-2 rounded-lg ${
                                currentSection === 0
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            Previous
                        </button>
                        {currentSection === studyContent.length - 1 ? (
                            <button
                                onClick={completeStudySession}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                            >
                                <FiCheck className="mr-2" />
                                Complete
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setCurrentSection((prev) =>
                                        Math.min(
                                            studyContent.length - 1,
                                            prev + 1
                                        )
                                    );
                                    // Reset interactive section states
                                    setShowingFlashcard(false);
                                    setCurrentFlashcardIndex(0);
                                    setShowingAnswer(false);
                                    setQuizStarted(false);
                                    setCurrentQuestionIndex(0);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {renderQuizResults()}
        </>
    );
}
