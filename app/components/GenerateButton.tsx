import { motion } from 'framer-motion';
import { FiZap } from 'react-icons/fi';
import { useCaptionGeneration } from '../hooks/useCaptionGeneration';
import { useCaptionStore } from '../store/captionStore';

export default function GenerateButton({ tone = 'Casual' }: { tone?: string }) {
  const { generateCaptions, error } = useCaptionGeneration();
  const { 
    isGenerating, 
    uploadedImages, 
    includeHashtags,
    includeEmojis
  } = useCaptionStore();

  const handleGenerate = async () => {
    if (!uploadedImages || uploadedImages.length === 0) return;
    await generateCaptions(tone);
  };

  // Check if images are available for caption generation
  const hasImages = uploadedImages && uploadedImages.length > 0;

  return (
    <div className="w-full max-w-md">
      <motion.button
        onClick={handleGenerate}
        disabled={isGenerating || !hasImages}
        className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white shadow-lg ${
          !hasImages
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
        }`}
        whileHover={hasImages ? { scale: 1.02 } : {}}
        whileTap={hasImages ? { scale: 0.98 } : {}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isGenerating ? (
          <>
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
            Generating Captions...
          </>
        ) : (
          <>
            <FiZap className="mr-2 h-5 w-5" />
            Generate Captions
          </>
        )}
      </motion.button>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
          {error}
        </div>
      )}
    </div>
  );
} 