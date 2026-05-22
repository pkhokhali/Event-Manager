import { Pressable, Text, type PressableProps } from 'react-native';

type Props = PressableProps & {
  title: string;
  variant?: 'primary' | 'outline' | 'ghost';
};

export function Button({ title, variant = 'primary', className, ...props }: Props) {
  const base = 'px-4 py-3 rounded-xl items-center';
  const variants = {
    primary: 'bg-primary',
    outline: 'border-2 border-primary',
    ghost: 'bg-transparent',
  };
  const textVariants = {
    primary: 'text-white font-semibold',
    outline: 'text-primary font-semibold',
    ghost: 'text-primary',
  };
  return (
    <Pressable className={`${base} ${variants[variant]} ${className ?? ''}`} {...props}>
      <Text className={textVariants[variant]}>{title}</Text>
    </Pressable>
  );
}
