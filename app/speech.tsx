import React from 'react';
import { StyleSheet, View } from 'react-native';
import SpeechToText from '../components/SpeechToText';
import Colors from '../constants/Colors';

export default function SpeechScreen() {
  return (
    <View style={styles.container}>
      <SpeechToText />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
}); 