'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import { useCaptionStore } from '@/app/store/captionStore';
import CaptionCard from '@/app/components/CaptionCard';
import { FiSearch, FiAlertCircle, FiBookmark, FiFilter } from 'react-icons/fi';
import { useFirebaseIntegration } from '@/app/hooks/useFirebaseIntegration';

export default function SavedCaptions() {
  const { user, loading } = useAuth();
  const isSignedIn = !!user;
  const isLoaded = !loading;
  const { savedCaptions, setGeneratedCaptions } = useCaptionStore();
  const { isLoading: isFirebaseLoading, getSavedCaptions } = useFirebaseIntegration();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCaptions, setFilteredCaptions] = useState(savedCaptions);
  const [isLoadingCaptions, setIsLoadingCaptions] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

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

  // Filter captions based on search term and active filter
  useEffect(() => {
    let filtered = savedCaptions;
    
    // Apply category filter if not 'all'
    if (activeFilter !== 'all') {
      filtered = filtered.filter(caption => 
        caption.category.toLowerCase() === activeFilter.toLowerCase()
      );
    }
    
    // Apply search term filter
    if (searchTerm.trim() !== '') {
      const lowercasedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (caption) =>
          caption.text.toLowerCase().includes(lowercasedSearch) ||
          caption.category.toLowerCase().includes(lowercasedSearch) ||
          (caption.hashtags &&
            caption.hashtags.some((tag) =>
              typeof tag === 'string' && tag.toLowerCase().includes(lowercasedSearch)
            ))
      );
    }
    
    setFilteredCaptions(filtered);
  }, [searchTerm, savedCaptions, activeFilter]);

  // Get unique categories for filter
  const categories = ['all', ...new Set(savedCaptions.map(caption => caption.category.toLowerCase()))];

  if (!isLoaded || isFirebaseLoading || isLoadingCaptions) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 py-12 flex items-center justify-center pt-28">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-blue-600 dark:text-blue-400 font-medium">Loading your captions...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 pt-28 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden p-8 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
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
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 pt-28 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block p-2 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <FiBookmark className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Your Saved Captions
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              View and manage all your saved Instagram captions.
            </p>
          </motion.div>

          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-12 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="p-6 sm:p-10">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 mb-8">
                <div className="relative flex-grow md:mr-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Search captions, hashtags, or categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="relative">
                  <div className="flex items-center overflow-x-auto pb-1 scrollbar-hide">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1.5 shadow-sm">
                      <div className="flex items-center space-x-1">
                        <FiFilter className="h-4 w-4 text-gray-500 dark:text-gray-400 ml-2 mr-1" />
                        {categories.map((category) => (
                          <motion.button
                            key={category}
                            onClick={() => setActiveFilter(category)}
                            className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition-all duration-200 ${
                              activeFilter === category
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {filteredCaptions.length > 0 ? (
                  <motion.div
                    key="caption-grid"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {filteredCaptions.map((caption, index) => (
                      <motion.div
                        key={caption.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <CaptionCard 
                          caption={caption} 
                          index={index} 
                          isSavedCaption={true} 
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-captions"
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No saved captions found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      {searchTerm || activeFilter !== 'all'
                        ? "No captions match your search criteria."
                        : "You haven't saved any captions yet. Generate some captions and save them to see them here."}
                    </p>
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Generate Captions
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 