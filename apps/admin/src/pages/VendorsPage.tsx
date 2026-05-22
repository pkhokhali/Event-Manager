import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../lib/api';
const VENDOR_CATEGORIES = [
  'CATERING', 'PHOTOGRAPHY', 'DECORATOR', 'MAKEUP', 'MUSIC_BAND', 'DJ',
  'VENUE', 'PANDIT', 'TRANSPORTATION', 'SOUND_LIGHTING',
] as const;

type Vendor = {
  id: string;
  name: string;
  category: string;
  city?: string;
  phone?: string;
  rating: number;
  isFeatured: boolean;
};

export function VendorsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    category: 'CATERING',
    city: 'Kathmandu',
    phone: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vendors'],
    queryFn: async () => {
      const res = await api.get('/vendors/admin', { params: { limit: 50 } });
      return res.data.data as Vendor[];
    },
  });

  const create = useMutation({
    mutationFn: () => api.post('/vendors/admin', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-vendors'] });
      setForm({ name: '', category: 'CATERING', city: 'Kathmandu', phone: '' });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/vendors/admin/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-vendors'] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Vendor Management</h1>
      <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-2">
        <input
          className="border px-2 py-1 rounded"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <select
          className="border px-2 py-1 rounded"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          {VENDOR_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          className="border px-2 py-1 rounded"
          placeholder="City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
        <button
          className="bg-primary text-white px-4 py-1 rounded"
          onClick={() => create.mutate()}
          disabled={!form.name}
        >
          Add Vendor
        </button>
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full bg-white rounded shadow text-sm">
          <thead className="bg-stone-100">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Category</th>
              <th className="text-left p-2">City</th>
              <th className="text-left p-2">Rating</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((v) => (
              <tr key={v.id} className="border-t">
                <td className="p-2">{v.name}</td>
                <td className="p-2">{v.category}</td>
                <td className="p-2">{v.city}</td>
                <td className="p-2">{v.rating}</td>
                <td className="p-2">
                  <button
                    className="text-red-600"
                    onClick={() => remove.mutate(v.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
