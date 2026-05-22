import { useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';

function daysUntil(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function CalendarScreen() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'gregorian' | 'bikram'>('gregorian');

  const { data } = useQuery({
    queryKey: ['festivals'],
    queryFn: async () => (await api.get('/festivals', { params: { limit: 50 } })).data.data,
  });

  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row gap-2 mb-4">
        <Pressable
          className={`px-4 py-2 rounded-full ${mode === 'gregorian' ? 'bg-primary' : 'bg-stone-200'}`}
          onPress={() => setMode('gregorian')}
        >
          <Text className={mode === 'gregorian' ? 'text-white' : 'text-stone-600'}>
            {t('calendar.gregorian')}
          </Text>
        </Pressable>
        <Pressable
          className={`px-4 py-2 rounded-full ${mode === 'bikram' ? 'bg-primary' : 'bg-stone-200'}`}
          onPress={() => setMode('bikram')}
        >
          <Text className={mode === 'bikram' ? 'text-white' : 'text-stone-600'}>
            {t('calendar.bikram')}
          </Text>
        </Pressable>
      </View>
      <FlatList
        data={data ?? []}
        keyExtractor={(item: { id: string }) => item.id}
        renderItem={({ item }: { item: { id: string; nameEn: string; nameNe: string; gregorianDate: string; bikramDate?: string; tithiLabel?: string } }) => (
          <Card className="mb-2">
            <Text className="font-semibold text-primary">{item.nameEn}</Text>
            <Text className="text-stone-500">{item.nameNe}</Text>
            <Text className="text-sm mt-1">
              {mode === 'bikram' && item.bikramDate
                ? item.bikramDate
                : new Date(item.gregorianDate).toDateString()}
            </Text>
            {item.tithiLabel && <Text className="text-accent text-sm">{item.tithiLabel}</Text>}
            <Text className="text-primary font-bold mt-1">
              {t('calendar.countdown')}: {daysUntil(item.gregorianDate)}d
            </Text>
          </Card>
        )}
      />
    </View>
  );
}
