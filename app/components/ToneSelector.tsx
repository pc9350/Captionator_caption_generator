'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiCoffee, FiBriefcase, FiSmile, FiTrendingUp, FiSun, FiBookOpen, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface ToneSelectorProps {
  selectedTone: string;
  onToneChange: (tone: string) => void;
}

const toneOptions = [
  {
    value: 'casual',
    label: 'Casual',
    description: 'Relaxed, friendly, and conversational',
    icon: <FiCoffee className="w-5 h-5" />,
    color: 'from-amber-400 to-amber-300',
    darkColor: 'from-amber-600 to-amber-500',
    examples: ['Just another day in paradise ☀️', 'Coffee and chill vibes only ☕']
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Polished, formal, and business-like',
    icon: <FiBriefcase className="w-5 h-5" />,
    color: 'from-blue-400 to-blue-300',
    darkColor: 'from-blue-600 to-blue-500',
    examples: ['Embracing new challenges and opportunities', 'Dedicated to excellence in everything we do']
  },
  {
    value: 'funny',
    label: 'Funny',
    description: 'Humorous, witty, and entertaining',
    icon: <FiSmile className="w-5 h-5" />,
    color: 'from-pink-400 to-pink-300',
    darkColor: 'from-pink-600 to-pink-500',
    examples: ['My face when the weekend arrives 😂', 'If my camera roll could talk, it would be laughing']
  },
  {
    value: 'cool',
    label: 'Cool & Attitude',
    description: 'Edgy, confident, and trendsetting',
    icon: <FiTrendingUp className="w-5 h-5" />,
    color: 'from-purple-400 to-purple-300',
    darkColor: 'from-purple-600 to-purple-500',
    examples: ["Not here to fit in 💯", "Vibes don't lie"]
  },
  {
    value: 'inspirational',
    label: 'Inspirational',
    description: 'Uplifting, motivational, and positive',
    icon: <FiSun className="w-5 h-5" />,
    color: 'from-orange-400 to-orange-300',
    darkColor: 'from-orange-600 to-orange-500',
    examples: ['Every day is a new opportunity to grow ✨', 'The only limit is your mind 🚀']
  },
  {
    value: 'storytelling',
    label: 'Storytelling',
    description: 'Narrative, engaging, and descriptive',
    icon: <FiBookOpen className="w-5 h-5" />,
    color: 'from-green-400 to-green-300',
    darkColor: 'from-green-600 to-green-500',
    examples: ['Chapter 1 of many adventures to come 📖', 'The story continues with every moment captured']
  },
];

export default function ToneSelector({ selectedTone, onToneChange }: ToneSelectorProps) {
  const [hoveredTone, setHoveredTone] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Ensure onToneChange is a function before using it
  const handleToneChange = useCallback((value: string) => {
    console.log('ToneSelector: handleToneChange called with value:', value);
    
    if (typeof onToneChange === 'function') {
      onToneChange(value);
    } else {
      console.error('onToneChange is not a function');
    }
  }, [onToneChange]);
  
  // Check if we can scroll left or right
  const checkScrollPosition = useCallback(() => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  }, []);
  
  // Add scroll event listener
  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', checkScrollPosition);
      // Initial check
      checkScrollPosition();
      
      return () => {
        carousel.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, [checkScrollPosition]);
  
  // Scroll functions
  const scrollLeft = () => {
    if (carouselRef.current) {
      // Scroll by one card width plus margin for smoother navigation
      const cardWidth = 270 + 16; // card width (270px) + margin (16px)
      carouselRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      // Use a longer timeout to ensure the scroll animation completes
      setTimeout(checkScrollPosition, 600);
    }
  };
  
  const scrollRight = () => {
    if (carouselRef.current) {
      // Scroll by one card width plus margin for smoother navigation
      const cardWidth = 270 + 16; // card width (270px) + margin (16px)
      carouselRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
      // Use a longer timeout to ensure the scroll animation completes
      setTimeout(checkScrollPosition, 600);
    }
  };

  // Initial scroll check when component mounts
  useEffect(() => {
    // Small delay to ensure the component is fully rendered
    const timer = setTimeout(() => {
      checkScrollPosition();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Select Caption Tone</h2>
      
      {/* Desktop Carousel View */}
      <div className="relative hidden md:block">
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button 
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 z-10 w-10 h-10 bg-white dark:bg-gray-700 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FiChevronLeft />
            </motion.button>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {canScrollRight && (
            <motion.button 
              onClick={scrollRight}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 z-10 w-10 h-10 bg-white dark:bg-gray-700 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FiChevronRight />
            </motion.button>
          )}
        </AnimatePresence>
        
        <div 
          ref={carouselRef}
          className="flex overflow-x-auto pb-6 pt-2 px-5 -mx-5 hide-scrollbar"
          onScroll={checkScrollPosition}
        >
          {toneOptions.map((tone) => (
            <motion.div
              key={tone.value}
              className={`relative flex-shrink-0 w-[270px] mx-3 first:ml-5 last:mr-5 overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
                selectedTone === tone.value
                  ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400'
                  : 'hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600'
              }`}
              whileHover={{ 
                scale: 1.02, 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                y: -5
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                console.log('Clicked on tone:', tone.value);
                handleToneChange(tone.value);
              }}
              onMouseEnter={() => setHoveredTone(tone.value)}
              onMouseLeave={() => setHoveredTone(null)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br opacity-10 ${
                selectedTone === tone.value 
                  ? (tone.darkColor + ' dark:' + tone.darkColor) 
                  : (tone.color + ' dark:' + tone.darkColor)
              }`}></div>
              
              <div className="p-5 relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${
                      selectedTone === tone.value
                        ? `bg-gradient-to-br ${tone.color} dark:${tone.darkColor} text-white`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {tone.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{tone.label}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {tone.description}
                      </p>
                    </div>
                  </div>
                  {selectedTone === tone.value && (
                    <div className="bg-blue-500 text-white rounded-full p-1 ml-2">
                      <FiCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>
                
                {/* Example captions - always show on desktop */}
                <div 
                  className={`mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 ${
                    selectedTone !== tone.value ? 'opacity-60' : 'opacity-100'
                  }`}
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Example captions:</p>
                  <ul className="space-y-2">
                    {tone.examples.map((example, index) => (
                      <li 
                        key={index} 
                        className={`text-sm ${
                          selectedTone === tone.value 
                            ? 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50' 
                            : 'text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30'
                        } p-2 rounded`}
                      >
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Mobile Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-4">
        {toneOptions.map((tone) => (
          <motion.div
            key={tone.value}
            whileHover={{ 
              scale: 1.03, 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            }}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
              selectedTone === tone.value
                ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400'
                : 'hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600'
            }`}
            onClick={() => {
              console.log('Clicked on tone:', tone.value);
              handleToneChange(tone.value);
            }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br opacity-10 ${
              selectedTone === tone.value 
                ? (tone.darkColor + ' dark:' + tone.darkColor) 
                : (tone.color + ' dark:' + tone.darkColor)
            }`}></div>
            
            <div className="p-4 relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-3 ${
                    selectedTone === tone.value
                      ? `bg-gradient-to-br ${tone.color} dark:${tone.darkColor} text-white`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {tone.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">{tone.label}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {tone.description}
                    </p>
                  </div>
                </div>
                {selectedTone === tone.value && (
                  <div className="bg-blue-500 text-white rounded-full p-1 ml-2">
                    <FiCheck className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 