import { NavLink, Outlet } from 'react-router-dom';

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
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-primary text-white shrink-0">
        <div className="p-4 font-bold text-lg border-b border-white/20">Event Manager</div>
        <nav className="p-2 flex flex-col gap-1">
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
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
