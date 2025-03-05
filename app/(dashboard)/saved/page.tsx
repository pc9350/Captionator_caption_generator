'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useCaptionStore } from '@/app/store/captionStore';
import CaptionCard from '@/app/components/CaptionCard';
import { FiSearch, FiAlertCircle } from 'react-icons/fi';
import { useFirebaseIntegration } from '@/app/hooks/useFirebaseIntegration';

export default function SavedCaptions() {
  const { isSignedIn, isLoaded } = useUser();
  const { savedCaptions, setGeneratedCaptions } = useCaptionStore();
  const { isLoading: isFirebaseLoading, getSavedCaptions } = useFirebaseIntegration();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCaptions, setFilteredCaptions] = useState(savedCaptions);
  const [isLoadingCaptions, setIsLoadingCaptions] = useState(true);

  // Fetch saved captions when the component mounts
  useEffect(() => {
    const fetchSavedCaptions = async () => {
      if (isSignedIn) {
        setIsLoadingCaptions(true);
        try {
          const captions = await getSavedCaptions();
          // Update the store with the fetched captions
          if (captions && captions.length > 0) {
            setGeneratedCaptions(captions);
          }
        } catch (error) {
          console.error('Error fetching saved captions:', error);
        } finally {
          setIsLoadingCaptions(false);
        }
      }
    };

    if (isLoaded && isSignedIn) {
      fetchSavedCaptions();
    } else if (isLoaded) {
      setIsLoadingCaptions(false);
    }
  }, [isSignedIn, isLoaded, getSavedCaptions, setGeneratedCaptions]);

  // Filter captions based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCaptions(savedCaptions);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      setFilteredCaptions(
        savedCaptions.filter(
          (caption) =>
            caption.text.toLowerCase().includes(lowercasedSearch) ||
            caption.category.toLowerCase().includes(lowercasedSearch) ||
            (caption.hashtags &&
              caption.hashtags.some((tag) =>
                typeof tag === 'string' && tag.toLowerCase().includes(lowercasedSearch)
              ))
        )
      );
    }
  }, [searchTerm, savedCaptions]);

  if (!isLoaded || isFirebaseLoading || isLoadingCaptions) {
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
                Please sign in to view your saved captions.
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
              Your Saved Captions
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              View and manage all your saved Instagram captions.
            </p>
          </motion.div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-12">
            <div className="p-6 sm:p-10">
              <div className="relative mb-8">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search captions, hashtags, or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {filteredCaptions.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {filteredCaptions.map((caption, index) => (
                    <CaptionCard 
                      key={caption.id || index} 
                      caption={caption} 
                      index={index} 
                      isSavedCaption={true} 
                    />
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No saved captions found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {searchTerm
                      ? "No captions match your search criteria."
                      : "You haven't saved any captions yet. Generate some captions and save them to see them here."}
                  </p>
                  <button
                    onClick={() => window.location.href = '/'}
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
    </div>
  );
} 