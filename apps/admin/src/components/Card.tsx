export function Card({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-stone-200">
      <p className="text-sm text-stone-500">{title}</p>
      <p className="text-2xl font-bold text-primary mt-1">{value}</p>
    </div>
  );
}
