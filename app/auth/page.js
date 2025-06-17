'use client';

import { useState } from 'react';
import LoginForm from '../../components/auth/LoginForm';
import SignUpForm from '../../components/auth/SignUpForm';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Adaptiq
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        AI-Powered Learning Platform
                    </p>
                </div>

                {/* Auth Forms */}
                {isLogin ? (
                    <LoginForm onSwitchToSignUp={() => setIsLogin(false)} />
                ) : (
                    <SignUpForm onSwitchToLogin={() => setIsLogin(true)} />
                )}

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
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
