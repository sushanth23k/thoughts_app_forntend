import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import Colors from '../constants/Colors';
import AudioWaveform from './AudioWaveform';
import AudioControls from './AudioControls';
import { useStore } from '../constants/Store';
import { normalizeFrequencies } from '../constants/Utils';
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
    startRecording, 
    stopRecording, 
    pauseRecording,
    updateFrequencies,
    addThought,
    currentConversation
  } = useStore();
  
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isFetchingResponse, setIsFetchingResponse] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Initialize Voice recognition
  useEffect(() => {
    const setupVoice = async () => {
      try {
        await Voice.isAvailable();
        
        Voice.onSpeechResults = (e: SpeechResultsEvent) => {
          if (e.value && e.value.length > 0) {
            setTranscription(e.value[0]);
          }
        };

        Voice.onSpeechError = (e: SpeechErrorEvent) => {
          console.error('Speech recognition error', e);
          stopRecording();
        };

        Voice.onSpeechEnd = () => {
          stopRecording();
        };

        return () => {
          Voice.destroy().then(Voice.removeAllListeners);
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
      if (sound) {
        await sound.unloadAsync();
      }

      const audioData = base64Audio;
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `data:audio/wav;base64,${audioData}` },
        { shouldPlay: true }
      );
      
      setSound(newSound);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  // Simulate audio processing and frequency updates
  useEffect(() => {
    if (audioState.isRecording && !audioState.isPaused) {
      const interval = setInterval(() => {
        // Generate random frequencies for visualization
        const mockFrequencies = Array(50).fill(0).map(() => Math.random() * 0.8);
        updateFrequencies(mockFrequencies);
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [audioState.isRecording, audioState.isPaused]);

  const handleStartRecording = async () => {
    try {
      setTranscription('');
      await Voice.start('en-US');
      startRecording();
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please check your microphone permissions.');
    }
  };

  const handleStopRecording = async () => {
    try {
      await Voice.stop();
      stopRecording();
      
      if (transcription && conversationId) {
        setIsFetchingResponse(true);
        
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
        } finally {
          setIsFetchingResponse(false);
        }
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const handlePauseRecording = async () => {
    try {
      if (audioState.isPaused) {
        await Voice.start('en-US');
      } else {
        await Voice.stop();
      }
      pauseRecording();
    } catch (err) {
      console.error('Failed to pause/resume recording', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.conversationId}>
          {currentConversation?.title || 'Conversation'}
        </Text>
        <MaterialIcons 
          name="close" 
          size={24} 
          color={Colors.text} 
          onPress={onEndConversation}
          style={styles.closeButton}
        />
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
              : 'Press the microphone to start speaking'}
          </Text>
        )}
      </View>
      
      <AudioWaveform 
        frequencies={audioState.frequencies}
        isRecording={audioState.isRecording}
        isPaused={audioState.isPaused}
      />
      
      <AudioControls 
        isRecording={audioState.isRecording}
        isPaused={audioState.isPaused}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onPauseRecording={handlePauseRecording}
      />
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
  conversationId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
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
});

export default ConversationActiveState; 