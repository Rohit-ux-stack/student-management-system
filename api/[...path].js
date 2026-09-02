import app from '../server/app.js';

export default function handler(req, res) {
  // Vercel strips the /api prefix before invoking the function.
  // Re-add it so Express can match its routes (app.use('/api/students', ...)).
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  // Ensure original path stays consistent for Express routing
  if (req.originalUrl && !req.originalUrl.startsWith('/api')) {
    req.originalUrl = '/api' + req.originalUrl;
  }
  return app(req, res);
}
