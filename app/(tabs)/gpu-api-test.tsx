import React, { useState } from 'react';
import { StyleSheet, View, Image, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import { getATMPrediction, getVLMPrediction, getObstacleDetection } from '../../scripts/gpuCloudApi';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type Mode = 'atm' | 'vlm' | 'obstacle';

export default function GpuApiTestScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('vlm');
  const [question, setQuestion] = useState<string>('What do you see in this image?');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  // Function to capture image using camera
  const captureImage = async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Camera permission is required to use this feature');
        return;
      }
      
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setResult(null); // Clear previous results
        setError(null);
        setResponseTime(null);
      }
    } catch (err) {
      console.error('Error capturing image:', err);
      setError('Failed to capture image');
    }
  };

  // Function to select image from gallery
  const selectImage = async () => {
    try {
      // Request media library permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Media library permission is required to use this feature');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setResult(null); // Clear previous results
        setError(null);
        setResponseTime(null);
      }
    } catch (err) {
      console.error('Error selecting image:', err);
      setError('Failed to select image');
    }
  };

  // Function to process the selected image
  const processImage = async () => {
    if (!imageUri) {
      setError('Please select or capture an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    
    // Record start time for performance measurement
    const start = Date.now();
    setStartTime(start);
    
    try {
      let response;
      
      switch (mode) {
        case 'atm':
          response = await getATMPrediction(imageUri);
          break;
        case 'vlm':
          if (!question.trim()) {
            setError('Please enter a question');
            setLoading(false);
            return;
          }
          response = await getVLMPrediction(imageUri, question);
          break;
        case 'obstacle':
          response = await getObstacleDetection(imageUri, question);
          break;
      }
      
      // Calculate response time
      const end = Date.now();
      setResponseTime(end - start);
      
      // Add response time to the result
      if (response) {
        response.responseTimeMs = end - start;
      }
      
      setResult(response);
    } catch (err) {
      console.error('Error processing image:', err);
      setError(`Failed to process image: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setResponseTime(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <Stack.Screen options={{ title: 'GPU API Test', headerShown: true }} />

        <ThemedView style={styles.content}>
          <ThemedText type="title" style={styles.title}>GPU Vision AI Test</ThemedText>
          
          {/* Mode Selection */}
          <ThemedView style={styles.modeContainer}>
            <ThemedText type="subtitle">Select Mode:</ThemedText>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.modeButton, mode === 'vlm' && styles.selectedMode]} 
                onPress={() => setMode('vlm')}
              >
                <ThemedText>Vision AI</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modeButton, mode === 'obstacle' && styles.selectedMode]} 
                onPress={() => setMode('obstacle')}
              >
                <ThemedText>Walking Assistance</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modeButton, mode === 'atm' && styles.selectedMode]} 
                onPress={() => setMode('atm')}
              >
                <ThemedText>ATM Assistance</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>

          {/* Question Input (for VLM and Walking Assistance) */}
          {(mode === 'vlm' || mode === 'obstacle') && (
            <ThemedView style={styles.questionContainer}>
              <ThemedText type="subtitle">Question:</ThemedText>
              <TextInput
                style={styles.textInput}
                value={question}
                onChangeText={setQuestion}
                placeholder="Enter your question about the image"
                multiline
              />
            </ThemedView>
          )}

          {/* Image Selection */}
          <ThemedView style={styles.imageSection}>
            <ThemedText type="subtitle">Image:</ThemedText>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.button} onPress={captureImage}>
                <ThemedText style={styles.buttonText}>Take Photo</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={selectImage}>
                <ThemedText style={styles.buttonText}>Select Photo</ThemedText>
              </TouchableOpacity>
            </View>
            
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.image} />
              </View>
            ) : (
              <ThemedView style={styles.noImageContainer}>
                <ThemedText>No image selected</ThemedText>
              </ThemedView>
            )}
          </ThemedView>

          {/* Process Button */}
          <TouchableOpacity 
            style={[styles.processButton, (!imageUri || loading) && styles.disabledButton]} 
            onPress={processImage}
            disabled={!imageUri || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.processButtonText}>
                {mode === 'vlm' ? 'Ask AI (GPU)' : 
                 mode === 'obstacle' ? 'Get Walking Assistance (GPU)' : 
                 'Process ATM Scene (GPU)'}
              </ThemedText>
            )}
          </TouchableOpacity>

          {/* Response Time */}
          {responseTime && (
            <ThemedView style={styles.responseTimeContainer}>
              <ThemedText style={styles.responseTimeText}>
                Response Time: {(responseTime / 1000).toFixed(2)} seconds
              </ThemedText>
              {result?.device && (
                <ThemedText style={styles.deviceText}>
                  Processing Device: {result.device}
                </ThemedText>
              )}
            </ThemedView>
          )}

          {/* Error Message */}
          {error && (
            <ThemedView style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </ThemedView>
          )}

          {/* Results */}
          {result && (
            <ThemedView style={styles.resultContainer}>
              <ThemedText type="subtitle">Result:</ThemedText>
              <ThemedText style={styles.resultText}>
                {mode === 'vlm' || mode === 'obstacle' 
                  ? result.result || JSON.stringify(result, null, 2)
                  : JSON.stringify(result, null, 2)}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100, // Extra padding at the bottom for keyboard
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  modeContainer: {
    marginBottom: 20,
  },
  questionContainer: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modeButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedMode: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  imageSection: {
    marginBottom: 20,
  },
  button: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
  imageContainer: {
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  noImageContainer: {
    height: 150,
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  processButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  processButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  responseTimeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  responseTimeText: {
    fontWeight: 'bold',
  },
  deviceText: {
    marginTop: 5,
  },
  errorContainer: {
    padding: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
  },
  resultContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  resultText: {
    marginTop: 8,
    fontFamily: 'monospace',
  },
}); 