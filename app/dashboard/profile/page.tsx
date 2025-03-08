'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import ProfileImage from '@/app/components/ProfileImage';
import { FiEdit2, FiSave, FiX, FiCamera } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { doc, setDoc, Firestore } from 'firebase/firestore';
import { db } from '@/app/firebase/config';

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  
  // Handle user authentication state
  useEffect(() => {
    if (!user && !shouldRedirect) {
      setShouldRedirect(true);
    }
  }, [user, shouldRedirect]);
  
  // Handle redirection if user is not authenticated
  useEffect(() => {
    if (shouldRedirect) {
      router.push('/sign-in');
    }
  }, [shouldRedirect, router]);
  
  // Initialize display name when user data is available
  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user?.displayName]);
  
  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      setError('Display name cannot be empty');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await updateUserProfile(displayName);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle profile image change
  const handleProfileImageChange = async (base64Image: string) => {
    if (!user) return;
    
    setIsUploadingImage(true);
    setError(null);
    
    try {
      // Ensure the base64 image has the correct format
      let processedImage = base64Image;
      
      // Check if the image is already a data URI
      if (!base64Image.startsWith('data:')) {
        // Add the prefix if it's missing
        processedImage = `data:image/jpeg;base64,${base64Image}`;
      }
      
      // Check the size of the base64 image
      const base64WithoutPrefix = processedImage.split(',')[1] || processedImage;
      const sizeInBytes = (base64WithoutPrefix.length * 3) / 4; // Approximate size calculation
      
      // console.log(`Original image size: ${Math.round(sizeInBytes / 1024)} KB`);
      
      // If image is still too large (over 800KB to be safe), we need to compress it further
      let imageToStore = processedImage;
      
      if (sizeInBytes > 800000) {
        console.log('Image is still too large, compressing further...');
        
        try {
          // Create an image element to get dimensions
          const img = document.createElement('img');
          
          // Load the image and resize it further
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              // Calculate new dimensions (max 200px width/height while maintaining aspect ratio)
              let width = img.width;
              let height = img.height;
              const maxSize = 200; // Even smaller size
              
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
              
              // Convert to JPEG with very low quality (0.3 = 30% quality)
              imageToStore = canvas.toDataURL('image/jpeg', 0.3);
              
              // Check the new size
              const newBase64WithoutPrefix = imageToStore.split(',')[1] || '';
              const newSizeInBytes = (newBase64WithoutPrefix.length * 3) / 4;
              console.log(`Further compressed image size: ${Math.round(newSizeInBytes / 1024)} KB`);
              
              resolve();
            };
            
            img.onerror = () => {
              reject(new Error('Failed to load image for further compression'));
            };
            
            img.src = processedImage;
          });
        } catch (compressionError) {
          console.error('Error during further compression:', compressionError);
          // Continue with the original processed image if compression fails
        }
      }
      
      // Final size check
      const finalBase64WithoutPrefix = imageToStore.split(',')[1] || '';
      const finalSizeInBytes = (finalBase64WithoutPrefix.length * 3) / 4;
      
      if (finalSizeInBytes > 1000000) {
        throw new Error('Image is still too large after compression. Please use a smaller image.');
      }
      
      // Save the image to Firestore
      const userProfileRef = doc(db as Firestore, 'userProfiles', user.uid);
      
      // Store the profile data with the base64 image
      await setDoc(userProfileRef, {
        photoBase64: imageToStore,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      // Update the user's photoURL in Firebase Auth
      const firestoreRef = `firestore://userProfiles/${user.uid}`;
      await updateUserProfile(user.displayName || '', firestoreRef);
      
      // Show success message
      alert('Profile picture updated successfully!');
    } catch (err: any) {
      console.error('Error updating profile picture:', err);
      setError(err.message || 'Failed to update profile picture. Please try again with a smaller image.');
      alert('Error: ' + (err.message || 'Failed to update profile picture. Please try again with a smaller image.'));
    } finally {
      setIsUploadingImage(false);
    }
  };
  
  // Cancel editing
  const handleCancel = () => {
    setDisplayName(user?.displayName || '');
    setIsEditing(false);
    setError(null);
  };
  
  // Show loading state while checking authentication
  if (!user && !shouldRedirect) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Don't render the main content if we're redirecting
  if (shouldRedirect) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h1>
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
          {/* Header/Banner */}
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            <div className="absolute -bottom-16 left-0 w-full flex justify-center">
              <div className="relative">
                {isUploadingImage ? (
                  <div 
                    className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg"
                  >
                    <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : user && (
                  <ProfileImage 
                    photoURL={user.photoURL}
                    displayName={user.displayName}
                    size={128}
                    className="border-4 border-white dark:border-gray-800 shadow-lg"
                    editable={true}
                    onImageChange={handleProfileImageChange}
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Profile Content */}
          <div className="pt-20 pb-12 px-6 sm:px-12">
            <div className="text-center mb-8">
              {isEditing ? (
                <div className="max-w-md mx-auto">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2 text-xl font-bold text-center border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-transparent outline-none dark:text-white"
                    placeholder="Your name"
                  />
                  {error && (
                    <p className="text-red-500 mt-2 text-sm">{error}</p>
                  )}
                  <div className="flex justify-center space-x-4 mt-4">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={isLoading}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        <>
                          <FiSave className="mr-2" />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      <FiX className="mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center">
                    {user?.displayName || 'User'}
                    <button
                      onClick={() => setIsEditing(true)}
                      className="ml-2 p-1 text-gray-500 hover:text-blue-500 transition-colors"
                      aria-label="Edit profile"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">{user?.email}</p>
                </>
              )}
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Account Information</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-gray-800 dark:text-gray-200">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Account Created</p>
                      <p className="text-gray-800 dark:text-gray-200">
                        {user?.metadata?.creationTime 
                          ? new Date(user?.metadata.creationTime).toLocaleDateString() 
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">App Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-800 dark:text-gray-200">Dark Mode</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">System default</p>
                      </div>
                      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                        <input
                          type="checkbox"
                          id="toggle"
                          aria-label="Toggle dark mode"
                          className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border-4 rounded-full appearance-none cursor-pointer border-gray-200 checked:border-blue-600 peer checked:translate-x-6"
                        />
                        <label
                          htmlFor="toggle"
                          className="block w-full h-full overflow-hidden rounded-full cursor-pointer bg-gray-200 peer-checked:bg-blue-600"
                        ></label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Need help? Visit our <a href="#" className="text-blue-600 hover:underline">Help Center</a> or contact <a href="mailto:support@captionator.com" className="text-blue-600 hover:underline">support@captionator.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 