import { useState } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { useSettingsStore } from '@/store/settings';

const slides = ['title1', 'title2', 'title3'] as const;
const descs = ['desc1', 'desc2', 'desc3'] as const;

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);

  const finish = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-background p-6 justify-center">
      <View className="bg-primary/10 rounded-3xl p-8 mb-8">
        <Text className="text-primary text-2xl font-bold mb-3">
          {t(`onboarding.${slides[step]}`)}
        </Text>
        <Text className="text-stone-600 text-base leading-6">
          {t(`onboarding.${descs[step]}`)}
        </Text>
      </View>
      <View className="flex-row justify-center gap-2 mb-8">
        {slides.map((_, i) => (
          <View
            key={i}
            className={`h-2 rounded-full ${i === step ? 'w-8 bg-primary' : 'w-2 bg-stone-300'}`}
          />
        ))}
      </View>
      {step < 2 ? (
        <View className="gap-3">
          <Button title={t('common.save').replace('Save', 'Next') || 'Next'} onPress={() => setStep(step + 1)} />
          <Button title={t('onboarding.skip')} variant="ghost" onPress={finish} />
        </View>
      ) : (
        <Button title={t('onboarding.getStarted')} onPress={finish} />
      )}
    </View>
  );
}
