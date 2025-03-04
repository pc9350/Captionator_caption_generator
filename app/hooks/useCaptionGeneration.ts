'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import { Caption } from '../types';
import { useFirebaseIntegration } from './useFirebaseIntegration';

export const useCaptionGeneration = (imageUrl: string | null) => {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn, user } = useUser();
  const { saveCaptionHistory } = useFirebaseIntegration();

  const generateCaptions = async (tone: string) => {
    if (!imageUrl) {
      setError('Please upload an image first');
      return [];
    }

    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          tone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate captions');
      }

      const data = await response.json();
      
      // Transform the response into Caption objects with unique IDs
      const generatedCaptions = data.captions.map((caption: any) => ({
        id: uuidv4(),
        text: caption.text,
        category: caption.category,
        hashtags: caption.hashtags || [],
        emojis: caption.emojis || [],
      }));

      setCaptions(generatedCaptions);
      
      // Save caption generation history to Firebase if user is signed in
      if (isSignedIn && user) {
        await saveCaptionHistory(imageUrl, generatedCaptions);
      }

      return generatedCaptions;
    } catch (err: any) {
      console.error('Error generating captions:', err);
      setError(err.message || 'Failed to generate captions');
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    captions,
    isGenerating,
    error,
    generateCaptions,
  };
}; 