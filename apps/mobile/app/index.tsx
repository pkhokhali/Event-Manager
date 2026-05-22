import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/store/settings';

SplashScreen.preventAutoHideAsync();

export default function SplashScreenPage() {
  const { t } = useTranslation();
  const onboardingDone = useSettingsStore((s) => s.onboardingDone);

  useEffect(() => {
    const timer = setTimeout(async () => {
      await SplashScreen.hideAsync();
      if (onboardingDone) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [onboardingDone]);

  return (
    <View className="flex-1 bg-primary items-center justify-center">
      <Text className="text-white text-3xl font-bold mb-2">{t('appName')}</Text>
      <Text className="text-accent text-base mb-8">{t('splash')}</Text>
      <ActivityIndicator color="#BA7517" size="large" />
    </View>
  );
}
