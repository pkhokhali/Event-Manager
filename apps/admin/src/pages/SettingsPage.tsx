import { useSettingsStore } from '../store/settings';

export function SettingsPage() {
  const { apiUrl, adminKey, setApiUrl, setAdminKey } = useSettingsStore();

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="bg-white p-4 rounded shadow space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">API Base URL</label>
          <input
            className="border w-full px-2 py-1 rounded"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Admin API Key (X-Admin-Key)</label>
          <input
            className="border w-full px-2 py-1 rounded"
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
          />
        </div>
        <p className="text-xs text-stone-500">
          No login system — store the shared secret here. Must match server ADMIN_API_KEY.
        </p>
      </div>
    </div>
  );
}
