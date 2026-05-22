import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './swagger';
import { errorHandler } from './middleware/errorHandler';
import { categoriesRouter } from './routes/categories';
import { vendorsRouter } from './routes/vendors';
import { festivalsRouter } from './routes/festivals';
import { bannersRouter } from './routes/banners';
import { featuredRouter } from './routes/featured';
import { reviewsRouter } from './routes/reviews';
import { notificationsRouter } from './routes/notifications';
import { uploadsRouter } from './routes/uploads';
import { adminRouter } from './routes/admin';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:5173', 'http://localhost:8081'],
      credentials: true,
    })
  );
  app.use(compression());
  app.use(morgan('dev'));
  app.use(express.json({ limit: '2mb' }));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  const v1 = express.Router();
  v1.use('/categories', categoriesRouter);
  v1.use('/vendors', vendorsRouter);
  v1.use('/festivals', festivalsRouter);
  v1.use('/banners', bannersRouter);
  v1.use('/featured', featuredRouter);
  v1.use('/reviews', reviewsRouter);
  v1.use('/notifications', notificationsRouter);
  v1.use('/uploads', uploadsRouter);
  v1.use('/admin', adminRouter);

  app.use('/api/v1', v1);
  app.use(errorHandler);

  return app;
}
