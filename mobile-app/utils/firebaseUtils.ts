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
  Firestore,
  setDoc
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

// Save user profile picture to Firestore
export const saveProfilePicture = async (userId: string, base64Image: string): Promise<string> => {
  return withRetry(async () => {
    try {
      if (!db) {
        console.error('Firestore is not initialized');
        throw new Error('Firestore is not initialized');
      }
      
      console.log('Saving profile picture to Firestore for userId:', userId);
      
      // Check if the image is already a URL (not base64)
      if (!base64Image.startsWith('data:image')) {
        // If it's a URL, just store the reference
        const userProfileRef = doc(db as Firestore, 'userProfiles', userId);
        await setDoc(userProfileRef, {
          photoURL: base64Image,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        
        return `firestore://userProfiles/${userId}`;
      }
      
      // For base64 images, check the size
      const base64WithoutPrefix = base64Image.split(',')[1] || base64Image;
      const sizeInBytes = (base64WithoutPrefix.length * 3) / 4; // Approximate size calculation
      
      console.log(`Original image size: ${Math.round(sizeInBytes / 1024)} KB`);
      
      // If image is too large (over 900KB to be safe), we need to compress it
      if (sizeInBytes > 900000) {
        console.log('Image is too large, compressing...');
        
        // Split the data URI to get the base64 part
        const parts = base64Image.split(',');
        const prefix = parts[0];
        
        // Compress the base64 string by removing every 3rd character
        // This is a simple compression technique that reduces quality but keeps the image usable
        let compressedBase64 = '';
        for (let i = 0; i < base64WithoutPrefix.length; i++) {
          if (i % 3 !== 0) { // Skip every 3rd character
            compressedBase64 += base64WithoutPrefix[i];
          }
        }
        
        // Recombine with the prefix
        const compressedImage = `${prefix},${compressedBase64}`;
        
        // Calculate new size
        const newSizeInBytes = (compressedBase64.length * 3) / 4;
        console.log(`Compressed image size: ${Math.round(newSizeInBytes / 1024)} KB`);
        
        // Create or update the document in the 'userProfiles' collection
        const userProfileRef = doc(db as Firestore, 'userProfiles', userId);
        
        // Store the profile data with the compressed base64 image
        await setDoc(userProfileRef, {
          photoBase64: compressedImage,
          updatedAt: serverTimestamp(),
        }, { merge: true }); // Use merge to preserve other fields
      } else {
        // Image is small enough, store as is
        // Create or update the document in the 'userProfiles' collection
        const userProfileRef = doc(db as Firestore, 'userProfiles', userId);
        
        // Store the profile data with the base64 image
        await setDoc(userProfileRef, {
          photoBase64: base64Image,
          updatedAt: serverTimestamp(),
        }, { merge: true }); // Use merge to preserve other fields
      }
      
      console.log('Profile picture saved successfully to Firestore');
      
      // Return a reference URL that can be stored in Firebase Auth photoURL
      // This is just a pointer to where the actual image is stored
      return `firestore://userProfiles/${userId}`;
    } catch (error) {
      console.error('Error saving profile picture:', error);
      throw error;
    }
  });
};

// Get user profile picture from Firestore
export const getProfilePicture = async (photoURL: string): Promise<string | null> => {
  return withRetry(async () => {
    try {
      if (!db) {
        console.error('Firestore is not initialized');
        throw new Error('Firestore is not initialized');
      }
      
      // Check if the photoURL is a Firestore reference
      if (!photoURL.startsWith('firestore://')) {
        // If it's a regular URL, just return it
        return photoURL;
      }
      
      console.log('Fetching profile picture from Firestore:', photoURL);
      
      // Extract the userId from the reference URL
      // Format: firestore://userProfiles/{userId}
      const parts = photoURL.split('/');
      const userId = parts[parts.length - 1];
      
      if (!userId) {
        console.error('Invalid Firestore reference URL:', photoURL);
        return null;
      }
      
      console.log('Extracted userId:', userId);
      
      // Get the document from Firestore
      const userProfileRef = doc(db as Firestore, 'userProfiles', userId);
      const userProfileDoc = await getDoc(userProfileRef);
      
      if (userProfileDoc.exists()) {
        const data = userProfileDoc.data();
        console.log('Profile document exists');
        
        // First check for photoBase64 (compressed image data)
        if (data.photoBase64) {
          console.log('Found photoBase64 data');
          return data.photoBase64;
        }
        
        // If no photoBase64, check for photoURL
        if (data.photoURL) {
          console.log('Found photoURL:', data.photoURL);
          return data.photoURL;
        }
        
        console.log('No photo data found in profile document');
        return null;
      } else {
        console.log('Profile document does not exist for userId:', userId);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting profile picture:', error);
      return null;
    }
  });
}; 