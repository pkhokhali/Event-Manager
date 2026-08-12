import { useSettingsStore } from '../store/settings';

export function SettingsPage() {
  const { apiUrl, setApiUrl } = useSettingsStore();

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
        <p className="text-xs text-stone-500">
          Sign in with your admin username and password. Sessions last 7 days.
        </p>
      </div>
    </div>
  );
}
