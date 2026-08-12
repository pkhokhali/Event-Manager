import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/auth';
import { DEFAULT_API_URL, useSettingsStore } from '../store/settings';

export function LoginPage() {
  const navigate = useNavigate();
  const apiUrl = useSettingsStore((s) => s.apiUrl);
  const setSession = useAuthStore((s) => s.setSession);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const base = (apiUrl || DEFAULT_API_URL).replace(/\/$/, '');
    try {
      const { data } = await axios.post(`${base}/admin/login`, { username, password });
      const session = data.data as { token: string; username: string; expiresAt: string };
      setSession(session);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError(`Cannot reach API at ${base}. Open Settings after login or clear site data.`);
        } else if (err.response.data?.error?.message) {
          setError(String(err.response.data.error.message));
        } else if (err.response.status === 401) {
          setError('Invalid username or password');
        } else {
          setError(`Login failed (${err.response.status})`);
        }
      } else {
        setError('Login failed. Check username and password.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-lg mb-3">
            EM
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Event Manager</h1>
          <p className="text-sm text-stone-500 mt-1">Sign in to the admin console</p>
        </div>
        <form
          onSubmit={onSubmit}
          className="bg-white border border-stone-200 rounded-lg p-6 space-y-4 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className="border border-stone-300 w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="border border-stone-300 w-full px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded font-medium hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
