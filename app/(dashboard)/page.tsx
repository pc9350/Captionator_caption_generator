'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { FiUpload, FiImage, FiAlertCircle, FiX, FiCheckCircle } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import { useImageUpload } from '../hooks/useImageUpload';
import { useCaptionGeneration } from '../hooks/useCaptionGeneration';
import CaptionCard from '../components/CaptionCard';
import ToneSelector from '../components/ToneSelector';
import ImageUploader from '../components/ImageUploader';
import GenerateButton from '../components/GenerateButton';
import { Caption } from '../types';
import { useCaptionStore } from '../store/captionStore';

export default function Dashboard() {
  const { isUploading, imageUrl, uploadedImages, resetUpload, error: uploadError } = useImageUpload();
  const { captions, isGenerating, error: captionError, generateCaptions } = useCaptionGeneration();
  const [selectedTone, setSelectedTone] = useState('casual');
  const { isLoaded } = useUser();
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);

  // Show success message when image is uploaded
  useEffect(() => {
    if (uploadedImages && uploadedImages.length > 0) {
      setShowUploadSuccess(true);
      const timer = setTimeout(() => {
        setShowUploadSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadedImages]);

  // Define handleToneChange as a memoized callback to ensure it doesn't change between renders
  const handleToneChange = useCallback((tone: string) => {
    console.log('Tone changed to:', tone);
    setSelectedTone(tone);
  }, []);

  const handleReset = () => {
    resetUpload();
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Captionator
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Upload images and get AI-generated captions for your Instagram posts.
            </p>
          </motion.div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                  <span>Upload Your Images</span>
                  {uploadedImages && uploadedImages.length > 0 && (
                    <span className="text-sm font-normal text-blue-500">
                      {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} uploaded
                    </span>
                  )}
                </h2>

                <div className="w-full">
                  <ImageUploader />
                </div>
                
                {showUploadSuccess && uploadedImages && uploadedImages.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg text-green-600 dark:bg-green-900/20 dark:border-green-800/30 dark:text-green-400"
                  >
                    <div className="flex items-center">
                      <FiCheckCircle className="w-5 h-5 mr-2" />
                      <span>
                        {uploadedImages.length === 1 
                          ? 'Image uploaded successfully!' 
                          : `${uploadedImages.length} images uploaded successfully!`}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {uploadedImages && uploadedImages.length > 0 && (
                <motion.div 
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Select Caption Tone
                  </h2>
                  <ToneSelector 
                    selectedTone={selectedTone} 
                    onToneChange={handleToneChange} 
                  />
                </motion.div>
              )}

              {(uploadError || captionError) && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  {uploadError || captionError}
                </div>
              )}

              {uploadedImages && uploadedImages.length > 0 && (
                <motion.div 
                  className="flex justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <GenerateButton tone={selectedTone} />
                </motion.div>
              )}
            </div>
          </div>

          {captions && captions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Generated Captions
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {captions.map((caption, index) => (
                  <CaptionCard key={caption.id} caption={caption} index={index} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 