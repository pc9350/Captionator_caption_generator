import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
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
import FloatingNavbar from '../components/FloatingNavbar';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const [error, setError] = useState<string | null>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);
  
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

  const handleGenerateCaption = async (retryCount = 0, maxRetries = 2) => {
    if (uploadedMedia.length === 0) {
      setError('Please upload at least one image or video');
      return;
    }
    
    if (retryCount === 0) {
      // Only show loading indicator on first attempt
      setIsGenerating(true);
      setError(null);
    } else {
      console.log(`Retry attempt ${retryCount} of ${maxRetries}...`);
    }
    
    try {
      // Get the current active media for logging purposes
      const currentMedia = uploadedMedia[activeMediaIndex];
      
      // Check if the media is valid
      if (!currentMedia || !currentMedia.uri || !currentMedia.base64) {
        console.error('Invalid media data');
        setError('The selected media appears to be invalid. Please try uploading again.');
        setIsGenerating(false);
        return;
      }
      
      // Count videos in the collection
      const videoCount = uploadedMedia.filter(media => media.isVideo).length;
      const hasVideos = videoCount > 0;
      
      console.log(`Generating caption for ${uploadedMedia.length} media items (${videoCount} videos, ${uploadedMedia.length - videoCount} images)`);
      console.log('Active Media URI:', currentMedia.uri);
      console.log('Settings:', {
        tone,
        includeHashtags,
        includeEmojis,
        captionLength,
        spicyLevel,
        captionStyle,
        creativeLanguageOptions,
        hasVideos,
        videoCount
      });
      
      // Add a timeout to prevent hanging requests
      const timeoutPromise = new Promise<Caption[]>((_, reject) => {
        setTimeout(() => reject(new Error('Caption generation timed out')), 45000); // 45 second timeout
      });
      
      // Extract all base64 data from uploaded media
      const allMediaBase64 = uploadedMedia.map(media => media.base64);
      
      // Create the caption generation promise with all media
      const captionPromise = generateCaption(
        allMediaBase64,
        tone,
        includeHashtags,
        includeEmojis,
        captionLength,
        spicyLevel,
        captionStyle,
        creativeLanguageOptions,
        hasVideos, // Set isVideo to true if any media is a video
        videoCount, // Pass the count of videos
        retryCount
      );
      
      // Race the caption generation against the timeout
      const generatedCaptions = await Promise.race([captionPromise, timeoutPromise]);
      
      console.log(`Received ${generatedCaptions.length} captions`);
      
      // Check if we got valid captions
      if (!generatedCaptions || generatedCaptions.length === 0) {
        console.error('No captions were generated');
        
        // Retry automatically if we haven't reached max retries
        if (retryCount < maxRetries) {
          console.log(`Retrying caption generation (${retryCount + 1}/${maxRetries})...`);
          return handleGenerateCaption(retryCount + 1, maxRetries);
        }
        
        // Only show error if all retries failed
        setError('No captions were generated. Please try again with a different image or settings.');
      } else if (generatedCaptions.length === 1 && 
                (generatedCaptions[0].category === 'Error' || 
                 generatedCaptions[0].text.includes('Unable to generate'))) {
        console.error('Error caption received:', generatedCaptions[0].text);
        
        // Retry automatically if we haven't reached max retries
        if (retryCount < maxRetries) {
          console.log(`Retrying caption generation (${retryCount + 1}/${maxRetries})...`);
          return handleGenerateCaption(retryCount + 1, maxRetries);
        }
        
        // Only show error if all retries failed
        setError('Unable to generate captions. Please try again with a different image or settings.');
      } else {
        console.log('Caption generation successful');
        setGeneratedCaptions(generatedCaptions);
        setError(null); // Clear any previous errors
      }
    } catch (error: any) {
      console.error('Error generating caption:', error);
      
      // Retry automatically if we haven't reached max retries
      if (retryCount < maxRetries) {
        console.log(`Retrying caption generation (${retryCount + 1}/${maxRetries})...`);
        return handleGenerateCaption(retryCount + 1, maxRetries);
      }
      
      // Only show error if all retries failed
      if (error.message) {
        if (error.message.includes('maximum context length')) {
          setError('Image is too complex. Please try a different image or reduce image quality.');
        } else if (error.message.includes('timed out')) {
          setError('Caption generation timed out. Please check your internet connection and try again.');
        } else if (error.message.includes('rate limit')) {
          setError('Rate limit exceeded. Please wait a moment and try again.');
        } else {
          setError(`Failed to generate caption: ${error.message}`);
        }
      } else {
        setError('Failed to generate caption. Please try again.');
      }
    } finally {
      if (retryCount === 0 || retryCount === maxRetries) {
        // Only update loading state on first attempt or after all retries
        setIsGenerating(false);
      }
    }
  };

  const handleSaveCaption = async (caption: Caption) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to save captions.');
      return;
    }
    
    try {
      // Show a saving indicator
      setIsGenerating(true); // Reuse the loading state
      
      const success = await saveCaptionToFirebase(caption);
      
      // Hide the saving indicator
      setIsGenerating(false);
      
      if (success) {
        // Use a more subtle notification
        Alert.alert(
          'Caption Saved', 
          'Your caption has been saved to your account.',
          [{ text: 'OK' }],
          { cancelable: true }
        );
      } else {
        Alert.alert(
          'Save Failed', 
          'Unable to save your caption. Please try again.',
          [{ text: 'OK' }],
          { cancelable: true }
        );
      }
    } catch (error) {
      console.error('Error saving caption:', error);
      
      // Hide the saving indicator
      setIsGenerating(false);
      
      Alert.alert(
        'Save Error', 
        'An error occurred while saving your caption. Please try again later.',
        [{ text: 'OK' }],
        { cancelable: true }
      );
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

  // Handle video play
  const handlePlayVideo = () => {
    if (uploadedMedia.length > 0 && uploadedMedia[activeMediaIndex].isVideo) {
      // Check if the video URI is valid
      const videoUri = uploadedMedia[activeMediaIndex].uri;
      if (!videoUri) {
        Alert.alert('Error', 'Video file not found or corrupted. Please try uploading again.');
        return;
      }
      
      console.log('Playing video:', videoUri);
      
      // Reset video state
      setVideoError(null);
      setIsVideoLoading(true);
      setVideoModalVisible(true);
    }
  };

  // Handle video playback status
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsVideoLoading(false);
      setVideoError(null);
    } else {
      // Handle error
      if (status.error) {
        console.error(`Error loading video: ${status.error}`);
        setVideoError('Failed to load video. Please try again.');
        setIsVideoLoading(false);
      }
    }
  };

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
                <TouchableOpacity 
                  style={styles.videoOverlay}
                  onPress={handlePlayVideo}
                  activeOpacity={0.7}
                >
                  <View style={styles.playButtonContainer}>
                    <Ionicons name="play-circle" size={64} color="white" />
                    <Text style={styles.playVideoText}>Tap to play video</Text>
                  </View>
                </TouchableOpacity>
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
            <View style={styles.errorTextContainer}>
              <Text style={styles.errorText}>{error}</Text>
              {error.includes('Unable to generate') && (
                <Text style={styles.errorHelpText}>
                  This could be due to server load or connection issues. Try again with a different image or adjust your caption settings.
                </Text>
              )}
              {error.includes('timed out') && (
                <Text style={styles.errorHelpText}>
                  Check your internet connection and try again. If the problem persists, try a different image or reduce image quality.
                </Text>
              )}
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => handleGenerateCaption()}
                disabled={isGenerating}
              >
                <Ionicons name="refresh-outline" size={16} color="#4338ca" />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Generate Button */}
        <TouchableOpacity
          style={[
            styles.generateButton, 
            (uploadedMedia.length === 0 || isGenerating) && styles.generateButtonDisabled
          ]}
          onPress={() => handleGenerateCaption()}
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

        {/* Loading Indicator */}
        {isGenerating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4338ca" />
            <Text style={styles.loadingText}>
              {uploadedMedia.length > 1 
                ? (() => {
                    const videoCount = uploadedMedia.filter(media => media.isVideo).length;
                    const imageCount = uploadedMedia.length - videoCount;
                    
                    if (videoCount === 0) {
                      return `Generating captions for your collection of ${uploadedMedia.length} images...`;
                    } else if (imageCount === 0) {
                      return `Generating captions for your collection of ${uploadedMedia.length} videos...`;
                    } else {
                      return `Generating captions for your mixed collection (${videoCount} videos, ${imageCount} images)...`;
                    }
                  })()
                : `Generating ${tone} captions for your ${uploadedMedia[activeMediaIndex]?.isVideo ? 'video' : 'image'}...`}
            </Text>
            <Text style={styles.loadingSubtext}>This may take up to 30 seconds</Text>
          </View>
        )}

        {/* Generated Captions Section */}
        {generatedCaptions.length > 0 && !isGenerating && (
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
      
      {/* Video Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={videoModalVisible}
        onRequestClose={() => setVideoModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.videoContainer}>
            {uploadedMedia.length > 0 && uploadedMedia[activeMediaIndex].isVideo && (
              <>
                <Video
                  ref={videoRef}
                  source={{ uri: uploadedMedia[activeMediaIndex].uri }}
                  style={styles.videoPlayer}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                  shouldPlay
                  onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                  onLoad={() => {
                    setIsVideoLoading(false);
                    setVideoError(null);
                    console.log('Video loaded successfully');
                  }}
                  onError={(error) => {
                    console.error('Video playback error:', error);
                    setIsVideoLoading(false);
                    setVideoError('Failed to play video. The format may not be supported.');
                  }}
                />
                {isVideoLoading && (
                  <View style={styles.videoLoadingContainer}>
                    <ActivityIndicator size="large" color="#4338ca" />
                    <Text style={styles.videoLoadingText}>Loading video...</Text>
                  </View>
                )}
                {videoError && (
                  <View style={styles.videoErrorContainer}>
                    <Ionicons name="alert-circle" size={48} color="#ef4444" />
                    <Text style={styles.videoErrorText}>{videoError}</Text>
                    <TouchableOpacity 
                      style={styles.tryAgainButton}
                      onPress={() => {
                        setIsVideoLoading(true);
                        setVideoError(null);
                        console.log('Attempting to reload video');
                        // Attempt to reload the video
                        if (videoRef.current) {
                          videoRef.current.loadAsync(
                            { uri: uploadedMedia[activeMediaIndex].uri },
                            { shouldPlay: true },
                            false
                          );
                        }
                      }}
                    >
                      <Text style={styles.tryAgainButtonText}>Try Again</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                console.log('Closing video modal');
                setVideoModalVisible(false);
                setIsVideoLoading(true); // Reset loading state for next time
                setVideoError(null);
              }}
            >
              <Ionicons name="close-circle" size={36} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <FloatingNavbar />
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  errorHelpText: {
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 16,
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
  playButtonContainer: {
    alignItems: 'center',
  },
  playVideoText: {
    color: 'white',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: '100%',
    height: '80%',
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  videoLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  videoLoadingText: {
    color: 'white',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  videoErrorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  videoErrorText: {
    color: 'white',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  tryAgainButton: {
    backgroundColor: '#4338ca',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  tryAgainButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  retryButtonText: {
    color: '#4338ca',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default DashboardScreen; 