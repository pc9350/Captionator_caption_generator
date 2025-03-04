import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiRefreshCw, FiHeart, FiCheck, FiTrash2 } from 'react-icons/fi';
import { Caption } from '../types';
import { useCaptionGeneration } from '../hooks/useCaptionGeneration';
import { useCaptionStore } from '../store/captionStore';
import { useFirebaseIntegration } from '../hooks/useFirebaseIntegration';
import { useUser } from '@clerk/nextjs';

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
  const { regenerateCaption } = useCaptionGeneration();
  const { addGeneratedCaption } = useCaptionStore();
  const { saveCaption, deleteCaption } = useFirebaseIntegration();
  const { isSignedIn } = useUser();

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
    
    const result = await saveCaption(caption);
    if (result) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!isSignedIn) return;
    
    setIsDeleting(true);
    try {
      await deleteCaption(caption.id);
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
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                aria-label="Regenerate caption"
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
        
        {caption.hashtags && caption.hashtags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {caption.hashtags.map((hashtag, idx) => (
                <span 
                  key={idx} 
                  className="text-sm text-blue-600 dark:text-blue-400"
                >
                  #{hashtag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {caption.emojis && caption.emojis.length > 0 && (
          <div className="text-lg">
            {caption.emojis.map((emoji, idx) => (
              <span key={idx} className="mr-1">{emoji}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
} 