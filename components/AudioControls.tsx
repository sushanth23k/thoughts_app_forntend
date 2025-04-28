import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

interface AudioControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isRecording,
  isPaused,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
}) => {
  return (
    <View style={styles.container}>
      {/* Stop Button */}
      <Pressable
        style={[styles.button, styles.sideButton]}
        onPress={onStopRecording}
        disabled={!isRecording}
      >
        <MaterialIcons
          name="stop"
          size={24}
          color={isRecording ? Colors.text : Colors.accent}
        />
      </Pressable>

      {/* Main Record Button */}
      <Pressable
        style={[styles.button, styles.mainButton]}
        onPress={isRecording ? onStopRecording : onStartRecording}
      >
        <MaterialIcons
          name={isRecording ? "mic" : "mic-none"}
          size={32}
          color={Colors.white}
        />
      </Pressable>

      {/* Pause Button */}
      <Pressable
        style={[styles.button, styles.sideButton]}
        onPress={onPauseRecording}
        disabled={!isRecording}
      >
        <MaterialIcons
          name={isPaused ? "play-arrow" : "pause"}
          size={24}
          color={isRecording ? Colors.text : Colors.accent}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  mainButton: {
    backgroundColor: Colors.text,
    width: 70,
    height: 70,
    marginHorizontal: 30,
  },
  sideButton: {
    backgroundColor: Colors.primary,
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
});

export default AudioControls; 