'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { useRouter } from 'next/navigation';
import { setAuthCookie, removeAuthCookie } from '../utils/authCookies';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth!, async (user) => {
      if (user) {
        // Set the auth cookie
        await setAuthCookie(user);
      } else {
        // Remove the auth cookie
        await removeAuthCookie();
      }
      
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth!, email, password);
      
      // Set the auth cookie
      await setAuthCookie(userCredential.user);
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth!, email, password);
      
      // Update profile with display name
      if (result.user) {
        await updateProfile(result.user, {
          displayName: name
        });
        
        // Set the auth cookie
        await setAuthCookie(result.user);
      }
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth!);
      await removeAuthCookie();
      router.push('/');
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth!, googleProvider!);
      
      // Set the auth cookie
      await setAuthCookie(result.user);
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error signing in with Google:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth!, email);
    } catch (error: any) {
      console.error('Error resetting password:', error.message);
      throw error;
    }
  };

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      await updateProfile(user, {
        displayName,
        ...(photoURL && { photoURL })
      });
      
      // Force refresh the user object
      setUser({ ...user });
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logOut,
    signInWithGoogle,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 