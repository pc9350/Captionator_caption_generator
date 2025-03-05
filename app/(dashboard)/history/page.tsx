'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { FiClock, FiAlertCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import CaptionCard from '@/app/components/CaptionCard';
import { getCaptionHistory } from '@/app/utils/firebaseUtils';
import { CaptionHistory } from '@/app/types';
import Image from 'next/image';

export default function History() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [history, setHistory] = useState<CaptionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      if (!isSignedIn || !user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const captionHistory = await getCaptionHistory(user.id);
        setHistory(captionHistory);
      } catch (err) {
        console.error('Error loading caption history:', err);
        setError('Failed to load caption history');
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded && isSignedIn) {
      loadHistory();
    } else if (isLoaded && !isSignedIn) {
      setIsLoading(false);
    }
  }, [isSignedIn, isLoaded, user]);

  const toggleExpand = (historyId: string) => {
    if (expandedHistory === historyId) {
      setExpandedHistory(null);
    } else {
      setExpandedHistory(historyId);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden p-8">
              <FiAlertCircle className="w-16 h-16 text-blue-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Sign In Required
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Please sign in to view your caption history.
              </p>
              <button
                onClick={() => window.location.href = '/sign-in'}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
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
              Caption History
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              View your past caption generations.
            </p>
          </motion.div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {history.length > 0 ? (
              history.map((item) => (
                <motion.div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <FiClock className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        aria-label={expandedHistory === item.id ? "Collapse" : "Expand"}
                      >
                        {expandedHistory === item.id ? (
                          <FiChevronUp className="w-5 h-5" />
                        ) : (
                          <FiChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <div className="mb-4">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                        <Image
                          src={item.imageUrl}
                          alt="Caption history thumbnail"
                          fill
                          className="object-cover"
                          sizes="(max-width: 96px) 100vw, 96px"
                        />
                      </div>
                    </div>

                    {expandedHistory === item.id && (
                      <motion.div
                        className="mt-6 space-y-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          Generated Captions
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          {item.captions.map((caption, index) => (
                            <CaptionCard
                              key={caption.id || index}
                              caption={{
                                id: caption.id || `history-${item.id}-${index}`,
                                text: caption.text,
                                category: caption.category,
                                hashtags: caption.hashtags || [],
                                emojis: caption.emojis || [],
                              }}
                              index={index}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden p-8 text-center">
                <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No caption history found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  You haven&apos;t generated any captions yet. Generate some captions to see your history here.
                </p>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Generate Captions
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 