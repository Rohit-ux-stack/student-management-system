import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Migration runner that applies SQL migration files in sequence
 */
async function runMigrations() {
  let client;
  try {
    console.log('🔄 Connecting to PostgreSQL database...');
    client = await pool.connect();

    // Create migrations tracker table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Get all SQL migration files sorted by name
    const files = fs
      .readdirSync(__dirname)
      .filter((file) => file.endsWith('.sql') && file !== 'schema.sql')
      .sort();

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT id FROM _migrations WHERE name = $1',
        [file]
      );

      if (rows.length === 0) {
        console.log(`⏳ Applying migration: ${file}...`);
        const filePath = path.join(__dirname, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');

        console.log(`✅ Migration applied successfully: ${file}`);
      } else {
        console.log(`⏩ Migration already applied: ${file}`);
      }
    }

    console.log('🎉 All PostgreSQL migrations completed successfully.');
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {});
    }
    console.error('\n❌ Migration failed:', error.message);
    if (error.code === '28P01') {
      console.error('👉 Cause: PostgreSQL password authentication failed.');
      console.error('👉 Action: Check your database password in .env (or reset your database password in your Supabase project dashboard under Project Settings > Database).');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('👉 Cause: Could not connect to PostgreSQL server (Connection Refused).');
      console.error('👉 Action: Verify your PostgreSQL host, port, or network connection.');
    }
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

runMigrations();
