'use client';

import { FiEye, FiBookOpen } from 'react-icons/fi';
import { FaEarListen, FaBrain } from 'react-icons/fa6';

const styleMap = {
    Visual: {
        color: 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/30',
        icon: <FiEye size={64} className="text-black dark:text-white" />,
        title: 'Visual Learner',
        bar: 'bg-red-400 dark:bg-red-700',
    },
    'Text-Based': {
        color: 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30',
        icon: <FiBookOpen size={64} className="text-black dark:text-white" />,
        title: 'Text-based Learner',
        bar: 'bg-blue-400 dark:bg-blue-700',
    },
    Auditory: {
        color: 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/30',
        icon: <FaEarListen size={64} className="text-black dark:text-white" />,
        title: 'Auditory Learner',
        bar: 'bg-green-400 dark:bg-green-700',
    },
    Mixed: {
        color: 'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/30',
        icon: <FaBrain size={64} className="text-black dark:text-white" />,
        title: 'Generalist Learner',
        bar: 'bg-yellow-400 dark:bg-yellow-700',
    },
};

export default function OnboardingResult({ style, onContinue, loading }) {
    const s = styleMap[style] || styleMap.Mixed;
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div
                className={`w-full max-w-lg mx-auto border-2 ${s.color} rounded-xl shadow-lg p-10 flex flex-col items-center relative`}
            >
                <div className={`w-full h-2 rounded-t-lg mb-8 ${s.bar}`}></div>
                <div className="flex flex-col items-center">
                    <span className="text-6xl mb-4">{s.icon}</span>
                    <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white text-center">
                        Congratulations! You are a..
                    </h2>
                    <h3 className="text-3xl font-extrabold mb-4 text-center text-black dark:text-white">
                        {s.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
                        {s.title === 'Visual Learner' &&
                            'You learn best when you can see things in depth. Diagrams, charts, and visuals are your superpower!'}
                        {s.title === 'Text-based Learner' &&
                            'You master topics by focusing on text. Key concepts and detailed notes, reading and writing, are your thing!'}
                        {s.title === 'Auditory Learner' &&
                            'You absorb information best by listening. You thrive in explanations, discussions, and audio content!'}
                        {s.title === 'Generalist Learner' &&
                            'You are a flexible learner who adapts to all kinds of materials. You do great in any environment!'}
                    </p>
                    <button
                        onClick={onContinue}
                        disabled={loading}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Loading...' : 'Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
}
