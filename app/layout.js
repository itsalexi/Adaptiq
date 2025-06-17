import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthContextProvider, useAuth } from '../contexts/AuthContext';

import Navbar from '../components/shared/Navbar';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata = {
    title: 'Adaptiq - AI-Powered Learning Platform',
    description:
        'Personalized learning experience with adaptive modules and intelligent feedback',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <AuthContextProvider>
                    <Navbar />
                    {children}
                </AuthContextProvider>
            </body>
        </html>
    );
}
