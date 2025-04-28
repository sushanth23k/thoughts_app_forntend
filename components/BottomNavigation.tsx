import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const tabs = [
  {
    name: 'Conversation',
    icon: 'record-voice-over',
    path: '(tabs)/conversation',
  },
  {
    name: 'History',
    icon: 'history',
    path: '(tabs)/history',
  },
  {
    name: 'Thoughts',
    icon: 'psychology',
    path: '(tabs)/thoughts',
  },
  {
    name: 'Profile',
    icon: 'person',
    path: '(tabs)/profile',
  },
];

const BottomNavigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname.includes(tab.name.toLowerCase());
        return (
          <Pressable
            key={tab.name}
            style={styles.tabButton}
            onPress={() => router.push(tab.name.toLowerCase() as any)}
          >
            <MaterialIcons
              name={tab.icon as any}
              size={24}
              color={isActive ? Colors.text : Colors.accent}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? Colors.text : Colors.accent },
              ]}
            >
              {tab.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: Colors.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.accent,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default BottomNavigation; 