import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  connectFirestoreEmulator, 
  Firestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  FirestoreSettings
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';

// Check if Firebase configuration is complete
const isFirebaseConfigValid = () => {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
};

// Initialize Firebase
const initializeFirebase = () => {
  if (!isFirebaseConfigValid()) {
    console.warn(
      'Firebase configuration is incomplete. Some features may not work properly.'
    );
    return null;
  }

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  try {
    // Initialize Firebase only once
    let app: FirebaseApp;
    
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      console.log('Firebase app initialized');
    } else {
      app = getApp();
      console.log('Using existing Firebase app');
    }
    
    // Initialize Firestore with persistent cache
    let db: Firestore;
    if (typeof window !== 'undefined') {
      // Use persistentLocalCache with multi-tab support in browser environment
      db = initializeFirestore(app, {
        cache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      } as any); // Type assertion to bypass TypeScript error
      console.log('Firestore initialized with persistent cache');
    } else {
      // Use default settings in non-browser environment
      db = getFirestore(app);
    }
    
    const storage = getStorage(app);
    const auth = getAuth(app);
    const googleProvider = new GoogleAuthProvider();
    
    // Configure Google Auth Provider
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Use emulators in development if needed
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
      if (typeof window !== 'undefined') {
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectStorageEmulator(storage, 'localhost', 9199);
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      }
    }
    
    // console.log('Firebase services initialized successfully');
    return { app, db, storage, auth, googleProvider };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return null;
  }
};

// Initialize Firebase and export the instances
const firebaseInstance = initializeFirebase();

export const app = firebaseInstance?.app;
export const db = firebaseInstance?.db;
export const storage = firebaseInstance?.storage;
export const auth = firebaseInstance?.auth;
export const googleProvider = firebaseInstance?.googleProvider;

export const checkFirebaseStatus = (): boolean => {
  return !!firebaseInstance;
};

// Export a function to get the current user
export const getCurrentUser = () => {
  return auth?.currentUser;
}; 