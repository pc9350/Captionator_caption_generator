import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, Firestore, enableIndexedDbPersistence, PersistenceSettings } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';

// Check if Firebase configuration is complete
const isFirebaseConfigValid = () => {
  const requiredEnvVars = [
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  ];
  
  const missingVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ].filter((key, index) => !requiredEnvVars[index]);
  
  if (missingVars.length > 0) {
    console.error(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  return requiredEnvVars.every(Boolean);
};

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase conditionally
let app: FirebaseApp | null = null;
let db: Firestore;
let storage: FirebaseStorage;

const initializeFirebase = () => {
  try {
    if (isFirebaseConfigValid()) {
      // Check if app is already initialized
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        console.log('Firebase app initialized');
      } else {
        app = getApp();
        console.log('Using existing Firebase app');
      }
      
      // Initialize Firestore with settings to improve reliability
      db = getFirestore(app);
      
      // Enable offline persistence with increased cache size
      if (typeof window !== 'undefined') {
        enableIndexedDbPersistence(db).catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
          } else if (err.code === 'unimplemented') {
            console.warn('The current browser does not support all of the features required to enable persistence');
          } else {
            console.error('Error enabling persistence:', err);
          }
        });
      }
      
      // Initialize Storage
      storage = getStorage(app);
      
      // Use emulators in development if needed
      if (process.env.NODE_ENV === 'development' && process.env.USE_FIREBASE_EMULATORS === 'true') {
        if (typeof window !== 'undefined') {
          // Only connect to emulators in browser environment
          connectFirestoreEmulator(db, 'localhost', 8080);
          connectStorageEmulator(storage, 'localhost', 9199);
          console.log('Connected to Firebase emulators');
        }
      }
      
      console.log('Firebase initialized successfully');
      return true;
    } else {
      console.warn('Firebase configuration is incomplete. Firebase features will be disabled.');
      // Create dummy objects that won't throw errors when used
      db = {} as Firestore;
      storage = {} as FirebaseStorage;
      return false;
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // Create dummy objects that won't throw errors when used
    db = {} as Firestore;
    storage = {} as FirebaseStorage;
    return false;
  }
};

// Initialize Firebase
const isInitialized = initializeFirebase();

export { app, db, storage };

// Helper function to check if Firebase is properly initialized
export const isFirebaseInitialized = (): boolean => {
  return !!app && db !== null && storage !== null && isFirebaseConfigValid();
}; 