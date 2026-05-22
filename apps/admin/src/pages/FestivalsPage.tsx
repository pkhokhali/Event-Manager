import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../lib/api';

type Festival = {
  id: string;
  nameEn: string;
  nameNe: string;
  gregorianDate: string;
  bikramDate?: string;
  tithiLabel?: string;
};

export function FestivalsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    slug: '',
    nameEn: '',
    nameNe: '',
    gregorianDate: '',
    bikramDate: '',
    tithiLabel: '',
  });

  const { data } = useQuery({
    queryKey: ['admin-festivals'],
    queryFn: async () => {
      const res = await api.get('/festivals', { params: { limit: 50 } });
      return res.data.data as Festival[];
    },
  });

  const create = useMutation({
    mutationFn: () => api.post('/festivals/admin', form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-festivals'] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Festival Calendar</h1>
      <div className="bg-white p-4 rounded shadow mb-4 grid grid-cols-2 gap-2">
        <input className="border px-2 py-1 rounded" placeholder="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <input className="border px-2 py-1 rounded" placeholder="nameEn" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
        <input className="border px-2 py-1 rounded" placeholder="nameNe" value={form.nameNe} onChange={(e) => setForm({ ...form, nameNe: e.target.value })} />
        <input className="border px-2 py-1 rounded" type="date" value={form.gregorianDate} onChange={(e) => setForm({ ...form, gregorianDate: e.target.value })} />
        <button className="bg-primary text-white px-4 py-1 rounded col-span-2" onClick={() => create.mutate()}>
          Add Festival
        </button>
      </div>
      <ul className="bg-white rounded shadow divide-y">
        {(data ?? []).map((f) => (
          <li key={f.id} className="p-3 flex justify-between">
            <span>
              <strong>{f.nameEn}</strong> / {f.nameNe}
            </span>
            <span className="text-sm text-stone-500">
              {new Date(f.gregorianDate).toLocaleDateString()} {f.tithiLabel}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
