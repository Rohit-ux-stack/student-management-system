import { Router } from 'express';
import { query } from '../config/db.js';
import { getFirebaseStorageBucket } from '../config/firebase.js';
import { uploadStudentPhoto } from '../middleware/upload.js';
import { validateStudent } from '../middleware/validateStudent.js';
import { logActivity } from '../utils/logger.js';

const router = Router();

/**
 * Helper to upload a file buffer to Firebase Storage
 * @param {Express.Multer.File} file - Uploaded file from multer memory storage
 * @param {string} identifier - Student UUID or identifier prefix
 * @returns {Promise<string|null>} - Public/Signed download URL
 */
async function uploadPhotoToFirebase(file, identifier) {
  if (!file) return null;

  const bucket = getFirebaseStorageBucket();
  if (!bucket) {
    console.warn(
      '⚠️  Firebase Storage bucket is not available. Photo upload skipped.'
    );
    return null;
  }

  const timestamp = Date.now();
  const sanitizedName = (file.originalname || 'photo.jpg').replace(
    /[^a-zA-Z0-9.-]/g,
    '_'
  );
  const destination = `students/${identifier}/${timestamp}-${sanitizedName}`;
  const fileRef = bucket.file(destination);

  await fileRef.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
    },
    resumable: false,
  });

  try {
    await fileRef.makePublic();
    return (
      fileRef.publicUrl() ||
      `https://storage.googleapis.com/${bucket.name}/${destination}`
    );
  } catch {
    // If uniform bucket-level access prevents makePublic(), generate long-lived signed URL
    const [signedUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '01-01-2099',
    });
    return signedUrl;
  }
}

/**
 * Helper to safely delete an existing photo from Firebase Storage
 * @param {string} photoUrl
 */
async function deletePhotoFromFirebase(photoUrl) {
  if (!photoUrl || typeof photoUrl !== 'string') return;

  try {
    const bucket = getFirebaseStorageBucket();
    if (!bucket) return;

    let filePath = null;
    if (photoUrl.includes(`${bucket.name}/`)) {
      const parts = photoUrl.split(`${bucket.name}/`);
      if (parts[1]) {
        filePath = decodeURIComponent(parts[1].split('?')[0]);
      }
    } else if (photoUrl.includes('/o/')) {
      const parts = photoUrl.split('/o/');
      if (parts[1]) {
        filePath = decodeURIComponent(parts[1].split('?')[0]);
      }
    }

    if (filePath) {
      const fileRef = bucket.file(filePath);
      const [exists] = await fileRef.exists();
      if (exists) {
        await fileRef.delete();
        console.log(`🗑️  Deleted previous photo from Firebase Storage: ${filePath}`);
      }
    }
  } catch (err) {
    console.warn('⚠️  Could not delete photo from Firebase Storage:', err.message);
  }
}

/**
 * GET /api/students
 * List all students with server-side pagination, search, and filtering
 * Query Params: page, limit, search, course, year
 */
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const { search, course, year } = req.query;

    const whereClauses = [];
    const values = [];
    let paramIndex = 1;

    // Search query matches name, email, or admission_number
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      whereClauses.push(
        `(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR admission_number ILIKE $${paramIndex})`
      );
      values.push(searchTerm);
      paramIndex++;
    }

    // Filter by course
    if (course && typeof course === 'string' && course.trim().length > 0) {
      whereClauses.push(`course = $${paramIndex}`);
      values.push(course.trim());
      paramIndex++;
    }

    // Filter by year
    if (year !== undefined && year !== '' && !isNaN(parseInt(year, 10))) {
      whereClauses.push(`year = $${paramIndex}`);
      values.push(parseInt(year, 10));
      paramIndex++;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // 1. Get total count
    const countQuery = `SELECT COUNT(*)::int AS total FROM students ${whereSql}`;
    const countResult = await query(countQuery, values);
    const total = countResult.rows[0]?.total || 0;

    // 2. Fetch paginated records
    const dataQuery = `
      SELECT 
        id, 
        admission_number, 
        name, 
        course, 
        year, 
        date_of_birth, 
        email, 
        mobile_number, 
        gender, 
        address, 
        photo_url, 
        created_at, 
        updated_at
      FROM students
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataValues = [...values, limit, offset];
    const dataResult = await query(dataQuery, dataValues);

    return res.status(200).json({
      data: dataResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/students/:id
 * Fetch single student by id (UUID)
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        id, 
        admission_number, 
        name, 
        course, 
        year, 
        date_of_birth, 
        email, 
        mobile_number, 
        gender, 
        address, 
        photo_url, 
        created_at, 
        updated_at 
       FROM students 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Student not found',
        },
      });
    }

    const student = result.rows[0];
    logActivity('FETCH', student.id, { admission_number: student.admission_number });

    return res.status(200).json({
      data: student,
    });
  } catch (err) {
    // If invalid UUID format error from postgres (22P02), return 404
    if (err.code === '22P02') {
      return res.status(404).json({
        error: {
          message: 'Student not found (invalid ID format)',
        },
      });
    }
    next(err);
  }
});

/**
 * POST /api/students/bulk-delete
 * Delete multiple students by their IDs
 * Body: { ids: string[] }
 */
router.post('/bulk-delete', async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        error: {
          message: 'An array of student IDs (ids) is required for bulk deletion',
        },
      });
    }

    const validIds = ids.filter(
      (id) => typeof id === 'string' && id.trim().length > 0
    );

    if (validIds.length === 0) {
      return res.status(400).json({
        error: {
          message: 'No valid student IDs provided',
        },
      });
    }

    // 1. Fetch matching students to retrieve photo URLs for cleanup
    const findResult = await query(
      'SELECT id, name, admission_number, photo_url FROM students WHERE id = ANY($1::uuid[])',
      [validIds]
    );

    const studentsToDelete = findResult.rows;

    if (studentsToDelete.length === 0) {
      return res.status(404).json({
        error: {
          message: 'No matching students found to delete',
        },
      });
    }

    // 2. Perform bulk delete
    const deleteResult = await query(
      'DELETE FROM students WHERE id = ANY($1::uuid[]) RETURNING id, admission_number',
      [validIds]
    );

    const deletedCount = deleteResult.rowCount || deleteResult.rows.length;
    const deletedIds = deleteResult.rows.map((r) => r.id);

    // 3. Clean up photos from Firebase Storage asynchronously
    for (const st of studentsToDelete) {
      if (st.photo_url) {
        deletePhotoFromFirebase(st.photo_url).catch((err) => {
          console.warn(
            `⚠️ Failed to delete photo for student ${st.id}:`,
            err.message
          );
        });
      }
    }

    // 4. Record entry in activity_logs
    await logActivity(
      'BULK_DELETE_STUDENTS',
      `Bulk deleted ${deletedCount} student(s)`
    );

    return res.status(200).json({
      message: `Successfully deleted ${deletedCount} student(s)`,
      deleted_count: deletedCount,
      deletedCount,
      data: {
        deleted_count: deletedCount,
        deleted_ids: deletedIds,
      },
    });
  } catch (err) {
    if (err.code === '22P02') {
      return res.status(400).json({
        error: {
          message: 'One or more provided IDs are invalid UUIDs',
        },
      });
    }
    next(err);
  }
});

/**
 * POST /api/students
 * Create a new student (multipart/form-data)
 * Photo upload is optional.
 * DB default handles admission_number generation via generate_admission_number() trigger/default.
 */
router.post(
  '/',
  uploadStudentPhoto,
  validateStudent(false),
  async (req, res, next) => {
    try {
      const {
        name,
        course,
        year,
        date_of_birth,
        email,
        mobile_number,
        gender,
        address,
      } = req.body;

      let photo_url = null;

      // Upload photo to Firebase Storage if provided — fails gracefully if Firebase is misconfigured
      if (req.file) {
        try {
          const tempPrefix = `student_${Date.now()}`;
          photo_url = await uploadPhotoToFirebase(req.file, tempPrefix);
        } catch (uploadErr) {
          console.error('⚠️  Photo upload to Firebase failed (student will be saved without photo):', uploadErr.message);
          photo_url = null; // Continue without photo rather than failing the whole request
        }
      }

      // Insert student record into PostgreSQL.
      // Note: admission_number is intentionally omitted to allow Postgres default trigger/function to generate it.
      const insertQuery = `
        INSERT INTO students (
          name,
          course,
          year,
          date_of_birth,
          email,
          mobile_number,
          gender,
          address,
          photo_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const values = [
        name.trim(),
        course.trim(),
        parseInt(year, 10),
        date_of_birth.trim(),
        email.trim().toLowerCase(),
        mobile_number.trim(),
        gender.trim(),
        address ? address.trim() : null,
        photo_url,
      ];

      const result = await query(insertQuery, values);
      const newStudent = result.rows[0];

      await logActivity(
        'CREATE_STUDENT',
        `Created student ${newStudent.name} (${newStudent.admission_number})`
      );

      return res.status(201).json({
        message: 'Student created successfully',
        data: newStudent,
      });
    } catch (err) {
      console.error("Student creation failed:", err);
      // Catch duplicate unique email constraint violation (23505)
      if (err.code === '23505') {
        if (err.constraint && err.constraint.includes('email')) {
          return res.status(409).json({
            error: {
              message: 'A student with this email already exists',
              field: 'email',
            },
          });
        }
        return res.status(409).json({
          error: {
            message: 'Duplicate record exists that violates a unique constraint',
          },
        });
      }
      next(err);
    }
  }
);

/**
 * PUT /api/students/:id
 * Update an existing student (multipart/form-data)
 * Partial fields supported. If a new photo is uploaded, replaces photo_url.
 */
router.put(
  '/:id',
  uploadStudentPhoto,
  validateStudent(true),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // 1. Check if student exists
      const existingResult = await query(
        'SELECT * FROM students WHERE id = $1',
        [id]
      );

      if (existingResult.rows.length === 0) {
        return res.status(404).json({
          error: {
            message: 'Student not found',
          },
        });
      }

      const existingStudent = existingResult.rows[0];
      const updates = [];
      const values = [];
      let paramIndex = 1;

      const {
        name,
        course,
        year,
        date_of_birth,
        email,
        mobile_number,
        gender,
        address,
      } = req.body;

      if (name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(name.trim());
      }

      if (course !== undefined) {
        updates.push(`course = $${paramIndex++}`);
        values.push(course.trim());
      }

      if (year !== undefined) {
        updates.push(`year = $${paramIndex++}`);
        values.push(parseInt(year, 10));
      }

      if (date_of_birth !== undefined) {
        updates.push(`date_of_birth = $${paramIndex++}`);
        values.push(date_of_birth.trim());
      }

      if (email !== undefined) {
        updates.push(`email = $${paramIndex++}`);
        values.push(email.trim().toLowerCase());
      }

      if (mobile_number !== undefined) {
        updates.push(`mobile_number = $${paramIndex++}`);
        values.push(mobile_number.trim());
      }

      if (gender !== undefined) {
        updates.push(`gender = $${paramIndex++}`);
        values.push(gender.trim());
      }

      if (address !== undefined) {
        updates.push(`address = $${paramIndex++}`);
        values.push(address ? address.trim() : null);
      }

      // Handle photo update if new file is attached
      if (req.file) {
        const newPhotoUrl = await uploadPhotoToFirebase(
          req.file,
          existingStudent.admission_number || id
        );

        if (newPhotoUrl) {
          // Delete old photo if it existed
          if (existingStudent.photo_url) {
            await deletePhotoFromFirebase(existingStudent.photo_url);
          }
          updates.push(`photo_url = $${paramIndex++}`);
          values.push(newPhotoUrl);
        }
      }

      if (updates.length === 0) {
        return res.status(200).json({
          message: 'No changes requested',
          data: existingStudent,
        });
      }

      values.push(id);
      const updateQuery = `
        UPDATE students
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const updateResult = await query(updateQuery, values);
      const updatedStudent = updateResult.rows[0];

      await logActivity(
        'UPDATE_STUDENT',
        `Updated student ${updatedStudent.name} (${updatedStudent.admission_number})`
      );

      return res.status(200).json({
        message: 'Student updated successfully',
        data: updatedStudent,
      });
    } catch (err) {
      if (err.code === '23505') {
        if (err.constraint && err.constraint.includes('email')) {
          return res.status(409).json({
            error: {
              message: 'A student with this email already exists',
              field: 'email',
            },
          });
        }
        return res.status(409).json({
          error: {
            message: 'Duplicate record exists that violates a unique constraint',
          },
        });
      }

      if (err.code === '22P02') {
        return res.status(404).json({
          error: {
            message: 'Student not found (invalid ID format)',
          },
        });
      }

      next(err);
    }
  }
);

/**
 * DELETE /api/students/:id
 * Delete student by id, and delete associated photo from Firebase Storage if present
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Fetch student to get photo_url and verify existence
    const findResult = await query('SELECT * FROM students WHERE id = $1', [id]);

    if (findResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Student not found',
        },
      });
    }

    const student = findResult.rows[0];

    // 2. Delete from PostgreSQL
    await query('DELETE FROM students WHERE id = $1', [id]);

    // 3. Delete photo from Firebase Storage if one exists
    if (student.photo_url) {
      await deletePhotoFromFirebase(student.photo_url);
    }

    await logActivity(
      'DELETE_STUDENT',
      `Deleted student ${student.name} (${student.admission_number})`
    );

    return res.status(200).json({
      message: 'Student deleted successfully',
      data: {
        id: student.id,
        admission_number: student.admission_number,
      },
    });
  } catch (err) {
    if (err.code === '22P02') {
      return res.status(404).json({
        error: {
          message: 'Student not found (invalid ID format)',
        },
      });
    }
    next(err);
  }
});

export default router;
