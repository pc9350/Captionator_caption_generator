import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiRefreshCw, FiSave, FiTrash2, FiCheck, FiTag } from 'react-icons/fi';
import { useCaptionGeneration } from '../hooks/useCaptionGeneration';
import { useCaptionStore } from '../store/captionStore';
import { Caption } from '../types';
import toast from 'react-hot-toast';
import Tooltip from './Tooltip';

interface CaptionCardProps {
  caption: Caption;
  index: number;
  isSavedCaption?: boolean;
}

export default function CaptionCard({ caption, index, isSavedCaption = false }: CaptionCardProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipAnchor, setTooltipAnchor] = useState<HTMLButtonElement | null>(null);
  const { regenerateCaption } = useCaptionGeneration();
  const { saveCaption, removeCaption } = useCaptionStore();
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(isSavedCaption);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Update isSaved when isSavedCaption changes
  useEffect(() => {
    setIsSaved(isSavedCaption);
  }, [isSavedCaption]);

  // Ensure hashtags and emojis are arrays of strings
  const hashtags = Array.isArray(caption.hashtags) 
    ? caption.hashtags.filter((tag): tag is string => typeof tag === 'string')
    : [];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(caption.text);
      setCopied(true);
      toast.success('Caption copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy text');
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const newCaption = await regenerateCaption(caption.category);
      if (newCaption) {
        // Show notification and scroll to bottom
        setShowNotification(true);
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
        
        // Hide notification after 5 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error regenerating caption:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      // Temporarily show the green tick
      setIsSaved(true);
      
      // Save the caption
      await saveCaption(caption);
      toast.success('Caption saved successfully');
    } catch (error) {
      console.error('Error saving caption:', error);
      setIsSaved(false);
      toast.error('Failed to save caption');
    }
  };

  const handleDelete = async () => {
    // Check if caption has an id before attempting to delete
    if (!caption.id) {
      console.error('Cannot delete caption without id');
      return;
    }

    setIsDeleting(true);
    try {
      await removeCaption(caption.id);
      toast.success('Caption deleted successfully');
    } catch (error) {
      console.error('Error deleting caption:', error);
      toast.error('Failed to delete caption');
    } finally {
      setIsDeleting(false);
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        delay: index * 0.1 
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      transition: { duration: 0.3 } 
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <>
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FiTag className="w-4 h-4 text-blue-500 dark:text-blue-400 mr-2" />
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                {caption.category}
              </span>
            </div>
            <div className="flex space-x-2">
              {isSavedCaption ? (
                <motion.button
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  aria-label="Delete caption"
                >
                  <FiTrash2 className={`w-4 h-4 ${isDeleting ? 'animate-pulse' : ''}`} />
                </motion.button>
              ) : (
                <motion.button
                  className={`w-9 h-9 flex items-center justify-center rounded-full ${
                    isSaved 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-400' 
                      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  } transition-colors duration-200`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleSave}
                  aria-label="Save caption"
                >
                  {isSaved ? <FiCheck className="w-4 h-4" /> : <FiSave className="w-4 h-4" />}
                </motion.button>
              )}
              
              {!isSavedCaption && (
                <motion.button
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  aria-label="Regenerate caption"
                  onMouseEnter={(e) => {
                    setTooltipVisible(true);
                    setTooltipAnchor(e.currentTarget);
                  }}
                  onMouseLeave={() => setTooltipVisible(false)}
                >
                  <FiRefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                </motion.button>
              )}
              
              <motion.button
                className={`w-9 h-9 flex items-center justify-center rounded-full ${
                  copied 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-400' 
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                } transition-colors duration-200`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleCopy}
                aria-label="Copy caption"
              >
                {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>
          
          <div className="mb-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
              {caption.text}
            </p>
          </div>
          
          {hashtags.length > 0 && (
            <div className="mb-1">
              <div className="flex flex-wrap gap-2">
                {hashtags.map((hashtag, idx) => (
                  <span 
                    key={idx} 
                    className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md"
                  >
                    #{hashtag.replace(/^#/, '')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Use the new Tooltip component */}
      <Tooltip 
        text="New caption will be added at the bottom"
        isVisible={tooltipVisible}
        anchorElement={tooltipAnchor}
        position="top"
      />
      
      {/* Notification toast */}
      {showNotification && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center z-50 animate-pulse">
          <FiSave className="mr-2" />
          <span>New caption added at the bottom</span>
        </div>
      )}
    </>
  );
} 