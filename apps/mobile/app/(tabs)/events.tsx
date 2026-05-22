import { View, Text, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEventsStore } from '@/store/events';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

export default function EventsScreen() {
  const { t } = useTranslation();
  const { events, deleteEvent, duplicateEvent } = useEventsStore();

  return (
    <View className="flex-1 bg-background p-4">
      <Button title={t('events.create')} onPress={() => router.push('/event/create')} className="mb-4" />
      {events.length === 0 ? (
        <EmptyState message={t('events.empty')} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card className="mb-3">
              <Pressable onPress={() => router.push(`/event/${item.id}`)}>
                <Text className="text-lg font-semibold text-primary">{item.title}</Text>
                <Text className="text-stone-500">{item.date} {item.time}</Text>
                {item.venue && <Text className="text-stone-400 text-sm">{item.venue}</Text>}
              </Pressable>
              <View className="flex-row gap-3 mt-3">
                <Pressable onPress={() => duplicateEvent(item.id)}>
                  <Text className="text-accent text-sm">{t('events.duplicate')}</Text>
                </Pressable>
                <Pressable onPress={() => deleteEvent(item.id)}>
                  <Text className="text-red-600 text-sm">{t('events.delete')}</Text>
                </Pressable>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}
