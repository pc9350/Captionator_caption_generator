import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TextInput,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import * as ExpoClipboard from 'expo-clipboard';
import { useAuth } from '../hooks/useAuth';
import { pickImage, takePhoto } from '../utils/imageUtils';
import { generateCaption } from '../utils/openai';

interface Caption {
  id: string;
  text: string;
  category: string;
  hashtags: string[];
  createdAt: Date;
  viral_score: number;
}

const TONE_OPTIONS = [
  { id: 'casual', label: 'Casual' },
  { id: 'professional', label: 'Professional' },
  { id: 'funny', label: 'Funny' },
  { id: 'inspirational', label: 'Inspirational' },
  { id: 'storytelling', label: 'Storytelling' },
];

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState('casual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  
  const { user, logout } = useAuth();

  const handleImagePick = async () => {
    const imageUri = await pickImage();
    if (imageUri) {
      setSelectedImage(imageUri);
      // Clear previous captions when a new image is selected
      setCaptions([]);
    }
  };

  const handleTakePhoto = async () => {
    const imageUri = await takePhoto();
    if (imageUri) {
      setSelectedImage(imageUri);
      // Clear previous captions when a new image is selected
      setCaptions([]);
    }
  };

  const handleGenerateCaption = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setIsGenerating(true);

    try {
      // Create a prompt for the image
      const prompt = `Generate a creative caption for this image. The tone should be ${selectedTone}.`;
      
      const caption = await generateCaption(prompt, selectedTone);
      
      if (caption) {
        setCaptions([caption, ...captions]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate caption');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCaption = async (caption: Caption) => {
    let textToCopy = caption.text;
    
    if (includeHashtags && caption.hashtags.length > 0) {
      textToCopy += '\n\n' + caption.hashtags.map(tag => `#${tag}`).join(' ');
    }
    
    await ExpoClipboard.setStringAsync(textToCopy);
    Alert.alert('Success', 'Caption copied to clipboard');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to log out');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Captionator</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome, {user?.displayName || 'User'}!
          </Text>
          <Text style={styles.welcomeSubtext}>
            Upload an image to generate AI-powered captions
          </Text>
        </View>
        
        {/* Image Upload Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upload Media</Text>
          
          <View style={styles.imageSection}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>No image selected</Text>
              </View>
            )}

            <View style={styles.imageButtonsContainer}>
              <TouchableOpacity 
                style={styles.imageButton} 
                onPress={handleImagePick}
              >
                <Text style={styles.imageButtonText}>Choose Image</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.imageButton} 
                onPress={handleTakePhoto}
              >
                <Text style={styles.imageButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Caption Options Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Caption Options</Text>
          
          <View style={styles.optionsSection}>
            <Text style={styles.optionLabel}>Tone:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.toneScrollContent}
            >
              {TONE_OPTIONS.map((tone) => (
                <TouchableOpacity
                  key={tone.id}
                  style={[
                    styles.toneOption,
                    selectedTone === tone.id && styles.toneOptionSelected,
                  ]}
                  onPress={() => setSelectedTone(tone.id)}
                >
                  <Text
                    style={[
                      styles.toneOptionText,
                      selectedTone === tone.id && styles.toneOptionTextSelected,
                    ]}
                  >
                    {tone.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.toggleOption}>
              <Text style={styles.optionLabel}>Include Hashtags:</Text>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  includeHashtags ? styles.toggleButtonActive : styles.toggleButtonInactive,
                ]}
                onPress={() => setIncludeHashtags(!includeHashtags)}
              >
                <View
                  style={[
                    styles.toggleCircle,
                    includeHashtags ? styles.toggleCircleActive : styles.toggleCircleInactive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.generateButton, 
                (!selectedImage || isGenerating) && styles.generateButtonDisabled
              ]}
              onPress={handleGenerateCaption}
              disabled={!selectedImage || isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.generateButtonText}>Generate Caption</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Generated Captions Section */}
        {captions.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Generated Captions</Text>
            
            {captions.map((caption) => (
              <View key={caption.id} style={styles.captionCard}>
                <Text style={styles.captionText}>{caption.text}</Text>
                
                {includeHashtags && caption.hashtags.length > 0 && (
                  <Text style={styles.hashtagsText}>
                    {caption.hashtags.map(tag => `#${tag}`).join(' ')}
                  </Text>
                )}
                
                <View style={styles.captionActions}>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => handleCopyCaption(caption)}
                  >
                    <Text style={styles.copyButtonText}>Copy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4338ca',
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  logoutText: {
    color: '#4b5563',
    fontWeight: '500',
    fontSize: 14,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#6b7280',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 12,
  },
  imageSection: {
    marginBottom: 16,
  },
  selectedImage: {
    width: '100%',
    height: width * 0.7, // Aspect ratio based on screen width
    borderRadius: 12,
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: '100%',
    height: width * 0.7, // Aspect ratio based on screen width
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '500',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 0.48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  imageButtonText: {
    color: '#4b5563',
    fontWeight: '600',
    fontSize: 14,
  },
  optionsSection: {
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 10,
  },
  toneScrollContent: {
    paddingBottom: 16,
  },
  toneOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  toneOptionSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  toneOptionText: {
    color: '#4b5563',
    fontWeight: '600',
    fontSize: 14,
  },
  toneOptionTextSelected: {
    color: 'white',
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#6366f1',
  },
  toggleButtonInactive: {
    backgroundColor: '#e5e7eb',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  toggleCircleActive: {
    backgroundColor: 'white',
    alignSelf: 'flex-end',
  },
  toggleCircleInactive: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  generateButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  generateButtonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  captionCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
  },
  captionText: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 24,
  },
  hashtagsText: {
    fontSize: 14,
    color: '#6366f1',
    marginBottom: 16,
  },
  captionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  copyButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  copyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default DashboardScreen; 