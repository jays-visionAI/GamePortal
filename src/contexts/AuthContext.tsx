import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check for redirect result on mount
        const checkRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    console.log('Redirect login successful');
                }
            } catch (error: any) {
                console.error('Redirect result error:', error);
                setError(error.message || 'Failed to complete login');
            }
        };

        checkRedirectResult();

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    // Save/Update user to Firestore
                    const userRef = doc(db, 'users', currentUser.uid);
                    const userSnap = await getDoc(userRef);

                    if (!userSnap.exists()) {
                        await setDoc(userRef, {
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName,
                            photoURL: currentUser.photoURL,
                            createdAt: new Date().toISOString(),
                            lastLogin: new Date().toISOString()
                        });
                    } else {
                        await setDoc(userRef, {
                            lastLogin: new Date().toISOString()
                        }, { merge: true });
                    }
                } catch (error) {
                    console.error('Error saving user data:', error);
                }
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        try {
            setError(null);
            // Try popup first
            await signInWithPopup(auth, googleProvider);
        } catch (error: any) {
            console.error("Popup error:", error);

            // If popup is blocked or fails, try redirect
            if (error.code === 'auth/popup-blocked' ||
                error.code === 'auth/popup-closed-by-user' ||
                error.code === 'auth/cancelled-popup-request') {
                try {
                    console.log('Popup failed, trying redirect...');
                    await signInWithRedirect(auth, googleProvider);
                } catch (redirectError: any) {
                    console.error("Redirect error:", redirectError);
                    setError(redirectError.message || 'Failed to sign in with Google');
                }
            } else {
                setError(error.message || 'Failed to sign in with Google');
            }
        }
    };

    const logout = async () => {
        try {
            setError(null);
            await signOut(auth);
        } catch (error: any) {
            console.error("Error signing out", error);
            setError(error.message || 'Failed to sign out');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, error }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
