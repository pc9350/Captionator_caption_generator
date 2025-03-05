'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import { Caption } from '../types';
import { useFirebaseIntegration } from './useFirebaseIntegration';
import { useCaptionStore } from '../store/captionStore';

export const useCaptionGeneration = () => {
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn, user } = useUser();
  const { saveCaptionHistory } = useFirebaseIntegration();
  const { 
    imageUrl, 
    uploadedImages, 
    isGenerating, 
    setIsGenerating, 
    generatedCaptions,
    setGeneratedCaptions,
    includeHashtags,
    includeEmojis
  } = useCaptionStore();

  // Function to safely save caption history to Firebase
  const safelySaveCaptionHistory = async (imageUrl: string, captions: Caption[]) => {
    if (!isSignedIn || !user) return;
    
    try {
      await saveCaptionHistory(imageUrl, captions);
    } catch (err) {
      console.warn('Failed to save caption history to Firebase, but continuing with caption generation:', err);
      // Don't throw the error - just log it and continue
    }
  };

  const generateCaptions = async (tone: string) => {
    // Check if there are any uploaded images
    if (!uploadedImages || uploadedImages.length === 0) {
      setError('Please upload at least one image first');
      return [];
    }

    console.log('Generating captions with tone:', tone);
    console.log('Using images:', uploadedImages.length);
    console.log('Include hashtags:', includeHashtags);
    console.log('Include emojis:', includeEmojis);

    try {
      setIsGenerating(true);
      setError(null);

      // Get all base64 image data from uploaded images
      const imageData = uploadedImages.map(img => img.base64);

      // Validate image data
      if (imageData.some(data => !data || !data.startsWith('data:image/'))) {
        setError('One or more images are in an invalid format. Please try uploading them again.');
        return [];
      }

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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate captions');
      }

      console.log('Generated captions data:', data);
      
      // Check if we have valid captions
      if (!data.captions || !Array.isArray(data.captions) || data.captions.length === 0) {
        throw new Error('No captions were generated. Please try again with different images.');
      }
      
      // Transform the response into Caption objects with unique IDs
      const newCaptions = data.captions.map((captionData: any) => {
        // Check for both possible field names (text or caption)
        const captionText = captionData.caption || captionData.text || 'No caption text provided';
        
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
        };
      });

      setGeneratedCaptions(newCaptions);
      
      // Try to save caption history to Firebase, but don't block on it
      if (isSignedIn && user && imageUrl) {
        // Use a separate function that won't throw errors
        safelySaveCaptionHistory(imageUrl, newCaptions).catch(err => {
          console.warn('Error in background Firebase save:', err);
        });
      }

      return newCaptions;
    } catch (err: any) {
      console.error('Error generating captions:', err);
      
      // Provide more user-friendly error messages
      if (err.message.includes('too large')) {
        setError('The images are too large. Please try with smaller images or fewer images.');
      } else if (err.message.includes('Rate limit')) {
        setError('Rate limit exceeded. Please wait a moment and try again.');
      } else {
        setError(err.message || 'Failed to generate captions. Please try again.');
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

      // Get all base64 image data from uploaded images
      const imageData = uploadedImages.map(img => img.base64);

      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData,
          tone: 'Casual', // Default tone for regeneration
          includeHashtags,
          includeEmojis,
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
      };

      return newCaption;
    } catch (err: any) {
      console.error('Error regenerating caption:', err);
      setError(err.message || 'Failed to regenerate caption. Please try again.');
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