import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RequireAuth } from './components/RequireAuth';
import { DashboardPage } from './pages/DashboardPage';
import { VendorsPage } from './pages/VendorsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { FestivalsPage } from './pages/FestivalsPage';
import { BannersPage } from './pages/BannersPage';
import { FeaturedPage } from './pages/FeaturedPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="vendors" element={<VendorsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="festivals" element={<FestivalsPage />} />
          <Route path="banners" element={<BannersPage />} />
          <Route path="featured" element={<FeaturedPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
