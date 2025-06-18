import Link from 'next/link';
import { useState } from 'react';
import CreateTopicModal from './CreateTopicModal';

export default function TeacherDashboard({
    user,
    topics,
    onCreateTopic,
    onEditTopic,
    onDeleteTopic,
}) {
    const [createModalOpen, setCreateModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
                    >
                        + Create Study Material
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topics.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
                            No study materials yet. Click &quot;Create Study
                            Material&quot; to add your first topic.
                        </div>
                    ) : (
                        topics.map((topic) => (
                            <Link
                                key={topic.id}
                                href={`/topics/${topic.id}`}
                                className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800 shadow flex flex-col gap-2 hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
                            >
                                <h2 className="text-xl font-semibold mb-2">
                                    {topic.title}
                                </h2>
                                <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-700/20 text-green-700 dark:text-green-400 text-xs rounded-full">
                                    Study Material
                                </span>
                            </Link>
                        ))
                    )}
                </div>
                <CreateTopicModal
                    open={createModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    onCreate={onCreateTopic}
                />
            </div>
        </div>
    );
}
