import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface AnimatedCaptionProps {
  captions: string[];
  typingSpeed?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  textColor?: string;
  fontSize?: number;
  showCursor?: boolean;
  style?: any;
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
  deletingSpeed = 30,
  textColor = '#ffffff',
  fontSize = 14,
  showCursor = true,
  style
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
    if (!showCursor) return;
    
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
  }, [cursorOpacity, showCursor]);
  
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

  // Process text to highlight hashtags
  const renderText = () => {
    const words = displayedText.split(' ');
    return words.map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <Text key={index} style={styles.hashtag}>
            {word}{index < words.length - 1 ? ' ' : ''}
          </Text>
        );
      }
      return (
        <Text key={index} style={{ color: textColor }}>
          {word}{index < words.length - 1 ? ' ' : ''}
        </Text>
      );
    });
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.captionContainer}>
        <Text style={[
          styles.caption, 
          { 
            fontSize, 
            color: textColor,
            textShadowColor: 'rgba(0, 0, 0, 0.5)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 3,
          }
        ]}>
          {renderText()}
        </Text>
        {showCursor && (
          <Animated.View 
            style={[
              styles.cursor, 
              { 
                opacity: cursorOpacity,
                height: fontSize + 2,
                backgroundColor: textColor
              }
            ]} 
          />
        )}
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
    lineHeight: 20,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  cursor: {
    width: 2,
    marginLeft: 2,
  },
  hashtag: {
    color: '#a5b4fc',
    fontWeight: '600',
  },
});

export default AnimatedCaption; 