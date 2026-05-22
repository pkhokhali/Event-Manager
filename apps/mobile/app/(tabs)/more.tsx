import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';

const links = [
  { route: '/notifications' as const, icon: 'notifications', labelKey: 'notifications.title' },
  { route: '/settings' as const, icon: 'settings', labelKey: 'settings.title' },
];

export default function MoreScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-background p-4">
      {links.map((l) => (
        <Pressable key={l.route} onPress={() => router.push(l.route)}>
          <Card className="mb-3 flex-row items-center">
            <Ionicons name={l.icon as 'notifications'} size={24} color="#8B1A1A" />
            <Text className="ml-3 text-lg font-medium text-stone-800">{t(l.labelKey)}</Text>
          </Card>
        </Pressable>
      ))}
    </View>
  );
}
