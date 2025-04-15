import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { format } from 'date-fns';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { Thought } from '../../types/types';

type ThoughtCardProps = {
  thought: Thought;
};

const ThoughtCard = ({ thought }: ThoughtCardProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.content}>{thought.content}</Text>
      <Text style={styles.time}>
        {format(new Date(thought.createdAt), 'h:mm a')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.secondary,
    borderRadius: Layout.borderRadius,
    padding: Layout.spacing.medium,
    marginBottom: Layout.spacing.small,
  },
  content: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: Layout.spacing.small,
  },
  time: {
    fontSize: 12,
    color: Colors.lightText,
    alignSelf: 'flex-end',
  },
});

export default ThoughtCard; 