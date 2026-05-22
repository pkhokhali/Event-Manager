import { View, Text, Linking, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import MapView, { Marker } from 'react-native-maps';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export default function VendorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => (await api.get(`/vendors/${id}`)).data.data,
  });

  if (isLoading) return <Skeleton className="h-40 m-4" />;
  if (!vendor) return <Text className="p-4">Vendor not found</Text>;

  const call = () => vendor.phone && Linking.openURL(`tel:${vendor.phone}`);
  const email = () => vendor.email && Linking.openURL(`mailto:${vendor.email}`);

  return (
    <View className="flex-1 bg-background p-4">
      <Card>
        <Text className="text-2xl font-bold text-primary">{vendor.name}</Text>
        {vendor.nameNe && <Text className="text-stone-500">{vendor.nameNe}</Text>}
        <Text className="text-accent mt-1">★ {vendor.rating} ({vendor.reviewCount} reviews)</Text>
        <Text className="text-stone-600 mt-2">{vendor.category}</Text>
        {vendor.description && <Text className="mt-2">{vendor.description}</Text>}
        {vendor.priceMin != null && (
          <Text className="mt-2 font-semibold">
            NPR {vendor.priceMin?.toLocaleString()} - {vendor.priceMax?.toLocaleString()}
          </Text>
        )}
      </Card>
      <View className="flex-row gap-2 mt-4">
        <Button title="Call" onPress={call} className="flex-1" />
        <Button title="Email" variant="outline" onPress={email} className="flex-1" />
      </View>
      {vendor.latitude && vendor.longitude && (
        <MapView
          className="h-48 w-full rounded-2xl mt-4"
          initialRegion={{
            latitude: vendor.latitude,
            longitude: vendor.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={{ latitude: vendor.latitude, longitude: vendor.longitude }} title={vendor.name} />
        </MapView>
      )}
      {(vendor.reviews ?? []).map((r: { id: string; rating: number; comment?: string }) => (
        <Card key={r.id} className="mt-2">
          <Text>★ {r.rating}</Text>
          <Text className="text-stone-600">{r.comment}</Text>
        </Card>
      ))}
    </View>
  );
}
