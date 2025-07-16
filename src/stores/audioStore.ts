import { create } from 'zustand';
import { TTSService, TTSSettings } from '@/services/TTSService';

interface Email {
  id: string;
  sender: string;
  subject: string;
  content: string;
  isRead: boolean;
}

interface AudioState {
  isPlaying: boolean;
  currentEmailId: string | null;
  queue: Email[];
  currentIndex: number;
  progress: number;
  duration: number;
  settings: TTSSettings;
  isLoading: boolean;
}

interface AudioActions {
  addToQueue: (email: Email) => void;
  removeFromQueue: (emailId: string) => void;
  playNext: () => void;
  playPrevious: () => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seekTo: (time: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setVoice: (voice: string) => void;
  updateProgress: () => void;
  playEmail: (email: Email) => void;
  clearQueue: () => void;
}

export const useAudioStore = create<AudioState & AudioActions>((set, get) => ({
  // State
  isPlaying: false,
  currentEmailId: null,
  queue: [],
  currentIndex: 0,
  progress: 0,
  duration: 0,
  settings: {
    voice: 'default',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0
  },
  isLoading: false,

  // Actions
  addToQueue: (email) => {
    set((state) => ({
      queue: [...state.queue, email]
    }));
  },

  removeFromQueue: (emailId) => {
    set((state) => ({
      queue: state.queue.filter((email) => email.id !== emailId)
    }));
  },

  playNext: async () => {
    const state = get();
    const nextIndex = state.currentIndex + 1;
    
    if (nextIndex < state.queue.length) {
      set({ currentIndex: nextIndex });
      await get().playEmail(state.queue[nextIndex]);
    }
  },

  playPrevious: async () => {
    const state = get();
    const prevIndex = state.currentIndex - 1;
    
    if (prevIndex >= 0) {
      set({ currentIndex: prevIndex });
      await get().playEmail(state.queue[prevIndex]);
    }
  },

  play: () => {
    TTSService.resumeAudio();
    set({ isPlaying: true });
  },

  pause: () => {
    TTSService.pauseAudio();
    set({ isPlaying: false });
  },

  stop: () => {
    TTSService.stopAudio();
    set({ isPlaying: false, progress: 0 });
  },

  seekTo: (time) => {
    TTSService.setCurrentTime(time);
    set({ progress: time });
  },

  setPlaybackSpeed: (rate) => {
    TTSService.setPlaybackRate(rate);
    set((state) => ({
      settings: { ...state.settings, rate }
    }));
  },

  setVoice: (voice) => {
    set((state) => ({
      settings: { ...state.settings, voice }
    }));
  },

  updateProgress: () => {
    const currentTime = TTSService.getCurrentTime();
    const duration = TTSService.getDuration();
    set({ progress: currentTime, duration });
  },

  playEmail: async (email) => {
    const state = get();
    set({ isLoading: true, currentEmailId: email.id });

    try {
      const emailText = `Email from ${email.sender}. Subject: ${email.subject}. ${email.content}`;
      await TTSService.generateSpeech(emailText, state.settings);
      
      set({ isPlaying: true, isLoading: false });

      // Start progress tracking
      const progressInterval = setInterval(() => {
        if (TTSService.isPlaying()) {
          get().updateProgress();
        } else {
          clearInterval(progressInterval);
          set({ isPlaying: false });
          // Auto-play next email
          get().playNext();
        }
      }, 1000);

    } catch (error) {
      console.error('Error playing email:', error);
      set({ isLoading: false, isPlaying: false });
    }
  },

  clearQueue: () => {
    set({ queue: [], currentIndex: 0, currentEmailId: null });
  }
}));