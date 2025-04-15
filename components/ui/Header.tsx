import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

type HeaderProps = {
  activeTab: 'thoughts' | 'chat';
  onTabChange: (tab: 'thoughts' | 'chat') => void;
};

const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thoughts</Text>
      
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'thoughts' && styles.activeTab
          ]}
          onPress={() => onTabChange('thoughts')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'thoughts' && styles.activeTabText
          ]}>
            My Thoughts
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'chat' && styles.activeTab
          ]}
          onPress={() => onTabChange('chat')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'chat' && styles.activeTabText
          ]}>
            Chat
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingTop: Layout.spacing.large,
    paddingBottom: Layout.spacing.medium,
    paddingHorizontal: Layout.spacing.medium,
    borderBottomLeftRadius: Layout.borderRadius,
    borderBottomRightRadius: Layout.borderRadius,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.background,
    marginBottom: Layout.spacing.medium,
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    paddingVertical: Layout.spacing.small,
    paddingHorizontal: Layout.spacing.medium,
    marginRight: Layout.spacing.small,
    borderRadius: Layout.borderRadius,
  },
  activeTab: {
    backgroundColor: Colors.background,
  },
  tabText: {
    color: Colors.background,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
  },
});

export default Header; 