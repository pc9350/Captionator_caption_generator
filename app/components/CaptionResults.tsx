import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCaptionStore } from '../store/captionStore';
import CaptionCard from './CaptionCard';
import { CaptionCategory } from '../types';
import { FiFilter, FiHash, FiSmile, FiStar, FiTrendingUp, FiHeart, FiCoffee, FiFeather } from 'react-icons/fi';

// Map categories to icons
const categoryIcons: Record<string, React.ReactNode> = {
  'All': <FiHash className="w-4 h-4" />,
  'Funny': <FiSmile className="w-4 h-4" />,
  'Aesthetic': <FiStar className="w-4 h-4" />,
  'Motivational': <FiHeart className="w-4 h-4" />,
  'Trendy': <FiTrendingUp className="w-4 h-4" />,
  'Witty': <FiFeather className="w-4 h-4" />,
  'Deep': <FiCoffee className="w-4 h-4" />,
  'Minimal': <FiHash className="w-4 h-4" />,
};

export default function CaptionResults() {
  const { generatedCaptions, selectedCategory, setSelectedCategory } = useCaptionStore();
  const [filteredCaptions, setFilteredCaptions] = useState(generatedCaptions);

  // Filter captions when selection changes
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredCaptions(generatedCaptions);
    } else {
      setFilteredCaptions(
        generatedCaptions.filter((caption) => caption.category === selectedCategory)
      );
    }
  }, [generatedCaptions, selectedCategory]);

  // All possible categories plus "All"
  const categories: (CaptionCategory | 'All')[] = [
    'All',
    'Funny',
    'Aesthetic',
    'Motivational',
    'Trendy',
    'Witty',
    'Deep',
    'Minimal',
  ];

  if (generatedCaptions.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
            Your Generated Captions
          </span>
          <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
            {filteredCaptions.length} results
          </span>
        </h2>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-2">
            <FiFilter className="text-gray-500 dark:text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by style:</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-1.5">
                  {categoryIcons[category]}
                </span>
                {category}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        <AnimatePresence mode="popLayout">
          {filteredCaptions.map((caption, index) => (
            <motion.div
              key={caption.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              layout
            >
              <CaptionCard caption={caption} index={index} />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredCaptions.length === 0 && (
          <motion.div 
            className="col-span-2 text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FiFilter className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No captions found in this category.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Try selecting a different category or generate more captions.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 