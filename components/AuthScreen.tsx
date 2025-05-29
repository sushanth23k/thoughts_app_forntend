import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import { APP_NAME } from '../constants/AppConstants';
import Button from './Button';
import { useStore } from '../constants/Store';

const AuthScreen: React.FC = () => {
  const router = useRouter();
  const loginAsGuest = useStore((state) => state.loginAsGuest);

  const handleLogin = () => {
    // For now, just redirect to guest mode since we're not implementing full auth
    handleGuestAccess();
  };

  const handleSignup = () => {
    // For now, just redirect to guest mode since we're not implementing full auth
    handleGuestAccess();
  };

  const handleGuestAccess = () => {
    loginAsGuest();
    router.replace('/(tabs)/conversation' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          {/* Placeholder logo - replace with actual logo */}
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>T</Text>
          </View>
          <Text style={styles.appName}>{APP_NAME}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Login"
            onPress={handleLogin}
            variant="primary"
            fullWidth
          />
          <Button
            title="Sign Up"
            onPress={handleSignup}
            variant="outline"
            fullWidth
          />
          <Button
            title="Continue as Guest"
            onPress={handleGuestAccess}
            variant="secondary"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: Colors.white,
    fontSize: 48,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
});

export default AuthScreen; 