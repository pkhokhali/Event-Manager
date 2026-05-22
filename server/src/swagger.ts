export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Event Manager API',
    version: '1.0.0',
    description: 'Nepal-focused event management REST API',
  },
  servers: [{ url: '/api/v1' }],
  paths: {
    '/health': { get: { summary: 'Health check' } },
    '/categories': { get: { summary: 'List category tree' } },
    '/vendors': { get: { summary: 'List vendors with pagination' } },
    '/festivals': { get: { summary: 'List festivals' } },
    '/banners': { get: { summary: 'Active banners' } },
    '/featured': { get: { summary: 'Featured events' } },
    '/reviews': { get: { summary: 'Approved reviews' }, post: { summary: 'Submit review' } },
    '/notifications/devices/register': { post: { summary: 'Register FCM token' } },
    '/uploads/presign': { post: { summary: 'Get S3 presigned URL' } },
    '/admin/stats': { get: { summary: 'Dashboard stats (admin key required)' } },
  },
  components: {
    securitySchemes: {
      AdminKey: { type: 'apiKey', in: 'header', name: 'X-Admin-Key' },
    },
  },
};
