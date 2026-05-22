import { View } from 'react-native';

export function Skeleton({ className }: { className?: string }) {
  return <View className={`bg-stone-200 dark:bg-stone-700 rounded-lg animate-pulse ${className ?? 'h-4 w-full'}`} />;
}
