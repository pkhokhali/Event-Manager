import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../lib/api';

export function FeaturedPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: '', titleNe: '', description: '', imageUrl: '' });

  const { data } = useQuery({
    queryKey: ['admin-featured'],
    queryFn: async () => {
      const res = await api.get('/featured/admin');
      return res.data.data;
    },
  });

  const create = useMutation({
    mutationFn: () => api.post('/featured/admin', { ...form, isActive: true, sortOrder: 0 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-featured'] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Featured Events</h1>
      <div className="bg-white p-4 rounded shadow mb-4 flex flex-col gap-2 max-w-lg">
        <input className="border px-2 py-1 rounded" placeholder="Title EN" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="border px-2 py-1 rounded" placeholder="Title NE" value={form.titleNe} onChange={(e) => setForm({ ...form, titleNe: e.target.value })} />
        <button className="bg-primary text-white px-4 py-1 rounded w-fit" onClick={() => create.mutate()}>
          Add Featured
        </button>
      </div>
      <ul className="bg-white rounded shadow divide-y">
        {(data ?? []).map((f: { id: string; title: string; titleNe?: string }) => (
          <li key={f.id} className="p-3">
            {f.title} {f.titleNe && `/ ${f.titleNe}`}
          </li>
        ))}
      </ul>
    </div>
  );
}
