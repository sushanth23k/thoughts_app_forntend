import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../constants/Store';
import { STORAGE_KEYS } from '../constants/AppConstants';
import { User, Conversation, Thought } from '../constants/Types';
import Colors from '../constants/Colors';

export default function RootLayout() {
  const setUser = useStore((state) => state.loginAsGuest);
  
  // Load the app state from AsyncStorage on app launch
  useEffect(() => {
    const loadAppState = async () => {
      try {
        // Just going with guest user for simplicity
        setUser();
      } catch (error) {
        console.error('Error loading app state:', error);
      }
    };
    
    loadAppState();
  }, []);

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: Colors.primary,
            },
            headerTintColor: Colors.text,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="auth" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="(tabs)" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="voice-conversation" 
            options={{ 
              title: 'Voice Conversation',
              presentation: 'modal'
            }} 
          />
        </Stack>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
