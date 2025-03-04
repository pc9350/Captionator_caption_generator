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
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { Caption, CaptionHistory } from '../types';

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
  };
};

// Convert Firestore document to CaptionHistory object
export const captionHistoryFromFirestore = (
  doc: QueryDocumentSnapshot<DocumentData>
): CaptionHistory => {
  const data = doc.data();
  return {
    id: doc.id,
    imageUrl: data.imageUrl,
    captions: data.captions || [],
    createdAt: data.createdAt?.toDate() || new Date(),
  };
};

// Save a single caption to user's saved captions
export const saveCaption = async (userId: string, caption: Caption) => {
  try {
    const captionWithTimestamp = {
      ...caption,
      userId,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'savedCaptions'), captionWithTimestamp);
    return { ...captionWithTimestamp, id: docRef.id };
  } catch (error) {
    console.error('Error saving caption:', error);
    throw error;
  }
};

// Delete a caption from user's saved captions
export const deleteCaption = async (captionId: string) => {
  try {
    await deleteDoc(doc(db, 'savedCaptions', captionId));
    return true;
  } catch (error) {
    console.error('Error deleting caption:', error);
    throw error;
  }
};

// Get all saved captions for a user
export const getSavedCaptions = async (userId: string): Promise<Caption[]> => {
  try {
    const q = query(
      collection(db, 'savedCaptions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Caption));
  } catch (error) {
    console.error('Error getting saved captions:', error);
    throw error;
  }
};

// Save caption generation history
export const saveCaptionGenerationHistory = async (
  userId: string,
  imageUrl: string,
  captions: Caption[]
) => {
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
};

// Get caption generation history for a user
export const getCaptionHistory = async (userId: string): Promise<CaptionHistory[]> => {
  try {
    const q = query(
      collection(db, 'captionHistory'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as CaptionHistory));
  } catch (error) {
    console.error('Error getting caption history:', error);
    throw error;
  }
}; 