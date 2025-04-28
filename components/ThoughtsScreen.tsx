import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useStore } from '../constants/Store';
import Colors from '../constants/Colors';
import { formatDate } from '../constants/Utils';
import BottomNavigation from './BottomNavigation';

const ThoughtsScreen: React.FC = () => {
  const { thoughts } = useStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thought Repository</Text>
      </View>
      
      <View style={styles.content}>
        {thoughts.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="psychology" size={60} color={Colors.accent} />
            <Text style={styles.emptyText}>No thoughts yet</Text>
            <Text style={styles.emptySubtext}>
              Thoughts generated during conversations will appear here
            </Text>
          </View>
        ) : (
          <FlatList
            data={thoughts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.thoughtItem}>
                <View style={styles.thoughtHeader}>
                  <MaterialIcons name="psychology" size={20} color={Colors.text} />
                  <Text style={styles.thoughtDate}>
                    {formatDate(item.created)}
                  </Text>
                </View>
                <Text style={styles.thoughtContent}>{item.content}</Text>
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
    marginTop: 16,
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
  thoughtItem: {
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
  thoughtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  thoughtDate: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.6,
    marginLeft: 8,
  },
  thoughtContent: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
});

export default ThoughtsScreen; 