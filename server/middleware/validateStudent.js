/**
 * Student Payload Validation Middleware
 * Validates request bodies for POST (creation) and PUT (update) routes.
 * Ensures readable, field-level 400 error responses before queries reach PostgreSQL constraints.
 */

const ALLOWED_GENDERS = [
  'Male',
  'Female',
  'Non-Binary',
  'Other',
  'Prefer Not to Say',
];

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

/**
 * Helper to validate date string and ensure it is not in the future
 * @param {string} dateStr
 * @returns {boolean}
 */
function isValidPastOrPresentDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return false;

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return parsed <= today;
}

/**
 * Creates student validation middleware
 * @param {boolean} [isUpdate=false] - If true, all fields are optional (partial update)
 */
export function validateStudent(isUpdate = false) {
  return (req, res, next) => {
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

    const errors = {};

    // 1. Name validation
    if (!isUpdate || name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.name = 'Name is required and cannot be empty.';
      } else if (name.trim().length > 255) {
        errors.name = 'Name cannot exceed 255 characters.';
      }
    }

    // 2. Course validation
    if (!isUpdate || course !== undefined) {
      if (!course || typeof course !== 'string' || course.trim().length === 0) {
        errors.course = 'Course is required and cannot be empty.';
      } else if (course.trim().length > 100) {
        errors.course = 'Course cannot exceed 100 characters.';
      }
    }

    // 3. Year validation (1 to 8)
    if (!isUpdate || year !== undefined) {
      const parsedYear = Number(year);
      if (
        year === undefined ||
        year === null ||
        year === '' ||
        isNaN(parsedYear) ||
        !Number.isInteger(parsedYear) ||
        parsedYear < 1 ||
        parsedYear > 8
      ) {
        errors.year = 'Year is required and must be an integer between 1 and 8.';
      }
    }

    // 4. Date of Birth validation
    if (!isUpdate || date_of_birth !== undefined) {
      if (!date_of_birth || typeof date_of_birth !== 'string' || date_of_birth.trim().length === 0) {
        errors.date_of_birth = 'Date of birth is required.';
      } else if (!isValidPastOrPresentDate(date_of_birth.trim())) {
        errors.date_of_birth =
          'Date of birth must be a valid calendar date in YYYY-MM-DD format and cannot be in the future.';
      }
    }

    // 5. Email validation
    if (!isUpdate || email !== undefined) {
      if (!email || typeof email !== 'string' || email.trim().length === 0) {
        errors.email = 'Email address is required.';
      } else if (!EMAIL_REGEX.test(email.trim())) {
        errors.email = 'Invalid email address format.';
      } else if (email.trim().length > 255) {
        errors.email = 'Email address cannot exceed 255 characters.';
      }
    }

    // 6. Mobile Number validation
    if (!isUpdate || mobile_number !== undefined) {
      if (
        !mobile_number ||
        typeof mobile_number !== 'string' ||
        mobile_number.trim().length === 0
      ) {
        errors.mobile_number = 'Mobile number is required.';
      } else if (!PHONE_REGEX.test(mobile_number.trim())) {
        errors.mobile_number =
          'Invalid mobile number format (must contain 7 to 20 digits, spaces, or valid phone punctuation).';
      }
    }

    // 7. Gender validation
    if (!isUpdate || gender !== undefined) {
      if (!gender || typeof gender !== 'string' || gender.trim().length === 0) {
        errors.gender = 'Gender is required.';
      } else if (!ALLOWED_GENDERS.includes(gender.trim())) {
        errors.gender = `Gender must be one of: ${ALLOWED_GENDERS.join(', ')}.`;
      }
    }

    // 8. Address validation (optional string)
    if (address !== undefined && address !== null && typeof address !== 'string') {
      errors.address = 'Address must be a string.';
    }

    // If PUT update with no fields provided and no photo uploaded
    if (isUpdate && Object.keys(req.body).length === 0 && !req.file) {
      errors._general = 'At least one field or photo must be provided to update.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          errors,
        },
        errors,
      });
    }

    next();
  };
}

export default {
  validateStudent,
};
