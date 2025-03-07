import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import FooterNavbar from '../components/FooterNavbar';
import CaptionCard from '../components/CaptionCard';
import { Ionicons } from '@expo/vector-icons';
import { useFirebaseIntegration } from '../hooks/useFirebaseIntegration';
import { useCaptionStore } from '../store/captionStore';
import { Caption } from '../types/caption';

const SavedCaptionsScreen = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use the caption store for state management
  const { 
    savedCaptions,
    setSavedCaptions,
    includeHashtags,
    includeEmojis,
  } = useCaptionStore();
  
  // Use Firebase integration for loading and deleting captions
  const { 
    getSavedCaptions, 
    deleteCaption: deleteCaptionFromFirebase,
    isLoading: isFirebaseLoading,
  } = useFirebaseIntegration();

  // Load saved captions on mount
  useEffect(() => {
    loadSavedCaptions();
  }, [user]);

  const loadSavedCaptions = async () => {
    if (!user) {
      setError('You must be signed in to view saved captions');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const captions = await getSavedCaptions();
      setSavedCaptions(captions);
    } catch (error) {
      console.error('Error loading saved captions:', error);
      setError('Failed to load saved captions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCaption = async (captionId: string) => {
    try {
      const success = await deleteCaptionFromFirebase(captionId);
      if (success) {
        // Update local state
        setSavedCaptions(savedCaptions.filter(caption => caption.id !== captionId));
        Alert.alert('Success', 'Caption deleted successfully!');
      } else {
        Alert.alert('Error', 'Failed to delete caption. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting caption:', error);
      Alert.alert('Error', 'Failed to delete caption. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Saved Captions" />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Your Saved Captions</Text>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4338ca" />
            <Text style={styles.loadingText}>Loading saved captions...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : savedCaptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={64} color="#a5b4fc" />
            <Text style={styles.emptyStateText}>No saved captions yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Captions you save will appear here
            </Text>
          </View>
        ) : (
          savedCaptions.map((caption) => (
            <CaptionCard
              key={caption.id}
              caption={caption}
              includeHashtags={includeHashtags}
              includeEmojis={includeEmojis}
              onDelete={handleDeleteCaption}
              isSaved={true}
            />
          ))
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4b5563',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default SavedCaptionsScreen; 