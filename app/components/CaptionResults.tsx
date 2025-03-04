import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCaptionStore } from '../store/captionStore';
import CaptionCard from './CaptionCard';
import { CaptionCategory } from '../types';
import { FiFilter } from 'react-icons/fi';

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
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Your Generated Captions
        </h2>
        
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-4">
          <FiFilter className="text-gray-500 dark:text-gray-400 mr-2" />
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence>
          {filteredCaptions.map((caption, index) => (
            <CaptionCard key={caption.id} caption={caption} index={index} />
          ))}
        </AnimatePresence>
        
        {filteredCaptions.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No captions found in this category. Try selecting a different category or generate more captions.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
} 