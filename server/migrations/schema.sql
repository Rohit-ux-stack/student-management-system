-- ==============================================================================
-- STUDENT MANAGEMENT SYSTEM - BASELINE POSTGRESQL SCHEMA (EMPTY SCHEMA)
-- Absolutely NO dummy/seed data is included.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SEQUENCE IF NOT EXISTS student_admission_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    NO MAXVALUE
    CACHE 1;

CREATE OR REPLACE FUNCTION generate_admission_number()
RETURNS VARCHAR(30) AS $$
BEGIN
    RETURN 'ADM' || TO_CHAR(CURRENT_DATE, 'YYYY') || LPAD(nextval('student_admission_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_number VARCHAR(30) NOT NULL UNIQUE DEFAULT generate_admission_number(),
    name VARCHAR(255) NOT NULL,
    course VARCHAR(100) NOT NULL,
    year SMALLINT NOT NULL CHECK (year >= 1 AND year <= 8),
    date_of_birth DATE NOT NULL CHECK (date_of_birth <= CURRENT_DATE),
    email VARCHAR(255) NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    mobile_number VARCHAR(20) NOT NULL CHECK (mobile_number ~ '^\+?[0-9\s\-()]{7,20}$'),
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Non-Binary', 'Other', 'Prefer Not to Say')),
    address TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_admission_number ON students (admission_number);
CREATE INDEX IF NOT EXISTS idx_students_email ON students (email);
CREATE INDEX IF NOT EXISTS idx_students_course ON students (course);
CREATE INDEX IF NOT EXISTS idx_students_year ON students (year);

DROP TRIGGER IF EXISTS set_students_updated_at ON students;
CREATE TRIGGER set_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- ==============================================================================
-- ACTIVITY LOGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at DESC);

