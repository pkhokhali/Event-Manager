import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

const nav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/vendors', label: 'Vendors' },
  { to: '/categories', label: 'Categories' },
  { to: '/festivals', label: 'Festivals' },
  { to: '/banners', label: 'Banners' },
  { to: '/featured', label: 'Featured' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/settings', label: 'Settings' },
];

export function Layout() {
  const navigate = useNavigate();
  const username = useAuthStore((s) => s.username);
  const logout = useAuthStore((s) => s.logout);

  function onLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-primary text-white shrink-0 flex flex-col">
        <div className="p-4 font-bold text-lg border-b border-white/20">Event Manager</div>
        <nav className="p-2 flex flex-col gap-1 flex-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded text-sm ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/20 space-y-2">
          <p className="text-xs text-white/70 truncate px-1">{username || 'Admin'}</p>
          <button
            type="button"
            onClick={onLogout}
            className="w-full text-left px-3 py-2 rounded text-sm hover:bg-white/10"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
