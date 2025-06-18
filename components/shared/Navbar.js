'use client';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import ProfileSettingsModal from './ProfileSettingsModal';
import Image from 'next/image';

export default function Navbar() {
    const { user, logout, updateUserProfile } = useAuth();
    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setDropdownOpen(false);
        await logout();
        router.push('/auth');
    };

    const handleSettingsSave = async (values) => {
        await updateUserProfile(values);
        setSettingsOpen(false);
        setDropdownOpen(false);
    };

    return (
        <>
            <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 h-16">
                <div className="flex items-center gap-3">
                    <Image
                        src="/logo.png"
                        alt="Adaptiq Logo"
                        width={36}
                        height={36}
                        priority
                    />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                        Adaptiq
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none"
                                onClick={() => setDropdownOpen((v) => !v)}
                            >
                                <svg
                                    width="22"
                                    height="22"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        cx="12"
                                        cy="8"
                                        r="4"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                    <path
                                        d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                </svg>
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-2">
                                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700">
                                        {user.profile?.name || user.email}
                                    </div>
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            setSettingsOpen(true);
                                        }}
                                    >
                                        Edit Settings
                                    </button>
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </nav>
            <ProfileSettingsModal
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                userProfile={user?.profile || {}}
                onSave={handleSettingsSave}
            />
        </>
    );
}
