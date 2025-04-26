import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import ChatMessage from '../../components/chat/ChatMessage';
import { ChatMessageType } from '../../types/types';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';

type ChatInterfaceProps = {
  onNewThought: (content: string) => void;
};

const ChatInterface = ({ onNewThought }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    { id: '1', content: 'Hi there! I\'m your AI assistant. How can I help with your thoughts today?', isUser: false }
  ]);
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastActivityTimestamp, setLastActivityTimestamp] = useState<number | null>(null);
  const [previousTranscript, setPreviousTranscript] = useState('');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Clean up function to ensure proper teardown and setup
  const cleanUpVoice = async () => {
    try {
      Voice.destroy().then(Voice.removeAllListeners);
    } catch (err) {
      console.error('Failed to clean up voice recognition', err);
    }
  };

  // Setup Voice when component mounts and clean up when unmounts
  useEffect(() => {
    const setupVoice = async () => {
      try {
        // Clean up any existing Voice instance first
        await cleanUpVoice();
        
        await Voice.isAvailable();
        
        Voice.onSpeechResults = (e: SpeechResultsEvent) => {
          if (e.value && e.value.length > 0) {
            const newTranscript = e.value[0];
            setTranscript(newTranscript);
            
            // Check for activity by comparing with previous transcript
            if (newTranscript !== previousTranscript) {
              setLastActivityTimestamp(Date.now());
              setPreviousTranscript(newTranscript);
            }
          }
        };

        Voice.onSpeechError = (e: SpeechErrorEvent) => {
          console.error('Speech recognition error', e);
          setIsRecording(false);
          clearSilenceTimer();
        };

        Voice.onSpeechEnd = () => {
          setIsRecording(false);
          clearSilenceTimer();
        };
      } catch (err) {
        console.error('Failed to setup voice recognition', err);
        Alert.alert('Error', 'Failed to setup voice recognition. Please try again.');
      }
    };

    setupVoice();

    // Clean up when component unmounts
    return () => {
      clearSilenceTimer();
      cleanUpVoice();
    };
  }, []); // Empty dependency array to only run on mount/unmount

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearInterval(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const startSilenceDetection = () => {
    // Clear any existing timer
    clearSilenceTimer();
    
    // Set initial timestamp
    setLastActivityTimestamp(Date.now());
    
    // Check for voice inactivity every second
    silenceTimerRef.current = setInterval(() => {
      if (lastActivityTimestamp && isRecording) {
        const currentTime = Date.now();
        const silenceDuration = currentTime - lastActivityTimestamp;
        
        // If silence has lasted more than 3 seconds (3000ms), stop recording
        if (silenceDuration > 3000) {
          stopRecording();
        }
      }
    }, 1000);
  };

  const startRecording = async () => {
    try {
      setTranscript('');
      setPreviousTranscript('');
      await Voice.start('en-US');
      setIsRecording(true);
      setLastActivityTimestamp(Date.now());
      startSilenceDetection();
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = async () => {
    try {
      clearSilenceTimer();
      await Voice.stop();
      setIsRecording(false);
      if (transcript.trim()) {
        handleSend();
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const handleSend = async () => {
    if (!transcript.trim()) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: transcript,
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setTranscript('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(transcript);
      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      
      // Save the thought
      onNewThought(transcript);
    }, 1000);
  };

  // Simple AI response generator - in a real app, this would be replaced with an actual AI API call
  const generateAIResponse = (userInput: string): string => {
    const responses = [
      "That's an interesting thought. How does it make you feel?",
      "I understand. Would you like to explore this idea further?",
      "Thanks for sharing that with me. What led you to this thought?",
      "I've noted your thought. Is there anything specific about it you'd like to discuss?",
      "That's a valuable reflection. How might this impact your day today?",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        )}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptText}>
            {transcript || (isRecording 
              ? 'Listening...' 
              : 'Press the microphone to start recording...')}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.iconButton, isRecording ? styles.recordingButton : styles.recordButton]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Ionicons 
            name={isRecording ? "mic" : "mic-outline"} 
            size={24} 
            color={Colors.background} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: Layout.spacing.medium,
  },
  loadingContainer: {
    padding: Layout.spacing.medium,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.small,
    backgroundColor: Colors.secondary,
    borderRadius: Layout.borderRadius,
    marginTop: Layout.spacing.small,
  },
  transcriptContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius,
    padding: Layout.spacing.small,
    marginRight: Layout.spacing.small,
  },
  transcriptText: {
    fontSize: 16,
    color: Colors.text,
  },
  iconButton: {
    padding: Layout.spacing.small,
    borderRadius: 20,
  },
  recordButton: {
    backgroundColor: Colors.primary,
  },
  recordingButton: {
    backgroundColor: Colors.primary,
  },
});

export default ChatInterface; 