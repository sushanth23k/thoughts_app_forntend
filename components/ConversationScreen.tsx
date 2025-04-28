import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useStore } from '../constants/Store';
import Colors from '../constants/Colors';
import ConversationBeginState from './ConversationBeginState';
import ConversationActiveState from './ConversationActiveState';
import ConversationEndState from './ConversationEndState';
import BottomNavigation from './BottomNavigation';

const ConversationScreen: React.FC = () => {
  const { 
    conversationState, 
    startConversation,
    endConversation,
    setConversationState
  } = useStore();

  const handleStartConversation = () => {
    startConversation();
  };

  const handleEndConversation = () => {
    endConversation();
  };

  const handleStartNewConversation = () => {
    setConversationState('begin');
  };

  const renderConversationState = () => {
    switch (conversationState) {
      case 'begin':
        return <ConversationBeginState onStartConversation={handleStartConversation} />;
      case 'active':
        return <ConversationActiveState onEndConversation={handleEndConversation} />;
      case 'end':
        return <ConversationEndState onStartNewConversation={handleStartNewConversation} />;
      default:
        return <ConversationBeginState onStartConversation={handleStartConversation} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderConversationState()}
      </View>
      <BottomNavigation />
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
  },
});

export default ConversationScreen; 