import { View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEventsStore } from '@/store/events';
import { Card } from '@/components/ui/Card';
import { getTaskTemplatesForSubcategory } from '@event-manager/shared';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const event = useEventsStore((s) => s.events.find((e) => e.id === id));
  const tasks = useEventsStore((s) => s.getTasksByEvent(id!));
  const guests = useEventsStore((s) => s.getGuestsByEvent(id!));
  const addTask = useEventsStore((s) => s.addTask);

  if (!event) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Event not found</Text>
      </View>
    );
  }

  const applyTemplates = () => {
    const templates = getTaskTemplatesForSubcategory(event.subcategorySlug ?? 'wedding');
    templates.forEach((tmpl) => {
      if (!tasks.some((t) => t.title === tmpl.title)) {
        addTask({
          eventId: event.id,
          title: tmpl.title,
          isCompleted: false,
          sortOrder: tmpl.sortOrder,
        });
      }
    });
    router.push(`/event/${id}/timeline`);
  };

  const links = [
    { href: `/event/${id}/guests`, label: t('events.guests'), count: guests.length },
    { href: `/event/${id}/budget`, label: t('events.budget') },
    { href: `/event/${id}/timeline`, label: t('events.timeline'), count: tasks.length },
  ];

  return (
    <View className="flex-1 bg-background p-4">
      <Card className="mb-4">
        <Text className="text-2xl font-bold text-primary">{event.title}</Text>
        <Text className="text-stone-500 mt-1">{event.date} {event.time}</Text>
        {event.venue && <Text className="text-stone-600">{event.venue}</Text>}
        {event.bikramDate && <Text className="text-accent">{event.bikramDate}</Text>}
        {event.description && <Text className="mt-2 text-stone-600">{event.description}</Text>}
        {event.budget != null && (
          <Text className="mt-2 font-semibold">Budget: NPR {event.budget.toLocaleString()}</Text>
        )}
      </Card>
      {links.map((l) => (
        <Pressable key={l.href} onPress={() => router.push(l.href as `/event/${string}/guests`)}>
          <Card className="mb-2 flex-row justify-between">
            <Text className="font-medium text-primary">{l.label}</Text>
            {l.count != null && <Text className="text-stone-500">{l.count}</Text>}
          </Card>
        </Pressable>
      ))}
      <Pressable onPress={applyTemplates} className="mt-4">
        <Text className="text-accent text-center">Apply ritual task templates</Text>
      </Pressable>
    </View>
  );
}
