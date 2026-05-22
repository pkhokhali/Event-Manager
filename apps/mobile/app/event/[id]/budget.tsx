import { useState, useMemo } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ExpenseCategory, PaymentStatus } from '@event-manager/shared';
import { useEventsStore } from '@/store/events';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function BudgetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const event = useEventsStore((s) => s.events.find((e) => e.id === id));
  const { getExpensesByEvent, addExpense, deleteExpense } = useEventsStore();
  const expenses = getExpensesByEvent(id!);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  const spent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const total = event?.budget ?? 0;
  const remaining = total - spent;
  const alert = total > 0 && spent / total > 0.85;

  return (
    <View className="flex-1 bg-background p-4">
      <Card className="mb-4">
        <Text>{t('budget.total')}: NPR {total.toLocaleString()}</Text>
        <Text className="text-red-700">{t('budget.spent')}: NPR {spent.toLocaleString()}</Text>
        <Text className="text-green-700 font-bold">{t('budget.remaining')}: NPR {remaining.toLocaleString()}</Text>
        {alert && <Text className="text-amber-600 mt-2">{t('budget.alert')}</Text>}
      </Card>
      <Input label="Expense title" value={title} onChangeText={setTitle} />
      <Input label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <Button
        title={t('budget.addExpense')}
        onPress={() => {
          if (!title || !amount) return;
          addExpense({
            eventId: id!,
            title,
            amount: parseFloat(amount),
            category: ExpenseCategory.OTHER,
            paymentStatus: PaymentStatus.PENDING,
          });
          setTitle('');
          setAmount('');
        }}
        className="mb-4"
      />
      <FlatList
        data={expenses}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => (
          <Card className="mb-2 flex-row justify-between">
            <View>
              <Text className="font-medium">{item.title}</Text>
              <Text className="text-stone-500 text-sm">{item.category}</Text>
            </View>
            <Text className="font-bold text-primary" onPress={() => deleteExpense(item.id)}>
              NPR {item.amount.toLocaleString()}
            </Text>
          </Card>
        )}
      />
    </View>
  );
}
