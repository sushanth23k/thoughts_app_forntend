import AsyncStorage from '@react-native-async-storage/async-storage';
import { Thought } from '../types/types';

const THOUGHTS_STORAGE_KEY = 'thoughts_app_thoughts';

export const saveThought = async (thought: Thought): Promise<void> => {
  try {
    const existingThoughtsJSON = await AsyncStorage.getItem(THOUGHTS_STORAGE_KEY);
    const existingThoughts: Thought[] = existingThoughtsJSON 
      ? JSON.parse(existingThoughtsJSON) 
      : [];
    
    const updatedThoughts = [thought, ...existingThoughts];
    await AsyncStorage.setItem(THOUGHTS_STORAGE_KEY, JSON.stringify(updatedThoughts));
  } catch (error) {
    console.error('Error saving thought:', error);
  }
};

export const loadThoughts = async (): Promise<Thought[]> => {
  try {
    const thoughtsJSON = await AsyncStorage.getItem(THOUGHTS_STORAGE_KEY);
    return thoughtsJSON ? JSON.parse(thoughtsJSON) : [];
  } catch (error) {
    console.error('Error loading thoughts:', error);
    return [];
  }
}; 