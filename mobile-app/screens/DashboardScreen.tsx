import React, { useState, useEffect } from 'react';
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
  Platform,
  Dimensions,
  FlatList,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { pickImage, takePhoto } from '../utils/imageUtils';
import { generateCaption } from '../utils/openai';
import Header from '../components/Header';
import FooterNavbar from '../components/FooterNavbar';
import CaptionOptions from '../components/CaptionOptions';
import CaptionCard from '../components/CaptionCard';
import { Ionicons } from '@expo/vector-icons';
import { useFirebaseIntegration } from '../hooks/useFirebaseIntegration';
import { useCaptionStore } from '../store/captionStore';
import {
  Caption,
  CaptionTone,
  CaptionLength,
  SpicyLevel,
  CaptionStyle,
  CreativeLanguageOptions,
} from '../types/caption';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const [error, setError] = useState<string | null>(null);
  
  // Use the caption store for state management
  const { 
    uploadedMedia,
    activeMediaIndex,
    generatedCaptions,
    selectedTone: tone,
    includeHashtags,
    includeEmojis,
    captionLength,
    spicyLevel,
    captionStyle,
    creativeLanguageOptions,
    isGenerating,
    addUploadedMedia,
    removeUploadedMedia,
    clearUploadedMedia,
    setActiveMediaIndex,
    setGeneratedCaptions,
    setSelectedTone: setTone,
    setIncludeHashtags,
    setIncludeEmojis,
    setCaptionLength,
    setSpicyLevel,
    setCaptionStyle,
    setCreativeLanguageOptions,
    setIsGenerating,
  } = useCaptionStore();
  
  // Use Firebase integration for saving captions
  const { saveCaption: saveCaptionToFirebase } = useFirebaseIntegration();
  const { user, logout } = useAuth();

  // Load saved captions on mount
  useEffect(() => {
    // This effect will run when the component mounts
    console.log('DashboardScreen mounted');
    return () => {
      // This cleanup function will run when the component unmounts
      console.log('DashboardScreen unmounted');
    };
  }, []);

  const handleImagePick = async () => {
    try {
      setError(null);
      const media = await pickImage();
      if (media) {
        addUploadedMedia(media);
        setActiveMediaIndex(uploadedMedia.length); // Set to the newly added image
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setError('Failed to pick image. Please try again.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      setError(null);
      const media = await takePhoto();
      if (media) {
        addUploadedMedia(media);
        setActiveMediaIndex(uploadedMedia.length); // Set to the newly added image
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      setError('Failed to take photo. Please try again.');
    }
  };

  const handleRemoveMedia = (index: number) => {
    removeUploadedMedia(index);
  };

  const handleGenerateCaption = async () => {
    if (uploadedMedia.length === 0) {
      setError('Please upload at least one image or video');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const currentMedia = uploadedMedia[activeMediaIndex];
      const generatedCaptions = await generateCaption(
        currentMedia.base64,
        tone,
        includeHashtags,
        includeEmojis,
        captionLength,
        spicyLevel,
        captionStyle,
        creativeLanguageOptions
      );
      
      if (generatedCaptions.length === 0) {
        setError('No captions were generated. Please try again.');
      } else if (generatedCaptions.length === 1 && generatedCaptions[0].category === 'Error') {
        setError(generatedCaptions[0].text);
      } else {
        setGeneratedCaptions(generatedCaptions);
      }
    } catch (error: any) {
      console.error('Error generating caption:', error);
      
      if (error.message && error.message.includes('maximum context length')) {
        setError('Image is too complex. Please try a different image or reduce image quality.');
      } else {
        setError('Failed to generate caption. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCaption = async (caption: Caption) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to save captions.');
      return;
    }
    
    try {
      const success = await saveCaptionToFirebase(caption);
      if (success) {
        Alert.alert('Success', 'Caption saved successfully!');
      } else {
        Alert.alert('Error', 'Failed to save caption. Please try again.');
      }
    } catch (error) {
      console.error('Error saving caption:', error);
      Alert.alert('Error', 'Failed to save caption. Please try again.');
    }
  };

  const renderMediaItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity 
      style={[
        styles.mediaThumbnail, 
        activeMediaIndex === index && styles.mediaThumbnailActive
      ]}
      onPress={() => setActiveMediaIndex(index)}
    >
      <Image 
        source={{ uri: item.uri }} 
        style={styles.thumbnailImage} 
        resizeMode="cover"
      />
      {item.isVideo && (
        <View style={styles.videoIndicator}>
          <Ionicons name="play" size={12} color="white" />
        </View>
      )}
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveMedia(index)}
      >
        <Ionicons name="close" size={12} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Generate Captions" 
        showBackButton={false}
        rightComponent={
          <TouchableOpacity onPress={logout} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="log-out-outline" size={24} color="#4338ca" />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Hello, {user?.displayName || 'User'}</Text>
          <Text style={styles.welcomeSubtext}>Let's create some amazing captions</Text>
        </View>

        {/* Media Upload Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upload Media</Text>
          
          {uploadedMedia.length > 0 ? (
            <View style={styles.mediaContainer}>
              <Image 
                source={{ uri: uploadedMedia[activeMediaIndex].uri }} 
                style={styles.selectedImage}
                resizeMode="cover"
              />
              {uploadedMedia[activeMediaIndex].isVideo && (
                <View style={styles.videoOverlay}>
                  <Ionicons name="play-circle" size={48} color="white" />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="images-outline" size={48} color="#9ca3af" />
              <Text style={styles.imagePlaceholderText}>No media selected</Text>
            </View>
          )}
          
          {/* Media Thumbnails */}
          {uploadedMedia.length > 0 && (
            <View style={styles.thumbnailsContainer}>
              <FlatList
                data={uploadedMedia}
                renderItem={renderMediaItem}
                keyExtractor={(_, index) => `media-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailsList}
              />
              <TouchableOpacity 
                style={styles.addMoreButton}
                onPress={handleImagePick}
              >
                <Ionicons name="add" size={24} color="#4338ca" />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity 
              style={styles.imageButton}
              onPress={handleImagePick}
            >
              <Ionicons name="folder-outline" size={20} color="#4b5563" style={{ marginRight: 8 }} />
              <Text style={styles.imageButtonText}>Choose Media</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.imageButton}
              onPress={handleTakePhoto}
            >
              <Ionicons name="camera-outline" size={20} color="#4b5563" style={{ marginRight: 8 }} />
              <Text style={styles.imageButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Caption Options */}
        <CaptionOptions
          tone={tone}
          setTone={setTone}
          includeHashtags={includeHashtags}
          setIncludeHashtags={setIncludeHashtags}
          includeEmojis={includeEmojis}
          setIncludeEmojis={setIncludeEmojis}
          captionLength={captionLength}
          setCaptionLength={setCaptionLength}
          spicyLevel={spicyLevel}
          setSpicyLevel={setSpicyLevel}
          captionStyle={captionStyle}
          setCaptionStyle={setCaptionStyle}
          creativeLanguageOptions={creativeLanguageOptions}
          setCreativeLanguageOptions={setCreativeLanguageOptions}
        />

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Generate Button */}
        <TouchableOpacity
          style={[
            styles.generateButton, 
            (uploadedMedia.length === 0 || isGenerating) && styles.generateButtonDisabled
          ]}
          onPress={handleGenerateCaption}
          disabled={uploadedMedia.length === 0 || isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="sparkles-outline" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.generateButtonText}>Generate Caption</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Generated Captions Section */}
        {generatedCaptions.length > 0 && (
          <View style={styles.captionsSection}>
            <Text style={styles.captionsSectionTitle}>Generated Captions</Text>
            
            {generatedCaptions.map((caption) => (
              <CaptionCard
                key={caption.id}
                caption={caption}
                includeHashtags={includeHashtags}
                includeEmojis={includeEmojis}
                onSave={handleSaveCaption}
              />
            ))}
          </View>
        )}
      </ScrollView>
      
      <FooterNavbar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
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
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
  mediaContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 16,
  },
  selectedImage: {
    width: '100%',
    height: width * 0.7,
    borderRadius: 12,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: width * 0.7,
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
    marginTop: 12,
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  thumbnailsList: {
    paddingRight: 8,
  },
  mediaThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  mediaThumbnailActive: {
    borderColor: '#4338ca',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoreButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imageButtonText: {
    color: '#4b5563',
    fontWeight: '600',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  generateButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  captionsSection: {
    marginBottom: 20,
  },
  captionsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
});

export default DashboardScreen; 