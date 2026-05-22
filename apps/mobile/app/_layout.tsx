import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useSettingsStore } from '@/store/settings';
import { useEventsStore } from '@/store/events';
import '@/lib/i18n';
import i18n from '@/lib/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const { locale, darkMode, hydrate } = useSettingsStore();

  useEffect(() => {
    hydrate();
    useEventsStore.getState().hydrate();
  }, []);

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="event/create" options={{ headerShown: true, title: 'Create Event' }} />
        <Stack.Screen name="event/[id]" options={{ headerShown: true, title: 'Event' }} />
        <Stack.Screen name="event/[id]/guests" options={{ headerShown: true, title: 'Guests' }} />
        <Stack.Screen name="event/[id]/budget" options={{ headerShown: true, title: 'Budget' }} />
        <Stack.Screen name="event/[id]/timeline" options={{ headerShown: true, title: 'Timeline' }} />
        <Stack.Screen name="vendor/[id]" options={{ headerShown: true, title: 'Vendor' }} />
        <Stack.Screen name="notifications" options={{ headerShown: true, title: 'Notifications' }} />
        <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings' }} />
      </Stack>
    </QueryClientProvider>
  );
}
