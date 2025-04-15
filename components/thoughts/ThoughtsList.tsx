import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { format } from 'date-fns';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { Thought } from '../../types/types';
import ThoughtCard from '../../components/thoughts/ThoughtCard';

type ThoughtsListProps = {
  thoughts: Thought[];
};

const ThoughtsList = ({ thoughts }: ThoughtsListProps) => {
  const groupThoughtsByDate = () => {
    const grouped: { [date: string]: Thought[] } = {};
    
    thoughts.forEach(thought => {
      const date = format(new Date(thought.createdAt), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(thought);
    });
    
    return Object.entries(grouped).map(([date, items]) => ({
      date,
      items,
    }));
  };

  const groupedThoughts = groupThoughtsByDate();

  if (thoughts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No thoughts yet. Start a chat to create some!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={groupedThoughts}
      keyExtractor={item => item.date}
      renderItem={({ item }) => (
        <View style={styles.dateGroup}>
          <Text style={styles.dateHeader}>
            {format(new Date(item.date), 'MMMM d, yyyy')}
          </Text>
          {item.items.map(thought => (
            <ThoughtCard key={thought.id} thought={thought} />
          ))}
        </View>
      )}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: Layout.spacing.large,
  },
  dateGroup: {
    marginBottom: Layout.spacing.large,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.tertiary,
    marginBottom: Layout.spacing.small,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.lightText,
    textAlign: 'center',
  },
});

export default ThoughtsList; 