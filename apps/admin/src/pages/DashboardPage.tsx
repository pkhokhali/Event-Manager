import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Card } from '../components/Card';

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data.data as Record<string, number>;
    },
  });

  if (error) {
    return (
      <div className="text-red-600">
        Failed to load stats. Try signing in again.
      </div>
    );
  }

  if (isLoading) return <p>Loading...</p>;

  const s = data ?? {};
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Vendors" value={s.vendors ?? 0} />
        <Card title="Festivals" value={s.festivals ?? 0} />
        <Card title="Active Banners" value={s.banners ?? 0} />
        <Card title="Categories" value={s.categories ?? 0} />
        <Card title="Pending Reviews" value={s.pendingReviews ?? 0} />
        <Card title="Pending Jobs" value={s.pendingJobs ?? 0} />
        <Card title="Device Tokens" value={s.deviceTokens ?? 0} />
      </div>
    </div>
  );
}
