import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { auth } from '../firebase/config';
import { saveProfilePicture, getProfilePicture } from '../utils/firebaseUtils';

const EditProfileScreen = () => {
  const { user, updateUserProfile } = useAuth();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [tempPhotoURI, setTempPhotoURI] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  
  // Use the temp photo URI for display if available, otherwise use the photoURL
  const displayPhotoURI = tempPhotoURI || photoURL;
  
  // Load profile picture from Firestore if it's a Firestore reference
  useEffect(() => {
    const loadProfileImage = async () => {
      if (user?.photoURL && user.photoURL.startsWith('firestore://')) {
        setIsLoadingImage(true);
        try {
          const imageData = await getProfilePicture(user.photoURL);
          if (imageData) {
            setTempPhotoURI(imageData);
          }
        } catch (error) {
          console.error('Error loading profile image:', error);
        } finally {
          setIsLoadingImage(false);
        }
      }
    };
    
    loadProfileImage();
  }, [user?.photoURL]);
  
  // Generate a placeholder image URL based on the user's name
  const getPlaceholderImageUrl = (name: string) => {
    // Use UI Avatars service to generate a placeholder image
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4338ca&color=fff&size=200`;
  };
  
  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }
    
    setIsLoading(true);
    
    try {
      let updatedPhotoURL = photoURL;
      
      // If we have a user ID
      if (user?.uid) {
        try {
          // If we have a new image, upload it to Firestore
          if (base64Image) {
            // Save the image to Firestore and get back a reference URL
            updatedPhotoURL = await saveProfilePicture(user.uid, base64Image);
            console.log('New profile picture saved to Firestore:', updatedPhotoURL);
          } 
          // If we don't have a new image but have an existing photo that's not a Firestore reference
          else if (tempPhotoURI && (!photoURL || !photoURL.startsWith('firestore://'))) {
            // Save the existing image to Firestore
            updatedPhotoURL = await saveProfilePicture(user.uid, tempPhotoURI);
            console.log('Existing profile picture saved to Firestore:', updatedPhotoURL);
          }
          // If we don't have any image and the current URL is not a Firestore reference
          else if (!photoURL || !photoURL.startsWith('firestore://')) {
            // Generate a placeholder URL that will be consistent across devices
            const placeholderUrl = getPlaceholderImageUrl(displayName);
            updatedPhotoURL = await saveProfilePicture(user.uid, placeholderUrl);
            console.log('Placeholder profile picture saved to Firestore:', updatedPhotoURL);
          }
        } catch (error) {
          console.error('Error saving profile picture:', error);
          Alert.alert('Warning', 'Could not update profile picture, but will continue updating other profile information.');
        }
      }
      
      // Update the user profile in Firebase Auth
      await updateUserProfile({
        displayName,
        photoURL: updatedPhotoURL,
      });
      
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant permission to access your photos');
        return;
      }
      
      // Use MediaType instead of deprecated MediaTypeOptions
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        
        // Compress and resize the image
        try {
          // Show loading state
          setIsLoading(true);
          
          // Resize and compress the image
          const manipResult = await ImageManipulator.manipulateAsync(
            selectedAsset.uri,
            [{ resize: { width: 400, height: 400 } }], // Resize to 400x400
            { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
          );
          
          // Store the selected image URI temporarily (just for display)
          setTempPhotoURI(manipResult.uri);
          
          // Store the base64 data for later upload
          if (manipResult.base64) {
            setBase64Image(`data:image/jpeg;base64,${manipResult.base64}`);
            console.log(`Compressed image size: ${Math.round((manipResult.base64.length * 3) / 4 / 1024)} KB`);
          } else {
            Alert.alert('Error', 'Could not get image data. Please try another image.');
          }
        } catch (error) {
          console.error('Error manipulating image:', error);
          Alert.alert('Error', 'Failed to process image. Please try again with a different image.');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <Header 
        title="Edit Profile" 
        showBackButton={true}
      />
      
      <ScrollView style={styles.content}>
        {/* Profile Image */}
        <View style={styles.profileImageSection}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={handlePickImage}
            activeOpacity={0.8}
          >
            {isLoadingImage ? (
              <View style={styles.profileImagePlaceholder}>
                <ActivityIndicator color="#fff" size="small" />
              </View>
            ) : displayPhotoURI ? (
              <Image 
                source={{ uri: displayPhotoURI }} 
                style={styles.profileImage} 
                defaultSource={require('../assets/images/captionator-logo.png')}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileInitial}>
                  {displayName.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Text>
              </View>
            )}
            
            <View style={styles.changePhotoButton}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.changePhotoTextButton}
            onPress={handlePickImage}
          >
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </TouchableOpacity>
          
          <Text style={styles.photoNote}>
            Your profile photo will be stored securely
          </Text>
        </View>
        
        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
        
        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveProfile}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    padding: 16,
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    overflow: 'visible',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4338ca',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 10,
  },
  changePhotoTextButton: {
    marginTop: 12,
  },
  changePhotoText: {
    color: '#4338ca',
    fontSize: 16,
    fontWeight: '600',
  },
  photoNote: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#4338ca',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen; 