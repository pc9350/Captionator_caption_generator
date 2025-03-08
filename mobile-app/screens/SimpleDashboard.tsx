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
  Platform,
  Dimensions,
} from 'react-native';
import SimpleHeader from '../components/SimpleHeader';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface SimpleDashboardProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const SimpleDashboard: React.FC<SimpleDashboardProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleImagePick = () => {
    Alert.alert('Pick Image', 'This would open the image picker');
  };

  const handleTakePhoto = () => {
    Alert.alert('Take Photo', 'This would open the camera');
  };

  const handleGenerateCaption = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Caption Generated', 'Your caption would be generated here');
    }, 2000);
  };

  const handleSaveCaption = () => {
    Alert.alert('Save Caption', 'This would save the caption to your account');
  };

  const handleNavigateToSavedCaptions = () => {
    navigation.navigate('SavedCaptions');
  };

  return (
    <SafeAreaView style={styles.container}>
      <SimpleHeader 
        title="Dashboard" 
        showBackButton={false}
        rightComponent={
          <TouchableOpacity onPress={handleNavigateToSavedCaptions}>
            <Ionicons name="bookmark-outline" size={24} color="#4338ca" />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Captionator!</Text>
          <Text style={styles.welcomeSubtitle}>Generate amazing captions for your photos</Text>
        </View>
        
        <View style={styles.mediaSection}>
          <View style={styles.mediaPlaceholder}>
            <Ionicons name="image-outline" size={80} color="#ccc" />
            <Text style={styles.mediaPlaceholderText}>No media selected</Text>
          </View>
          
          <View style={styles.mediaButtons}>
            <TouchableOpacity style={styles.mediaButton} onPress={handleImagePick}>
              <Ionicons name="image-outline" size={24} color="white" />
              <Text style={styles.mediaButtonText}>Pick Image</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.mediaButton} onPress={handleTakePhoto}>
              <Ionicons name="camera-outline" size={24} color="white" />
              <Text style={styles.mediaButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.captionSection}>
          <Text style={styles.sectionTitle}>Caption Options</Text>
          
          <View style={styles.optionsContainer}>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Tone:</Text>
              <Text style={styles.optionValue}>Casual</Text>
            </View>
            
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Include Hashtags:</Text>
              <Text style={styles.optionValue}>Yes</Text>
            </View>
            
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Include Emojis:</Text>
              <Text style={styles.optionValue}>Yes</Text>
            </View>
            
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Caption Length:</Text>
              <Text style={styles.optionValue}>Medium</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.generateButton, isLoading && styles.generateButtonDisabled]} 
            onPress={handleGenerateCaption}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="create-outline" size={24} color="white" />
                <Text style={styles.generateButtonText}>Generate Caption</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>Generated Captions</Text>
          <Text style={styles.noResultsText}>No captions generated yet</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  mediaSection: {
    marginBottom: 24,
  },
  mediaPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mediaPlaceholderText: {
    marginTop: 8,
    color: '#999',
  },
  mediaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4338ca',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 0.48,
  },
  mediaButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  captionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  optionsContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 16,
    color: '#666',
  },
  optionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4338ca',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  generateButtonDisabled: {
    backgroundColor: '#a5a5a5',
  },
  generateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  resultSection: {
    marginBottom: 24,
  },
  noResultsText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    padding: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
});

export default SimpleDashboard; 