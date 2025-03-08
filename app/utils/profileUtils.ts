import { doc, getDoc, Firestore } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Retrieves a user's profile picture from Firestore
 * @param photoURL The photoURL from Firebase Auth, which may be a Firestore reference
 * @returns The actual profile picture URL or base64 data
 */
export const getProfilePicture = async (photoURL: string | null): Promise<string | null> => {
  try {
    if (!photoURL) return null;
    
    // If the photoURL is not a Firestore reference, return it as is
    if (!photoURL.startsWith('firestore://')) {
      return photoURL;
    }
    
    if (!db) {
      console.error('Firestore is not initialized');
      return null;
    }
    
    // console.log('Fetching profile picture from Firestore reference:', photoURL);
    
    // Extract the userId from the reference URL
    // Format: firestore://userProfiles/{userId}
    const parts = photoURL.split('/');
    const userId = parts[parts.length - 1];
    
    if (!userId) {
      console.error('Invalid Firestore reference URL:', photoURL);
      return null;
    }
    
    // Get the document from Firestore
    const userProfileRef = doc(db as Firestore, 'userProfiles', userId);
    const userProfileDoc = await getDoc(userProfileRef);
    
    if (userProfileDoc.exists()) {
      const data = userProfileDoc.data();
      
      // First check for photoBase64 (compressed image data)
      if (data.photoBase64) {
        // console.log('Found photoBase64 data in Firestore');
        
        // Ensure the base64 data has the correct prefix
        if (data.photoBase64.startsWith('data:')) {
          return data.photoBase64;
        } else {
          // Add the prefix if it's missing
          return `data:image/jpeg;base64,${data.photoBase64}`;
        }
      }
      
      // If no photoBase64, check for photoURL
      if (data.photoURL) {
        console.log('Found photoURL in Firestore:', data.photoURL);
        return data.photoURL;
      }
      
      console.log('No photo data found in profile document');
    } else {
      console.log('Profile document does not exist for userId:', userId);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting profile picture:', error);
    return null;
  }
}; 