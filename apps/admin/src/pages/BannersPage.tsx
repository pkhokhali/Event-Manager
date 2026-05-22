import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../lib/api';

export function BannersPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: '', imageUrl: '', linkUrl: '' });

  const { data } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const res = await api.get('/banners/admin');
      return res.data.data;
    },
  });

  const create = useMutation({
    mutationFn: () => api.post('/banners/admin', { ...form, isActive: true, sortOrder: 0 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-banners'] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Banners</h1>
      <div className="bg-white p-4 rounded shadow mb-4 flex gap-2 flex-wrap">
        <input className="border px-2 py-1 rounded flex-1" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="border px-2 py-1 rounded flex-1" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        <button className="bg-primary text-white px-4 py-1 rounded" onClick={() => create.mutate()}>
          Add
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(data ?? []).map((b: { id: string; title: string; imageUrl: string; isActive: boolean }) => (
          <div key={b.id} className="bg-white rounded shadow overflow-hidden">
            <img src={b.imageUrl} alt={b.title} className="h-32 w-full object-cover" />
            <div className="p-3">
              <p className="font-medium">{b.title}</p>
              <p className="text-xs text-stone-500">{b.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
