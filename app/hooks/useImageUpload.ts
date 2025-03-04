'use client';

import { useState } from 'react';

export const useImageUpload = () => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return null;
    }

    try {
      setIsUploading(true);
      setError(null);

      // For demo purposes, we'll just create a local URL
      // In a real app, you would upload to a server or cloud storage
      const imageUrl = URL.createObjectURL(file);
      setUploadedImageUrl(imageUrl);
      return imageUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
    }
    setUploadedImageUrl(null);
    setError(null);
  };

  return {
    uploadImage,
    resetUpload,
    uploadedImageUrl,
    isUploading,
    error,
    setError,
  };
}; 