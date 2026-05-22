import { useEffect } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { getDeviceId } from '@/store/device';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function NotificationsScreen() {
  const { t } = useTranslation();

  const { data } = useQuery({
    queryKey: ['notifications-feed'],
    queryFn: async () => (await api.get('/notifications/feed')).data.data,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      try {
        await api.post('/notifications/devices/register', {
          deviceId: getDeviceId(),
          fcmToken: token,
          platform: 'android',
        });
      } catch {
        // API may be offline in dev
      }
    })();
  }, []);

  const items = data ?? [];

  return (
    <View className="flex-1 bg-background p-4">
      {items.length === 0 ? (
        <EmptyState message={t('notifications.empty')} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item: { id: string }) => item.id}
          renderItem={({ item }: { item: { title: string; body: string; sentAt?: string } }) => (
            <Card className="mb-2">
              <Text className="font-semibold text-primary">{item.title}</Text>
              <Text className="text-stone-600">{item.body}</Text>
              {item.sentAt && (
                <Text className="text-xs text-stone-400 mt-1">
                  {new Date(item.sentAt).toLocaleString()}
                </Text>
              )}
            </Card>
          )}
        />
      )}
    </View>
  );
}
