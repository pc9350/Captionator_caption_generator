import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiRefreshCw, FiSave, FiTrash2 } from 'react-icons/fi';
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
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
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
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
              {caption.category}
            </span>
            <div className="flex space-x-2">
              {isSavedCaption ? (
                <motion.button
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  aria-label="Delete caption"
                >
                  <FiTrash2 className={isDeleting ? 'text-red-500' : ''} />
                </motion.button>
              ) : (
                <motion.button
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleSave}
                  aria-label="Save caption"
                >
                  {isSaved ? <FiSave className="text-green-500" /> : <FiSave />}
                </motion.button>
              )}
              
              {!isSavedCaption && (
                <motion.button
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
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
                  <FiRefreshCw className={isRegenerating ? 'animate-spin' : ''} />
                </motion.button>
              )}
              
              <motion.button
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleCopy}
                aria-label="Copy caption"
              >
                {copied ? <FiSave className="text-green-500" /> : <FiCopy />}
              </motion.button>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
              {caption.text}
            </p>
          </div>
          
          {hashtags.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {hashtags.map((hashtag, idx) => (
                  <span 
                    key={idx} 
                    className="text-sm text-blue-600 dark:text-blue-400"
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
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center z-50">
          <FiSave className="mr-2" />
          <span>New caption added at the bottom</span>
        </div>
      )}
    </>
  );
} 