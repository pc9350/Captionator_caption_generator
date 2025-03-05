'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import ImageUploader from '@/app/components/ImageUploader';
import ToneSelector from '@/app/components/ToneSelector';
import CaptionOptions from '@/app/components/CaptionOptions';
import GenerateButton from '@/app/components/GenerateButton';
import CaptionResults from '@/app/components/CaptionResults';

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [showOptions, setShowOptions] = useState(false);
  const [selectedTone, setSelectedTone] = useState('casual');

  const handleToneChange = (tone: string) => {
    console.log('Dashboard: tone changed to', tone);
    setSelectedTone(tone);
  };

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
              {isLoaded && isSignedIn
                ? `Welcome, ${user?.firstName || 'there'}!`
                : 'Generate Instagram Captions'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Upload an image and our AI will generate engaging, context-aware captions for your Instagram posts.
            </p>
          </motion.div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-12">
            <div className="p-6 sm:p-10">
              <div className="mb-10">
                <ImageUploader />
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 mb-6 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  <svg
                    className={`w-4 h-4 mr-2 transition-transform ${
                      showOptions ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  {showOptions ? 'Hide Options' : 'Show Options'}
                </button>

                {showOptions && (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ToneSelector selectedTone={selectedTone} onToneChange={handleToneChange} />
                    <CaptionOptions />
                  </motion.div>
                )}

                <div className="flex justify-center mt-8">
                  <GenerateButton />
                </div>
              </motion.div>
            </div>
          </div>

          <CaptionResults />
        </div>
      </div>
    </div>
  );
} 