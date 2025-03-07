import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ExpoClipboard from 'expo-clipboard';
import AnimatedCaption from './AnimatedCaption';
import { Caption } from '../types/caption';

interface CaptionCardProps {
  caption: Caption;
  includeHashtags: boolean;
  includeEmojis: boolean;
  onSave?: (caption: Caption) => void;
  onDelete?: (captionId: string) => void;
  isSaved?: boolean;
}

const CaptionCard: React.FC<CaptionCardProps> = ({
  caption,
  includeHashtags,
  includeEmojis,
  onSave,
  onDelete,
  isSaved = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Animation for the card
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCopy = async () => {
    try {
      let textToCopy = caption.text;
      
      // Add emojis if enabled
      if (includeEmojis && caption.emojis && caption.emojis.length > 0) {
        textToCopy += ' ' + caption.emojis.join(' ');
      }
      
      // Add hashtags if enabled
      if (includeHashtags && caption.hashtags && caption.hashtags.length > 0) {
        textToCopy += '\n\n' + caption.hashtags.map(tag => `#${tag}`).join(' ');
      }
      
      await ExpoClipboard.setStringAsync(textToCopy);
      setCopied(true);
      Alert.alert('Success', 'Caption copied to clipboard!');
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying caption:', error);
      Alert.alert('Error', 'Failed to copy caption to clipboard.');
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      setIsSaving(true);
      await onSave(caption);
      Alert.alert('Success', 'Caption saved successfully!');
    } catch (error) {
      console.error('Error saving caption:', error);
      Alert.alert('Error', 'Failed to save caption.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    Alert.alert(
      'Delete Caption',
      'Are you sure you want to delete this caption?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await onDelete(caption.id);
              Alert.alert('Success', 'Caption deleted successfully!');
            } catch (error) {
              console.error('Error deleting caption:', error);
              Alert.alert('Error', 'Failed to delete caption.');
            } finally {
              setIsDeleting(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Get viral score color based on value
  const getViralScoreColor = () => {
    if (caption.viral_score >= 8) return '#22c55e'; // green-500
    if (caption.viral_score >= 6) return '#eab308'; // yellow-500
    return '#6b7280'; // gray-500
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Card Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.categoryContainer}>
            <Ionicons name="pricetag-outline" size={16} color="#3b82f6" style={styles.categoryIcon} />
            <Text style={styles.categoryText}>{caption.category}</Text>
          </View>
          
          <View style={styles.viralScoreContainer}>
            <Text style={[styles.viralScoreText, { color: getViralScoreColor() }]}>
              Viral Score: <Text style={styles.viralScoreValue}>{caption.viral_score}</Text>
            </Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          {isSaved ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]} 
              onPress={handleDelete}
              disabled={isDeleting}
            >
              <Ionicons 
                name="trash-outline" 
                size={18} 
                color="white" 
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.actionButton, styles.saveButton]} 
              onPress={handleSave}
              disabled={isSaving}
            >
              <Ionicons 
                name={isSaved ? "checkmark" : "bookmark-outline"} 
                size={18} 
                color="white" 
              />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.copyButton, copied && styles.copiedButton]} 
            onPress={handleCopy}
          >
            <Ionicons 
              name={copied ? "checkmark" : "copy-outline"} 
              size={18} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Caption Content */}
      <View style={styles.content}>
        <View style={styles.captionTextContainer}>
          <AnimatedCaption 
            captions={[caption.text]}
            typingSpeed={30}
            pauseDuration={5000}
            deletingSpeed={0}
            isStatic={true}
            fontSize={16}
            textColor="#6366f1"
          />
          
          {includeEmojis && caption.emojis && caption.emojis.length > 0 && (
            <Text style={styles.emojiText}>
              {caption.emojis.join(' ')}
            </Text>
          )}
        </View>
        
        {includeHashtags && caption.hashtags && caption.hashtags.length > 0 && (
          <View style={styles.hashtagsContainer}>
            {caption.hashtags.map((tag, index) => (
              <View key={index} style={styles.hashtagBadge}>
                <Text style={styles.hashtagText}>#{tag.replace(/^#/, '')}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  viralScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  viralScoreText: {
    fontSize: 12,
    fontWeight: '500',
  },
  viralScoreValue: {
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#6366f1',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  copyButton: {
    backgroundColor: '#6b7280',
  },
  copiedButton: {
    backgroundColor: '#22c55e',
  },
  content: {
    padding: 16,
  },
  captionTextContainer: {
    marginBottom: 12,
  },
  emojiText: {
    fontSize: 16,
    marginTop: 8,
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.2)',
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  hashtagBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  hashtagText: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CaptionCard; 