import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../lib/api';

export function NotificationsPage() {
  const [form, setForm] = useState({ title: '', body: '' });

  const { data } = useQuery({
    queryKey: ['admin-notif-jobs'],
    queryFn: async () => {
      const res = await api.get('/notifications/admin/jobs');
      return res.data.data;
    },
  });

  const broadcast = useMutation({
    mutationFn: () =>
      api.post('/notifications/admin/broadcast', {
        ...form,
        channel: 'PUSH',
      }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <div className="bg-white p-4 rounded shadow mb-4 max-w-lg space-y-2">
        <input className="border w-full px-2 py-1 rounded" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="border w-full px-2 py-1 rounded" placeholder="Body" rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <button className="bg-primary text-white px-4 py-2 rounded" onClick={() => broadcast.mutate()}>
          Send Broadcast Push
        </button>
      </div>
      <table className="w-full bg-white rounded shadow text-sm">
        <thead className="bg-stone-100">
          <tr>
            <th className="text-left p-2">Title</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Sent</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((j: { id: string; title: string; status: string; sentAt?: string }) => (
            <tr key={j.id} className="border-t">
              <td className="p-2">{j.title}</td>
              <td className="p-2">{j.status}</td>
              <td className="p-2">{j.sentAt ? new Date(j.sentAt).toLocaleString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
