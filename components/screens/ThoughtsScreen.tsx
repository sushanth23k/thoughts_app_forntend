import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView } from 'react-native';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import ThoughtsList from '../thoughts/ThoughtsList';
import ChatInterface from '../chat/ChatInterface';
import Header from '../ui/Header';
import { Thought } from '../../types/types';
import { loadThoughts, saveThought } from '../../utils/storage';

const ThoughtsScreen = () => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [activeTab, setActiveTab] = useState<'thoughts' | 'chat'>('thoughts');

  useEffect(() => {
    const fetchThoughts = async () => {
      const loadedThoughts = await loadThoughts();
      setThoughts(loadedThoughts);
    };
    
    fetchThoughts();
  }, []);

  const addThought = async (content: string) => {
    const newThought: Thought = {
      id: Date.now().toString(),
      content,
      createdAt: new Date().toISOString(),
    };
    
    const updatedThoughts = [newThought, ...thoughts];
    setThoughts(updatedThoughts);
    await saveThought(newThought);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      <View style={styles.content}>
        {activeTab === 'thoughts' ? (
          <ThoughtsList thoughts={thoughts} />
        ) : (
          <ChatInterface onNewThought={addThought} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Layout.spacing.medium,
  },
});

export default ThoughtsScreen; 