import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  Auth
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { useLocalStorage } from './useLocalStorage';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  
  // Use a ref to track if the auth state listener is already set up
  const authListenerSetup = useRef(false);
  
  // Use local storage to persist the user's authentication state
  const { value: persistedUser, setValue: setPersistedUser } = useLocalStorage<string | null>('auth_user', null);

  // Memoize the setPersistedUser function to prevent it from changing on every render
  const updatePersistedUser = useCallback((user: User | null) => {
    if (user) {
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
      setPersistedUser(JSON.stringify(userData));
    } else {
      setPersistedUser(null);
    }
  }, [setPersistedUser]);

  useEffect(() => {
    // Prevent setting up multiple listeners
    if (authListenerSetup.current) {
      return () => {};
    }
    
    authListenerSetup.current = true;
    console.log('Setting up auth state listener');
    
    if (!auth) {
      console.error('Firebase auth is not initialized in useEffect');
      setState({
        user: null,
        loading: false,
        error: 'Firebase auth is not initialized',
      });
      return () => {};
    }

    // Try to restore user from persisted data
    if (persistedUser && !state.user) {
      try {
        const userData = JSON.parse(persistedUser);
        setState({
          user: userData as User,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error parsing persisted user:', error);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? `User: ${user.uid}` : 'No user');
      
      // Only update state if it's different from current state
      if ((user && !state.user) || (!user && state.user) || 
          (user && state.user && user.uid !== state.user.uid)) {
        setState({
          user,
          loading: false,
          error: null,
        });
        
        // Persist the user data
        updatePersistedUser(user);
      } else if (state.loading) {
        // Update loading state even if user hasn't changed
        setState(prevState => ({
          ...prevState,
          loading: false
        }));
      }
    });

    return () => {
      console.log('Cleaning up auth state listener');
      authListenerSetup.current = false;
      unsubscribe();
    };
  }, []);  // Remove dependencies to prevent re-running

  const signup = async (email: string, password: string, displayName: string) => {
    setState({ ...state, loading: true, error: null });
    console.log('Signup attempt started for:', email);
    
    if (!auth) {
      console.error('Firebase auth is not initialized in signup');
      setState({
        ...state,
        loading: false,
        error: 'Firebase auth is not initialized',
      });
      throw new Error('Firebase auth is not initialized');
    }
    
    // Create a promise that rejects after a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Signup timed out. Please try again.')), 10000);
    });
    
    try {
      console.log('Calling Firebase createUserWithEmailAndPassword...');
      
      // Race between the signup and the timeout
      const userCredential = await Promise.race([
        createUserWithEmailAndPassword(auth, email, password),
        timeoutPromise
      ]) as any;
      
      console.log('Signup successful, updating profile...');
      
      // Update the user's display name
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName,
        });
        console.log('Profile updated successfully');
      }
      
      setState({
        user: userCredential.user,
        loading: false,
        error: null,
      });
      return userCredential.user;
    } catch (error: any) {
      console.error('Signup error:', error.message);
      setState({
        ...state,
        loading: false,
        error: error.message,
      });
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    setState({ ...state, loading: true, error: null });
    console.log('Login attempt started for:', email);
    
    if (!auth) {
      console.error('Firebase auth is not initialized in login');
      setState({
        ...state,
        loading: false,
        error: 'Firebase auth is not initialized',
      });
      throw new Error('Firebase auth is not initialized');
    }
    
    // Create a promise that rejects after a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Login timed out. Please try again.')), 15000);
    });
    
    try {
      console.log('Calling Firebase signInWithEmailAndPassword...');
      if (auth.app) {
        console.log('Auth app name:', auth.app.name);
        console.log('Firebase project ID:', auth.app.options.projectId);
      } else {
        console.log('Auth app is not available');
      }
      
      // Race between the login and the timeout
      const userCredential = await Promise.race([
        signInWithEmailAndPassword(auth, email, password),
        timeoutPromise
      ]) as any;
      
      console.log('Login successful:', userCredential.user.uid);
      setState({
        user: userCredential.user,
        loading: false,
        error: null,
      });
      return userCredential.user;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'An unknown error occurred';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = 'The email address is not valid.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This user account has been disabled.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No user found with this email address.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many unsuccessful login attempts. Please try again later.';
            break;
          default:
            errorMessage = error.message || 'Failed to log in. Please try again.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Formatted error message:', errorMessage);
      
      setState({
        ...state,
        loading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    setState({ ...state, loading: true, error: null });
    
    if (!auth) {
      console.error('Firebase auth is not initialized in logout');
      setState({
        ...state,
        loading: false,
        error: 'Firebase auth is not initialized',
      });
      throw new Error('Firebase auth is not initialized');
    }
    
    try {
      await signOut(auth);
      setState({
        user: null,
        loading: false,
        error: null,
      });
      // Clear persisted user data
      updatePersistedUser(null);
    } catch (error: any) {
      setState({
        ...state,
        loading: false,
        error: error.message,
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    setState({ ...state, loading: true, error: null });
    
    if (!auth) {
      console.error('Firebase auth is not initialized in resetPassword');
      setState({
        ...state,
        loading: false,
        error: 'Firebase auth is not initialized',
      });
      throw new Error('Firebase auth is not initialized');
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      setState({
        ...state,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState({
        ...state,
        loading: false,
        error: error.message,
      });
      throw error;
    }
  };

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    setState({ ...state, loading: true, error: null });
    
    try {
      if (!auth) {
        console.error('Firebase auth is not initialized');
        setState({
          ...state,
          loading: false,
          error: 'Firebase auth is not initialized',
        });
        throw new Error('Firebase auth is not initialized');
      }
      
      if (!auth.currentUser) {
        throw new Error('No user is currently logged in');
      }
      
      await updateProfile(auth.currentUser, data);
      
      // Update the local state with the new profile data
      setState({
        user: auth.currentUser,
        loading: false,
        error: null,
      });
      
      // Update the persisted user data
      updatePersistedUser(auth.currentUser);
      
      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      setState({
        ...state,
        loading: false,
        error: error.message,
      });
      throw error;
    }
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
  };
}; 