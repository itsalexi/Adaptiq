'use client';
import { useState, useEffect } from 'react';

const learningStyleOptions = [
    { value: 'Visual', label: 'Visual' },
    { value: 'Text-Based', label: 'Text-Based' },
    { value: 'Auditory', label: 'Auditory' },
    { value: 'Mixed', label: 'Mixed' },
];

export default function ProfileSettingsModal({
    open,
    onClose,
    userProfile,
    onSave,
}) {
    const [name, setName] = useState(userProfile?.name || '');
    const [learningStyle, setLearningStyle] = useState(
        userProfile?.learningStyle || 'Mixed'
    );
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setName(userProfile?.name || '');
            setLearningStyle(userProfile?.learningStyle || 'Mixed');
        }
    }, [open, userProfile]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ name, learningStyle });
        setSaving(false);
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 w-full max-w-md relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
                    onClick={onClose}
                    aria-label="Close"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
                    Edit Profile Settings
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-200 mb-1 font-medium">
                            Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-200 mb-1 font-medium">
                            Learning Style
                        </label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={learningStyle}
                            onChange={(e) => setLearningStyle(e.target.value)}
                            required
                        >
                            {learningStyleOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
