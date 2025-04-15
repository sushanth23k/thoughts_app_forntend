import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { ChatMessageType } from '../../types/types';

type ChatMessageProps = {
  message: ChatMessageType;
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <View style={[
      styles.container,
      message.isUser ? styles.userContainer : styles.aiContainer
    ]}>
      <Text style={[
        styles.messageText,
        message.isUser ? styles.userText : styles.aiText
      ]}>
        {message.content}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    borderRadius: Layout.borderRadius,
    padding: Layout.spacing.medium,
    marginBottom: Layout.spacing.small,
    marginHorizontal: Layout.spacing.medium,
  },
  userContainer: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
  },
  aiContainer: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.tertiary,
  },
  messageText: {
    fontSize: 16,
  },
  userText: {
    color: Colors.background,
  },
  aiText: {
    color: Colors.background,
  },
});

export default ChatMessage; 