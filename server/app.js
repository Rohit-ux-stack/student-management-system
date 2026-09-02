import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { testDbConnection } from './config/db.js';
import { getFirebaseStorageBucket } from './config/firebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();

// CORS — allow the Vercel frontend origin (set CORS_ORIGIN env var on Render)
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: allowedOrigin !== '*',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Comprehensive Health & Database Diagnostic Endpoint
app.get('/api/health', async (req, res) => {
  const dbHealth = await testDbConnection();
  const bucket = getFirebaseStorageBucket();
  const storageConfigured = Boolean(bucket);

  const isHealthy = dbHealth.connected;
  const statusCode = isHealthy ? 200 : 503;

  return res.status(statusCode).json({
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'Student Management System API',
    uptime: Math.floor(process.uptime()),
    database: {
      status: dbHealth.connected ? 'connected' : 'disconnected',
      latency_ms: dbHealth.latencyMs,
      database: dbHealth.database,
      version: dbHealth.version,
      tables_ready: dbHealth.tablesReady,
      ...(dbHealth.error ? { error: dbHealth.error, code: dbHealth.code } : {}),
    },
    storage: {
      status: storageConfigured ? 'configured' : 'not_configured',
      bucket: bucket?.name || process.env.FIREBASE_STORAGE_BUCKET || null,
    },
  });
});

// Mount domain routes
import studentRoutes from './routes/students.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import activityRoutes from './routes/activity.routes.js';

app.use('/api/students', studentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/activity', activityRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    },
  });
});

export default app;
