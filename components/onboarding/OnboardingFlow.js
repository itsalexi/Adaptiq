'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LearningStyleSelection from './LearningStyleSelection';
import LearningStyleQuiz from './LearningStyleQuiz';
import OnboardingResult from './OnboardingResult';

export default function OnboardingFlow({ onComplete }) {
    const [step, setStep] = useState('intro');
    const [learningStyle, setLearningStyle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const { updateUserProfile } = useAuth();

    const handleLearningStyleComplete = (style) => {
        setLearningStyle(style);
        setResult(style);
        setStep('result');
    };

    const handleResultContinue = async () => {
        setLoading(true);
        try {
            await updateUserProfile({
                learningStyle: result,
                onboardingCompleted: true,
            });
            setTimeout(() => {
                setLoading(false);
                onComplete();
            }, 1000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setLoading(false);
        }
    };

    const handleSkip = async () => {
        setLoading(true);

        try {
            await updateUserProfile({
                learningStyle: 'Mixed',
                onboardingCompleted: true,
            });

            setTimeout(() => {
                onComplete();
            }, 1000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                        {learningStyle
                            ? 'Setting up your personalized experience...'
                            : 'Saving your preferences...'}
                    </p>
                </div>
            </div>
        );
    }

    if (step === 'intro') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="max-w-2xl mx-auto p-6 text-center">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Welcome to Adaptiq! 🎓
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                            Let's personalize your learning experience by
                            understanding how you learn best.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                            Do you know your learning style?
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            This helps us create the most effective study
                            materials for you.
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={() => setStep('selection')}
                                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                Yes, I know my learning style
                            </button>

                            <button
                                onClick={() => setStep('quiz')}
                                className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                No, let me take a quick quiz
                            </button>

                            <button
                                onClick={handleSkip}
                                className="w-full py-3 px-6 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold rounded-lg transition-colors"
                            >
                                Skip for now (I'll set it up later)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'selection') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <LearningStyleSelection
                    onSelect={handleLearningStyleComplete}
                />
            </div>
        );
    }

    if (step === 'quiz') {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <LearningStyleQuiz
                    onComplete={handleLearningStyleComplete}
                    onBack={() => setStep('intro')}
                />
            </div>
        );
    }

    if (step === 'result' && result) {
        return (
            <OnboardingResult
                style={result}
                onContinue={handleResultContinue}
                loading={loading}
            />
        );
    }

    return null;
}
