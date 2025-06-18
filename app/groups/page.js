'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/dashboard/Sidebar';

const groupColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
];
const mockGroups = [
    { id: '1', name: 'Math Wizards', members: 5 },
    { id: '2', name: 'Science Squad', members: 3 },
    { id: '3', name: 'History Buffs', members: 4 },
];

export default function GroupsPage() {
    const [groups, setGroups] = useState(mockGroups);
    const [showModal, setShowModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    const handleCreateGroup = () => {
        if (!newGroupName) return;
        setGroups([
            ...groups,
            {
                id: (groups.length + 1).toString(),
                name: newGroupName,
                members: 1,
            },
        ]);
        setNewGroupName('');
        setShowModal(false);
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            <Sidebar />
            <main className="flex-1 p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            My Study Groups
                        </h1>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md"
                        >
                            + Create Group
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {groups.map((group, idx) => (
                            <Link
                                key={group.id}
                                href={`/groups/${group.id}`}
                                className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-lg flex flex-col gap-3 hover:scale-105 hover:shadow-2xl transition-all cursor-pointer group"
                            >
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2 ${
                                        groupColors[idx % groupColors.length]
                                    } group-hover:scale-110 transition-transform`}
                                >
                                    {group.name[0]}
                                </div>
                                <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
                                    {group.name}
                                </h2>
                                <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                                    Active group
                                </div>
                                <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-700/20 text-green-700 dark:text-green-400 text-xs rounded-full w-fit">
                                    {group.members} member
                                    {group.members !== 1 ? 's' : ''}
                                </span>
                            </Link>
                        ))}
                    </div>
                    {/* Create Group Modal */}
                    {showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70">
                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative flex flex-col items-center">
                                <button
                                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
                                    onClick={() => setShowModal(false)}
                                    aria-label="Close"
                                >
                                    &times;
                                </button>
                                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
                                    Create New Study Group
                                </h2>
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) =>
                                        setNewGroupName(e.target.value)
                                    }
                                    placeholder="Group Name"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                <button
                                    onClick={handleCreateGroup}
                                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
