import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure environment variables are loaded
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const { Pool } = pg;

/**
 * PostgreSQL Connection Pool Configuration
 * Strictly initialized using process.env.DATABASE_URL and ssl: { rejectUnauthorized: false } for Supabase connections.
 */
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: parseInt(process.env.PGMAX_CONNECTIONS || '20', 10),
  idleTimeoutMillis: parseInt(process.env.PGIDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.PGCONNECT_TIMEOUT || '5000', 10),
};

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client:', err.message);
});

/**
 * Helper function to run parameterized queries with the connection pool
 * @param {string} text - SQL query text
 * @param {Array<any>} [params] - Query parameters
 * @returns {Promise<pg.QueryResult>}
 */
export const query = (text, params) => pool.query(text, params);

/**
 * Transaction helper for executing atomic multi-statement operations safely
 * @template T
 * @param {(client: pg.PoolClient) => Promise<T>} callback
 * @returns {Promise<T>}
 */
export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Probes the PostgreSQL database connection and verifies table readiness
 * @returns {Promise<{
 *   connected: boolean,
 *   latencyMs: number,
 *   database?: string,
 *   version?: string,
 *   serverTime?: string,
 *   tablesReady?: boolean,
 *   error?: string,
 *   code?: string
 * }>}
 */
export async function testDbConnection() {
  const startTime = Date.now();
  try {
    const client = await pool.connect();
    try {
      const res = await client.query(`
        SELECT 
          current_database() AS database_name,
          version() AS pg_version,
          NOW() AS server_time,
          (
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name IN ('students', 'activity_logs')
          ) >= 2 AS tables_ready
      `);

      const latencyMs = Date.now() - startTime;
      const row = res.rows[0] || {};

      return {
        connected: true,
        latencyMs,
        database: row.database_name,
        version: row.pg_version ? row.pg_version.split(' on ')[0] : 'Unknown',
        serverTime: row.server_time,
        tablesReady: Boolean(row.tables_ready),
      };
    } finally {
      client.release();
    }
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    const errorMsg =
      err?.errors && Array.isArray(err.errors)
        ? err.errors.map((e) => e.message).join('; ')
        : err?.message || String(err) || 'Failed to connect to database';

    return {
      connected: false,
      latencyMs,
      error: errorMsg,
      code: err?.code || err?.errors?.[0]?.code || 'UNKNOWN',
    };
  }
}

export default {
  pool,
  query,
  withTransaction,
  testDbConnection,
};
