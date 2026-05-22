import { create } from 'zustand';
import { storage } from '../lib/storage';

type SettingsState = {
  locale: 'en' | 'ne';
  darkMode: boolean;
  onboardingDone: boolean;
  setLocale: (l: 'en' | 'ne') => void;
  setDarkMode: (v: boolean) => void;
  completeOnboarding: () => void;
  hydrate: () => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  locale: (storage.getString('locale') as 'en' | 'ne') ?? 'en',
  darkMode: storage.getBoolean('darkMode') ?? false,
  onboardingDone: storage.getBoolean('onboardingDone') ?? false,
  setLocale: (locale) => {
    storage.set('locale', locale);
    set({ locale });
  },
  setDarkMode: (darkMode) => {
    storage.set('darkMode', darkMode);
    set({ darkMode });
  },
  completeOnboarding: () => {
    storage.set('onboardingDone', true);
    set({ onboardingDone: true });
  },
  hydrate: () =>
    set({
      locale: (storage.getString('locale') as 'en' | 'ne') ?? 'en',
      darkMode: storage.getBoolean('darkMode') ?? false,
      onboardingDone: storage.getBoolean('onboardingDone') ?? false,
    }),
}));
