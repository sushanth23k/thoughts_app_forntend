import { create } from 'zustand';
import { AppState, Conversation, Thought, ConversationState } from './Types';
import { generateUniqueId } from './Utils';

const initialState: AppState = {
  user: null,
  currentConversation: null,
  conversations: [],
  thoughts: [],
  conversationState: 'begin',
  audioState: {
    isRecording: false,
    isPaused: false,
    frequencies: [],
    lastFrequencyTime: 0,
    lowFrequencyCount: 0,
    conversationMode: 'speaking'
  },
};

export const useStore = create<AppState & {
  // User actions
  loginAsGuest: () => void;
  logout: () => void;
  
  // Conversation actions
  startConversation: () => void;
  endConversation: () => void;
  setConversationState: (state: ConversationState) => void;
  setConversationMode: (mode: 'speaking' | 'listening') => void;
  
  // Audio actions
  startRecording: () => void;
  stopRecording: () => void;
  pauseRecording: () => void;
  updateFrequencies: (frequencies: number[]) => void;
  
  // Thought actions
  addThought: (content: string) => void;
}>((set) => ({
  ...initialState,
  
  // User actions
  loginAsGuest: () => set((state) => ({
    user: {
      id: generateUniqueId(),
      username: 'Guest',
      isGuest: true,
    },
  })),
  
  logout: () => set(initialState),
  
  // Conversation actions
  startConversation: () => set((state) => {
    const newConversation: Conversation = {
      id: generateUniqueId(),
      title: `Conversation ${state.conversations.length + 1}`,
      created: new Date(),
      thoughts: [],
    };
    
    return {
      currentConversation: newConversation,
      conversations: [...state.conversations, newConversation],
      conversationState: 'active',
      audioState: {
        ...state.audioState,
        conversationMode: 'speaking'
      }
    };
  }),
  
  endConversation: () => set((state) => ({
    conversationState: 'end',
  })),
  
  setConversationState: (state: ConversationState) => set(() => ({
    conversationState: state,
  })),

  setConversationMode: (mode: 'speaking' | 'listening') => set((state) => ({
    audioState: {
      ...state.audioState,
      conversationMode: mode,
      lastFrequencyTime: Date.now(),
      lowFrequencyCount: 0
    }
  })),
  
  // Audio actions
  startRecording: () => set((state) => ({
    audioState: {
      ...state.audioState,
      isRecording: true,
      isPaused: false,
      lastFrequencyTime: Date.now(),
      lowFrequencyCount: 0
    },
  })),
  
  stopRecording: () => set((state) => ({
    audioState: {
      ...state.audioState,
      isRecording: false,
      isPaused: false,
      frequencies: [],
      lastFrequencyTime: 0,
      lowFrequencyCount: 0
    },
  })),
  
  pauseRecording: () => set((state) => ({
    audioState: {
      ...state.audioState,
      isPaused: !state.audioState.isPaused,
    },
  })),
  
  updateFrequencies: (frequencies: number[]) => set((state) => {
    const now = Date.now();
    const avgFrequency = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
    const isLowFrequency = avgFrequency < 30;
    const timeSinceLastFrequency = now - state.audioState.lastFrequencyTime;
    
    let lowFrequencyCount = state.audioState.lowFrequencyCount;
    if (isLowFrequency && timeSinceLastFrequency >= 1000) {
      lowFrequencyCount += 1;
    } else if (!isLowFrequency) {
      lowFrequencyCount = 0;
    }

    return {
      audioState: {
        ...state.audioState,
        frequencies,
        lastFrequencyTime: now,
        lowFrequencyCount
      }
    };
  }),
  
  // Thought actions
  addThought: (content: string) => set((state) => {
    if (!state.currentConversation) return state;
    
    const newThought: Thought = {
      id: generateUniqueId(),
      content,
      created: new Date(),
      conversationId: state.currentConversation.id,
    };
    
    const updatedConversation = {
      ...state.currentConversation,
      thoughts: [...state.currentConversation.thoughts, newThought],
    };
    
    return {
      thoughts: [...state.thoughts, newThought],
      currentConversation: updatedConversation,
      conversations: state.conversations.map(conv => 
        conv.id === updatedConversation.id ? updatedConversation : conv
      ),
    };
  }),
})); 