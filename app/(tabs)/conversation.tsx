import React from 'react';
import { View, StyleSheet } from 'react-native';
import ConversationBeginState from '../../components/ConversationBeginState';

export default function Conversation() {
  const handleStartConversation = () => {
    // This will be handled by ConversationBeginState's internal navigation
  };

  return (
    <View style={styles.container}>
      <ConversationBeginState onStartConversation={handleStartConversation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 