import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'student-photos';

let supabaseClient = null;

/**
 * Returns an initialized Supabase client using the service_role key.
 * Uses service_role (not anon) so uploads bypass Row Level Security.
 * @returns {import('@supabase/supabase-js').SupabaseClient | null}
 */
export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.warn('⚠️  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. Photo uploads will be disabled.');
    return null;
  }

  try {
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('✅ Supabase Storage client initialized.');
  } catch (err) {
    console.warn('⚠️  Failed to initialize Supabase client:', err.message);
    return null;
  }

  return supabaseClient;
}

export default { getSupabaseClient, STORAGE_BUCKET };
