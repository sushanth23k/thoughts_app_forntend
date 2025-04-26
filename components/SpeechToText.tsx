import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';

const SpeechToText = () => {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const setupVoice = async () => {
      try {
        await Voice.isAvailable();
        
        Voice.onSpeechResults = (e: SpeechResultsEvent) => {
          if (e.value && e.value.length > 0) {
            setTranscript(e.value[0]);
          }
        };

        Voice.onSpeechError = (e: SpeechErrorEvent) => {
          console.error('Speech recognition error', e);
          setIsRecording(false);
        };

        Voice.onSpeechEnd = () => {
          setIsRecording(false);
        };

        return () => {
          Voice.destroy().then(Voice.removeAllListeners);
        };
      } catch (err) {
        console.error('Failed to setup voice recognition', err);
        Alert.alert('Error', 'Failed to setup voice recognition. Please try again.');
      }
    };

    setupVoice();
  }, []);

  const startRecording = async () => {
    try {
      setTranscript('');
      await Voice.start('en-US');
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.transcriptContainer}>
        <Text style={styles.transcriptText}>
          {transcript || 'Press the microphone to start recording...'}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.iconButton, isRecording ? styles.recordingButton : styles.recordButton]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Ionicons 
          name={isRecording ? "mic-off" : "mic"} 
          size={24} 
          color={Colors.background} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.small,
    backgroundColor: Colors.secondary,
    borderRadius: Layout.borderRadius,
    marginTop: Layout.spacing.small,
  },
  transcriptContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius,
    padding: Layout.spacing.small,
    marginRight: Layout.spacing.small,
  },
  transcriptText: {
    fontSize: 16,
    color: Colors.text,
  },
  iconButton: {
    padding: Layout.spacing.small,
    borderRadius: 20,
  },
  recordButton: {
    backgroundColor: Colors.primary,
  },
  recordingButton: {
    backgroundColor: Colors.primary,
  },
});

export default SpeechToText; 