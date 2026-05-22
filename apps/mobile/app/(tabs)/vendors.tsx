import { useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function VendorsScreen() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['vendors', search],
    queryFn: async () =>
      (await api.get('/vendors', { params: { search, limit: 30 } })).data,
  });

  const vendors = data?.data ?? [];

  return (
    <View className="flex-1 bg-background p-4">
      <TextInput
        className="border border-stone-200 rounded-xl px-3 py-2 mb-4 bg-white"
        placeholder={t('vendors.search')}
        value={search}
        onChangeText={setSearch}
      />
      {isLoading ? (
        <Skeleton className="h-20 mb-2" />
      ) : (
        <FlatList
          data={vendors}
          keyExtractor={(item: { id: string }) => item.id}
          renderItem={({ item }: { item: { id: string; name: string; category: string; city?: string; rating: number } }) => (
            <Pressable onPress={() => router.push(`/vendor/${item.id}`)}>
              <Card className="mb-2">
                <Text className="font-semibold text-primary">{item.name}</Text>
                <Text className="text-stone-500 text-sm">
                  {item.category} • {item.city} • ★ {item.rating}
                </Text>
              </Card>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
