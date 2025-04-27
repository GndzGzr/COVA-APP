import { Platform } from 'react-native';

// API base URL - Updated with the provided endpoint
const API_BASE_URL = 'https://d3e134e5d335b4aa1b23b9a8a78193562.clg07azjl.paperspacegradient.com';

/**
 * Converts an image to a format suitable for API requests
 * @param imageUri The URI of the image to be processed
 * @returns A promise that resolves to the image bytes as an array
 */
async function getImageBytes(imageUri: string): Promise<number[]> {
  try {
    // For React Native
    if (Platform.OS !== 'web') {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            const arrayBuffer = reader.result as ArrayBuffer;
            const bytes = Array.from(new Uint8Array(arrayBuffer));
            resolve(bytes);
          } else {
            reject(new Error('Failed to read image'));
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });
    } 
    // For web
    else {
      const response = await fetch(imageUri);
      const arrayBuffer = await response.arrayBuffer();
      return Array.from(new Uint8Array(arrayBuffer));
    }
  } catch (error) {
    console.error('Error converting image to bytes:', error);
    throw error;
  }
}

/**
 * Sends an image to the ATM prediction endpoint
 * @param imageUri URI of the image to be processed
 * @returns A promise that resolves to the prediction result
 */
export async function getATMPrediction(imageUri: string): Promise<any> {
  try {
    const imageBytes = await getImageBytes(imageUri);
    
    const response = await fetch(`${API_BASE_URL}/ATMpredict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_bytes: imageBytes,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in ATM prediction:', error);
    throw error;
  }
}

/**
 * Sends an image to the obstacle detection endpoint
 * @param imageUri URI of the image to be processed
 * @returns A promise that resolves to the obstacle detection result
 */
export async function getObstacleDetection(imageUri: string): Promise<any> {
  try {
    const imageBytes = await getImageBytes(imageUri);
    
    const response = await fetch(`${API_BASE_URL}/WApredict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_bytes: imageBytes,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in obstacle detection:', error);
    throw error;
  }
} 