import app from './app.js';
import { testDbConnection } from './config/db.js';

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Start standalone HTTP listener if not running in a serverless environment (e.g. Vercel)
if (!process.env.VERCEL) {
  const server = app.listen(PORT, HOST, async () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Student Management System Server running on http://${HOST}:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`======================================================`);

    // Probe database connection on startup
    try {
      const dbStatus = await testDbConnection();
      if (dbStatus.connected) {
        console.log(`✅ Database Connected: '${dbStatus.database}' (${dbStatus.latencyMs}ms latency)`);
        console.log(`🗄️  PostgreSQL Version: ${dbStatus.version}`);
        if (dbStatus.tablesReady) {
          console.log(`✨ Schema status: 'students' table is active and ready.`);
        } else {
          console.warn(`⚠️  Schema notice: 'students' table was not detected. Run 'npm run migrate' to initialize.`);
        }
      } else {
        console.warn(`⚠️  Database Connection Notice: ${dbStatus.error}`);
        console.warn(`👉 Verify PostgreSQL is running and credentials in .env are correct.`);
      }
    } catch (err) {
      console.error('❌ Failed to run database startup diagnostics:', err.message);
    }
    console.log(`======================================================\n`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Closing HTTP server...');
    server.close(() => {
      console.log('HTTP server closed.');
    });
  });
}

// Export Express app instance for Vercel serverless function execution & ESM compatibility
export default app;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
}
