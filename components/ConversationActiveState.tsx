import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import Colors from '../constants/Colors';
import { useStore } from '../constants/Store';
import { Conversation } from '../constants/Types';
import { Audio } from 'expo-av';

interface ConversationActiveStateProps {
  onEndConversation: () => void;
}

const API_BASE_URL = 'http://127.0.0.1:8000';

const ConversationActiveState: React.FC<ConversationActiveStateProps> = ({
  onEndConversation,
}) => {
  const { 
    audioState, 
    startRecording: storeStartRecording, 
    stopRecording, 
    pauseRecording,
    updateFrequencies,
    addThought,
    currentConversation,
    setConversationMode
  } = useStore();
  
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isFetchingResponse, setIsFetchingResponse] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentFrequency, setCurrentFrequency] = useState<number>(0);
  const [lowFrequencyDuration, setLowFrequencyDuration] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor low frequency duration for auto-stopping and trigger stop when threshold is exceeded
  useEffect(() => {
    console.log('audioState.conversationMode', audioState.conversationMode);
    const stopListening = async() => {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Only set up the interval if we're in listening mode
      if (audioState.conversationMode === 'listening') {
        intervalRef.current = setInterval(async () => {
          console.log('Low Frequency Duration: ' + lowFrequencyDuration);
          if (currentFrequency < 30 && transcription !== '') {
            setLowFrequencyDuration(prev => prev + 1);
          } else {
            setLowFrequencyDuration(0);
          }
          if (lowFrequencyDuration > 10 && transcription) {
            handleStopRecording();
          }
        }, 200);
      }
    };

    stopListening();

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [audioState.conversationMode, currentFrequency, transcription, lowFrequencyDuration]);

  // Initialize Voice recognition
  useEffect(() => {
    console.log('transcription', transcription);
    const setupVoice = async () => {
      try {
        await Voice.isAvailable();
        
        Voice.onSpeechResults = async (e: SpeechResultsEvent) => {
          if (e.value && e.value.length > 0) {
            setTranscription(e.value[0]);
          }
        };

        Voice.onSpeechError = async (e: SpeechErrorEvent) => {
          console.error('Speech recognition error', e);
          await stopRecording();
        };

        Voice.onSpeechEnd = async () => {
          await stopRecording();
        };

        return async() => {
          await Voice.destroy().then(Voice.removeAllListeners);
        };
      } catch (err) {
        console.error('Failed to setup voice recognition', err);
        Alert.alert('Error', 'Failed to setup voice recognition. Please try again.');
      }
    };

    setupVoice();
  }, []);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Start conversation when component mounts
  useEffect(() => {
    startConversation();
  }, []);

  const startConversation = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/start_conversation`);
      const data = await response.json();
      
      setConversationId(data.conversation_id);
      setAiResponse(data.response);
      
      // Play the welcome audio
      if (data.voice) {
        await playAudioFromBase64(data.voice);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    }
  };

  const playAudioFromBase64 = async (base64Audio: string) => {
    try {
      setConversationMode('speaking');
      
      if (sound) {
        await sound.unloadAsync();
      }

      const audioData = base64Audio;
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `data:audio/wav;base64,${audioData}` },
        { shouldPlay: true }
      );
      
      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          setConversationMode('listening');
          handleStartRecording();
        }
      });
      
      setSound(newSound);
    } catch (error) {
      console.error('Error playing audio:', error);
      // If audio fails, still move to listening mode
      setConversationMode('listening');
      handleStartRecording();
    }
  };

  const startRecording = async () => {
    try {
      setLowFrequencyDuration(0);
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);

      // This is the iOS-only callback for raw audio samples
      if (newRecording.setOnRecordingStatusUpdate) {
        newRecording.setOnRecordingStatusUpdate((status) => {
          if (status.isRecording) {
            const pcmData = new Int16Array(status.durationMillis);
            // Process PCM data with FFT here
            // For simplicity, let's just use the average amplitude as a proxy for frequency
            const avgAmplitude = pcmData.reduce((sum, val) => sum + Math.abs(val), 0) / pcmData.length;
            setCurrentFrequency(avgAmplitude);
          }
        });
      }

      await newRecording.startAsync();
      setRecording(newRecording);
      storeStartRecording();
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const handleStartRecording = async () => {
    try {
      setTranscription('');
      await Voice.start('en-US');
      await startRecording();
      setConversationMode('listening');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please check your microphone permissions.');
    }
  };

  const handleStopRecording = async () => {
    try {
      await Voice.stop();
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
        } catch (error) {
          console.log('Recording already stopped');
        }
        setRecording(null);
      }
      stopRecording();
      
      if (transcription && conversationId) {
        setIsFetchingResponse(true);
        setConversationMode('speaking');
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/conversation_loop`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              conversation_id: conversationId,
              user_message: transcription,
            }),
          });

          const data = await response.json();

          // If the API signals "stop", end the conversation
          if (data.status === 'stop') {
            await handleEndConversation();
            return;
          }
          
          setAiResponse(data.response);
          
          // Add thoughts to the store
          if (data.thoughts && Array.isArray(data.thoughts)) {
            data.thoughts.forEach((thought: string) => {
              addThought(thought);
            });
          }

          // Play the response audio
          if (data.response_audio) {
            await playAudioFromBase64(data.response_audio);
          }
        } catch (error) {
          console.error('Error getting AI response:', error);
          Alert.alert('Error', 'Failed to get AI response. Please try again.');
          setConversationMode('listening');
        } finally {
          setIsFetchingResponse(false);
        }
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const handleEndConversation = async () => {
    try {
      if (conversationId) {
        await fetch(`${API_BASE_URL}/api/stop_conversation?conversation_id=${conversationId}`);
      }
      onEndConversation();
    } catch (error) {
      console.error('Error ending conversation:', error);
      onEndConversation(); // Still end the conversation locally
    }
  };

  const handlePauseRecording = async () => {
    try {
      if (audioState.isPaused) {
        if (audioState.conversationMode === 'listening') {
          await Voice.start('en-US');
          if (recording) {
            await recording.startAsync();
          }
        }
      } else {
        if (audioState.conversationMode === 'listening') {
          await Voice.stop();
          if (recording) {
            await recording.pauseAsync();
          }
        }
        if (sound) {
          await sound.pauseAsync();
        }
      }
      pauseRecording();
    } catch (err) {
      console.error('Failed to pause/resume recording', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons 
          name="close" 
          size={24} 
          color={Colors.text} 
          onPress={handleEndConversation}
          style={styles.leftButton}
        />
        <Text style={styles.conversationId}>
          {currentConversation?.title || 'Conversation'}
        </Text>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {aiResponse ? (
          <View style={styles.responseContainer}>
            <Text style={styles.aiResponseLabel}>AI Response:</Text>
            <Text style={styles.aiResponse}>{aiResponse}</Text>
          </View>
        ) : null}
        
        {isFetchingResponse ? (
          <Text style={styles.processingText}>Processing your request...</Text>
        ) : null}
      </ScrollView>
      
      <View style={styles.transcriptionContainer}>
        {transcription ? (
          <Text style={styles.transcription}>{transcription}</Text>
        ) : (
          <Text style={styles.transcriptionPlaceholder}>
            {audioState.isRecording 
              ? 'Listening...' 
              : audioState.conversationMode === 'speaking'
                ? 'AI is speaking...'
                : 'Waiting for you to speak...'}
          </Text>
        )}
      </View>
      
      <View style={styles.controls}>
        <MaterialIcons 
          name="close" 
          size={32} 
          color={Colors.text} 
          onPress={handleEndConversation}
          style={styles.controlButton}
        />
        <View style={styles.stateIndicator}>
          <MaterialIcons 
            name={audioState.conversationMode === 'speaking' ? 'volume-up' : 'mic'}
            size={48} 
            color={Colors.text}
            style={[
              styles.stateIcon,
              {
                transform: [
                  { 
                    scale: 1 + (currentFrequency / 1000) // Adjust scaling factor as needed
                  }
                ]
              }
            ]}
          />
        </View>
        <MaterialIcons 
          name={audioState.isPaused ? 'play-arrow' : 'pause'} 
          size={32} 
          color={Colors.text}
          onPress={handlePauseRecording}
          style={styles.controlButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent,
    position: 'relative',
  },
  leftButton: {
    position: 'absolute',
    left: 16,
  },
  conversationId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  responseContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aiResponseLabel: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.6,
    marginBottom: 8,
  },
  aiResponse: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  processingText: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.text,
    opacity: 0.6,
    marginVertical: 20,
  },
  transcriptionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.accent,
    minHeight: 60,
    justifyContent: 'center',
  },
  transcription: {
    fontSize: 16,
    color: Colors.text,
  },
  transcriptionPlaceholder: {
    fontSize: 16,
    color: Colors.text,
    opacity: 0.6,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.accent,
  },
  controlButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateIcon: {
    color: Colors.text,
  },
});

export default ConversationActiveState;