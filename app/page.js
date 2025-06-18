'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db, storage } from '@/lib/firebase';
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardMain from '../components/dashboard/DashboardMain';
import CreateTopicModal from '../components/dashboard/CreateTopicModal';
import DiagnosticQuiz from '../components/quiz/DiagnosticQuiz';
import { toast } from 'react-hot-toast';
import TeacherDashboard from '../components/dashboard/TeacherDashboard';

export default function Home() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [topics, setTopics] = useState([]);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [diagnosticQuizOpen, setDiagnosticQuizOpen] = useState(false);
    const [currentTopicForQuiz, setCurrentTopicForQuiz] = useState(null);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'topics'),
            where('userId', '==', user.uid)
        );
        const unsub = onSnapshot(q, (snapshot) => {
            setTopics(
                snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
        });
        return () => unsub();
    }, [user]);

    const handleCreateTopic = async ({ name, materials }) => {
        try {
            const docRef = await addDoc(collection(db, 'topics'), {
                userId: user.uid,
                title: name,
                materials, // array of {name, text, processedByAI, etc.}
                proficiency: 0,
                upNext: 'Diagnostic Quiz',
                hasCompletedDiagnostic: false,
                diagnosticResults: null,
                createdAt: serverTimestamp(),
            });

            // Get the created topic with its ID
            const newTopic = {
                id: docRef.id,
                userId: user.uid,
                title: name,
                materials,
                proficiency: 0,
                upNext: 'Diagnostic Quiz',
                hasCompletedDiagnostic: false,
                diagnosticResults: null,
            };

            setCreateModalOpen(false);
            if (user.profile?.role === 'teacher') {
                router.push(`/topics/${newTopic.id}`);
            } else {
                // Automatically start diagnostic quiz for new topic (students only)
                setCurrentTopicForQuiz(newTopic);
                setDiagnosticQuizOpen(true);
            }
        } catch (error) {
            console.error('Error creating topic:', error);
        }
    };

    const handleDiagnosticComplete = async (results) => {
        if (!currentTopicForQuiz) return;

        try {
            // Update topic with diagnostic results and mark as onboarded
            const topicRef = doc(db, 'topics', currentTopicForQuiz.id);

            const updateData = {
                hasCompletedDiagnostic: true,
                isOnboarded: true,
                diagnosticResults: results,
                knowledgeGaps: results.knowledgeGaps || [],
                weakAreas: results.weakAreas || [],
                proficiency: results.overallScore,
                upNext: generateNextStep(results),
                lastUpdated: serverTimestamp(),
            };

            await updateDoc(topicRef, updateData);

            // Close diagnostic quiz
            setDiagnosticQuizOpen(false);
            setCurrentTopicForQuiz(null);

            // Redirect to topic page
            router.push(`/topics/${currentTopicForQuiz.id}`);
        } catch (error) {
            console.error('Error saving diagnostic results:', error);
            toast.error('Failed to save quiz results. Please try again.');
        }
    };

    const handleDiagnosticSkip = async () => {
        if (!currentTopicForQuiz) return;

        try {
            // Update topic to mark diagnostic as skipped but still onboarded
            await updateDoc(doc(db, 'topics', currentTopicForQuiz.id), {
                hasCompletedDiagnostic: true,
                isOnboarded: true,
                diagnosticResults: null,
                knowledgeGaps: [],
                weakAreas: [],
                upNext: 'Study Materials',
                lastUpdated: serverTimestamp(),
            });

            // Close diagnostic quiz
            setDiagnosticQuizOpen(false);
            setCurrentTopicForQuiz(null);
        } catch (error) {
            console.error('Error skipping diagnostic:', error);
        }
    };

    const generateNextStep = (results) => {
        const score = results.overallScore;
        if (score >= 80) return 'Advanced Practice';
        if (score >= 60) return 'Targeted Review';
        if (score >= 40) return 'Foundation Building';
        return 'Basic Concepts';
    };

    const startDiagnosticForTopic = (topic) => {
        setCurrentTopicForQuiz(topic);
        setDiagnosticQuizOpen(true);
    };

    useEffect(() => {
        if (!loading && !user) {
            setShowOnboarding(false);
            router.push('/auth');
        } else if (!loading && user) {
            if (!user.profile?.onboardingCompleted) {
                setShowOnboarding(true);
            } else {
                setShowOnboarding(false);
            }
        }
    }, [user, loading, router]);

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
    };

    const handleLogout = async () => {
        setShowOnboarding(false);
        await logout();
        router.push('/auth');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    if (showOnboarding) {
        return <OnboardingFlow onComplete={handleOnboardingComplete} />;
    }

    if (!user) {
        return null; // Will redirect to auth page
    }

    // Render teacher dashboard if user is a teacher
    if (user.profile?.role === 'teacher') {
        return (
            <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900">
                <Sidebar onCreateTopic={() => setCreateModalOpen(true)} />
                <main className="flex-1 w-full">
                    <TeacherDashboard
                        user={user}
                        topics={topics}
                        onCreateTopic={handleCreateTopic}
                    />
                </main>
                <CreateTopicModal
                    open={createModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    onCreate={handleCreateTopic}
                />
            </div>
        );
    }

    // Student dashboard (default)
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900">
            <Sidebar onCreateTopic={() => setCreateModalOpen(true)} />
            <main className="flex-1 w-full">
                <DashboardMain
                    user={user}
                    topics={topics}
                    onCreateTopic={() => setCreateModalOpen(true)}
                    onStartDiagnostic={startDiagnosticForTopic}
                />
            </main>
            <CreateTopicModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreate={handleCreateTopic}
            />
            <DiagnosticQuiz
                topic={currentTopicForQuiz}
                isOpen={diagnosticQuizOpen}
                onComplete={handleDiagnosticComplete}
                onSkip={handleDiagnosticSkip}
            />
        </div>
    );
}
