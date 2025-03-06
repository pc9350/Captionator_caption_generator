import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCaptionStore } from '../store/captionStore';
import CaptionCard from './CaptionCard';
import { FiZap } from 'react-icons/fi';

export default function CaptionResults() {
  const { generatedCaptions } = useCaptionStore();
  const [sortedCaptions, setSortedCaptions] = useState(generatedCaptions);

  // Sort captions by viral score
  useEffect(() => {
    // Sort by viral score (if available)
    const sorted = [...generatedCaptions].sort((a, b) => {
      // If both have viral scores, sort by score (highest first)
      if (a.viral_score && b.viral_score) {
        return b.viral_score - a.viral_score;
      }
      // If only one has a viral score, prioritize the one with a score
      else if (a.viral_score) return -1;
      else if (b.viral_score) return 1;
      // If neither has a viral score, maintain original order
      return 0;
    });
    
    setSortedCaptions(sorted);
  }, [generatedCaptions]);

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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
              Your Generated Captions
            </span>
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
              {sortedCaptions.length} results
            </span>
          </h2>
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FiZap className="mr-1" />
            <span>Sorted by viral potential</span>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AnimatePresence>
          {sortedCaptions.map((caption, index) => (
            <CaptionCard key={caption.id || index} caption={caption} index={index} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
} 