import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

/**
 * GET /api/activity
 * Fetches the 20 most recent logs from the activity_logs table.
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        id, 
        action_type, 
        description, 
        created_at
      FROM activity_logs
      ORDER BY created_at DESC
      LIMIT 20
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
