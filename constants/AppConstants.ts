// App Information
export const APP_NAME = 'Thoughts';

// API Endpoints
export const API_BASE_URL = 'https://api.thoughtsapp.example'; // Replace with actual API URL
export const API_ENDPOINTS = {
  START_CONVERSATION: '/api/start_conversation',
  CONVERSATION_LOOP: '/api/conversation_loop',
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
};

// Audio Configuration
export const AUDIO_CONFIG = {
  SILENCE_THRESHOLD: 0.1, // 0-1 scale (0 = silence, 1 = max volume)
  SILENCE_DURATION: 3000, // milliseconds before auto-stopping on silence
  RECORDING_MAX_DURATION: 60000, // milliseconds (1 minute max recording)
  SAMPLE_RATE: 44100,
  FFT_SIZE: 1024,
};

// Storage Keys
export const STORAGE_KEYS = {
  USER: '@Thoughts:user',
  CONVERSATIONS: '@Thoughts:conversations',
  THOUGHTS: '@Thoughts:thoughts',
}; 