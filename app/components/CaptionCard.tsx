import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiRefreshCw, FiSave, FiTrash2, FiCheck, FiTag, FiZap } from 'react-icons/fi';
import { useCaptionGeneration } from '../hooks/useCaptionGeneration';
import { useCaptionStore } from '../store/captionStore';
import { useFirebaseIntegration } from '../hooks/useFirebaseIntegration';
import { useAuth } from '../context/AuthContext';
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
  const { saveCaption: storeSaveCaption, removeCaption: storeRemoveCaption } = useCaptionStore();
  const { saveCaption: firebaseSaveCaption, deleteCaption: firebaseDeleteCaption } = useFirebaseIntegration();
  const { user } = useAuth();
  const isSignedIn = !!user;
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(isSavedCaption);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Update isSaved when isSavedCaption changes
  useEffect(() => {
    setIsSaved(isSavedCaption);
  }, [isSavedCaption]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(caption.text);
      setCopied(true);
      toast.success('Caption copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying text:', error);
      toast.error('Failed to copy caption');
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const newCaption = await regenerateCaption(caption.category);
      if (newCaption) {
        toast.success('Caption regenerated successfully');
      } else {
        toast.error('Failed to regenerate caption');
      }
    } catch (error) {
      console.error('Error regenerating caption:', error);
      toast.error('Failed to regenerate caption');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      // Temporarily show the green tick
      setIsSaved(true);
      
      // First save to local store
      storeSaveCaption(caption);
      
      // If user is signed in, also save to Firebase
      if (isSignedIn) {
        const success = await firebaseSaveCaption(caption);
        if (!success) {
          toast.error('Failed to save caption to cloud. It will be available locally only.');
        }
      }
      
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
      // Remove from local store
      storeRemoveCaption(caption.id);
      
      // If user is signed in, also delete from Firebase
      if (isSignedIn) {
        const success = await firebaseDeleteCaption(caption.id);
        if (!success) {
          toast.error('Failed to delete caption from cloud. It has been removed locally.');
        }
      }
      
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

  // Get viral score color based on value
  const getViralScoreColor = (score: number) => {
    if (score >= 8) return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
    if (score >= 6) return 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white';
    return 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
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
            <div className="flex items-center space-x-2">
              <FiTag className="w-4 h-4 text-blue-500 dark:text-blue-400 mr-2" />
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                {caption.category}
              </span>
              
              {/* Viral Score Badge - Always render with a fallback */}
              <div className="ml-2 flex items-center">
              <span 
                className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center
                  ${(typeof caption.viral_score === 'number' && caption.viral_score >= 8) 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                    : (typeof caption.viral_score === 'number' && caption.viral_score >= 6)
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}
              >
                <span className="mr-1">Viral Score:</span>
                <span className="font-bold">{typeof caption.viral_score === 'number' ? caption.viral_score : 5}</span>
              </span>
            </div>
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
                >
                  <FiRefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                </motion.button>
              )}
              
              <motion.button
                className={`w-9 h-9 flex items-center justify-center rounded-full ${
                  copied 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-400' 
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                } transition-colors duration-200`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleCopy}
                aria-label="Copy caption"
                ref={(el) => {
                  if (tooltipVisible && !el) {
                    setTooltipVisible(false);
                  }
                }}
                onMouseEnter={(e) => {
                  setTooltipAnchor(e.currentTarget);
                  setTooltipVisible(true);
                }}
                onMouseLeave={() => {
                  setTooltipVisible(false);
                }}
              >
                {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>
          
          <div className="mt-2">
            <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed">
              {caption.text}
            </p>
            
            {caption.hashtags && caption.hashtags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {caption.hashtags.map((tag, i) => (
                  <span 
                    key={i} 
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
      
      {tooltipVisible && tooltipAnchor && (
        <Tooltip
          text={copied ? "Copied!" : "Copy to clipboard"}
          isVisible={tooltipVisible}
          anchorElement={tooltipAnchor}
          position="top"
        />
      )}
    </>
  );
} 