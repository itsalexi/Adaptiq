'use client';
import { useState } from 'react';

const fileTypes = '.pdf,.ppt,.pptx,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif';

export default function CreateTopicModal({ open, onClose, onCreate }) {
    const [name, setName] = useState('');
    const [materials, setMaterials] = useState([]);
    const [adding, setAdding] = useState(false);
    const [addType, setAddType] = useState('file');
    const [file, setFile] = useState(null);
    const [manualText, setManualText] = useState('');
    const [manualName, setManualName] = useState('');
    const [saving, setSaving] = useState(false);
    const [processingFiles, setProcessingFiles] = useState(false);
    const [processingProgress, setProcessingProgress] = useState('');

    const handleAddFile = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Add files to materials list without processing
        const newMaterials = files.map((file) => ({
            name: file.name,
            file: file, // Store the actual file object
            text: `File uploaded: ${file.name} (${(file.size / 1024).toFixed(
                1
            )} KB)`,
            originalSize: file.size,
            type: file.type || 'unknown',
            processedByAI: false,
            error: false,
            pendingProcessing: true, // Flag to indicate it needs AI processing
        }));

        setMaterials((prev) => [...prev, ...newMaterials]);
        setFile(null);
        setAdding(false);
    };

    const handleAddManual = () => {
        if (!manualName || !manualText) return;
        setMaterials((prev) => [
            ...prev,
            {
                name: manualName,
                text: manualText,
                processedByAI: false,
                error: false,
                pendingProcessing: false, // Manual entries don't need AI processing
            },
        ]);
        setManualName('');
        setManualText('');
        setAdding(false);
    };

    const handleRemoveMaterial = (idx) => {
        setMaterials((prev) => prev.filter((_, i) => i !== idx));
    };

    const processFilesWithAI = async (filesToProcess) => {
        setProcessingFiles(true);
        setProcessingProgress('Processing files with AI...');

        try {
            // Create FormData for API call
            const formData = new FormData();
            filesToProcess.forEach((material) => {
                formData.append('files', material.file);
            });

            // Call Firebase AI API
            const response = await fetch('/api/processMaterialsWithGemini', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success && result.processed) {
                setProcessingProgress(
                    `Successfully processed ${result.totalFiles} file(s)`
                );
                return result.processed; // Return the processed results
            } else {
                throw new Error(result.error || 'Failed to process files');
            }
        } catch (error) {
            console.error('Error processing files:', error);
            setProcessingProgress(`Error: ${error.message}`);
            throw error; // Re-throw to handle in calling function
        } finally {
            setProcessingFiles(false);
            // Clear progress message after a delay
            setTimeout(() => setProcessingProgress(''), 3000);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) return;

        setSaving(true);

        try {
            // Process any pending files with AI first
            const pendingFiles = materials.filter((m) => m.pendingProcessing);
            let processedResults = [];

            if (pendingFiles.length > 0) {
                processedResults = await processFilesWithAI(pendingFiles);
            }

            // Prepare materials for saving, incorporating AI results
            const materialsToSave = materials.map((material) => {
                if (material.pendingProcessing) {
                    // Find the corresponding processed result
                    const processed = processedResults.find(
                        (p) => p.name === material.name
                    );
                    if (processed) {
                        return {
                            name: material.name,
                            text: processed.summary, // Use AI-generated summary
                            originalSize: material.originalSize,
                            type: material.type,
                            processedByAI: true,
                            error: processed.error || false,
                        };
                    } else {
                        // Fallback if processing failed
                        return {
                            name: material.name,
                            text: `File uploaded: ${material.name}`,
                            originalSize: material.originalSize,
                            type: material.type,
                            processedByAI: false,
                            error: true,
                        };
                    }
                } else {
                    // Manual entries or already processed
                    return {
                        name: material.name,
                        text: material.text,
                        originalSize: material.originalSize,
                        type: material.type,
                        processedByAI: material.processedByAI,
                        error: material.error,
                    };
                }
            });

            // Create the topic with processed materials
            await onCreate({ name, materials: materialsToSave });

            // Reset form
            setName('');
            setMaterials([]);
            setSaving(false);
            onClose();
        } catch (error) {
            console.error('Error creating topic:', error);
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"
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
                    Create New Topic
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-200 mb-1 font-medium">
                            Topic Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder='e.g. "Calculus 101", Biology 10'
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-gray-700 dark:text-gray-200 font-medium">
                                Materials
                            </label>
                            <button
                                type="button"
                                className="text-blue-600 hover:underline text-sm font-semibold"
                                onClick={() => {
                                    setAdding(true);
                                    setAddType('file');
                                }}
                                disabled={processingFiles}
                            >
                                + Add Material
                            </button>
                        </div>

                        {processingProgress && (
                            <div
                                className={`mb-3 p-3 rounded text-sm ${
                                    processingProgress.includes('Error')
                                        ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                        : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                }`}
                            >
                                {processingProgress}
                            </div>
                        )}

                        <ul className="mb-2 space-y-2">
                            {materials.map((mat, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-start justify-between bg-gray-100 dark:bg-gray-800 rounded px-3 py-2"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 dark:text-white truncate">
                                                {mat.name}
                                            </span>
                                            {mat.pendingProcessing && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400">
                                                    Pending AI
                                                </span>
                                            )}
                                            {mat.processedByAI &&
                                                !mat.pendingProcessing && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                                                        AI Processed
                                                    </span>
                                                )}
                                            {mat.error && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">
                                                    Error
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            <div className="line-clamp-2">
                                                {mat.text.slice(0, 100)}
                                                {mat.text.length > 100
                                                    ? '...'
                                                    : ''}
                                            </div>
                                            {mat.originalSize && (
                                                <div className="mt-1">
                                                    Size:{' '}
                                                    {(
                                                        mat.originalSize / 1024
                                                    ).toFixed(1)}{' '}
                                                    KB
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="ml-2 text-red-500 hover:text-red-700 text-lg flex-shrink-0"
                                        onClick={() =>
                                            handleRemoveMaterial(idx)
                                        }
                                    >
                                        &times;
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {adding && (
                            <div className="mb-2 p-3 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <div className="flex gap-2 mb-2">
                                    <button
                                        type="button"
                                        className={`px-3 py-1 rounded ${
                                            addType === 'file'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                                        }`}
                                        onClick={() => setAddType('file')}
                                        disabled={processingFiles}
                                    >
                                        File
                                    </button>
                                    <button
                                        type="button"
                                        className={`px-3 py-1 rounded ${
                                            addType === 'manual'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                                        }`}
                                        onClick={() => setAddType('manual')}
                                        disabled={processingFiles}
                                    >
                                        Manual
                                    </button>
                                </div>
                                {addType === 'file' ? (
                                    <div>
                                        <input
                                            type="file"
                                            accept={fileTypes}
                                            multiple
                                            className="w-full text-gray-700 dark:text-gray-200"
                                            onChange={handleAddFile}
                                            disabled={processingFiles}
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Supported: PDF, PowerPoint, Word,
                                            Text, Images. Files will be
                                            processed with AI when you click
                                            "Create".
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            placeholder="Material Name"
                                            value={manualName}
                                            onChange={(e) =>
                                                setManualName(e.target.value)
                                            }
                                        />
                                        <textarea
                                            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            placeholder="Material Text"
                                            rows={3}
                                            value={manualText}
                                            onChange={(e) =>
                                                setManualText(e.target.value)
                                            }
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                type="button"
                                                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                                                onClick={() => setAdding(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                className="px-3 py-1 rounded bg-blue-600 text-white"
                                                onClick={handleAddManual}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                            onClick={onClose}
                            disabled={saving || processingFiles}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
                            disabled={saving || !name || processingFiles}
                        >
                            {saving
                                ? processingFiles
                                    ? 'Processing...'
                                    : 'Creating...'
                                : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
