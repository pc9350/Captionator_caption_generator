import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

// Maximum dimensions for images to be sent to OpenAI API
const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;
const IMAGE_QUALITY = 0.7;

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
export const pickImage = async (): Promise<string | null> => {
  try {
    const permissionGranted = await requestMediaLibraryPermissions();
    if (!permissionGranted) {
      console.error('Media library permission not granted');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: IMAGE_QUALITY,
    });

    if (result.canceled) {
      return null;
    }

    const uri = result.assets[0].uri;
    return await processImage(uri);
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};

// Take a photo with the camera
export const takePhoto = async (): Promise<string | null> => {
  try {
    const permissionGranted = await requestCameraPermissions();
    if (!permissionGranted) {
      console.error('Camera permission not granted');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: IMAGE_QUALITY,
    });

    if (result.canceled) {
      return null;
    }

    const uri = result.assets[0].uri;
    return await processImage(uri);
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

// Process an image to ensure it meets the requirements for the OpenAI API
export const processImage = async (uri: string): Promise<string> => {
  try {
    // Convert the image to base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

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