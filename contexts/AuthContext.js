'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Get user profile from Firestore
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setUser({ ...user, profile: userDoc.data() });
                } else {
                    setUser(user);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signUp = async (email, password, profileData = {}) => {
        try {
            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            // Create user profile in Firestore
            await setDoc(doc(db, 'users', result.user.uid), {
                email: result.user.email,
                createdAt: new Date().toISOString(),
                onboardingCompleted: false,
                ...profileData,
            });

            return result;
        } catch (error) {
            throw error;
        }
    };

    const signIn = async (email, password) => {
        try {
            return await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            // Check if user profile exists, if not create one
            const userDoc = await getDoc(doc(db, 'users', result.user.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, 'users', result.user.uid), {
                    email: result.user.email,
                    name: result.user.displayName,
                    createdAt: new Date().toISOString(),
                    onboardingCompleted: false,
                });
            }

            return result;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        setUser(null);
        await signOut(auth);
    };

    const updateUserProfile = async (profileData) => {
        if (!user) return;

        try {
            await setDoc(
                doc(db, 'users', user.uid),
                {
                    ...user.profile,
                    ...profileData,
                },
                { merge: true }
            );

            // Update local user state
            setUser({ ...user, profile: { ...user.profile, ...profileData } });
        } catch (error) {
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                signUp,
                signIn,
                signInWithGoogle,
                logout,
                updateUserProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
