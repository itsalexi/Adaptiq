'use client';
import { useState } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';

const mockUser = {
    name: 'Jane Doe',
    email: 'jane.doe@email.com',
    role: 'student',
    streak: 7,
    points: 210,
};

export default function ProfilePage() {
    const [user, setUser] = useState(mockUser);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user.name);

    const handleSave = () => {
        setUser({ ...user, name });
        setEditing(false);
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            <Sidebar />
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold mb-1">
                        {user.name[0]}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-0">
                        Profile
                    </h2>
                    {editing ? (
                        <div className="w-full flex flex-col gap-2 mt-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setEditing(false);
                                        setName(user.name);
                                    }}
                                    className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {user.name}
                                </span>
                                <button
                                    onClick={() => setEditing(true)}
                                    className="text-blue-600 hover:underline text-xs"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="w-full flex flex-col gap-1 mt-2">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                                Email:
                            </span>
                            <span className="text-gray-600 dark:text-gray-300">
                                {user.email}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                                Role:
                            </span>
                            <span className="inline-block px-2 py-0.5 bg-green-100 dark:bg-green-700/20 text-green-700 dark:text-green-400 text-xs rounded-full">
                                {user.role}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                                Streak:
                            </span>
                            <span className="inline-block px-2 py-0.5 bg-yellow-100 dark:bg-yellow-700/20 text-yellow-700 dark:text-yellow-400 text-xs rounded-full">
                                {user.streak} days
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                                Points:
                            </span>
                            <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-700/20 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                                {user.points}
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
