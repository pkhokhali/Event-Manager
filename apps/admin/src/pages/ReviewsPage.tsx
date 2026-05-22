import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

type Review = {
  id: string;
  rating: number;
  comment?: string;
  authorName?: string;
  vendor: { name: string };
};

export function ReviewsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['pending-reviews'],
    queryFn: async () => {
      const res = await api.get('/reviews/admin/pending');
      return res.data.data as Review[];
    },
  });

  const approve = useMutation({
    mutationFn: (id: string) => api.patch(`/reviews/admin/${id}/approve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pending-reviews'] }),
  });

  const reject = useMutation({
    mutationFn: (id: string) => api.patch(`/reviews/admin/${id}/reject`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pending-reviews'] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Review Moderation</h1>
      <div className="space-y-3">
        {(data ?? []).length === 0 && <p className="text-stone-500">No pending reviews</p>}
        {(data ?? []).map((r) => (
          <div key={r.id} className="bg-white p-4 rounded shadow">
            <p className="font-medium">{r.vendor.name} — {r.rating}★</p>
            <p className="text-sm text-stone-600">{r.comment}</p>
            <div className="mt-2 flex gap-2">
              <button className="bg-green-700 text-white px-3 py-1 rounded text-sm" onClick={() => approve.mutate(r.id)}>
                Approve
              </button>
              <button className="bg-stone-500 text-white px-3 py-1 rounded text-sm" onClick={() => reject.mutate(r.id)}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
