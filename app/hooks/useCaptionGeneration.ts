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

      // Get the current active image/video
      const currentMedia = uploadedImages[0]; // Use the first uploaded media
      
      // Check if the base64 data is valid
      if (!currentMedia.base64 || !currentMedia.base64.startsWith('data:')) {
        throw new Error('Invalid media data. Please try uploading again.');
      }
      
      // Add a timestamp to prevent caching and ensure fresh results
      const timestamp = Date.now();
      
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          image: currentMedia.base64,
          tone,
          includeHashtags,
          includeEmojis,
          captionLength,
          spicyLevel,
          captionStyle,
          creativeLanguageOptions,
          isVideo: currentMedia.isVideo || false,
          timestamp // Add timestamp to prevent caching
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
          id: captionData.id || uuidv4(),
          text: captionText,
          category: captionData.category || 'General',
          hashtags,
          emojis,
          viral_score: typeof captionData.viral_score === 'number' ? captionData.viral_score : 5,
          userId: user?.uid, // Add user ID if available
          createdAt: captionData.createdAt || new Date()
        };
      });

      // Replace existing captions with new ones
      setGeneratedCaptions(newCaptions);
      
      return newCaptions;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Error generating caption:', apiError);
      
      // Provide more helpful error messages
      if (apiError.message?.includes('No captions were generated')) {
        setError('No captions could be generated. This might be due to the content of the image or video. Please try a different media file or adjust your settings.');
      } else if (apiError.message?.includes('Invalid media data')) {
        setError('There was a problem with your media file. Please try uploading it again.');
      } else if (apiError.message?.includes('Rate limit')) {
        setError('You have reached the rate limit. Please wait a moment and try again.');
      } else {
        setError(apiError.message || 'Failed to generate caption. Please try again later.');
      }
      
      return [];
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

      // Get the current active image/video
      const currentMedia = uploadedImages[0]; // Use the first uploaded media

      // Check if the base64 data is valid
      if (!currentMedia.base64 || !currentMedia.base64.startsWith('data:')) {
        throw new Error('Invalid media data. Please try uploading again.');
      }
      
      // Add a timestamp to prevent caching and ensure fresh results
      const timestamp = Date.now();

      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          image: currentMedia.base64,
          tone: 'casual', // Default tone for regeneration
          includeHashtags,
          includeEmojis,
          captionLength,
          spicyLevel,
          captionStyle,
          creativeLanguageOptions,
          categories: [category], // Focus on the specific category
          isVideo: currentMedia.isVideo || false,
          timestamp // Add timestamp to prevent caching
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
      
      // Create a new caption object
      const newCaption: Caption = {
        id: captionData.id || uuidv4(),
        text: captionData.text || 'No caption text provided',
        category: captionData.category || category || 'General',
        hashtags,
        emojis,
        viral_score: typeof captionData.viral_score === 'number' ? captionData.viral_score : 5,
        userId: user?.uid,
        createdAt: captionData.createdAt || new Date()
      };
      
      // Add the new caption to the generated captions
      setGeneratedCaptions([...generatedCaptions, newCaption]);
      
      return newCaption;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Error regenerating caption:', apiError);
      
      // Provide more helpful error messages
      if (apiError.message?.includes('No captions were generated')) {
        setError('No captions could be generated. This might be due to the content of the image or video. Please try a different media file or adjust your settings.');
      } else if (apiError.message?.includes('Invalid media data')) {
        setError('There was a problem with your media file. Please try uploading it again.');
      } else if (apiError.message?.includes('Rate limit')) {
        setError('You have reached the rate limit. Please wait a moment and try again.');
      } else {
        setError(apiError.message || 'Failed to regenerate caption. Please try again later.');
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