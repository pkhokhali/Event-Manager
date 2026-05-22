import { Text, View } from 'react-native';

export function EmptyState({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-stone-500 text-center text-base">{message}</Text>
    </View>
  );
}
