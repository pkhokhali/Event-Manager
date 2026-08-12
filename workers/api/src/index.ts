import { Hono } from 'hono';
import type { Env, AppVariables } from './env';
import { corsMiddleware, withDb } from './middleware';
import { categoriesRoutes } from './routes/categories';
import { vendorsRoutes } from './routes/vendors';
import { festivalsRoutes } from './routes/festivals';
import { bannersRoutes } from './routes/banners';
import { featuredRoutes } from './routes/featured';
import { reviewsRoutes } from './routes/reviews';
import { notificationsRoutes } from './routes/notifications';
import { uploadsRoutes } from './routes/uploads';
import { adminRoutes } from './routes/admin';
import { handleScheduled } from './cron';

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

app.use('*', corsMiddleware());
app.use('*', withDb);

app.get('/health', (c) => c.json({ ok: true, service: 'event-manager-api' }));

const v1 = new Hono<{ Bindings: Env; Variables: AppVariables }>();
v1.route('/categories', categoriesRoutes);
v1.route('/vendors', vendorsRoutes);
v1.route('/festivals', festivalsRoutes);
v1.route('/banners', bannersRoutes);
v1.route('/featured', featuredRoutes);
v1.route('/reviews', reviewsRoutes);
v1.route('/notifications', notificationsRoutes);
v1.route('/uploads', uploadsRoutes);
v1.route('/admin', adminRoutes);

app.route('/api/v1', v1);

app.onError((err, c) => {
  console.error(err);
  if (err.name === 'ZodError') {
    return c.json({ error: { code: 'VALIDATION', message: err.message } }, 400);
  }
  return c.json({ error: { code: 'INTERNAL', message: err.message || 'Internal error' } }, 500);
});

export default {
  fetch: app.fetch,
  scheduled: handleScheduled,
};
