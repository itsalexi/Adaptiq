'use client';
import { FiBookOpen, FiBarChart2, FiUser, FiGlobe } from 'react-icons/fi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const navLinks = [
    { label: 'Dashboard', icon: <FiBookOpen />, href: '/' },
    { label: 'My Study Groups', icon: <FiBarChart2 />, href: '/groups' },
    { label: 'Profile', icon: <FiUser />, href: '/profile' },
    // Add more links as needed
];

const pastTopics = [
    'Microbiology is the powerh..',
    'Algebra Geometry Grade 8',
    'Calculus II Areas',
    'Web Development UI Cour..',
];

export default function Sidebar({ onCreateTopic }) {
    const pathname = usePathname();
    return (
        <aside className="hidden md:flex h-[90vh] w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col p-6 gap-6">
            <div className="flex flex-col gap-2 mb-4">
                <button
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={onCreateTopic}
                >
                    + Topic
                </button>
            </div>
            <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                    <Link
                        key={link.label}
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                            pathname === link.href
                                ? 'bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-200 font-bold shadow'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        <span className="text-xl">{link.icon}</span>
                        {link.label}
                    </Link>
                ))}
            </nav>
            <div className="mt-auto pt-8">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    Past Topics
                </div>
                <ul className="flex flex-col gap-1">
                    {pastTopics.map((topic) => (
                        <li
                            key={topic}
                            className="truncate text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:underline"
                        >
                            {topic}
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
