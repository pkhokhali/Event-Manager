import { View, type ViewProps } from 'react-native';

export function Card({ children, className, ...props }: ViewProps) {
  return (
    <View
      className={`bg-surface dark:bg-stone-900 rounded-2xl p-4 shadow-sm border border-stone-100 dark:border-stone-800 ${className ?? ''}`}
      {...props}
    >
      {children}
    </View>
  );
}
