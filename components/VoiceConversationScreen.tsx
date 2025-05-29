import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useStore } from '../constants/Store';
import Colors from '../constants/Colors';
import { normalizeFrequencies } from '../constants/Utils';
import AudioWaveform from './AudioWaveform';
import FrequencyVisualizer from './FrequencyVisualizer';
import { MaterialIcons } from '@expo/vector-icons';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';

// Audio config
const AUDIO_CONFIG = {
  SILENCE_THRESHOLD: 1000, // 1000Hz threshold (lowered for better sensitivity)
  SILENCE_TIMEOUT: 2000, // 5 seconds of continuous silence
  NEW_SPEECH_TIMEOUT: 1200, // 1 second of continuous silence before new speech is detected
  FREQUENCY_CHECK_INTERVAL: 100, // Check every 100ms
  MIN_SPEECH_DURATION: 1000, // Minimum 1 second of speech before silence detection starts
};

// Default avatar image (placeholder)
const DEFAULT_AVATAR = { uri: 'https://via.placeholder.com/100' };

// Placeholder for actual agent avatar
const AGENT_AVATAR = { uri: 'https://via.placeholder.com/100' };

const VoiceConversationScreen: React.FC = () => {
  // Zustand state
  const { 
    audioState, 
    currentConversation,
    startRecording, 
    stopRecording, 
    updateFrequencies,
    endConversation,
    setConversationMode
  } = useStore();

  // WebSocket state
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [agentMessage, setAgentMessage] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [isAgentSpeaking, setIsAgentSpeaking] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string>("");
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioRecorderRef = useRef<Audio.Recording | null>(null);
  const audioPlayerRef = useRef<Audio.Sound | null>(null);
  const transcriptBufferRef = useRef<string>("");
  const lastSentTranscriptRef = useRef<string>("");
  const oldTranscriptRef = useRef<string>("");
  const frequencyCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const silenceStartTimeRef = useRef<number | null>(null);
  const speechStartTimeRef = useRef<number | null>(null);
  const waitingForAgentResponseRef = useRef<boolean>(false);
  const isCleaningUpRef = useRef<boolean>(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingInProgressRef = useRef<boolean>(false);
  const isPlayingAudioRef = useRef<boolean>(false);
  const isTranscriptingRef = useRef<boolean>(false);
  const isNewSpeechRef = useRef<boolean>(false);
  
  // Add local ref to track recording state to avoid React state sync issues
  const isLocallyRecordingRef = useRef<boolean>(false);
  
  // Add speech recognition state
  const [isRecognizing, setIsRecognizing] = useState(false);

  // Add fallback frequency generation interval if metering doesn't work
  const fallbackFrequencyIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add ref to track latest frequencies directly for silence detection
  const latestFrequenciesRef = useRef<number[]>([]);
  
  // Add temporary debugging effect to track audioState.isRecording changes
  useEffect(() => {
    console.log('audioState.isRecording changed to:', audioState.isRecording);
  }, [audioState.isRecording]);

  // Get average frequency for visualization
  const avgFrequency = audioState.frequencies.length 
    ? audioState.frequencies.reduce((a, b) => a + b, 0) / audioState.frequencies.length * 1000
    : 0;

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      cleanup();
    };
  }, []);

  // Initialize voice recognition
  useEffect(() => {
    const initVoiceRecognition = async () => {
      try {
        await Voice.isAvailable();
        Voice.onSpeechResults = handleSpeechResults;
        Voice.onSpeechError = handleSpeechError;
        Voice.onSpeechStart = handleSpeechStart;
        Voice.onSpeechEnd = handleSpeechEnd;
      } catch (err) {
        console.error('Voice recognition not available:', err);
      }
    };  

    initVoiceRecognition();

    // Initialize audio permissions and mode
    Audio.requestPermissionsAsync().then((status) => {
      console.log('Audio permissions status:', status);
    });
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    console.log('Audio mode Working');

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // Cleanup function
  const cleanup = async () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;

    console.log('Starting cleanup...');

    try {
      // Stop recording if active
      if (audioRecorderRef.current) {
        await audioRecorderRef.current.stopAndUnloadAsync();
        audioRecorderRef.current = null;
      }

      // Stop voice recognition
      try {
        await Voice.stop();
        await Voice.destroy();
      } catch (err) {
        console.error('Error stopping voice recognition:', err);
      }

      // Stop audio playback
      if (audioPlayerRef.current) {
        await audioPlayerRef.current.unloadAsync();
        audioPlayerRef.current = null;
      }

      // Clear intervals and timeouts
      if (frequencyCheckIntervalRef.current) {
        clearInterval(frequencyCheckIntervalRef.current);
        frequencyCheckIntervalRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Close WebSocket
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Clear fallback frequency generation
      if (fallbackFrequencyIntervalRef.current) {
        clearInterval(fallbackFrequencyIntervalRef.current);
        fallbackFrequencyIntervalRef.current = null;
      }

      console.log('Cleanup completed');
    } catch (err) {
      console.error('Error during cleanup:', err);
    }
  };

  // Connect to WebSocket with retry logic
  const connectWebSocket = () => {
    try {
      setConnectionError("");
      console.log('Connecting to WebSocket...');
      wsRef.current = new WebSocket('ws://127.0.0.1:8000/ws/conversation/');
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setWsConnected(true);
        setConnectionError("");
        // Initialize conversation
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ status: 'start' }));
        }
      };
      
      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setWsConnected(false);
        
        // Only attempt reconnection if not cleaning up and not a normal closure
        if (!isCleaningUpRef.current && event.code !== 1000 && event.code !== 1001) {
          setConnectionError("Connection lost. Attempting to reconnect...");
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isCleaningUpRef.current) {
              connectWebSocket();
            }
          }, 3000);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError("Connection error occurred");
      };
      
      wsRef.current.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          handleWebSocketMessage(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      setConnectionError("Failed to establish connection");
    }
  };
  
  // Handle incoming WebSocket messages
  const handleWebSocketMessage = async (data: any) => {
    try {
      // console.log('Received WebSocket message:',xdata);
      
      if (data.data==='conversation_id') {
        setConversationId(data.conversation_id);
      }
      
      if (data.data==='agent_message') {
        setAgentMessage(data.agent_message);
      }
      
      if (data.data==='agent_voice' && !isPlayingAudioRef.current) {
        setIsAgentSpeaking(true);
        setConversationMode('listening');
        waitingForAgentResponseRef.current = false;
        await playAudio(data.agent_voice);
      }
      
      if (data.data === 'conversation_ended') {
        console.log('Conversation ended');
        await handleConversationEnded();
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  };
  // Audio playback for agent responses
  const playAudio = async (base64Audio: string) => {
    if (isPlayingAudioRef.current || isCleaningUpRef.current) {
      console.log('Audio playback blocked - another operation in progress');
      return;
    }

    try {
      console.log('Playing agent audio...');
      isPlayingAudioRef.current = true;
      
      // Unload any existing audio
      if (audioPlayerRef.current) {
        await audioPlayerRef.current.unloadAsync();
        audioPlayerRef.current = null;
      }
      
      // Create a sound object from the base64 audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/wav;base64,${base64Audio}` },
        { shouldPlay: true, volume: 1.0 },
        (status: AVPlaybackStatus) => {
          if (status.isLoaded && status.didJustFinish) {
            console.log('Agent audio finished playing');
            setIsAgentSpeaking(false);
            setConversationMode('speaking');
            isPlayingAudioRef.current = false;
            
            // Reset silence detection timers when agent finishes speaking
            silenceStartTimeRef.current = null;
            speechStartTimeRef.current = null;
            
            // Automatically start listening after agent finishes speaking
            if (!waitingForAgentResponseRef.current && !isCleaningUpRef.current) {
              handleStartRecording();
              // setTimeout(() => {
              //   handleStartRecording();
              // }, 200);
            }
          }
        }
      );
      
      audioPlayerRef.current = sound;
      await sound.playAsync();
      
    } catch (err) {
      console.error('Failed to play audio', err);
      setIsAgentSpeaking(false);
      setConversationMode('speaking');
      isPlayingAudioRef.current = false;
      
      // Reset silence detection timers on error as well
      silenceStartTimeRef.current = null;
      speechStartTimeRef.current = null;
      
      // Still start listening even if audio playback failed
      if (!waitingForAgentResponseRef.current && !isCleaningUpRef.current) {
        setTimeout(() => {
          handleStartRecording();
        }, 200);
      }
    }
  };

  // Handle conversation ended
  const handleConversationEnded = async () => {
    try {
      console.log('Handling conversation end');
      await cleanup();
      
      // End conversation in store
      endConversation();
      
      console.log('Conversation ended and cleaned up');
    } catch (err) {
      console.error('Error handling conversation end:', err);
    }
  };
  
  // Audio recording functions
  const handleStartRecording = async () => {
    if (isRecordingInProgressRef.current || isCleaningUpRef.current) {
      console.log('Recording blocked - another operation in progress');
      return;
    }

    try {
      console.log('Starting recording...');
      isRecordingInProgressRef.current = true;
      
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true, // Explicitly enable metering
      });
      
      recording.setOnRecordingStatusUpdate((status) => {
        
        if (status.isRecording) {
          const metering = status.metering || -160;
          const normalizedMeter = Math.max(0, (metering + 160) / 160);
          
          const frequencies = Array(50).fill(0).map((_, i) => {
            return normalizedMeter * (1 - (Math.abs(i - 25) / 50));
          });
          
          updateFrequencies(frequencies);
          latestFrequenciesRef.current = frequencies; // Store for silence detection
        } else {
          console.log('Not recording in status update, status.isRecording:', status.isRecording);
        }
      });
      
      await recording.startAsync();
      audioRecorderRef.current = recording;
      
      startRecording();
      isLocallyRecordingRef.current = true;
      isTranscriptingRef.current = false;
      isNewSpeechRef.current = true;
      
      // Check state after a brief delay to see if Zustand update is asynchronous
      console.log('Checking audioState.isRecording:', audioState.isRecording);
      
      setConversationMode('listening');
      
      // Start voice recognition
      await startVoiceRecognition();
      
      // Start fallback frequency generation in case metering doesn't work
      setTimeout(() => {
        if (isLocallyRecordingRef.current && audioState.frequencies.length === 0) {
          console.log('Starting fallback frequency generation - no metering data detected');
          startFallbackFrequencyGeneration();
        }
      }, 2000); // Wait 2 seconds to see if metering starts working
      
      // Reset transcript and sent parts for new turn
      transcriptBufferRef.current = "";
      lastSentTranscriptRef.current = "";
      oldTranscriptRef.current = "";
      setTranscript("");
      
      // Reset timing refs
      speechStartTimeRef.current = null;
      silenceStartTimeRef.current = null;
      
      // Use setTimeout to ensure store state is updated before starting silence detection
      if (!isCleaningUpRef.current && audioRecorderRef.current) {
        console.log('Starting silence detection after state update...');
        startSilenceDetection();
      }
      
      console.log('Recording setup completed');
      
    } catch (err) {
      console.error('Failed to start recording', err);
    } finally {
      isRecordingInProgressRef.current = false;
    }
  };
  
  const handleStopRecording = async () => {
    if (!audioRecorderRef.current || isCleaningUpRef.current) {
      return;
    }

    try {
      console.log('handleStopRecording called - current audioState.isRecording:', audioState.isRecording);
      console.log('Stopping recording...');
      
      const recording = audioRecorderRef.current;
      audioRecorderRef.current = null;
      
      await recording.stopAndUnloadAsync();
      
      console.log('About to call stopRecording() - current audioState.isRecording:', audioState.isRecording);
      stopRecording();
      isLocallyRecordingRef.current = false;
      console.log('Called stopRecording() - audioState.isRecording should now be false:', audioState.isRecording);
      console.log('Set isLocallyRecordingRef.current to:', isLocallyRecordingRef.current);
      
      // Stop voice recognition
      await stopVoiceRecognition();

      if (transcript!=null) {
        setTranscript("");
      }
      
      // Clear silence detection
      if (frequencyCheckIntervalRef.current) {
        clearInterval(frequencyCheckIntervalRef.current);
        frequencyCheckIntervalRef.current = null;
      }
      
      // Clear fallback frequency generation
      if (fallbackFrequencyIntervalRef.current) {
        clearInterval(fallbackFrequencyIntervalRef.current);
        fallbackFrequencyIntervalRef.current = null;
      }
      
      waitingForAgentResponseRef.current = true;
      
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };
  
  
  const sendEndStatus = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ status: 'end' }));
    }
  };
  

  // End the transcript
  const endTranscript = () => {

    // Don't send transcripts while agent is speaking
    if (isPlayingAudioRef.current) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {

      console.log('Stopping the speech');
      wsRef.current.send(JSON.stringify({
        status: 'stopped',
        is_final: true
      }));

    }
  }

  // New transcript
  const newTranscript = () => {

    // Don't send transcripts while agent is speaking
    if (isPlayingAudioRef.current) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {

      console.log('New Speech Detected');
      wsRef.current.send(JSON.stringify({
        status: 'new_speech',
        is_final: false
      }));
    }
  }

  // Send the transcript chunk
  const sendTranscriptChunk = async () => {
    
    // Don't send transcripts while agent is speaking
    if (isPlayingAudioRef.current) return;
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const currentTranscript = transcriptBufferRef.current.trim();
      wsRef.current.send(JSON.stringify({
        status: 'speaking',
        transcript: currentTranscript,
        is_final: false
      }));
    }
  };
  
  // Improved silence detection with continuous silence tracking
  const startSilenceDetection = () => {
    // Clear any existing interval first
    if (frequencyCheckIntervalRef.current) {
      clearInterval(frequencyCheckIntervalRef.current);
      frequencyCheckIntervalRef.current = null;
    }
    
    // Reset silence tracking
    silenceStartTimeRef.current = null;
    
    frequencyCheckIntervalRef.current = setInterval( async () => {

      console.log('Silence Time:', silenceStartTimeRef.current);
      console.log('isTranscriptingRef.current:', isTranscriptingRef.current);
      
      // Skip if not recording or cleaning up
      if (!isLocallyRecordingRef.current || isCleaningUpRef.current) {
        console.log('Skipping silence detection - not recording or cleaning up');
        silenceStartTimeRef.current = null;
        return;
      }
      
      // Skip if no frequency data available
      if (latestFrequenciesRef.current.length === 0) {
        console.log('Skipping silence detection - no frequency data');
        silenceStartTimeRef.current = null;
        return;
      }
      
      // Calculate average frequency
      const avgFrequency = latestFrequenciesRef.current.reduce((a, b) => a + b, 0) / latestFrequenciesRef.current.length * 1000;
      const currentTime = Date.now();

      if (avgFrequency < AUDIO_CONFIG.SILENCE_THRESHOLD &&  isTranscriptingRef.current) {
        // Silence detected
        if (silenceStartTimeRef.current === null) {
          silenceStartTimeRef.current = currentTime;
        } else {
          // Check if silence duration exceeded threshold
          const silenceDuration = currentTime - silenceStartTimeRef.current;
          console.log('Silence duration:', silenceDuration, 'timeout threshold:', AUDIO_CONFIG.SILENCE_TIMEOUT);
          if (silenceDuration >= AUDIO_CONFIG.NEW_SPEECH_TIMEOUT) {
            newTranscript();
            // Reset speech recognition state and values for completely new voice input
            isNewSpeechRef.current = true;
          }
          if (silenceDuration >= AUDIO_CONFIG.SILENCE_TIMEOUT) {
            // Stop recording and send final transcript
            handleStopRecording();
            endTranscript();
            return;
          }
        }
      } else {
        // Voice detected - reset silence timer
        if (silenceStartTimeRef.current !== null) {
          console.log('Voice detected, resetting silence timer');
        }
        silenceStartTimeRef.current = null;
      }
    }, 1000); // Check every 1 second
    
    console.log('Silence detection interval started with ID:', frequencyCheckIntervalRef.current);
  };
  
  // Handle speech recognition results
  const handleSpeechResults = (e: SpeechResultsEvent) => {
    // Don't process speech while agent is speaking
    if (isPlayingAudioRef.current) return;

    isTranscriptingRef.current = true;

    let text = e.value?.[0] || '';
    if (isNewSpeechRef.current) {
      oldTranscriptRef.current = lastSentTranscriptRef.current;
      transcriptBufferRef.current = text.trim().startsWith(oldTranscriptRef.current.trim()) ? text.replace(oldTranscriptRef.current.trim(), '') : text;
      isNewSpeechRef.current = false;
    } else {
      console.log('Status:', text.trim().startsWith(oldTranscriptRef.current.trim()));
      console.log('Last Sent:', oldTranscriptRef.current);
      transcriptBufferRef.current = text.trim().startsWith(oldTranscriptRef.current.trim()) ? text.replace(oldTranscriptRef.current.trim(), '') : text;
    }
    lastSentTranscriptRef.current = text.trim();
    setTranscript(transcriptBufferRef.current);
    silenceStartTimeRef.current = null;
    sendTranscriptChunk();
  };

  // Handle speech recognition errors
  const handleSpeechError = (e: SpeechErrorEvent) => {
    console.error('Speech recognition error:', e);
    setIsRecognizing(false);
    
    // Try to restart voice recognition if it fails and we're still recording
    if (audioState.isRecording && !isCleaningUpRef.current) {
      setTimeout(() => {
        if (audioState.isRecording && !isCleaningUpRef.current) {
          startVoiceRecognition();
        }
      }, 1000);
    }
  };

  // Handle speech start
  const handleSpeechStart = () => {
    // Don't process speech while agent is speaking
    if (isPlayingAudioRef.current) return;
    
    console.log('Voice recognition detected speech start');
    if (speechStartTimeRef.current === null) {
      speechStartTimeRef.current = Date.now();
    }
    silenceStartTimeRef.current = null;
  };

  // Handle speech end
  const handleSpeechEnd = () => {
    console.log('Voice recognition detected speech end');
    // Don't immediately stop - let silence detection handle it
  };

  // Start voice recognition
  const startVoiceRecognition = async () => {
    try {
      if (isCleaningUpRef.current) return;
      
      await Voice.start('en-US');
      setIsRecognizing(true);
      console.log('Voice recognition started');
    } catch (err) {
      console.error('Failed to start voice recognition:', err);
      setIsRecognizing(false);
    }
  };

  // Stop voice recognition
  const stopVoiceRecognition = async () => {
    try {
      await Voice.stop();
      setIsRecognizing(false);
      console.log('Voice recognition stopped');
    } catch (err) {
      console.error('Failed to stop voice recognition:', err);
    }
  };
  
  // End the conversation manually
  const handleEndConversation = async () => {
    sendEndStatus();
    await cleanup();
  };
  
  // Start fallback frequency generation for when metering doesn't work
  const startFallbackFrequencyGeneration = () => {
    if (fallbackFrequencyIntervalRef.current) {
      clearInterval(fallbackFrequencyIntervalRef.current);
    }
    
    console.log('Starting fallback frequency generation...');
    
    fallbackFrequencyIntervalRef.current = setInterval(() => {
      if (!isLocallyRecordingRef.current) {
        console.log('Stopping fallback frequency generation - not recording');
        if (fallbackFrequencyIntervalRef.current) {
          clearInterval(fallbackFrequencyIntervalRef.current);
          fallbackFrequencyIntervalRef.current = null;
        }
        return;
      }
      
      // Generate mock frequency data with some randomness to simulate voice activity
      const baseLevel = Math.random() * 0.3 + 0.1; // Random base level
      const frequencies = Array(50).fill(0).map((_, i) => {
        const centerDistance = Math.abs(i - 25);
        const baseFreq = baseLevel * (1 - (centerDistance / 50));
        return baseFreq + (Math.random() * 0.2); // Add some random variation
      });
      
      // console.log('Generated fallback frequencies, avg:', frequencies.reduce((a, b) => a + b) / frequencies.length);
      updateFrequencies(frequencies);
      latestFrequenciesRef.current = frequencies; // Store for silence detection
    }, 100); // Update every 100ms
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={AGENT_AVATAR} 
          style={styles.avatar}
          defaultSource={DEFAULT_AVATAR}
        />
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusIndicator, 
            { backgroundColor: wsConnected ? Colors.success : Colors.error }
          ]} />
          <Text style={styles.statusText}>
            {wsConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>
      
      {/* Connection Error */}
      {connectionError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{connectionError}</Text>
        </View>
      ) : null}
      
      {/* Main Area */}
      <View style={styles.mainArea}>
        {/* Agent Message */}
        {agentMessage ? (
          <View style={styles.messageBubble}>
            <Text style={styles.agentMessage}>{agentMessage}</Text>
          </View>
        ) : (
          <View style={styles.messageBubble}>
            <Text style={styles.agentMessage}>I'm listening...</Text>
          </View>
        )}
        
        {/* Conversation Status */}
        <View style={styles.statusBubble}>
          <Text style={styles.statusMessage}>
            {isAgentSpeaking ? 'Agent speaking...' : 
             waitingForAgentResponseRef.current ? 'Processing your message...' :
             audioState.isRecording ? 'Listening...' : 'Ready'}
          </Text>
        </View>
        
        {/* Frequency Visualization */}
        <View style={styles.visualizationContainer}>
          <FrequencyVisualizer 
            frequency={avgFrequency} 
            isActive={audioState.isRecording || isAgentSpeaking}
            conversationMode={audioState.conversationMode}
          />
        </View>
        
        {/* Audio Waveform */}
        <AudioWaveform 
          frequencies={audioState.frequencies}
          isRecording={audioState.isRecording}
          isPaused={audioState.isPaused}
        />
        
        {/* Transcript */}
        {transcript && (
          <View style={styles.transcriptContainer}>
            <Text style={styles.transcript}>{transcript}</Text>
          </View>
        )}
      </View>
      
      {/* Controls */}
      <View style={styles.controls}>
        {/* End Conversation Button */}
        <TouchableOpacity 
          style={styles.endButton}
          onPress={handleEndConversation}
        >
          <MaterialIcons name="close" size={24} color={Colors.white} />
          <Text style={styles.endButtonText}>End Conversation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: Colors.text,
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  mainArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  messageBubble: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    maxHeight: '20%',
  },
  agentMessage: {
    color: Colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  statusBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 8,
    alignSelf: 'center',
    marginBottom: 10,
  },
  statusMessage: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  visualizationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transcriptContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
  },
  transcript: {
    color: Colors.text,
    fontSize: 14,
    fontStyle: 'italic',
  },
  controls: {
    marginTop: 'auto',
  },
  endButton: {
    backgroundColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    padding: 10,
  },
  endButtonText: {
    color: Colors.white,
    marginLeft: 8,
    fontWeight: 'bold',
  },
});

export default VoiceConversationScreen; 