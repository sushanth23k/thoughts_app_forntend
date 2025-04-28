export interface Thought {
  id: string;
  content: string;
  created: Date;
  conversationId: string;
}

export interface Conversation {
  id: string;
  title: string;
  created: Date;
  thoughts: Thought[];
}

export type ConversationState = 'begin' | 'active' | 'end';

export interface User {
  id: string;
  username: string;
  email?: string;
  isGuest: boolean;
}

export interface AudioState {
  isRecording: boolean;
  isPaused: boolean;
  frequencies: number[];
}

export interface AppState {
  user: User | null;
  currentConversation: Conversation | null;
  conversations: Conversation[];
  thoughts: Thought[];
  conversationState: ConversationState;
  audioState: AudioState;
} 