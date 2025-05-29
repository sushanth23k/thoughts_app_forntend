import React from 'react';
import { View, StyleSheet } from 'react-native';
import ThoughtsScreen from '../../components/ThoughtsScreen';

export default function Thoughts() {
  return (
    <View style={styles.container}>
      <ThoughtsScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 