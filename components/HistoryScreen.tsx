import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useStore } from '../constants/Store';
import Colors from '../constants/Colors';
import { formatDate } from '../constants/Utils';
import BottomNavigation from './BottomNavigation';

const HistoryScreen: React.FC = () => {
  const { conversations } = useStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Conversation History</Text>
      </View>
      
      <View style={styles.content}>
        {conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No conversation history yet</Text>
            <Text style={styles.emptySubtext}>
              Start a conversation to see it here
            </Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.conversationItem}>
                <Text style={styles.conversationTitle}>{item.title}</Text>
                <Text style={styles.conversationDate}>
                  {formatDate(item.created)}
                </Text>
                <Text style={styles.thoughtsCount}>
                  {item.thoughts.length} thoughts generated
                </Text>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.6,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  conversationItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  conversationDate: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.6,
    marginBottom: 8,
  },
  thoughtsCount: {
    fontSize: 14,
    color: Colors.text,
  },
});

export default HistoryScreen; 