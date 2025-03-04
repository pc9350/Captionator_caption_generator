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

  const handleSaveCaption = useCallback(async (caption: Caption) => {
    if (!isSignedIn || !user) {
      setError('You must be signed in to save captions');
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
  }, [isSignedIn, user]);

  const handleDeleteCaption = useCallback(async (captionId: string) => {
    if (!isSignedIn || !user) {
      setError('You must be signed in to delete captions');
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
  }, [isSignedIn, user]);

  const handleGetSavedCaptions = useCallback(async () => {
    if (!isSignedIn || !user) {
      setError('You must be signed in to view saved captions');
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
  }, [isSignedIn, user]);

  const handleSaveCaptionHistory = useCallback(async (imageUrl: string, captions: Caption[]) => {
    if (!isSignedIn || !user) {
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
  }, [isSignedIn, user]);

  const handleGetCaptionHistory = useCallback(async () => {
    if (!isSignedIn || !user) {
      setError('You must be signed in to view caption history');
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
  }, [isSignedIn, user]);

  return {
    saveCaption: handleSaveCaption,
    deleteCaption: handleDeleteCaption,
    getSavedCaptions: handleGetSavedCaptions,
    saveCaptionHistory: handleSaveCaptionHistory,
    getCaptionHistory: handleGetCaptionHistory,
    isLoading,
    error,
    isSignedIn,
    user
  };
}; 