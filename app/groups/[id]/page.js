'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const memberColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
];
const mockGroup = {
    id: '1',
    name: 'Math Wizards',
    members: [
        {
            id: 'u1',
            name: 'Alice',
            points: 120,
            streak: 5,
            lastCheckIn: '2024-06-01',
            tasksCompleted: 8,
        },
        {
            id: 'u2',
            name: 'Bob',
            points: 95,
            streak: 3,
            lastCheckIn: '2024-06-02',
            tasksCompleted: 6,
        },
        {
            id: 'u3',
            name: 'Charlie',
            points: 80,
            streak: 2,
            lastCheckIn: '2024-05-31',
            tasksCompleted: 4,
        },
    ],
};

export default function GroupDetailPage() {
    const { id } = useParams();
    const [group, setGroup] = useState(mockGroup);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    const handleInvite = () => {
        if (!inviteEmail) return;
        setGroup({
            ...group,
            members: [
                ...group.members,
                {
                    id: `u${group.members.length + 1}`,
                    name: inviteEmail,
                    points: 0,
                    streak: 0,
                    lastCheckIn: 'Never',
                    tasksCompleted: 0,
                },
            ],
        });
        setInviteEmail('');
        setShowInvite(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-3xl mx-auto">
                <Link
                    href="/groups"
                    className="text-blue-600 dark:text-blue-400 mb-4 inline-block"
                >
                    &larr; Back to Groups
                </Link>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-white">
                    {group.name}
                </h1>
                <div className="flex items-center gap-4 mb-8">
                    <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-700/20 text-green-700 dark:text-green-400 text-xs rounded-full">
                        {group.members.length} member
                        {group.members.length !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={() => setShowInvite(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow"
                    >
                        Invite User
                    </button>
                </div>
                {/* Leaderboard */}
                <div className="mb-12">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                        Leaderboard
                    </h2>
                    <div className="overflow-x-auto rounded-xl shadow">
                        <table className="w-full text-left border-collapse bg-white dark:bg-gray-800">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="py-3 px-4 border-b font-semibold">
                                        Member
                                    </th>
                                    <th className="py-3 px-4 border-b font-semibold">
                                        Points
                                    </th>
                                    <th className="py-3 px-4 border-b font-semibold">
                                        Streak
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.members
                                    .sort((a, b) => b.points - a.points)
                                    .map((member, idx) => (
                                        <tr
                                            key={member.id}
                                            className="hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                                        >
                                            <td className="py-3 px-4 border-b flex items-center gap-3">
                                                <span
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                                                        memberColors[
                                                            idx %
                                                                memberColors.length
                                                        ]
                                                    }`}
                                                >
                                                    {member.name[0]}
                                                </span>
                                                <span>{member.name}</span>
                                            </td>
                                            <td className="py-3 px-4 border-b">
                                                <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-700/20 text-blue-700 dark:text-blue-400 text-xs rounded-full font-semibold">
                                                    {member.points} pts
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 border-b">
                                                <span className="inline-block px-2 py-1 bg-yellow-100 dark:bg-yellow-700/20 text-yellow-700 dark:text-yellow-400 text-xs rounded-full font-semibold">
                                                    {member.streak} days
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Accountability Section */}
                <div className="mb-12">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                        Accountability
                    </h2>
                    <div className="overflow-x-auto rounded-xl shadow">
                        <table className="w-full text-left border-collapse bg-white dark:bg-gray-800">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="py-3 px-4 border-b font-semibold">
                                        Member
                                    </th>
                                    <th className="py-3 px-4 border-b font-semibold">
                                        Last Check-in
                                    </th>
                                    <th className="py-3 px-4 border-b font-semibold">
                                        Tasks Completed
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.members.map((member, idx) => (
                                    <tr
                                        key={member.id}
                                        className="hover:bg-green-50 dark:hover:bg-gray-700 transition"
                                    >
                                        <td className="py-3 px-4 border-b flex items-center gap-3">
                                            <span
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                                                    memberColors[
                                                        idx %
                                                            memberColors.length
                                                    ]
                                                }`}
                                            >
                                                {member.name[0]}
                                            </span>
                                            <span>{member.name}</span>
                                        </td>
                                        <td className="py-3 px-4 border-b">
                                            <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-semibold">
                                                {member.lastCheckIn}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 border-b">
                                            <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-700/20 text-green-700 dark:text-green-400 text-xs rounded-full font-semibold">
                                                {member.tasksCompleted}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Invite Modal */}
                {showInvite && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative flex flex-col items-center">
                            <button
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
                                onClick={() => setShowInvite(false)}
                                aria-label="Close"
                            >
                                &times;
                            </button>
                            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
                                Invite User to Group
                            </h2>
                            <input
                                type="text"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="User Email or Name"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                                onClick={handleInvite}
                                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow"
                            >
                                Invite
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
