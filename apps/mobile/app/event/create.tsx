import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useEventsStore } from '@/store/events';

export default function CreateEventScreen() {
  const { t } = useTranslation();
  const addEvent = useEventsStore((s) => s.addEvent);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('10:00');
  const [venue, setVenue] = useState('');
  const [bikramDate, setBikramDate] = useState('');
  const [budget, setBudget] = useState('');
  const [subcategorySlug, setSubcategorySlug] = useState('wedding');

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data.data,
  });

  const handleSave = () => {
    if (!title.trim()) return;
    const event = addEvent({
      title: title.trim(),
      description,
      date,
      time,
      venue,
      bikramDate: bikramDate || undefined,
      budget: budget ? parseFloat(budget) : undefined,
      subcategorySlug,
      categorySlug: 'ritual-wedding',
    });
    router.replace(`/event/${event.id}`);
  };

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Input label="Title *" value={title} onChangeText={setTitle} />
      <Input label="Description" value={description} onChangeText={setDescription} multiline />
      <Input label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
      <Input label="Time" value={time} onChangeText={setTime} />
      <Input label="Bikram Sambat" value={bikramDate} onChangeText={setBikramDate} placeholder="2082 Baisakh 15" />
      <Input label="Venue" value={venue} onChangeText={setVenue} />
      <Input label="Budget (NPR)" value={budget} onChangeText={setBudget} keyboardType="numeric" />
      {categories.data?.[0]?.subcategories?.slice(0, 5).map((s: { slug: string; nameEn: string }) => (
        <Button
          key={s.slug}
          title={s.nameEn}
          variant={subcategorySlug === s.slug ? 'primary' : 'outline'}
          onPress={() => setSubcategorySlug(s.slug)}
          className="mb-2"
        />
      ))}
      <Button title={t('common.save')} onPress={handleSave} className="mt-4" />
    </ScrollView>
  );
}
