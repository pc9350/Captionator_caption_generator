'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCaptionShowcaseProps {
  captions: string[];
  typingSpeed?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
}

export default function AnimatedCaptionShowcase({
  captions,
  typingSpeed = 50,
  pauseDuration = 2000,
  deletingSpeed = 30
}: AnimatedCaptionShowcaseProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentCaptionIndex, setCurrentCaptionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!captions.length) return;

    let timeout: NodeJS.Timeout;
    const currentCaption = captions[currentCaptionIndex];

    if (isTyping && !isPaused) {
      if (displayedText.length < currentCaption.length) {
        // Typing animation
        timeout = setTimeout(() => {
          setDisplayedText(currentCaption.slice(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        // Finished typing, pause before deleting
        setIsPaused(true);
        timeout = setTimeout(() => {
          setIsPaused(false);
          setIsTyping(false);
        }, pauseDuration);
      }
    } else if (!isTyping && !isPaused) {
      if (displayedText.length > 0) {
        // Deleting animation
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, displayedText.length - 1));
        }, deletingSpeed);
      } else {
        // Finished deleting, move to next caption
        setIsTyping(true);
        setCurrentCaptionIndex((prevIndex) => (prevIndex + 1) % captions.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [captions, currentCaptionIndex, displayedText, isTyping, isPaused, typingSpeed, pauseDuration, deletingSpeed]);

  return (
    <div className="min-h-[80px] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-lg text-gray-800 dark:text-gray-200 font-medium"
      >
        {displayedText}
        <span className="inline-block w-0.5 h-5 bg-blue-600 dark:bg-blue-400 ml-1 animate-blink"></span>
      </motion.div>
    </div>
  );
} 