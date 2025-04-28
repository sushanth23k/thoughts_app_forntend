import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import Button from './Button';
import { useStore } from '../constants/Store';
import { formatDate } from '../constants/Utils';

interface ConversationEndStateProps {
  onStartNewConversation: () => void;
}

const ConversationEndState: React.FC<ConversationEndStateProps> = ({
  onStartNewConversation,
}) => {
  const { currentConversation } = useStore();

  if (!currentConversation) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No conversation found</Text>
        <Button
          title="Start New Conversation"
          onPress={onStartNewConversation}
          variant="primary"
          style={styles.button}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Conversation Summary</Text>
        <Text style={styles.date}>
          {formatDate(currentConversation.created)}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{currentConversation.title}</Text>
          
          <View style={styles.thoughtsContainer}>
            <Text style={styles.thoughtsTitle}>
              Generated Thoughts ({currentConversation.thoughts.length})
            </Text>
            
            {currentConversation.thoughts.length === 0 ? (
              <Text style={styles.noThoughts}>No thoughts were generated</Text>
            ) : (
              currentConversation.thoughts.map((thought, index) => (
                <View key={thought.id} style={styles.thoughtItem}>
                  <MaterialIcons name="psychology" size={20} color={Colors.text} />
                  <Text style={styles.thoughtText}>{thought.content}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Start New Conversation"
          onPress={onStartNewConversation}
          variant="primary"
          fullWidth
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  thoughtsContainer: {
    marginTop: 16,
  },
  thoughtsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  noThoughts: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  thoughtItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: Colors.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  thoughtText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    marginLeft: 12,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.accent,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    alignSelf: 'center',
  },
});

export default ConversationEndState; 