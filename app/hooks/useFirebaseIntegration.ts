'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useCaptionStore } from '../store/captionStore';
import { 
  getSavedCaptions, 
  saveCaption,
  deleteCaption,
  saveCaptionGenerationHistory,
  getCaptionHistory
} from '../utils/firebaseUtils';
import { isFirebaseInitialized } from '../firebase/config';
import { Caption, CaptionHistory } from '../types';

export const useFirebaseIntegration = () => {
  const { user, isSignedIn } = useUser();
  const { 
    savedCaptions, 
    setGeneratedCaptions,
    imageUrl,
    generatedCaptions
  } = useCaptionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if Firebase is properly initialized
  const isFirebaseAvailable = isFirebaseInitialized();

  const handleSaveCaption = useCallback(async (caption: Caption) => {
    if (!isSignedIn || !user) {
      setError('You must be signed in to save captions');
      return null;
    }
    
    if (!isFirebaseAvailable) {
      console.warn('Firebase is not properly initialized. Cannot save caption.');
      setError('Firebase service is currently unavailable');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      const savedCaption = await saveCaption(user.id, caption);
      return savedCaption;
    } catch (err) {
      console.error('Error saving caption:', err);
      setError('Failed to save caption');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user, isFirebaseAvailable]);

  const handleDeleteCaption = useCallback(async (captionId: string) => {
    if (!isSignedIn || !user) {
      setError('You must be signed in to delete captions');
      return false;
    }
    
    if (!isFirebaseAvailable) {
      console.warn('Firebase is not properly initialized. Cannot delete caption.');
      setError('Firebase service is currently unavailable');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      await deleteCaption(captionId);
      return true;
    } catch (err) {
      console.error('Error deleting caption:', err);
      setError('Failed to delete caption');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user, isFirebaseAvailable]);

  const handleGetSavedCaptions = useCallback(async () => {
    if (!isSignedIn || !user) {
      setError('You must be signed in to view saved captions');
      return [];
    }
    
    if (!isFirebaseAvailable) {
      console.warn('Firebase is not properly initialized. Cannot get saved captions.');
      setError('Firebase service is currently unavailable');
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);
      const captions = await getSavedCaptions(user.id);
      return captions;
    } catch (err) {
      console.error('Error getting saved captions:', err);
      setError('Failed to get saved captions');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user, isFirebaseAvailable]);

  const handleSaveCaptionHistory = useCallback(async (imageUrl: string, captions: Caption[]) => {
    if (!isSignedIn || !user) {
      return null;
    }
    
    if (!isFirebaseAvailable) {
      console.warn('Firebase is not properly initialized. Cannot save caption history.');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      const history = await saveCaptionGenerationHistory(user.id, imageUrl, captions);
      return history;
    } catch (err) {
      console.error('Error saving caption history:', err);
      setError('Failed to save caption history');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user, isFirebaseAvailable]);

  const handleGetCaptionHistory = useCallback(async () => {
    if (!isSignedIn || !user) {
      setError('You must be signed in to view caption history');
      return [];
    }
    
    if (!isFirebaseAvailable) {
      console.warn('Firebase is not properly initialized. Cannot get caption history.');
      setError('Firebase service is currently unavailable');
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);
      const history = await getCaptionHistory(user.id);
      return history;
    } catch (err) {
      console.error('Error getting caption history:', err);
      setError('Failed to get caption history');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user, isFirebaseAvailable]);

  return {
    saveCaption: handleSaveCaption,
    deleteCaption: handleDeleteCaption,
    getSavedCaptions: handleGetSavedCaptions,
    saveCaptionHistory: handleSaveCaptionHistory,
    getCaptionHistory: handleGetCaptionHistory,
    isLoading,
    error,
    isSignedIn,
    user,
    isFirebaseAvailable
  };
}; 