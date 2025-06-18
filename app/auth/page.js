'use client';

import { useState } from 'react';
import LoginForm from '../../components/auth/LoginForm';
import SignUpForm from '../../components/auth/SignUpForm';
import Image from 'next/image';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 flex flex-col items-center">
                {/* Logo/Brand */}
                <div className="text-center mb-4 flex flex-col items-center">
                    <Image
                        src="/logo.png"
                        alt="Adaptiq Logo"
                        width={56}
                        height={56}
                        priority
                        className="mb-2"
                    />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        Adaptiq
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        AI-Powered Learning Platform
                    </p>
                </div>

                {/* Auth Forms */}
                <div className="w-full mt-2">
                    {isLogin ? (
                        <LoginForm onSwitchToSignUp={() => setIsLogin(false)} />
                    ) : (
                        <SignUpForm onSwitchToLogin={() => setIsLogin(true)} />
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-6 w-full">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        By continuing, you agree to our{' '}
                        <a
                            href="#"
                            className="text-blue-600 hover:text-blue-500"
                        >
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a
                            href="#"
                            className="text-blue-600 hover:text-blue-500"
                        >
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
