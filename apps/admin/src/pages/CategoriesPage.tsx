import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

type Sub = { id: string; slug: string; nameEn: string; nameNe: string };
type Cat = { id: string; slug: string; nameEn: string; nameNe: string; subcategories: Sub[] };

export function CategoriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data as Cat[];
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Event Categories</h1>
      <p className="text-stone-600 mb-4 text-sm">
        Seeded on deploy. Use admin API to add/edit via POST /categories/admin.
      </p>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {(data ?? []).map((cat) => (
            <div key={cat.id} className="bg-white rounded shadow p-4">
              <h2 className="font-semibold text-primary">
                {cat.nameEn} / {cat.nameNe}
              </h2>
              <ul className="mt-2 text-sm text-stone-600 grid grid-cols-2 gap-1">
                {cat.subcategories.map((s) => (
                  <li key={s.id}>
                    • {s.nameEn} ({s.slug})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
