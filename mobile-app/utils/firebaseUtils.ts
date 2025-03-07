import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Caption } from '../types/caption';

// Maximum number of retry attempts for Firestore operations
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to implement retry logic
const withRetry = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    if (retries <= 0) throw error;
    
    // Only retry for specific Firestore errors that might be temporary
    const retryableErrors = [
      'unavailable', 
      'resource-exhausted',
      'deadline-exceeded',
      'cancelled',
      'internal'
    ];
    
    if (!retryableErrors.includes(error.code)) {
      throw error;
    }
    
    console.warn(`Firestore operation failed, retrying (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`, error);
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Exponential backoff
    return withRetry(operation, retries - 1, delay * 2);
  }
};

// Convert Firestore document to Caption object
export const captionFromFirestore = (
  doc: QueryDocumentSnapshot<DocumentData>
): Caption => {
  const data = doc.data();
  return {
    id: doc.id,
    text: data.text,
    category: data.category,
    hashtags: data.hashtags || [],
    emojis: data.emojis || [],
    createdAt: new Date(data.createdAt?.toDate() || new Date()),
    viral_score: data.viral_score || 5,
  };
};

// Save a single caption to user's saved captions
export const saveCaption = async (userId: string, caption: Caption): Promise<Caption> => {
  return withRetry(async () => {
    try {
      if (!db) {
        throw new Error('Firestore is not initialized');
      }
      
      const captionWithTimestamp = {
        ...caption,
        userId,
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db as Firestore, 'savedCaptions'), captionWithTimestamp);
      return { ...caption, id: docRef.id };
    } catch (error) {
      console.error('Error saving caption:', error);
      throw error;
    }
  });
};

// Delete a caption from user's saved captions
export const deleteCaption = async (captionId: string): Promise<boolean> => {
  return withRetry(async () => {
    try {
      if (!db) {
        throw new Error('Firestore is not initialized');
      }
      
      await deleteDoc(doc(db as Firestore, 'savedCaptions', captionId));
      return true;
    } catch (error) {
      console.error('Error deleting caption:', error);
      throw error;
    }
  });
};

// Get all saved captions for a user
export const getSavedCaptions = async (userId: string): Promise<Caption[]> => {
  return withRetry(async () => {
    try {
      if (!db) {
        throw new Error('Firestore is not initialized');
      }
      
      const q = query(
        collection(db as Firestore, 'savedCaptions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(captionFromFirestore);
    } catch (error) {
      console.error('Error getting saved captions:', error);
      throw error;
    }
  });
}; 