import { useState } from 'react';
import { View, Text, FlatList, Linking, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-native-qrcode-svg';
import { RsvpStatus } from '@event-manager/shared';
import { useEventsStore } from '@/store/events';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function GuestsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { getGuestsByEvent, addGuest, updateGuest, deleteGuest } = useEventsStore();
  const guests = getGuestsByEvent(id!);
  const event = useEventsStore((s) => s.events.find((e) => e.id === id));
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const inviteWhatsApp = (phone: string) => {
    const msg = encodeURIComponent(`You're invited to ${event?.title ?? 'our event'}!`);
    Linking.openURL(`whatsapp://send?phone=${phone.replace(/\D/g, '')}&text=${msg}`);
  };

  const inviteSms = (phone: string) => {
    const body = encodeURIComponent(`Invitation: ${event?.title ?? 'Event'}`);
    Linking.openURL(`sms:${phone}?body=${body}`);
  };

  return (
    <View className="flex-1 bg-background p-4">
      <Input label="Name" value={name} onChangeText={setName} />
      <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Button
        title={t('guests.add')}
        onPress={() => {
          if (!name.trim()) return;
          addGuest({ eventId: id!, name, phone, rsvpStatus: RsvpStatus.PENDING });
          setName('');
          setPhone('');
        }}
        className="mb-4"
      />
      <FlatList
        data={guests}
        keyExtractor={(g) => g.id}
        renderItem={({ item }) => (
          <Card className="mb-2">
            <Text className="font-semibold">{item.name}</Text>
            <Text className="text-stone-500">{item.rsvpStatus}</Text>
            {item.phone && (
              <View className="flex-row gap-3 mt-2">
                <Pressable onPress={() => inviteWhatsApp(item.phone!)}>
                  <Text className="text-green-700 text-sm">{t('guests.inviteWhatsApp')}</Text>
                </Pressable>
                <Pressable onPress={() => inviteSms(item.phone!)}>
                  <Text className="text-blue-600 text-sm">{t('guests.inviteSms')}</Text>
                </Pressable>
              </View>
            )}
            <View className="flex-row gap-2 mt-2">
              {Object.values(RsvpStatus).map((s) => (
                <Pressable key={s} onPress={() => updateGuest(item.id, { rsvpStatus: s })}>
                  <Text className="text-xs text-primary">{s}</Text>
                </Pressable>
              ))}
              <Pressable onPress={() => deleteGuest(item.id)}>
                <Text className="text-xs text-red-600">{t('common.delete')}</Text>
              </Pressable>
            </View>
            {event && (
              <View className="items-center mt-3">
                <QRCode value={`event://${event.id}/guest/${item.id}`} size={80} />
                <Text className="text-xs text-stone-400 mt-1">{t('guests.qrInvite')}</Text>
              </View>
            )}
          </Card>
        )}
      />
    </View>
  );
}
