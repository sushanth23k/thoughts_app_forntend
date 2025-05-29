import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStore } from '../constants/Store';
import Colors from '../constants/Colors';
import Button from './Button';

const ProfileScreen: React.FC = () => {
  const { user, logout, conversations, thoughts } = useStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/auth' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="person" size={40} color={Colors.white} />
          </View>
          <Text style={styles.username}>{user?.username || 'Guest'}</Text>
          {user?.isGuest && (
            <Text style={styles.guestLabel}>Guest Account</Text>
          )}
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{conversations.length}</Text>
            <Text style={styles.statLabel}>Conversations</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{thoughts.length}</Text>
            <Text style={styles.statLabel}>Thoughts</Text>
          </View>
        </View>
        
        <View style={styles.optionsContainer}>
          <Text style={styles.sectionTitle}>Options</Text>
          
          <Pressable style={styles.optionItem}>
            <MaterialIcons name="settings" size={24} color={Colors.text} />
            <Text style={styles.optionLabel}>Settings</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.text} />
          </Pressable>
          
          <Pressable style={styles.optionItem}>
            <MaterialIcons name="help" size={24} color={Colors.text} />
            <Text style={styles.optionLabel}>Help & Support</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.text} />
          </Pressable>
          
          <Pressable style={styles.optionItem}>
            <MaterialIcons name="info" size={24} color={Colors.text} />
            <Text style={styles.optionLabel}>About</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.text} />
          </Pressable>
        </View>
        
        <Button 
          title="Logout" 
          onPress={handleLogout} 
          variant="outline"
          style={styles.logoutButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  guestLabel: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.6,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.6,
  },
  optionsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  logoutButton: {
    marginTop: 'auto',
  },
});

export default ProfileScreen; 