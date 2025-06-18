'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    FiArrowLeft,
    FiBook,
    FiTarget,
    FiBarChart2,
    FiClock,
    FiBookOpen,
    FiCheckSquare,
    FiLock,
} from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function TopicPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedArea, setSelectedArea] = useState(null);
    const [generating, setGenerating] = useState(false);
    const pdfRef = useRef();

    useEffect(() => {
        const fetchTopic = async () => {
            try {
                const topicDoc = await getDoc(doc(db, 'topics', id));
                if (topicDoc.exists()) {
                    setTopic({ id: topicDoc.id, ...topicDoc.data() });
                }
            } catch (error) {
                console.error('Error fetching topic:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopic();
    }, [id]);

    // Helper function to generate study materials based on learning style and priority areas
    const generateStudyMaterials = (gap) => {
        // Define all learning styles
        const allStyles = [
            {
                type: 'text-based',
                title: 'Written Guide',
                description: `Comprehensive written explanation of ${gap.topic} with examples and practice problems`,
                duration: '20 mins',
                format: 'Text Document',
                available: true,
            },
            {
                type: 'visual',
                title: 'Visual Learning Module',
                description: `Visual representation and diagrams of ${gap.topic} concepts`,
                duration: '15 mins',
                format: 'Interactive Visuals',
                available: false,
            },
            {
                type: 'auditory',
                title: 'Audio Lesson',
                description: `Narrated explanation of ${gap.topic} with key concepts`,
                duration: '10 mins',
                format: 'Audio Recording',
                available: false,
            },
            {
                type: 'mixed',
                title: 'Mixed Learning Experience',
                description: `Combined learning approach for ${gap.topic} using multiple formats`,
                duration: '25 mins',
                format: 'Multi-format Module',
                available: false,
            },
        ];

        // Get user's preferred learning style (you'll need to get this from the user's settings)
        const userPreferredStyle = topic.learningStyle || 'text-based';

        // Reorder materials to put user's preferred style first
        const reorderedMaterials = [
            ...allStyles.filter((m) => m.type === userPreferredStyle),
            ...allStyles.filter((m) => m.type !== userPreferredStyle),
        ];

        return reorderedMaterials;
    };

    const startLearning = async (material, gap) => {
        if (!material.available) {
            toast.error(`${material.format} is coming soon!`);
            return;
        }

        try {
            // For text-based materials, create a study session
            if (material.type === 'text-based') {
                console.log('Starting study session for gap:', gap);

                // Update the topic with study session info first
                await updateDoc(doc(db, 'topics', topic.id), {
                    currentStudySession: {
                        gapId: gap.topic,
                        materialType: material.type,
                        startedAt: new Date().toISOString(),
                        completed: false,
                    },
                });

                // Then navigate to the study session page
                router.push(`/topics/${topic.id}/study/${gap.topic}`);
            }
        } catch (error) {
            console.error('Error starting study session:', error);
            toast.error('Failed to start study session');
        }
    };

    // Handler to generate study materials using AI
    const handleGenerateMaterials = async () => {
        if (!topic) return;
        setGenerating(true);
        try {
            const res = await fetch('/api/generateStudyMaterials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: topic.title,
                    explanation:
                        topic.description ||
                        `Generate study materials for ${topic.title}`,
                }),
            });
            const data = await res.json();
            if (!data.success)
                throw new Error(data.error || 'AI generation failed');
            // Save flashcards and practiceQuestions as materials
            const generatedMaterials = {
                flashcards: data.studyMaterials.flashcards,
                practiceQuestions: data.studyMaterials.practiceQuestions,
            };
            await updateDoc(doc(db, 'topics', topic.id), {
                materials: generatedMaterials,
            });
            setTopic({ ...topic, materials: generatedMaterials });
            toast.success('AI study materials generated!');
        } catch (error) {
            toast.error('Failed to generate materials');
        } finally {
            setGenerating(false);
        }
    };

    // Handler to export study materials as JSON
    const handleExportMaterials = () => {
        if (
            !topic?.materials ||
            (!topic.materials.flashcards && !topic.materials.practiceQuestions)
        ) {
            toast.error('No study materials to export');
            return;
        }
        const blob = new Blob([JSON.stringify(topic.materials, null, 2)], {
            type: 'application/json',
        });
        saveAs(blob, `${topic.title.replace(/\s+/g, '_')}_materials.json`);
    };

    // Handler to export study materials as PDF
    const handleExportPDF = async () => {
        if (!pdfRef.current) return;
        const element = pdfRef.current;
        // Make sure the element is visible for capture
        element.style.display = 'block';
        // Wait for DOM to update
        await new Promise((resolve) => setTimeout(resolve, 100));
        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#fff',
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4',
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let position = 20;
        let remainingHeight = imgHeight;
        let pageNum = 0;
        // If the image is taller than one page, split it
        while (remainingHeight > 0) {
            const sourceY =
                (imgHeight - remainingHeight) * (canvas.height / imgHeight);
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = Math.min(
                canvas.height - sourceY,
                (pageHeight - 40) * (canvas.height / imgHeight)
            );
            const ctx = pageCanvas.getContext('2d');
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            ctx.drawImage(
                canvas,
                0,
                sourceY,
                canvas.width,
                pageCanvas.height,
                0,
                0,
                canvas.width,
                pageCanvas.height
            );
            const pageImgData = pageCanvas.toDataURL('image/png');
            if (pageNum > 0) pdf.addPage();
            pdf.addImage(
                pageImgData,
                'PNG',
                20,
                20,
                imgWidth,
                (pageCanvas.height * imgWidth) / canvas.width
            );
            remainingHeight -= pageHeight - 40;
            pageNum++;
        }
        pdf.save(`${topic.title.replace(/\s+/g, '_')}_materials.pdf`);
        // Hide the element again
        element.style.display = 'none';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
                <div className="max-w-6xl mx-auto">Loading...</div>
            </div>
        );
    }

    if (!topic) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
                <div className="max-w-6xl mx-auto">Topic not found</div>
            </div>
        );
    }

    // Teacher view
    if (user?.profile?.role === 'teacher') {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/"
                        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                    >
                        <FiArrowLeft className="mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold mb-8">{topic.title}</h1>
                    <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
                        <h2 className="text-2xl font-semibold">
                            Study Materials
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={handleGenerateMaterials}
                                disabled={generating}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50"
                            >
                                {generating
                                    ? 'Generating...'
                                    : 'Generate Study Materials'}
                            </button>
                            <button
                                onClick={handleExportMaterials}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                            >
                                Export
                            </button>
                            <button
                                onClick={handleExportPDF}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
                            >
                                Export as PDF
                            </button>
                        </div>
                    </div>
                    {/* Flashcards Section */}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold mb-2">Flashcards</h3>
                        {topic.materials?.flashcards &&
                        topic.materials.flashcards.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {topic.materials.flashcards.map((card, idx) => (
                                    <div
                                        key={idx}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
                                    >
                                        <div className="font-semibold">
                                            Q: {card.question}
                                        </div>
                                        <div className="mt-2">
                                            A: {card.answer}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            Concept: {card.concept}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-500 dark:text-gray-400">
                                No flashcards yet.
                            </div>
                        )}
                    </div>
                    {/* Practice Questions Section */}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold mb-2">
                            Practice Questions
                        </h3>
                        {topic.materials?.practiceQuestions &&
                        topic.materials.practiceQuestions.length > 0 ? (
                            <div className="space-y-4">
                                {topic.materials.practiceQuestions.map(
                                    (q, idx) => (
                                        <div
                                            key={idx}
                                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
                                        >
                                            <div className="font-semibold mb-1">
                                                Q: {q.question}
                                            </div>
                                            <ul className="mb-2 list-disc pl-5">
                                                {q.options.map((opt, i) => (
                                                    <li key={i}>{opt}</li>
                                                ))}
                                            </ul>
                                            <div className="text-green-700 dark:text-green-400 text-sm mb-1">
                                                Correct: {q.correctAnswer}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {q.explanation}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Difficulty: {q.difficulty}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="text-gray-500 dark:text-gray-400">
                                No practice questions yet.
                            </div>
                        )}
                    </div>
                    {/* Hidden PDF export section */}
                    <div
                        ref={pdfRef}
                        style={{
                            display: 'none',
                            background: '#fff',
                            color: '#000',
                            padding: 24,
                            width: 800,
                        }}
                    >
                        <style>{`.pdf-page-break { page-break-before: always; }`}</style>
                        <h1
                            style={{
                                fontSize: 28,
                                fontWeight: 'bold',
                                marginBottom: 8,
                            }}
                        >
                            {topic.title}
                        </h1>
                        <h2
                            style={{
                                fontSize: 22,
                                fontWeight: 'bold',
                                marginBottom: 8,
                            }}
                        >
                            Flashcards
                        </h2>
                        {topic.materials?.flashcards &&
                        topic.materials.flashcards.length > 0 ? (
                            <ul style={{ marginBottom: 16 }}>
                                {topic.materials.flashcards.map((card, idx) => (
                                    <li
                                        key={idx}
                                        style={{ marginBottom: 8 }}
                                        className={
                                            idx > 0 ? 'pdf-page-break' : ''
                                        }
                                    >
                                        <div>
                                            <b>Q:</b> {card.question}
                                        </div>
                                        <div>
                                            <b>A:</b> {card.answer}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: '#555',
                                            }}
                                        >
                                            Concept: {card.concept}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div>No flashcards yet.</div>
                        )}
                        <h2
                            style={{
                                fontSize: 22,
                                fontWeight: 'bold',
                                marginBottom: 8,
                            }}
                        >
                            Practice Questions
                        </h2>
                        {topic.materials?.practiceQuestions &&
                        topic.materials.practiceQuestions.length > 0 ? (
                            <ul>
                                {topic.materials.practiceQuestions.map(
                                    (q, idx) => (
                                        <li
                                            key={idx}
                                            style={{ marginBottom: 12 }}
                                            className={
                                                idx > 0 ? 'pdf-page-break' : ''
                                            }
                                        >
                                            <div>
                                                <b>Q:</b> {q.question}
                                            </div>
                                            <ul style={{ marginLeft: 16 }}>
                                                {q.options.map((opt, i) => (
                                                    <li key={i}>{opt}</li>
                                                ))}
                                            </ul>
                                            <div
                                                style={{
                                                    color: 'green',
                                                    fontSize: 13,
                                                }}
                                            >
                                                Correct: {q.correctAnswer}
                                            </div>
                                            <div style={{ fontSize: 12 }}>
                                                {q.explanation}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: '#888',
                                                }}
                                            >
                                                Difficulty: {q.difficulty}
                                            </div>
                                        </li>
                                    )
                                )}
                            </ul>
                        ) : (
                            <div>No practice questions yet.</div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                    >
                        <FiArrowLeft className="mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">{topic.title}</h1>
                    <div className="flex flex-wrap gap-2">
                        {topic.isOnboarded && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400 text-xs rounded-full">
                                Onboarded
                            </span>
                        )}
                        {topic.hasCompletedDiagnostic && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                                Assessed
                            </span>
                        )}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Diagnostic Results */}
                    <div className="space-y-6">
                        {/* Diagnostic Results Card */}
                        {topic.diagnosticResults && (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-semibold mb-4 flex items-center">
                                    <FiTarget className="mr-2" />
                                    Diagnostic Results
                                </h2>
                                <div className="space-y-4">
                                    {/* Overall Score */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Overall Proficiency
                                            </span>
                                            <span className="font-medium">
                                                {topic.proficiency}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                    topic.proficiency >= 80
                                                        ? 'bg-green-500'
                                                        : topic.proficiency >=
                                                          60
                                                        ? 'bg-yellow-500'
                                                        : 'bg-red-500'
                                                }`}
                                                style={{
                                                    width: `${topic.proficiency}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Topic Proficiencies */}
                                    {topic.diagnosticResults
                                        .topicProficiencies && (
                                        <div className="mt-4">
                                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                                Topic Breakdown
                                            </h3>
                                            <div className="space-y-2">
                                                {topic.diagnosticResults.topicProficiencies.map(
                                                    (tp, index) => (
                                                        <div key={index}>
                                                            <div className="flex justify-between items-center text-sm mb-1">
                                                                <span className="text-gray-700 dark:text-gray-300">
                                                                    {tp.topic}
                                                                </span>
                                                                <span className="text-gray-600 dark:text-gray-400">
                                                                    {tp.score}%
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                                                                <div
                                                                    className={`h-1 rounded-full ${
                                                                        tp.score >=
                                                                        80
                                                                            ? 'bg-green-500'
                                                                            : tp.score >=
                                                                              60
                                                                            ? 'bg-yellow-500'
                                                                            : 'bg-red-500'
                                                                    }`}
                                                                    style={{
                                                                        width: `${tp.score}%`,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Progress Tracking Card */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold mb-4 flex items-center">
                                <FiBarChart2 className="mr-2" />
                                Progress
                            </h2>
                            <div className="space-y-4">
                                {/* Materials Progress */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                        Materials
                                    </h3>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {topic.materials?.length || 0}{' '}
                                            uploaded
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {topic.materials?.filter(
                                                (m) => m.status === 'processed'
                                            ).length || 0}{' '}
                                            processed
                                        </span>
                                    </div>
                                </div>

                                {/* Last Updated */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                        Last Activity
                                    </h3>
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        {topic.lastUpdated
                                            ?.toDate()
                                            .toLocaleDateString() ||
                                            'No activity yet'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column - Areas to Review */}
                    <div className="space-y-6">
                        {/* Knowledge Gaps Card */}
                        {topic.knowledgeGaps &&
                            topic.knowledgeGaps.length > 0 && (
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                                        <FiBook className="mr-2" />
                                        Areas to Review
                                    </h2>
                                    <div className="space-y-4">
                                        {topic.knowledgeGaps.map(
                                            (gap, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                                                        selectedArea === index
                                                            ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500'
                                                            : 'bg-gray-100 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                                    }`}
                                                    onClick={() =>
                                                        setSelectedArea(index)
                                                    }
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                            {gap.topic}
                                                        </h3>
                                                        <span
                                                            className={`px-2 py-1 text-xs rounded-full ${
                                                                gap.difficulty ===
                                                                'basic'
                                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                                            }`}
                                                        >
                                                            {gap.difficulty}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                        {gap.question}
                                                    </p>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        <strong>Review:</strong>{' '}
                                                        {gap.explanation}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>

                    {/* Right Column - Study Materials */}
                    <div className="space-y-6">
                        {/* Study Materials Card */}
                        {selectedArea !== null && topic.knowledgeGaps && (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-semibold mb-4 flex items-center">
                                    <FiBookOpen className="mr-2" />
                                    Study Materials
                                </h2>
                                <div className="space-y-4">
                                    {generateStudyMaterials(
                                        topic.knowledgeGaps[selectedArea]
                                    ).map((material, index) => (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-lg border transition-colors ${
                                                material.type ===
                                                (topic.learningStyle ||
                                                    'text-based')
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-500/30'
                                                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                    {material.title}
                                                    {material.type ===
                                                        (topic.learningStyle ||
                                                            'text-based') && (
                                                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-full">
                                                            Recommended
                                                        </span>
                                                    )}
                                                </h3>
                                                <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <FiClock className="mr-1" />
                                                    {material.duration}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                {material.description}
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                                                    {material.format}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        startLearning(
                                                            material,
                                                            topic.knowledgeGaps[
                                                                selectedArea
                                                            ]
                                                        )
                                                    }
                                                    className={`text-sm flex items-center gap-1 px-3 py-1 rounded ${
                                                        material.available
                                                            ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                                                            : 'text-gray-500 dark:text-gray-400'
                                                    }`}
                                                >
                                                    {material.available ? (
                                                        <>
                                                            <FiCheckSquare className="mr-1" />
                                                            Start Learning
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiLock className="mr-1" />
                                                            Coming Soon
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedArea === null && (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
                                <FiBookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Select an Area to Review
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Click on a topic from the Areas to Review
                                    section to see personalized study materials.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
