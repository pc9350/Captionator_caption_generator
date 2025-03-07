import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

// Maximum dimensions for images to be sent to OpenAI API
// Reduced dimensions to save tokens
const MAX_WIDTH = 512;  // Reduced from 800
const MAX_HEIGHT = 512; // Reduced from 800
const IMAGE_QUALITY = 0.6; // Reduced from 0.7

// Request permissions for accessing the camera roll
export const requestMediaLibraryPermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
};

// Request permissions for accessing the camera
export const requestCameraPermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
};

// Pick an image from the media library
export const pickImage = async (): Promise<{ uri: string; base64: string; isVideo: boolean } | null> => {
  try {
    const permissionGranted = await requestMediaLibraryPermissions();
    if (!permissionGranted) {
      console.error('Media library permission not granted');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Allow both images and videos
      allowsEditing: true,
      aspect: [4, 3],
      quality: IMAGE_QUALITY,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    const uri = asset.uri;
    const isVideo = uri.endsWith('.mp4') || uri.endsWith('.mov') || uri.includes('video');
    
    // Process the media
    if (isVideo) {
      // For videos, we'll use a thumbnail or first frame
      // This is a simplified approach - in a real app, you'd generate a proper thumbnail
      const base64 = await processImage(uri);
      return { uri, base64, isVideo: true };
    } else {
      // For images, process normally
      const base64 = await processImage(uri);
      return { uri, base64, isVideo: false };
    }
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};

// Take a photo with the camera
export const takePhoto = async (): Promise<{ uri: string; base64: string; isVideo: boolean } | null> => {
  try {
    const permissionGranted = await requestCameraPermissions();
    if (!permissionGranted) {
      console.error('Camera permission not granted');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Allow both photos and videos
      allowsEditing: true,
      aspect: [4, 3],
      quality: IMAGE_QUALITY,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    const uri = asset.uri;
    const isVideo = uri.endsWith('.mp4') || uri.endsWith('.mov') || uri.includes('video');
    
    // Process the media
    if (isVideo) {
      // For videos, we'll use a thumbnail or first frame
      // This is a simplified approach - in a real app, you'd generate a proper thumbnail
      const base64 = await processImage(uri);
      return { uri, base64, isVideo: true };
    } else {
      // For images, process normally
      const base64 = await processImage(uri);
      return { uri, base64, isVideo: false };
    }
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

// Process an image to ensure it meets the requirements for the OpenAI API
export const processImage = async (uri: string): Promise<string> => {
  try {
    // First, resize the image to reduce token usage
    const resizedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: MAX_WIDTH, height: MAX_HEIGHT } }],
      { compress: IMAGE_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Convert the resized image to base64
    const base64 = await FileSystem.readAsStringAsync(resizedImage.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Calculate approximate token size (very rough estimate)
    const tokenSize = Math.ceil(base64.length / 4) * 0.75;
    console.log(`Estimated image token size: ~${Math.round(tokenSize / 1000)}K tokens`);

    // Return the base64 image with the appropriate prefix
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};

// Save an image to the device's file system
export const saveImage = async (base64Image: string): Promise<string> => {
  try {
    // Remove the data URI prefix if present
    const base64Data = base64Image.includes('base64,')
      ? base64Image.split('base64,')[1]
      : base64Image;

    // Create a unique filename
    const filename = `${FileSystem.documentDirectory}image_${Date.now()}.jpg`;

    // Write the file
    await FileSystem.writeAsStringAsync(filename, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return filename;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
}; 