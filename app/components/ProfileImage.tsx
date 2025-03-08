'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiUser, FiCamera } from 'react-icons/fi';
import { getProfilePicture } from '../utils/profileUtils';

interface ProfileImageProps {
  photoURL: string | null;
  displayName?: string | null;
  size?: number;
  className?: string;
  editable?: boolean;
  onImageChange?: (base64Image: string) => void;
}

export default function ProfileImage({ 
  photoURL, 
  displayName, 
  size = 40, 
  className = '',
  editable = false,
  onImageChange
}: ProfileImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Use a cleanup function to prevent state updates after unmounting
    let isMounted = true;
    
    const loadProfileImage = async () => {
      if (!photoURL) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        if (isMounted) setIsLoading(true);
        if (isMounted) setError(false);
        
        // Check if the photoURL is a Firestore reference
        const profilePicture = await getProfilePicture(photoURL);
        
        // Only update state if the component is still mounted
        if (isMounted) setImageUrl(profilePicture);
      } catch (err) {
        console.error('Error loading profile image:', err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    loadProfileImage();
    
    return () => {
      isMounted = false;
    };
  }, [photoURL]);

  const handleImageClick = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !onImageChange) return;
    
    const file = e.target.files[0];
    
    // Check file size
    if (file.size > 10 * 1024 * 1024) { // 10MB
      alert('Image is too large. Please select an image under 10MB.');
      return;
    }
    
    try {
      // Create a FileReader to read the file as a data URL
      const reader = new FileReader();
      
      // Convert file to data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            resolve(event.target.result);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      // Create an image element to get dimensions
      const img = document.createElement('img');
      
      // Load the image and resize it
      const resizedImage = await new Promise<string>((resolve, reject) => {
        img.onload = () => {
          // Calculate new dimensions (max 300px width/height while maintaining aspect ratio)
          let width = img.width;
          let height = img.height;
          const maxSize = 300;
          
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
          
          // Create a canvas to resize the image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          // Draw the resized image on the canvas
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to JPEG with reduced quality (0.5 = 50% quality)
          const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.5);
          resolve(resizedDataUrl);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        img.src = dataUrl;
      });
      
      // Update the UI with the resized image
      setImageUrl(resizedImage);
      
      // Pass the resized image to the parent component
      onImageChange(resizedImage);
      
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try another image.');
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div 
        className={`rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="animate-pulse w-full h-full rounded-full bg-gray-300 dark:bg-gray-600"></div>
      </div>
    );
  }

  // Render error or empty state
  if (error || !imageUrl) {
    return (
      <div 
        className={`rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center ${className} ${editable ? 'cursor-pointer' : ''}`}
        style={{ width: size, height: size }}
        onClick={editable ? handleImageClick : undefined}
      >
        <FiUser color="white" size={size * 0.5} />
        {editable && (
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <FiCamera color="white" size={size * 0.4} />
          </div>
        )}
        {editable && (
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            aria-label="Upload profile picture"
          />
        )}
      </div>
    );
  }

  // Determine if the image is a base64 data URI
  const isBase64 = imageUrl.startsWith('data:');

  // Render the actual image
  return (
    <div 
      className={`relative rounded-full overflow-hidden ${className} ${editable ? 'cursor-pointer group' : ''}`}
      style={{ width: size, height: size }}
      onClick={editable ? handleImageClick : undefined}
    >
      {isBase64 ? (
        <img 
          src={imageUrl} 
          alt={displayName || 'User'} 
          className="w-full h-full object-cover rounded-full"
          onError={() => setError(true)}
        />
      ) : (
        <Image 
          src={imageUrl} 
          alt={displayName || 'User'} 
          width={size} 
          height={size} 
          className="object-cover rounded-full"
          onError={() => setError(true)}
        />
      )}
      
      {editable && (
        <div className="absolute inset-0 rounded-full bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <FiCamera color="white" size={size * 0.4} />
        </div>
      )}
      
      {editable && (
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          aria-label="Upload profile picture"
        />
      )}
    </div>
  );
} 