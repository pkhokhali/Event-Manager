import { TextInput, Text, View, type TextInputProps } from 'react-native';

type Props = TextInputProps & { label?: string };

export function Input({ label, className, ...props }: Props) {
  return (
    <View className="mb-3">
      {label && <Text className="text-stone-600 dark:text-stone-400 mb-1 text-sm">{label}</Text>}
      <TextInput
        className={`border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2.5 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 ${className ?? ''}`}
        placeholderTextColor="#9ca3af"
        {...props}
      />
    </View>
  );
}
