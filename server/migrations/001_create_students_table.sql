-- ==============================================================================
-- MIGRATION: 001_create_students_table.sql
-- DESCRIPTION: Provision the students table, sequence, helper functions, and triggers.
-- NOTE: Absolutely NO seed or dummy data is inserted. The table is created empty.
-- ==============================================================================

-- 1. Enable pgcrypto / uuid generation extension if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create sequence for sequential admission number numbering
CREATE SEQUENCE IF NOT EXISTS student_admission_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO MAXVALUE
    CACHE 1;

-- 3. Helper function for database-level admission number generation
-- Format: ADM + [Current 4-digit Year] + [4-digit Zero-padded Sequence] (e.g. ADM20260001)
-- Hook / Note for Phase 2: If the application layer handles generation, it can provide
-- the admission_number explicitly in INSERT queries, bypassing this default.
CREATE OR REPLACE FUNCTION generate_admission_number()
RETURNS VARCHAR(30) AS $$
BEGIN
    RETURN 'ADM' || TO_CHAR(CURRENT_DATE, 'YYYY') || LPAD(nextval('student_admission_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- 4. Reusable trigger function for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create students table
CREATE TABLE IF NOT EXISTS students (
    -- Primary Key: UUID provides tamper-proof, non-sequential identifier protection
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Admission Number: Unique, format-enforced identifier
    admission_number VARCHAR(30) NOT NULL UNIQUE DEFAULT generate_admission_number(),

    -- Student Personal & Academic Details
    name VARCHAR(255) NOT NULL,
    course VARCHAR(100) NOT NULL,
    year SMALLINT NOT NULL CHECK (year >= 1 AND year <= 8),
    date_of_birth DATE NOT NULL CHECK (date_of_birth <= CURRENT_DATE),

    -- Contact Information with Validation Constraints
    email VARCHAR(255) NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    mobile_number VARCHAR(20) NOT NULL CHECK (mobile_number ~ '^\+?[0-9\s\-()]{7,20}$'),

    -- Demographic Information
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Non-Binary', 'Other', 'Prefer Not to Say')),
    address TEXT,

    -- Photo Reference: Firebase Storage Download URL (no raw binary in Postgres)
    photo_url TEXT,

    -- Audit Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Indexes for optimized querying and lookups
CREATE INDEX IF NOT EXISTS idx_students_admission_number ON students (admission_number);
CREATE INDEX IF NOT EXISTS idx_students_email ON students (email);
CREATE INDEX IF NOT EXISTS idx_students_course ON students (course);
CREATE INDEX IF NOT EXISTS idx_students_year ON students (year);

-- 7. Trigger to automatically update updated_at on record changes
DROP TRIGGER IF EXISTS set_students_updated_at ON students;
CREATE TRIGGER set_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- Schema Comments for Data Dictionary & Tooling
COMMENT ON TABLE students IS 'Stores academic and demographic records for enrolled students.';
COMMENT ON COLUMN students.id IS 'Primary UUID key.';
COMMENT ON COLUMN students.admission_number IS 'Unique institutional admission code (format: ADM{YYYY}{SEQ}).';
COMMENT ON COLUMN students.photo_url IS 'Public/Signed download URL hosted in Firebase Cloud Storage.';
