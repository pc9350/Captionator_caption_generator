'use client';

import { useState, useEffect, useRef } from 'react';

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  
  // Use refs to track the current state in the interval callback
  const currentIndexRef = useRef(currentCaptionIndex);
  const isDeletingRef = useRef(isDeleting);
  const isWaitingRef = useRef(isWaiting);
  const displayedTextRef = useRef(displayedText);
  
  // Update refs when state changes
  useEffect(() => {
    currentIndexRef.current = currentCaptionIndex;
    isDeletingRef.current = isDeleting;
    isWaitingRef.current = isWaiting;
    displayedTextRef.current = displayedText;
  }, [currentCaptionIndex, isDeleting, isWaiting, displayedText]);
  
  useEffect(() => {
    const animateText = () => {
      const currentCaption = captions[currentIndexRef.current];
      
      // If waiting, do nothing until wait time is over
      if (isWaitingRef.current) {
        return;
      }
      
      // If deleting
      if (isDeletingRef.current) {
        if (displayedTextRef.current.length > 0) {
          // Delete one character
          setDisplayedText(displayedTextRef.current.slice(0, -1));
        } else {
          // Move to next caption when done deleting
          setIsDeleting(false);
          setCurrentCaptionIndex((currentIndexRef.current + 1) % captions.length);
        }
        return;
      }
      
      // If typing
      if (displayedTextRef.current.length < currentCaption.length) {
        // Add one character
        setDisplayedText(currentCaption.slice(0, displayedTextRef.current.length + 1));
      } else {
        // Start waiting before deleting
        setIsWaiting(true);
        setTimeout(() => {
          setIsWaiting(false);
          setIsDeleting(true);
        }, pauseDuration);
      }
    };
    
    // Set up intervals for typing and deleting
    const typingInterval = setInterval(animateText, isDeletingRef.current ? deletingSpeed : typingSpeed);
    
    return () => clearInterval(typingInterval);
  }, [captions, typingSpeed, pauseDuration, deletingSpeed]);
  
  return (
    <div className="inline-flex items-center">
      <p className="text-gray-900 dark:text-white">
        <span className="font-semibold">@caption_ai</span> {displayedText}
      </p>
      <span className="ml-1 h-4 w-2 bg-blue-500 animate-blink"></span>
    </div>
  );
} 