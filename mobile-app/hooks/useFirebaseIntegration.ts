import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { Caption } from '../types/caption';
import { 
  saveCaption as saveCaptionToFirebase, 
  deleteCaption as deleteCaptionFromFirebase, 
  getSavedCaptions as getSavedCaptionsFromFirebase
} from '../utils/firebaseUtils';

export const useFirebaseIntegration = () => {
  const { user } = useAuth();
  const isSignedIn = !!user;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveCaption = useCallback(async (caption: Caption) => {
    if (!isSignedIn || !user) {
      setError('You must be signed in to save captions');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      await saveCaptionToFirebase(user.uid, caption);
      return true;
    } catch (err) {
      console.error('Error saving caption:', err);
      setError('Failed to save caption');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user]);

  const handleDeleteCaption = useCallback(async (captionId: string) => {
    if (!isSignedIn || !user) {
      setError('You must be signed in to delete captions');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      await deleteCaptionFromFirebase(captionId);
      return true;
    } catch (err) {
      console.error('Error deleting caption:', err);
      setError('Failed to delete caption');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user]);

  const handleGetSavedCaptions = useCallback(async () => {
    if (!isSignedIn || !user) {
      setError('You must be signed in to view saved captions');
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);
      const captions = await getSavedCaptionsFromFirebase(user.uid);
      return captions;
    } catch (err) {
      console.error('Error getting saved captions:', err);
      setError('Failed to get saved captions');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user]);

  return {
    saveCaption: handleSaveCaption,
    deleteCaption: handleDeleteCaption,
    getSavedCaptions: handleGetSavedCaptions,
    isLoading,
    error,
    isSignedIn,
    user
  };
}; 