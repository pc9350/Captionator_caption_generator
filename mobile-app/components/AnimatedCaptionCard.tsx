import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AnimatedCaption from './AnimatedCaption';

const { width } = Dimensions.get('window');

interface AnimatedCaptionCardProps {
  username: string;
  profileImage: any;
  postImage: any;
  captions: string[];
  likes: number;
  onLike?: () => void;
  isLiked?: boolean;
  onShare?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

const AnimatedCaptionCard: React.FC<AnimatedCaptionCardProps> = ({
  username,
  profileImage,
  postImage,
  captions,
  likes,
  onLike,
  isLiked = false,
  onShare,
  onSave,
  isSaved = false,
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const likeScaleAnim = useRef(new Animated.Value(1)).current;
  const saveScaleAnim = useRef(new Animated.Value(1)).current;
  
  // Start animations when component mounts
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const handleLikePress = () => {
    Animated.sequence([
      Animated.timing(likeScaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(likeScaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    if (onLike) onLike();
  };
  
  const handleSavePress = () => {
    Animated.sequence([
      Animated.timing(saveScaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(saveScaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    if (onSave) onSave();
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
        {/* Card Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image source={profileImage} style={styles.avatar} />
            <Text style={styles.username}>{username}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Card Image */}
        <View style={styles.imageContainer}>
          <Image source={postImage} style={styles.image} resizeMode="cover" />
          
          {/* Overlay gradient for better text visibility */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.8)']}
            style={styles.imageGradient}
            start={{ x: 0.5, y: 0.4 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>
        
        {/* Card Actions */}
        <View style={styles.actions}>
          <View style={styles.leftActions}>
            <Animated.View style={{ transform: [{ scale: likeScaleAnim }] }}>
              <TouchableOpacity onPress={handleLikePress} style={styles.actionButton}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={26}
                  color={isLiked ? '#ef4444' : '#fff'}
                />
              </TouchableOpacity>
            </Animated.View>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={onShare} style={styles.actionButton}>
              <Ionicons name="paper-plane-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Animated.View style={{ transform: [{ scale: saveScaleAnim }] }}>
            <TouchableOpacity onPress={handleSavePress} style={styles.actionButton}>
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={isSaved ? '#3b82f6' : '#fff'}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
        
        {/* Likes */}
        <View style={styles.likesContainer}>
          <Text style={styles.likesText}>{likes.toLocaleString()} likes</Text>
        </View>
        
        {/* Caption */}
        <View style={styles.captionContainer}>
          <Text style={styles.captionUsername}>{username}</Text>
          <View style={styles.captionTextContainer}>
            <AnimatedCaption
              captions={captions}
              typingSpeed={30}
              pauseDuration={3000}
              deletingSpeed={20}
              textColor="#ffffff"
              fontSize={14}
              showCursor={true}
              style={{ marginTop: 2 }}
            />
          </View>
        </View>

        {/* Add a highlight section for hashtags */}
        <View style={styles.hashtagContainer}>
          {captions[0].split(' ').map((word, index) => 
            word.startsWith('#') ? (
              <Text key={index} style={styles.hashtag}>{word}</Text>
            ) : null
          )}
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  username: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  imageContainer: {
    width: '100%',
    height: width - 40,
    backgroundColor: '#1f2937',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  leftActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: 15,
  },
  likesContainer: {
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  likesText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  captionContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    flexDirection: 'column',
  },
  captionUsername: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginRight: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  captionTextContainer: {
    flex: 1,
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    paddingBottom: 15,
    gap: 8,
  },
  hashtag: {
    color: '#a5b4fc',
    fontWeight: '600',
    fontSize: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default AnimatedCaptionCard; 