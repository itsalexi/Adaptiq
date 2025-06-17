'use client';

import { useState } from 'react';
import ThemeToggle from '../shared/ThemeToggle';
import React from 'react';
import { FiEye, FiBookOpen } from 'react-icons/fi';
import { FaEarListen, FaBrain } from 'react-icons/fa6';

const learningStyles = [
    {
        id: 'visual',
        name: 'I am a Visual Learner',
        icon: <FiEye size={56} className="text-black" />,
        color: 'bg-red-200 border-red-400',
        text: 'text-red-900',
        value: 'Visual',
    },
    {
        id: 'text',
        name: 'I am a Text-based Learner',
        icon: <FiBookOpen size={56} className="text-black" />,
        color: 'bg-blue-200 border-blue-400',
        text: 'text-blue-900',
        value: 'Text-Based',
    },
    {
        id: 'auditory',
        name: 'I am an Auditory Learner',
        icon: <FaEarListen size={56} className="text-black" />,
        color: 'bg-green-200 border-green-400',
        text: 'text-green-900',
        value: 'Auditory',
    },
    {
        id: 'mixed',
        name: 'All Three Works for Me',
        icon: <FaBrain size={56} className="text-black" />,
        color: 'bg-yellow-200 border-yellow-400',
        text: 'text-yellow-900',
        value: 'Mixed',
    },
];

export default function LearningStyleSelection({ onSelect }) {
    const [selectedStyle, setSelectedStyle] = useState(null);

    const handleSelect = (style) => {
        setSelectedStyle(style);
    };

    const handleContinue = () => {
        if (selectedStyle) {
            onSelect(selectedStyle.value);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="relative w-full sm:max-w-2xl sm:min-h-[400px] mx-auto border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl bg-white dark:bg-gray-800 sm:px-8 sm:py-8 flex flex-col items-center">
                {/* Progress bar */}
                <div className="w-full mb-6">
                    <div className="h-2 sm:h-3 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                            className="h-2 sm:h-3 rounded-full bg-blue-600 transition-all duration-300"
                            style={{ width: '100%' }}
                        ></div>
                    </div>
                </div>
                <h2 className="text-lg sm:text-2xl md:text-3xl text-center mb-4 sm:mb-6 text-gray-900 dark:text-white font-bold break-words whitespace-normal">
                    How do you best learn?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
                    {learningStyles.map((style) => (
                        <button
                            key={style.id}
                            type="button"
                            onClick={() => handleSelect(style)}
                            className={`flex flex-col items-center justify-center h-32 sm:h-36 rounded-xl transition-all duration-200 focus:outline-none font-medium text-base sm:text-lg 
                                ${
                                    {
                                        visual: 'bg-red-300',
                                        text: 'bg-blue-200',
                                        auditory: 'bg-green-200',
                                        mixed: 'bg-yellow-200',
                                    }[style.id]
                                }
                                text-black
                                ${
                                    selectedStyle?.id === style.id
                                        ? 'border-4 border-black scale-105'
                                        : 'hover:brightness-95'
                                }
                            `}
                        >
                            <span className="mb-2 flex items-center justify-center">
                                {style.icon}
                            </span>
                            <span>{style.name}</span>
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleContinue}
                    disabled={!selectedStyle}
                    className="mt-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base shadow"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
