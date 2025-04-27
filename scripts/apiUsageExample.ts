import { getATMPrediction, getObstacleDetection } from './api';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

/**
 * Example function to capture an image from camera and send it for ATM prediction
 */
export async function captureAndAnalyzeATM() {
  try {
    // Request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera permission is required to use this feature');
      return;
    }
    
    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });
    
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }
    
    const imageUri = result.assets[0].uri;
    
    // Process the image with the ATM prediction API
    const prediction = await getATMPrediction(imageUri);
    
    console.log('ATM Prediction Result:', prediction);
    return prediction;
  } catch (error) {
    console.error('Error in captureAndAnalyzeATM:', error);
    Alert.alert('Error', 'Failed to process image. Please try again.');
    throw error;
  }
}

/**
 * Example function to select an image from gallery and send it for obstacle detection
 */
export async function selectAndDetectObstacles() {
  try {
    // Request media library permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Media library permission is required to use this feature');
      return;
    }
    
    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });
    
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }
    
    const imageUri = result.assets[0].uri;
    
    // Process the image with the obstacle detection API
    const detection = await getObstacleDetection(imageUri);
    
    console.log('Obstacle Detection Result:', detection);
    return detection;
  } catch (error) {
    console.error('Error in selectAndDetectObstacles:', error);
    Alert.alert('Error', 'Failed to process image. Please try again.');
    throw error;
  }
}

/**
 * Example function showing how to process an existing image URI
 */
export async function processExistingImage(imageUri: string, endpointType: 'atm' | 'obstacle') {
  try {
    if (!imageUri) {
      throw new Error('No image URI provided');
    }
    
    // Process the image with the appropriate API
    if (endpointType === 'atm') {
      const prediction = await getATMPrediction(imageUri);
      console.log('ATM Prediction Result:', prediction);
      return prediction;
    } else {
      const detection = await getObstacleDetection(imageUri);
      console.log('Obstacle Detection Result:', detection);
      return detection;
    }
  } catch (error) {
    console.error('Error in processExistingImage:', error);
    Alert.alert('Error', 'Failed to process image. Please try again.');
    throw error;
  }
} 