import React from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

interface AudioWaveformProps {
  frequencies: number[];
  isRecording: boolean;
  isPaused: boolean;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  frequencies,
  isRecording,
  isPaused,
}) => {
  // Default to 50 bars if no frequencies provided
  const displayFrequencies = frequencies.length > 0 ? frequencies : Array(50).fill(0.05);
  
  const maxHeight = 60; // Maximum height of a bar
  
  return (
    <View style={styles.container}>
      {displayFrequencies.map((frequency, index) => {
        // Calculate height based on frequency (0-1 range)
        // If recording is paused, reduce height by 70%
        const height = isPaused
          ? Math.max(2, frequency * maxHeight * 0.3)
          : Math.max(2, frequency * maxHeight);
        
        // If not recording, show minimal animation
        const animatedHeight = isRecording ? height : Math.min(5 + (index % 3) * 2, 10);
        
        return (
          <View
            key={index}
            style={[
              styles.bar,
              {
                height: isRecording ? animatedHeight : 5,
                backgroundColor: isRecording
                  ? Colors.text
                  : index % 2 === 0
                  ? Colors.accent
                  : Colors.gray,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    paddingHorizontal: 10,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    marginHorizontal: 1,
  },
});

export default AudioWaveform; 