'use client';
import {
    FiBookOpen,
    FiFolderPlus,
    FiPlay,
    FiCheckCircle,
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function DashboardMain({
    user,
    topics,
    onCreateTopic,
    onStartDiagnostic,
}) {
    const router = useRouter();

    const handleTopicClick = (topic) => {
        // If diagnostic not completed, start diagnostic
        if (!topic.hasCompletedDiagnostic) {
            onStartDiagnostic(topic);
        } else {
            // TODO: Navigate to topic study view
            console.log('Navigate to topic study:', topic.title);
        }
    };

    const navigateToTopic = (topicId) => {
        router.push(`/topics/${topicId}`);
    };

    return (
        <section className="flex-1 p-10 bg-white dark:bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                Good Evening, {user?.profile?.name || user?.email || 'Student'}.
            </h1>
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                My Topics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topics.map((topic) => (
                    <div
                        key={topic.id}
                        onClick={() => navigateToTopic(topic.id)}
                        className="bg-white dark:bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative group border border-gray-200 dark:border-gray-700"
                    >
                        {/* Add hover effect indicator */}
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 rounded-lg transition-colors"></div>

                        {/* Content */}
                        <div className="relative z-10">
                            {/* Title with truncation */}
                            <div className="mb-3">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                                    {topic.title}
                                </h3>
                            </div>

                            {/* Status badges */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {/* Onboarding Status */}
                                {topic.isOnboarded ? (
                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400 text-xs rounded-full">
                                        Onboarded
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-600/20 text-yellow-700 dark:text-yellow-400 text-xs rounded-full">
                                        Setup Required
                                    </span>
                                )}

                                {/* Diagnostic Status */}
                                {topic.hasCompletedDiagnostic ? (
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                                        Assessed
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600/20 text-gray-700 dark:text-gray-400 text-xs rounded-full">
                                        Not Assessed
                                    </span>
                                )}

                                {/* Material Status */}
                                {topic.materials?.some(
                                    (m) => m.status === 'processed'
                                ) && (
                                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-400 text-xs rounded-full">
                                        AI Processed
                                    </span>
                                )}

                                {topic.materials?.some(
                                    (m) => m.status === 'pending'
                                ) && (
                                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-600/20 text-orange-700 dark:text-orange-400 text-xs rounded-full">
                                        Pending AI
                                    </span>
                                )}
                            </div>

                            {/* Proficiency and Knowledge Gaps */}
                            {topic.proficiency !== undefined && (
                                <div className="mb-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Overall Proficiency
                                        </span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {topic.proficiency}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                topic.proficiency >= 80
                                                    ? 'bg-green-500'
                                                    : topic.proficiency >= 60
                                                    ? 'bg-yellow-500'
                                                    : 'bg-red-500'
                                            }`}
                                            style={{
                                                width: `${topic.proficiency}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Knowledge Gaps Summary */}
                            {topic.knowledgeGaps &&
                                topic.knowledgeGaps.length > 0 && (
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                Areas to Improve
                                            </span>
                                            <span className="text-xs text-red-700 dark:text-red-400">
                                                {topic.knowledgeGaps.length}{' '}
                                                gaps
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {topic.knowledgeGaps
                                                .slice(0, 3)
                                                .map((gap, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-red-50 dark:bg-red-600/20 text-red-700 dark:text-red-400 text-xs rounded"
                                                    >
                                                        {gap.topic}
                                                    </span>
                                                ))}
                                            {topic.knowledgeGaps.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded">
                                                    +
                                                    {topic.knowledgeGaps
                                                        .length - 3}{' '}
                                                    more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Weak Areas */}
                            {topic.weakAreas && topic.weakAreas.length > 0 && (
                                <div className="mb-3">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Priority Areas:
                                    </span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {topic.weakAreas
                                            .slice(0, 2)
                                            .map((area, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-orange-50 dark:bg-orange-600/20 text-orange-700 dark:text-orange-400 text-xs rounded"
                                                >
                                                    {area}
                                                </span>
                                            ))}
                                        {topic.weakAreas.length > 2 && (
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded">
                                                +{topic.weakAreas.length - 2}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Start Diagnostic Button - Only show if not completed */}
                            {!topic.hasCompletedDiagnostic && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent card click
                                        onStartDiagnostic(topic);
                                    }}
                                    className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Start Diagnostic
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {/* Create New Topic Card */}
                <div
                    className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col items-center justify-center min-h-[150px] cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    onClick={onCreateTopic}
                >
                    <FiFolderPlus className="text-3xl text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Create New Topic
                    </span>
                </div>
            </div>

            {/* Empty State */}
            {topics.length === 0 && (
                <div className="text-center py-12">
                    <FiBookOpen className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        No topics yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Create your first topic to start your learning journey
                    </p>
                    <button
                        onClick={onCreateTopic}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                        Create Your First Topic
                    </button>
                </div>
            )}
        </section>
    );
}
