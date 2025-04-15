import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import ChatMessage from '../../components/chat/ChatMessage';
import { ChatMessageType } from '../../types/types';

// Add a flag to check if voice recognition is available
const isVoiceAvailable = Platform.OS !== 'web' && false; // Set to true when you have a dev build

// Create a dummy Voice implementation for Expo Go
const DummyVoice = {
  start: async () => { console.log('Voice recognition not available in Expo Go'); },
  stop: async () => { console.log('Voice recognition not available in Expo Go'); },
  destroy: async () => { console.log('Voice recognition not available in Expo Go'); },
  removeAllListeners: () => {},
  onSpeechStart: (() => {}) as any,
  onSpeechEnd: (() => {}) as any,
  onSpeechResults: (() => {}) as any,
  onSpeechError: (() => {}) as any,
};

// Create a more compatible conditional import approach
let Voice = DummyVoice;
if (isVoiceAvailable) {
  try {
    // Static import with type assertion to avoid dynamic import
    Voice = require('@react-native-voice/voice').default;
  } catch (e) {
    console.error('Failed to import voice module:', e);
  }
}

type ChatInterfaceProps = {
  onNewThought: (content: string) => void;
};

const ChatInterface = ({ onNewThought }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    { id: '1', content: 'Hi there! I\'m your AI assistant. How can I help with your thoughts today?', isUser: false }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const setupVoice = async () => {
      if (isVoiceAvailable) {
        try {
          await Voice.destroy();
          Voice.onSpeechStart = onSpeechStart;
          Voice.onSpeechEnd = onSpeechEnd;
          Voice.onSpeechResults = onSpeechResults;
          Voice.onSpeechError = onSpeechError;
        } catch (e) {
          console.error('Failed to initialize voice module:', e);
        }
      }
    };

    setupVoice();
    return () => {
      if (isVoiceAvailable) {
        Voice.destroy().then(Voice.removeAllListeners);
      }
    };
  }, []);

  const onSpeechStart = () => {
    console.log('Speech started');
  };

  const onSpeechEnd = () => {
    setIsRecording(false);
    console.log('Speech ended');
  };

  const onSpeechResults = (e: any) => {
    if (e.value && e.value[0]) {
      setInputText(e.value[0]);
    }
  };

  const onSpeechError = (e: any) => {
    console.error('Speech error', e);
    setIsRecording(false);
  };

  const startRecording = async () => {
    if (!isVoiceAvailable) {
      alert('Voice recognition is not available in Expo Go. You need to create a development build to use this feature.');
      return;
    }
    
    try {
      await Voice.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = async () => {
    if (!isVoiceAvailable) return;
    
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: inputText,
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputText);
      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      
      // Save the thought
      onNewThought(inputText);
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
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your thoughts..."
          multiline
        />
        {isVoiceAvailable && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Ionicons 
              name={isRecording ? "mic-off" : "mic"} 
              size={24} 
              color={isRecording ? Colors.primary : Colors.tertiary} 
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.iconButton, styles.sendButton]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={24} color={Colors.background} />
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
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius,
    padding: Layout.spacing.small,
    maxHeight: 100,
  },
  iconButton: {
    padding: Layout.spacing.small,
    marginLeft: Layout.spacing.small,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
});

export default ChatInterface; 