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

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return null;
    }

    try {
      console.log('Starting upload process for file:', file.name, 'size:', Math.round(file.size / 1024), 'KB');
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
      // This URL will remain valid until explicitly revoked
      const imageUrl = URL.createObjectURL(file);
      console.log('Created blob URL:', imageUrl, 'for file:', file.name);
      
      // Resize the image to reduce file size
      let resizedImage = await resizeImage(file);
      console.log('Resized image successfully. Original size:', Math.round(file.size / 1024), 'KB');
      
      let base64Image = await fileToBase64(new File([resizedImage], file.name, { type: 'image/jpeg' }));
      console.log('Converted to base64, length:', base64Image.length.toString().substring(0, 6) + '...');
      
      // If the base64 is still too large, resize again with lower quality
      if (isBase64TooLarge(base64Image)) {
        console.log('Image still too large, resizing again with lower quality');
        resizedImage = await resizeImage(file, 600, 600, 0.5);
        base64Image = await fileToBase64(new File([resizedImage], file.name, { type: 'image/jpeg' }));
        
        // If still too large, resize one more time with even lower quality
        if (isBase64TooLarge(base64Image)) {
          console.log('Image still too large, resizing with minimum quality');
          resizedImage = await resizeImage(file, 400, 400, 0.3);
          base64Image = await fileToBase64(new File([resizedImage], file.name, { type: 'image/jpeg' }));
        }
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Short delay to show 100% before completing
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Create an object with all the image data
      const uploadedImage = { 
        file, 
        url: imageUrl,
        base64: base64Image 
      };
      
      console.log('Adding image to store with URL:', imageUrl.substring(0, 30) + '...');
      
      // Add to uploaded images array and set current image
      // Store both the blob URL for UI display and base64 for API requests
      addUploadedImage(uploadedImage);
      
      // Set the most recently uploaded image as the current image
      setImageUrl(imageUrl);
      
      // Verify that URL is still valid
      // console.log('Upload completed. Current URLs in store:', 
      //   uploadedImages.length, 
      //   'images, newest URL:', imageUrl.substring(0, 30) + '...'
      // );
      
      try {
        // Test if we can access the URL - using Image instead of fetch for blob URLs
        // since fetch with HEAD method isn't supported for blob URLs
        const testImg = new Image();
        testImg.onload = () => console.log('Blob URL is accessible and valid');
        testImg.onerror = (err) => console.error('Blob URL might be invalid:', err);
        testImg.src = imageUrl;
      } catch (e) {
        console.error('Error testing blob URL:', e);
      }
      
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