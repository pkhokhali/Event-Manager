import { View, Text, Switch, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/store/settings';
import i18n from '@/lib/i18n';
import { Card } from '@/components/ui/Card';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { locale, darkMode, setLocale, setDarkMode } = useSettingsStore();

  return (
    <View className="flex-1 bg-background p-4">
      <Card className="mb-4">
        <Text className="font-semibold mb-2">{t('settings.language')}</Text>
        <View className="flex-row gap-2">
          <Pressable
            className={`px-4 py-2 rounded-full ${locale === 'en' ? 'bg-primary' : 'bg-stone-200'}`}
            onPress={() => {
              setLocale('en');
              i18n.changeLanguage('en');
            }}
          >
            <Text className={locale === 'en' ? 'text-white' : ''}>English</Text>
          </Pressable>
          <Pressable
            className={`px-4 py-2 rounded-full ${locale === 'ne' ? 'bg-primary' : 'bg-stone-200'}`}
            onPress={() => {
              setLocale('ne');
              i18n.changeLanguage('ne');
            }}
          >
            <Text className={locale === 'ne' ? 'text-white' : ''}>नेपाली</Text>
          </Pressable>
        </View>
      </Card>
      <Card className="mb-4 flex-row justify-between items-center">
        <Text className="font-semibold">{t('settings.darkMode')}</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: '#8B1A1A' }} />
      </Card>
      <Card>
        <Text className="font-semibold">{t('settings.about')}</Text>
        <Text className="text-stone-500 mt-2">Event Manager v1.0.0</Text>
        <Text className="text-stone-400 text-sm mt-1">Nepal-focused event planning</Text>
      </Card>
    </View>
  );
}
