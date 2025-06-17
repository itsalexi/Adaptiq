'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [dark, setDark] = useState(false);

    // On mount, read theme from localStorage or system preference
    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (
            saved === 'dark' ||
            (!saved &&
                window.matchMedia('(prefers-color-scheme: dark)').matches)
        ) {
            setDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setDark(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // When dark changes, update <html> and localStorage
    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [dark]);

    return (
        <button
            aria-label="Toggle dark mode"
            onClick={() => setDark((d) => !d)}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
            {dark ? (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <path
                        d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z"
                        fill="#facc15"
                    />
                </svg>
            ) : (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5" fill="#fbbf24" />
                    <path
                        d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                        stroke="#fbbf24"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            )}
        </button>
    );
}
