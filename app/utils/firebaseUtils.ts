import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  runTransaction,
  writeBatch,
  FirestoreError
} from 'firebase/firestore';
import { Caption, CaptionHistory } from '../types';

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
  } catch (error) {
    if (retries <= 0) throw error;
    
    // Only retry for specific Firestore errors that might be temporary
    const firestoreError = error as FirestoreError;
    const retryableErrors = [
      'unavailable', 
      'resource-exhausted',
      'deadline-exceeded',
      'cancelled',
      'internal'
    ];
    
    if (!retryableErrors.includes(firestoreError.code)) {
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
    userId: data.userId,
    createdAt: data.createdAt
  };
};

// Convert Firestore document to CaptionHistory object
export const captionHistoryFromFirestore = (
  doc: QueryDocumentSnapshot<DocumentData>
): CaptionHistory => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    imageUrl: data.imageUrl,
    captions: data.captions || [],
    createdAt: data.createdAt?.toDate() || new Date(),
  };
};

// Save a single caption to user's saved captions
export const saveCaption = async (userId: string, caption: Caption) => {
  return withRetry(async () => {
    try {
      const captionWithTimestamp = {
        ...caption,
        userId,
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'savedCaptions'), captionWithTimestamp);
      return { ...caption, id: docRef.id, userId };
    } catch (error) {
      console.error('Error saving caption:', error);
      throw error;
    }
  });
};

// Delete a caption from user's saved captions
export const deleteCaption = async (captionId: string) => {
  return withRetry(async () => {
    try {
      await deleteDoc(doc(db, 'savedCaptions', captionId));
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
      const q = query(
        collection(db, 'savedCaptions'),
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

// Save caption generation history
export const saveCaptionGenerationHistory = async (
  userId: string,
  imageUrl: string,
  captions: Caption[]
) => {
  return withRetry(async () => {
    try {
      const historyData = {
        userId,
        imageUrl,
        captions,
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'captionHistory'), historyData);
      return { id: docRef.id, ...historyData };
    } catch (error) {
      console.error('Error saving caption history:', error);
      throw error;
    }
  });
};

// Get caption generation history for a user
export const getCaptionHistory = async (userId: string): Promise<CaptionHistory[]> => {
  return withRetry(async () => {
    try {
      const q = query(
        collection(db, 'captionHistory'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(captionHistoryFromFirestore);
    } catch (error) {
      console.error('Error getting caption history:', error);
      throw error;
    }
  });
}; 