import { View, Text, FlatList, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEventsStore } from '@/store/events';
import { Card } from '@/components/ui/Card';

export default function TimelineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const tasks = useEventsStore((s) => s.getTasksByEvent(id!));
  const toggleTask = useEventsStore((s) => s.toggleTask);
  const done = tasks.filter((t) => t.isCompleted).length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <View className="flex-1 bg-background p-4">
      <Card className="mb-4">
        <Text className="font-semibold">{t('events.tasks')}</Text>
        <View className="h-2 bg-stone-200 rounded mt-2 overflow-hidden">
          <View className="h-full bg-accent" style={{ width: `${progress}%` }} />
        </View>
        <Text className="text-stone-500 text-sm mt-1">{done}/{tasks.length} ({progress}%)</Text>
      </Card>
      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => toggleTask(item.id)}>
            <Card className={`mb-2 ${item.isCompleted ? 'opacity-60' : ''}`}>
              <Text className={item.isCompleted ? 'line-through text-stone-500' : 'font-medium'}>
                {item.isCompleted ? '✓ ' : '○ '}{item.title}
              </Text>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}
