'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';
import { Caption } from '../types';
import { useFirebaseIntegration } from './useFirebaseIntegration';
import { useCaptionStore } from '../store/captionStore';

// Define ApiError type for error handling
interface ApiError {
  message: string;
  [key: string]: any;
}

export const useCaptionGeneration = () => {
  const { user } = useAuth();
  const isSignedIn = !!user;
  const [error, setError] = useState<string | null>(null);
  
  // Use the caption store for state management
  const { 
    imageUrl, 
    uploadedImages, 
    isGenerating, 
    setIsGenerating, 
    generatedCaptions,
    setGeneratedCaptions,
    includeHashtags,
    includeEmojis,
    captionLength,
    spicyLevel,
    captionStyle,
    creativeLanguageOptions
  } = useCaptionStore();

  const generateCaptions = async (tone: string) => {
    // Check if there are any uploaded images
    if (!uploadedImages || uploadedImages.length === 0) {
      setError('Please upload at least one image first');
      return [];
    }

    try {
      setIsGenerating(true);
      setError(null);

      // Get all base64 image data from uploaded images
      const imageData = uploadedImages.map(img => img.base64);

      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData,
          tone,
          includeHashtags,
          includeEmojis,
          captionLength,
          spicyLevel,
          captionStyle,
          wordInvention: creativeLanguageOptions.wordInvention,
          alliteration: creativeLanguageOptions.alliteration,
          rhyming: creativeLanguageOptions.rhyming
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate caption');
      }

      // Check if we have valid captions
      if (!data.captions || !Array.isArray(data.captions) || data.captions.length === 0) {
        throw new Error('No captions were generated. Please try again.');
      }

      // Map the API response to our Caption type
      const newCaptions = data.captions.map((captionData: any) => {
        const captionText = captionData.text || 'No caption text provided';
        
        // Ensure hashtags and emojis are arrays of strings
        const hashtags = Array.isArray(captionData.hashtags) 
          ? captionData.hashtags.filter((tag: any) => typeof tag === 'string')
          : [];
          
        const emojis = Array.isArray(captionData.emojis)
          ? captionData.emojis.filter((emoji: any) => typeof emoji === 'string')
          : [];
        
        return {
          id: uuidv4(),
          text: captionText,
          category: captionData.category || 'General',
          hashtags,
          emojis,
          viral_score: typeof captionData.viral_score === 'number' ? captionData.viral_score : 5,
          userId: user?.uid, // Add user ID if available
          createdAt: new Date()
        };
      });

      setGeneratedCaptions(newCaptions);
      
      // History saving functionality removed
      
      return newCaptions;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Error generating caption:', apiError);
      setError(apiError.message || 'Failed to generate caption');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Add regenerateCaption function to generate a new caption for a specific category
  const regenerateCaption = async (category: string): Promise<Caption | null> => {
    try {
      setIsGenerating(true);
      setError(null);

      // Check if there are any uploaded images
      if (!uploadedImages || uploadedImages.length === 0) {
        setError('Please upload at least one image first');
        return null;
      }

      // Get all base64 image data from uploaded images
      const imageData = uploadedImages.map(img => img.base64);

      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData,
          tone: 'casual', // Default tone for regeneration
          includeHashtags,
          includeEmojis,
          captionLength,
          spicyLevel,
          captionStyle,
          wordInvention: creativeLanguageOptions.wordInvention,
          alliteration: creativeLanguageOptions.alliteration,
          rhyming: creativeLanguageOptions.rhyming,
          categories: [category], // Focus on the specific category
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to regenerate caption');
      }

      // Check if we have valid captions
      if (!data.captions || !Array.isArray(data.captions) || data.captions.length === 0) {
        throw new Error('No captions were generated. Please try again.');
      }
      
      // Get the first caption from the response
      const captionData = data.captions[0];
      
      // Ensure hashtags and emojis are arrays of strings
      const hashtags = Array.isArray(captionData.hashtags) 
        ? captionData.hashtags.filter((tag: any) => typeof tag === 'string')
        : [];
        
      const emojis = Array.isArray(captionData.emojis)
        ? captionData.emojis.filter((emoji: any) => typeof emoji === 'string')
        : [];
      
      // Create a new Caption object with a unique ID
      const newCaption: Caption = {
        id: uuidv4(),
        text: captionData.text || 'No caption text provided',
        category: category, // Use the requested category
        hashtags,
        emojis,
        viral_score: typeof captionData.viral_score === 'number' ? captionData.viral_score : 5,
        userId: user?.uid, // Add user ID if available
        createdAt: new Date()
      };

      return newCaption;
    } catch (err: unknown) {
      console.error('Error regenerating caption:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to regenerate caption. Please try again.');
      } else {
        setError('An unexpected error occurred while regenerating the caption.');
      }
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    captions: generatedCaptions,
    isGenerating,
    error,
    generateCaptions,
    regenerateCaption,
  };
}; 