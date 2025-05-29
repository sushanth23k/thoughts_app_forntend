import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '../constants/Colors';
import Button from './Button';

interface ConversationBeginStateProps {
  onStartConversation: () => void;
}

const ConversationBeginState: React.FC<ConversationBeginStateProps> = ({

}) => {
  const handleStartVoiceConversation = () => {
    router.push('/voice-conversation' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.illustration}>
          <MaterialIcons name="mic" size={80} color={Colors.text} />
        </View>
        <Text style={styles.title}>Ready to start a conversation?</Text>
        <Text style={styles.subtitle}>
          Speak with your AI assistant and generate thoughts.
        </Text>
        <Button
          title="Start Voice Conversation"
          onPress={handleStartVoiceConversation}
          variant="secondary"
          style={styles.button}
          icon="mic"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  illustration: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text,
    opacity: 0.7,
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 40,
    marginBottom: 16,
  },
});

export default ConversationBeginState; 