import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

/**
 * GET /api/analytics
 * Returns total student count, and grouped student counts by course and year.
 */
router.get('/', async (req, res, next) => {
  try {
    const [totalResult, courseResult, yearResult] = await Promise.all([
      query('SELECT COUNT(*)::int AS total FROM students'),
      query(`
        SELECT 
          course, 
          COUNT(*)::int AS count 
        FROM students 
        GROUP BY course 
        ORDER BY count DESC, course ASC
      `),
      query(`
        SELECT 
          year, 
          COUNT(*)::int AS count 
        FROM students 
        GROUP BY year 
        ORDER BY year ASC
      `),
    ]);

    const totalStudents = totalResult.rows[0]?.total || 0;
    const byCourse = courseResult.rows;
    const byYear = yearResult.rows;

    return res.status(200).json({
      success: true,
      total_students: totalStudents,
      totalStudents,
      by_course: byCourse,
      by_year: byYear,
      byCourse,
      byYear,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
