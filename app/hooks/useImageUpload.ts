'use client';

import { useState, useCallback } from 'react';
import { useCaptionStore } from '../store/captionStore';

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Helper function to get video thumbnail
const getVideoThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.playsInline = true;
    video.muted = true;
    
    // Create object URL for the video file
    const url = URL.createObjectURL(file);
    video.src = url;
    
    // When video metadata is loaded, seek to the middle of the video
    video.onloadedmetadata = () => {
      // Seek to 25% of the video duration to get a representative frame
      video.currentTime = video.duration * 0.25;
    };
    
    // When the video has seeked to the desired time
    video.onseeked = () => {
      try {
        // Create a canvas to draw the video frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the video frame on the canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert the canvas to a data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        resolve(dataUrl);
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };
    
    // Handle errors
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Error loading video'));
    };
    
    // Start loading the video
    video.load();
  });
};

// Helper function to resize an image before uploading
// Using smaller dimensions and lower quality to ensure compatibility with OpenAI API
const resizeImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.src = e.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with reduced quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg', // Convert all images to JPEG for better compression
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Error loading image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsDataURL(file);
  });
};

// Helper function to check if base64 string is too large
const isBase64TooLarge = (base64String: string, maxSizeInMB = 1): boolean => {
  // Estimate base64 size: 4 characters of base64 encode 3 bytes of data
  const base64Length = base64String.length;
  // Remove header (e.g., "data:image/jpeg;base64,")
  const headerLength = base64String.indexOf(',') + 1;
  const pureBase64Length = base64Length - headerLength;
  
  // Calculate size in bytes and convert to MB
  const sizeInBytes = (pureBase64Length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);
  
  return sizeInMB > maxSizeInMB;
};

export const useImageUpload = () => {
  const [error, setError] = useState<string | null>(null);
  const { 
    setSelectedImage, 
    setImageUrl, 
    setIsUploading, 
    setUploadProgress,
    imageUrl,
    isUploading,
    addUploadedImage,
    uploadedImages,
    clearUploadedImages
  } = useCaptionStore();

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      const blobUrl = URL.createObjectURL(file);
      return blobUrl;
    } catch (error) {
      console.error('Error creating blob URL:', error);
      return null;
    }
  }, []);

  // Function to validate and fix blob URLs if needed
  const validateBlobUrls = () => {
    let needsUpdate = false;
    const updatedImages = [...uploadedImages].map(img => {
      // Check if the URL is a valid blob URL
      const isBlobUrl = img.url && img.url.startsWith('blob:');
      if (!isBlobUrl) {
        console.warn('URL is not a blob URL:', img.url?.substring(0, 30) + '...');
        return img;
      }

      // For videos, we need to be more careful about regenerating URLs
      // as this can cause infinite loops
      if (img.isVideo || (img.file && img.file.type.startsWith('video/'))) {
        // Only regenerate if absolutely necessary
        // For videos, we'll check if the URL is accessible by creating a video element
        try {
          const video = document.createElement('video');
          video.src = img.url;
          // If we can set the src without error, assume it's valid
          return img;
        } catch (err) {
          console.error('Error checking video URL, will regenerate:', err);
          // Only regenerate if there was an error
          needsUpdate = true;
          try {
            URL.revokeObjectURL(img.url);
          } catch (err) {
            console.error('Error revoking URL:', err);
          }
          return {
            ...img,
            url: URL.createObjectURL(img.file),
            isVideo: true
          };
        }
      }

      // For images, use the original approach
      // More reliable way to check if a blob URL is still valid
      try {
        // If the file is still available, regenerate the URL to be safe
        if (img.file) {
          console.log('Regenerating URL for image:', img.file.name);
          needsUpdate = true;
          // First revoke the old URL to prevent memory leaks
          try {
            URL.revokeObjectURL(img.url);
          } catch (err) {
            console.error('Error revoking URL:', err);
          }
          // Create a fresh blob URL
          return {
            ...img,
            url: URL.createObjectURL(img.file)
          };
        }
      } catch (error) {
        console.error('Error validating blob URL:', error);
      }
      
      return img;
    });
    
    if (needsUpdate && updatedImages.length > 0) {
      console.log('Updating store with regenerated URLs');
      // Update store with fixed URLs
      clearUploadedImages();
      updatedImages.forEach(img => addUploadedImage(img));
      
      // Update current image URL if needed
      if (imageUrl) {
        const currentImgIndex = uploadedImages.findIndex(img => img.url === imageUrl);
        if (currentImgIndex >= 0 && currentImgIndex < updatedImages.length) {
          setImageUrl(updatedImages[currentImgIndex].url);
        }
      }
    }
  };

  const uploadImage = async (file: File, isVideoFile = false): Promise<string | null> => {
    if (!file) return null;

    const isVideo = isVideoFile || file.type.startsWith('video/');
    
    // Check file size (max 50MB for videos, 10MB for images)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size exceeds ${isVideo ? '50MB' : '10MB'} limit`);
      return null;
    }

    try {
      setIsUploading(true);
      setSelectedImage(file);
      setError(null);
      
      // Simulate upload progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 95) {
          progress = 95;
          clearInterval(progressInterval);
        }
        setUploadProgress(progress);
      }, 200);

      // Create a persistent blob URL for display in the UI
      const mediaUrl = URL.createObjectURL(file);
      
      // For videos, we need to generate a thumbnail for the API
      let base64Media: string;
      
      if (isVideo) {
        // Generate a thumbnail from the video for the API
        base64Media = await getVideoThumbnail(file);
      } else {
        // For images, process as before
        let resizedImage = await resizeImage(file);
        base64Media = await fileToBase64(new File([resizedImage], file.name, { type: 'image/jpeg' }));
        
        // If the base64 is still too large, resize again with lower quality
        if (isBase64TooLarge(base64Media)) {
          resizedImage = await resizeImage(file, 600, 600, 0.5);
          base64Media = await fileToBase64(new File([resizedImage], file.name, { type: 'image/jpeg' }));
          
          // If still too large, resize one more time with even lower quality
          if (isBase64TooLarge(base64Media)) {
            resizedImage = await resizeImage(file, 400, 400, 0.3);
            base64Media = await fileToBase64(new File([resizedImage], file.name, { type: 'image/jpeg' }));
          }
        }
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Short delay to show 100% before completing
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Create an object with all the media data
      const uploadedMedia = { 
        file, 
        url: mediaUrl,
        base64: base64Media,
        isVideo: isVideo
      };
      
      // Add to uploaded media array and set current media
      addUploadedImage(uploadedMedia);
      
      // Set the most recently uploaded media as the current media
      setImageUrl(mediaUrl);
      
      return mediaUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    // Only revoke object URLs when explicitly resetting the upload
    // and make extra sure we're not revoking URLs that might still be in use
    if (uploadedImages && uploadedImages.length > 0) {
      // Create a map of URLs to avoid revoking the same URL multiple times
      // (which could happen if the same blob URL is referenced by multiple images)
      const urlMap = new Map<string, boolean>();
      
      uploadedImages.forEach(img => {
        if (img.url && !urlMap.has(img.url)) {
          console.log('Revoking URL on reset:', img.url.substring(0, 30) + '...');
          try {
            // We're keeping this for cleanup, but only when explicitly called
            URL.revokeObjectURL(img.url);
            urlMap.set(img.url, true);
          } catch (err) {
            console.error('Error revoking URL:', err);
          }
        }
      });
    }
    
    // Clear all uploaded images
    clearUploadedImages();
    setSelectedImage(null);
    setImageUrl(null);
    setUploadProgress(0);
    setError(null);
  };

  return {
    uploadImage,
    resetUpload,
    validateBlobUrls,
    isUploading,
    imageUrl,
    uploadedImages,
    error,
    setError,
  };
}; 