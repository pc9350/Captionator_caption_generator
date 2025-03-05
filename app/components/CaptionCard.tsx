import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCopy, FiRefreshCw, FiHeart, FiCheck, FiTrash2, FiInfo, FiArrowDown } from 'react-icons/fi';
import { Caption } from '../types';
import { useCaptionGeneration } from '../hooks/useCaptionGeneration';
import { useCaptionStore } from '../store/captionStore';
import { useFirebaseIntegration } from '../hooks/useFirebaseIntegration';
import { useUser } from '@clerk/nextjs';
import Tooltip from './Tooltip';

interface CaptionCardProps {
  caption: Caption;
  index: number;
  isSavedCaption?: boolean;
}

export default function CaptionCard({ caption, index, isSavedCaption = false }: CaptionCardProps) {
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const regenerateButtonRef = useRef<HTMLButtonElement>(null);
  
  const { regenerateCaption } = useCaptionGeneration();
  const { addGeneratedCaption, saveCaption: storeSaveCaption, removeCaption } = useCaptionStore();
  const { saveCaption, deleteCaption } = useFirebaseIntegration();
  const { isSignedIn } = useUser();

  // Check if the caption is already saved in the store
  useEffect(() => {
    // If this is already a saved caption, we don't need to check
    if (isSavedCaption) {
      setIsSaved(true);
    } else {
      // Reset isSaved to false for non-saved captions
      setIsSaved(false);
    }
  }, [isSavedCaption]);

  // Ensure hashtags and emojis are arrays of strings
  const hashtags = Array.isArray(caption.hashtags) 
    ? caption.hashtags.filter((tag): tag is string => typeof tag === 'string')
    : [];
  const emojis = caption.emojis || [];

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
        addGeneratedCaption(newCaption);
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
    if (!isSignedIn) {
      // Show sign-in prompt or notification
      alert('Please sign in to save captions');
      return;
    }
    
    try {
      // Temporarily show the green tick
      setIsSaved(true);
      
      const savedCaption = await saveCaption(caption);
      if (savedCaption) {
        // Update the local store
        storeSaveCaption({
          ...caption,
          id: savedCaption.id
        });
        
        // Show success feedback temporarily
        setTimeout(() => {
          // If we're not on the saved captions page, revert the icon back to heart
          if (!isSavedCaption) {
            setIsSaved(false);
          }
        }, 2000);
      } else {
        // If saving failed, revert the icon
        setIsSaved(false);
      }
    } catch (error) {
      console.error('Error saving caption:', error);
      setIsSaved(false);
    }
  };

  const handleDelete = async () => {
    if (!isSignedIn) return;
    
    // Check if caption has an id before attempting to delete
    if (!caption.id) {
      console.error('Cannot delete caption: No ID provided');
      return;
    }
    
    setIsDeleting(true);
    try {
      const success = await deleteCaption(caption.id);
      if (success) {
        // Remove from local store
        removeCaption(caption.id);
      }
    } catch (error) {
      console.error('Error deleting caption:', error);
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
                  {isSaved ? <FiCheck className="text-green-500" /> : <FiHeart />}
                </motion.button>
              )}
              
              {!isSavedCaption && (
                <motion.button
                  ref={regenerateButtonRef}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  aria-label="Regenerate caption"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
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
                {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
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
        isVisible={showTooltip}
        anchorElement={regenerateButtonRef.current}
        position="top"
      />
      
      {/* Notification toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center z-50"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <FiArrowDown className="mr-2" />
            <span>New caption added at the bottom</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 