import { motion } from 'framer-motion';
import { FiZap, FiDollarSign, FiCpu } from 'react-icons/fi';
import { useCaptionGeneration } from '../hooks/useCaptionGeneration';
import { useCaptionStore } from '../store/captionStore';

export default function GenerateButton({ tone = 'Casual' }: { tone?: string }) {
  const { generateCaptions, error } = useCaptionGeneration();
  const { 
    isGenerating, 
    uploadedImages
  } = useCaptionStore();

  const handleGenerate = async () => {
    if (!uploadedImages || uploadedImages.length === 0) return;
    await generateCaptions(tone);
  };

  // Check if images are available for caption generation
  const hasImages = uploadedImages && uploadedImages.length > 0;

  return (
    <div className="w-full max-w-md">
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Glow effect behind button */}
        {hasImages && (
          <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-600/30 blur-xl rounded-full transform scale-90 opacity-70" />
        )}
        
        <motion.button
          onClick={handleGenerate}
          disabled={isGenerating || !hasImages}
          className={`relative w-full flex items-center justify-center px-8 py-4 rounded-xl font-medium text-white shadow-lg ${
            !hasImages
              ? 'bg-gray-400 cursor-not-allowed dark:bg-gray-600'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500'
          } transition-all duration-300`}
          whileHover={hasImages ? { 
            scale: 1.03,
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(59, 130, 246, 0.3)'
          } : {}}
          whileTap={hasImages ? { scale: 0.98 } : {}}
        >
          {isGenerating ? (
            <>
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 animate-pulse" />
              </div>
              <div className="flex items-center justify-center relative z-10">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-lg">Generating Captions...</span>
              </div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-indigo-400/5 to-blue-400/10 bg-[length:400%_100%] animate-gradient" />
              </div>
              <div className="flex items-center justify-center relative z-10">
                <FiZap className="mr-2 h-5 w-5" />
                <span className="text-lg">Generate Captions</span>
              </div>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Cost-saving indicator */}
      <motion.div 
        className="mt-3 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 py-2 px-3 rounded-full shadow-sm border border-gray-100 dark:border-gray-700"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <FiDollarSign className="mr-1 text-green-500" />
        <span>Cost-saving optimizations enabled</span>
        <span className="mx-2 h-3 w-px bg-gray-300 dark:bg-gray-600"></span>
        <FiCpu className="mr-1 text-blue-500" />
        <span>AI-powered</span>
      </motion.div>

      {error && (
        <motion.div 
          className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 dark:text-red-400"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </motion.div>
      )}
    </div>
  );
} 