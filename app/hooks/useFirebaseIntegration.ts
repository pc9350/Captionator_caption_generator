'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Caption } from '../types';
import { 
  saveCaption, 
  deleteCaption, 
  getSavedCaptions
} from '../utils/firebaseUtils';

export const useFirebaseIntegration = () => {
  const { user } = useAuth();
  const isSignedIn = !!user;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFirebaseAvailable = typeof window !== 'undefined';

  const handleSaveCaption = useCallback(async (caption: Caption) => {
    if (!isSignedIn || !user) {
      setError('You must be signed in to save captions');
      return false;
    }
    
    if (!isFirebaseAvailable) {
      console.warn('Firebase is not properly initialized. Cannot save caption.');
      setError('Firebase service is currently unavailable');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      await saveCaption(user.uid, caption);
      return true;
    } catch (err) {
      console.error('Error saving caption:', err);
      setError('Failed to save caption');
      return false;
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
      const captions = await getSavedCaptions(user.uid);
      return captions;
    } catch (err) {
      console.error('Error getting saved captions:', err);
      setError('Failed to get saved captions');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user, isFirebaseAvailable]);

  return {
    saveCaption: handleSaveCaption,
    deleteCaption: handleDeleteCaption,
    getSavedCaptions: handleGetSavedCaptions,
    isLoading,
    error,
    isSignedIn,
    user,
    isFirebaseAvailable
  };
}; 