import { ScrollView, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({
  children,
  scroll,
  className,
}: ViewProps & { scroll?: boolean }) {
  const content = scroll ? (
    <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8">
      {children}
    </ScrollView>
  ) : (
    <View className="flex-1 p-4">{children}</View>
  );

  return (
    <SafeAreaView className={`flex-1 bg-background dark:bg-stone-950 ${className ?? ''}`}>
      {content}
    </SafeAreaView>
  );
}
