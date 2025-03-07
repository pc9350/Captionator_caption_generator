import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface AnimatedCaptionProps {
  captions: string[];
  typingSpeed?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
}

const AnimatedCaption: React.FC<AnimatedCaptionProps> = ({ 
  captions = [
    "Exploring new horizons, one step at a time. #adventure #journey",
    "Finding beauty in the everyday moments. #gratitude #mindfulness",
    "Living life in full color. #vibrant #authentic",
    "Making memories that last a lifetime. #memories #experiences"
  ], 
  typingSpeed = 50,
  pauseDuration = 2000,
  deletingSpeed = 30
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentCaptionIndex, setCurrentCaptionIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  
  // Use refs to track the current state in the interval callback
  const currentIndexRef = useRef(currentCaptionIndex);
  const isDeletingRef = useRef(isDeleting);
  const isWaitingRef = useRef(isWaiting);
  const displayedTextRef = useRef(displayedText);
  
  // Blinking cursor animation
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  
  // Start blinking animation
  useEffect(() => {
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    
    blinkAnimation.start();
    
    return () => {
      blinkAnimation.stop();
    };
  }, [cursorOpacity]);
  
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
    const typingInterval = setInterval(
      animateText, 
      isDeletingRef.current ? deletingSpeed : typingSpeed
    );
    
    return () => clearInterval(typingInterval);
  }, [captions, typingSpeed, pauseDuration, deletingSpeed]);

  return (
    <View style={styles.container}>
      <View style={styles.captionContainer}>
        <Text style={styles.caption}>
          {displayedText}
        </Text>
        <Animated.View 
          style={[
            styles.cursor, 
            { opacity: cursorOpacity }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  captionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caption: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  cursor: {
    width: 2,
    height: 16,
    backgroundColor: '#6366f1',
    marginLeft: 2,
  },
});

export default AnimatedCaption; 