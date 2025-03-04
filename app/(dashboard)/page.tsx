'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { FiUpload, FiImage, FiAlertCircle, FiX } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import { useImageUpload } from '../hooks/useImageUpload';
import { useCaptionGeneration } from '../hooks/useCaptionGeneration';
import CaptionCard from '../components/CaptionCard';
import ToneSelector from '../components/ToneSelector';
import { Caption } from '../types';

export default function Dashboard() {
  const { isUploading, uploadedImageUrl, uploadImage, resetUpload, error: uploadError } = useImageUpload();
  const { captions, isGenerating, error: captionError, generateCaptions } = useCaptionGeneration(uploadedImageUrl);
  const [selectedTone, setSelectedTone] = useState('casual');
  const [generatedCaptions, setGeneratedCaptions] = useState<Caption[]>([]);
  const { isLoaded } = useUser();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (captions.length > 0) {
      setGeneratedCaptions(captions);
    }
  }, [captions]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.type.startsWith('image/')) {
          await uploadImage(file);
        }
      }
    },
    [uploadImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadImage(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    const newCaptions = await generateCaptions(selectedTone);
    if (newCaptions && newCaptions.length > 0) {
      setGeneratedCaptions(newCaptions);
    }
  };

  const handleToneChange = (tone: string) => {
    setSelectedTone(tone);
  };

  const handleReset = () => {
    resetUpload();
    setGeneratedCaptions([]);
  };

  // Update dragging state for animation
  const handleDragEnter = useCallback(() => setIsDragging(true), []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);

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
              Upload an image and get AI-generated captions for your Instagram posts.
            </p>
          </motion.div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Upload Your Image
                </h2>

                {!uploadedImageUrl ? (
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                      isDragActive 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                  >
                    <input {...getInputProps()} />
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <FiImage className={`w-16 h-16 mb-4 ${
                        isDragActive 
                          ? 'text-blue-500 dark:text-blue-400' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`} />
                      <span className={`mb-2 ${
                        isDragActive 
                          ? 'text-blue-600 dark:text-blue-400 font-medium' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {isDragActive 
                          ? 'Drop your image here' 
                          : isUploading 
                            ? 'Uploading...' 
                            : 'Drag & drop or click to upload an image'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        JPG, PNG, GIF up to 10MB
                      </span>
                      {isUploading && (
                        <div className="mt-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        </div>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={uploadedImageUrl}
                      alt="Uploaded"
                      className="w-full h-auto rounded-lg max-h-96 object-contain mx-auto"
                    />
                    <button
                      onClick={handleReset}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      aria-label="Remove image"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {uploadedImageUrl && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Select Caption Tone
                  </h2>
                  <ToneSelector selectedTone={selectedTone} onToneChange={handleToneChange} />
                </div>
              )}

              {(uploadError || captionError) && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  {uploadError || captionError}
                </div>
              )}

              {uploadedImageUrl && (
                <div className="flex justify-center">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <FiUpload className="w-5 h-5" />
                        <span>Generate Captions</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {generatedCaptions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Generated Captions
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {generatedCaptions.map((caption, index) => (
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