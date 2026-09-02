import multer from 'multer';

// Use MemoryStorage to keep files in memory buffer for streaming to Firebase Storage
const storage = multer.memoryStorage();

// Allowed image MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
];

/**
 * File filter to ensure only images are uploaded
 */
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      `Unsupported file format: ${file.mimetype}. Allowed formats are: JPG, JPEG, PNG, WEBP.`
    );
    error.status = 400;
    cb(error, false);
  }
};

/**
 * Multer upload middleware instance
 * - Maximum file size: 5MB
 * - Single file field name: 'photo'
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes
    files: 1,
  },
});

/**
 * Express middleware wrapper to catch Multer errors cleanly and return 400 responses
 */
export const uploadStudentPhoto = (req, res, next) => {
  const singleUpload = upload.single('photo');

  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: {
            message: 'File size exceeds maximum limit of 5MB',
            field: 'photo',
            code: err.code,
          },
        });
      }
      return res.status(400).json({
        error: {
          message: `Upload error: ${err.message}`,
          field: 'photo',
          code: err.code,
        },
      });
    } else if (err) {
      return res.status(err.status || 400).json({
        error: {
          message: err.message || 'Error processing uploaded file',
          field: 'photo',
        },
      });
    }
    next();
  });
};

export default {
  upload,
  uploadStudentPhoto,
};
