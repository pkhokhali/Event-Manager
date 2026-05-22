import { View, Text, ScrollView, Image, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { useEventsStore } from '@/store/events';

export default function HomeScreen() {
  const { t } = useTranslation();
  const events = useEventsStore((s) => s.events);

  const banners = useQuery({
    queryKey: ['banners'],
    queryFn: async () => (await api.get('/banners')).data.data,
  });

  const featured = useQuery({
    queryKey: ['featured'],
    queryFn: async () => (await api.get('/featured')).data.data,
  });

  const festivals = useQuery({
    queryKey: ['festivals-upcoming'],
    queryFn: async () =>
      (await api.get('/festivals', { params: { limit: 5 } })).data.data,
  });

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4 pb-8">
      <Text className="text-2xl font-bold text-primary mb-4">{t('appName')}</Text>

      {banners.data?.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {banners.data.map((b: { id: string; imageUrl: string; title: string }) => (
            <Image
              key={b.id}
              source={{ uri: b.imageUrl }}
              className="w-72 h-36 rounded-2xl mr-3"
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      <Text className="text-lg font-semibold text-stone-800 mb-2">{t('home.myEvents')}</Text>
      {events.slice(0, 3).map((e) => (
        <Pressable key={e.id} onPress={() => router.push(`/event/${e.id}`)}>
          <Card className="mb-2">
            <Text className="font-semibold text-primary">{e.title}</Text>
            <Text className="text-stone-500 text-sm">{e.date}</Text>
          </Card>
        </Pressable>
      ))}
      {events.length === 0 && (
        <Card>
          <Text className="text-stone-500">{t('events.empty')}</Text>
        </Card>
      )}

      <Text className="text-lg font-semibold text-stone-800 mt-4 mb-2">
        {t('home.upcomingFestivals')}
      </Text>
      {(festivals.data ?? []).map((f: { id: string; nameEn: string; nameNe: string; gregorianDate: string }) => (
        <Card key={f.id} className="mb-2">
          <Text className="font-medium">{f.nameEn}</Text>
          <Text className="text-stone-500 text-sm">{new Date(f.gregorianDate).toDateString()}</Text>
        </Card>
      ))}

      <Text className="text-lg font-semibold text-stone-800 mt-4 mb-2">{t('home.featured')}</Text>
      {(featured.data ?? []).map((f: { id: string; title: string }) => (
        <Card key={f.id} className="mb-2">
          <Text>{f.title}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}
