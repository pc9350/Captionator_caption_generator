'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ImageUploader from '@/app/components/ImageUploader';
import ToneSelector from '@/app/components/ToneSelector';
import CaptionOptions from '@/app/components/CaptionOptions';
import GenerateButton from '@/app/components/GenerateButton';
import CaptionResults from '@/app/components/CaptionResults';
import { FiSettings } from 'react-icons/fi';
import { useAuth } from '@/app/context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedTone, setSelectedTone] = useState('casual');
  
  type TabType = 'tones' | 'options';
  const [activeTab, setActiveTab] = useState<TabType>('tones');

  const handleToneChange = (tone: string) => {
    setSelectedTone(tone);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-28 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-5xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            className="mb-10 text-center"
            variants={itemVariants}
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              {user
                ? `Welcome to Caption Generator`
                : 'Instagram Caption Generator'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Upload an image and our AI will generate engaging, context-aware captions for your Instagram posts.
            </p>
          </motion.div>

          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-12 border border-gray-100 dark:border-gray-700"
            variants={itemVariants}
          >
            <div className="p-6 sm:p-10">
              <motion.div 
                className="mb-10"
                variants={itemVariants}
              >
                <ImageUploader />
              </motion.div>

              <motion.div
                variants={itemVariants}
              >
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Desktop Layout */}
                  <div className="hidden md:block">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                        <FiSettings className="mr-2" />
                        Customize Your Captions
                      </h2>
                      
                      {/* Tabs for desktop */}
                      <div className="flex space-x-2 mb-6">
                        <button
                          onClick={() => setActiveTab('tones')}
                          className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-all ${
                            activeTab === 'tones'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          Caption Tones
                        </button>
                        <button
                          onClick={() => setActiveTab('options')}
                          className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-all ${
                            activeTab === 'options'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          Options
                        </button>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                        {activeTab === 'tones' ? (
                          <ToneSelector selectedTone={selectedTone} onToneChange={handleToneChange} />
                        ) : (
                          <CaptionOptions />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Layout */}
                  <div className="md:hidden">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                        <FiSettings className="mr-2" />
                        Customize Your Captions
                      </h2>
                      
                      {/* Mobile Tabs */}
                      <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => setActiveTab('tones')}
                          className={`flex-1 py-2 text-center text-sm font-medium ${
                            activeTab === 'tones'
                              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          Caption Tones
                        </button>
                        <button
                          onClick={() => setActiveTab('options')}
                          className={`flex-1 py-2 text-center text-sm font-medium ${
                            activeTab === 'options'
                              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          Options
                        </button>
                      </div>
                      
                      <div>
                        {activeTab === 'tones' ? (
                          <ToneSelector selectedTone={selectedTone} onToneChange={handleToneChange} />
                        ) : (
                          <CaptionOptions />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="flex justify-center mt-8">
                  <GenerateButton />
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <CaptionResults />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 