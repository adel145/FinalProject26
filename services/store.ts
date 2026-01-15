import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, Language, HistoryEvent, GeoLocation } from '../types';

interface AppState {
  user: UserProfile | null;
  language: Language;
  history: HistoryEvent[];
  location: GeoLocation | null;
  
  // Actions
  setUser: (user: UserProfile | null) => void;
  setLanguage: (lang: Language) => void;
  setLocation: (loc: GeoLocation) => void;
  addHistory: (event: Omit<HistoryEvent, 'id' | 'timestamp'>) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      language: 'he', // Default to Hebrew
      history: [],
      location: null,

      setUser: (user) => set({ user }),
      
      setLanguage: (language) => {
        set({ language });
        document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
        document.documentElement.lang = language;
      },

      setLocation: (location) => set({ location }),

      addHistory: (event) => {
        const newEvent: HistoryEvent = {
          ...event,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          userId: get().user?.id || 'guest'
        };
        set((state) => ({ history: [newEvent, ...state.history] }));
      },

      logout: () => set({ user: null })
    }),
    {
      name: 'miktsoan-storage',
      partialize: (state) => ({ 
        user: state.user, 
        language: state.language, 
        history: state.history 
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
            document.documentElement.dir = state.language === 'en' ? 'ltr' : 'rtl';
            document.documentElement.lang = state.language;
        }
      }
    }
  )
);