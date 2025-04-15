import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import { Text, View, ScrollView } from 'react-native';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';

export default function ModalScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>About Thoughts App</Text>
        <View style={styles.separator} />
        
        <Text style={styles.text}>
          Welcome to Thoughts App! This is an application for capturing and managing your thoughts with the help of an AI assistant.
        </Text>
        
        <Text style={styles.sectionTitle}>Features:</Text>
        <Text style={styles.text}>
          • Record your thoughts through text or voice input{'\n'}
          • Chat with an AI assistant that helps you explore your ideas{'\n'}
          • View your thoughts organized by date{'\n'}
          • Save thoughts automatically during conversations{'\n'}
        </Text>
        
        <Text style={styles.sectionTitle}>How to use:</Text>
        <Text style={styles.text}>
          1. Switch to the "Chat" tab to start a conversation{'\n'}
          2. Type or use voice input to share your thoughts{'\n'}
          3. The AI will respond and help you develop your ideas{'\n'}
          4. Your thoughts are automatically saved{'\n'}
          5. View your saved thoughts in the "My Thoughts" tab{'\n'}
        </Text>
        
        <Text style={styles.sectionTitle}>Version:</Text>
        <Text style={styles.text}>1.0.0</Text>

        <StatusBar style="light" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Layout.spacing.large,
    paddingBottom: Layout.spacing.large * 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: Layout.spacing.medium,
    marginBottom: Layout.spacing.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.tertiary,
    marginTop: Layout.spacing.large,
    marginBottom: Layout.spacing.small,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
  },
  separator: {
    marginVertical: Layout.spacing.medium,
    height: 2,
    width: '100%',
    backgroundColor: Colors.primary,
    opacity: 0.3,
    borderRadius: Layout.borderRadius,
  },
});
