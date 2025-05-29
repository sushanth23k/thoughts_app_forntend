import React from 'react';
import { View, StyleSheet } from 'react-native';
import HistoryScreen from '../../components/HistoryScreen';

export default function History() {
  return (
    <View style={styles.container}>
      <HistoryScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 