import { query } from '../config/db.js';

/**
 * Persists an administrative activity log entry to the PostgreSQL activity_logs table
 * @param {string} actionType - The action tag (e.g. 'CREATE_STUDENT', 'UPDATE_STUDENT', 'DELETE_STUDENT', 'BULK_DELETE_STUDENTS')
 * @param {string} description - Human-readable description of the action
 * @returns {Promise<any>}
 */
export async function logActivity(actionType, description) {
  const timestamp = new Date().toISOString();
  console.log(`📌 [${actionType}] [${timestamp}] ${description}`);

  try {
    const text = `
      INSERT INTO activity_logs (action_type, description)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await query(text, [actionType, description]);
    return result.rows[0];
  } catch (err) {
    // Gracefully warn without crashing the primary request
    console.warn(`⚠️ Failed to persist activity log to database:`, err.message);
    return null;
  }
}

export default {
  logActivity,
};
