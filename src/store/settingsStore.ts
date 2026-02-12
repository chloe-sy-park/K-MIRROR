import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserPreferences } from '@/types';

interface SettingsState {
  prefs: UserPreferences;
  isSensitive: boolean;
  isOnboarded: boolean;

  setPrefs: (prefs: UserPreferences) => void;
  toggleSensitive: () => void;
  completeOnboarding: (prefs: UserPreferences) => void;
  resetData: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      prefs: { environment: 'Office', skill: 'Beginner', mood: 'Natural' },
      isSensitive: false,
      isOnboarded: false,

      setPrefs: (prefs) => set({ prefs }),
      toggleSensitive: () => set((s) => ({ isSensitive: !s.isSensitive })),
      completeOnboarding: (prefs) => set({ prefs, isOnboarded: true }),
      resetData: () => set({ isOnboarded: false, prefs: { environment: 'Office', skill: 'Beginner', mood: 'Natural' } }),
    }),
    { name: 'kmirror_settings' }
  )
);
