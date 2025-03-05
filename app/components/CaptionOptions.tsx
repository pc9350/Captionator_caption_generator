import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { useCaptionStore } from '../store/captionStore';
import { FiHash, FiSmile, FiInfo, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function CaptionOptions() {
  const { 
    includeHashtags, 
    setIncludeHashtags, 
    includeEmojis, 
    setIncludeEmojis 
  } = useCaptionStore();
  
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Additional Options
      </h2>
      
      <motion.div 
        className="space-y-4 md:space-y-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300"
          whileHover={{ 
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
            y: -2
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-500 dark:text-blue-400 mr-3 mt-0.5">
                <FiHash className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Include Hashtags
                </span>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400 mt-1 max-w-xs`}>
                  {isMobile 
                    ? "Add hashtags to boost your post's discoverability."
                    : "Add relevant hashtags to increase reach and discoverability on Instagram. Hashtags help your content get found by users interested in similar topics."
                  }
                </p>
                
                {!isMobile && (
                  <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-start">
                    <FiInfo className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Example: "Sunset vibes at the beach 🌅 #BeachLife #SunsetLover #NaturePhotography"
                    </p>
                  </div>
                )}
              </div>
            </div>
            <Switch
              checked={includeHashtags}
              onChange={setIncludeHashtags}
              className={`${
                includeHashtags ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 ml-2`}
            >
              <span className="sr-only">Include hashtags</span>
              <motion.span
                className={`${
                  includeHashtags ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                layout
                transition={{
                  type: "spring",
                  stiffness: 700,
                  damping: 30
                }}
              />
            </Switch>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300"
          whileHover={{ 
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
            y: -2
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="p-2.5 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg text-yellow-500 dark:text-yellow-400 mr-3 mt-0.5">
                <FiSmile className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Include Emojis
                </span>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400 mt-1 max-w-xs`}>
                  {isMobile 
                    ? "Add emojis to make your captions more expressive."
                    : "Add relevant emojis to make captions more engaging, expressive, and visually appealing. Emojis can help convey emotions that words alone cannot."
                  }
                </p>
                
                {!isMobile && (
                  <div className="mt-3 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg flex items-start">
                    <FiInfo className="w-4 h-4 text-yellow-500 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      Example: "Coffee date with my bestie ☕❤️ Nothing beats good conversations!"
                    </p>
                  </div>
                )}
              </div>
            </div>
            <Switch
              checked={includeEmojis}
              onChange={setIncludeEmojis}
              className={`${
                includeEmojis ? 'bg-yellow-500' : 'bg-gray-200 dark:bg-gray-700'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 flex-shrink-0 ml-2`}
            >
              <span className="sr-only">Include emojis</span>
              <motion.span
                className={`${
                  includeEmojis ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                layout
                transition={{
                  type: "spring",
                  stiffness: 700,
                  damping: 30
                }}
              />
            </Switch>
          </div>
        </motion.div>
        
        <motion.div 
          className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start">
            <FiAlertCircle className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-600 dark:text-gray-400`}>
              {isMobile 
                ? "Options affect AI generation. You can edit captions afterward."
                : "These options affect the AI-generated captions. You can always edit the captions manually after generation."
              }
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 