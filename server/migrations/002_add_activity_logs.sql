-- ==============================================================================
-- MIGRATION: 002_add_activity_logs.sql
-- DESCRIPTION: Provision the activity_logs table for audit logging & analytics.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS activity_logs (
    -- Unique identifier for the activity log entry
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Action category identifier (e.g., CREATE_STUDENT, UPDATE_STUDENT, DELETE_STUDENT, BULK_DELETE_STUDENTS)
    action_type VARCHAR(50) NOT NULL,

    -- Human-readable descriptive summary of the action
    description TEXT NOT NULL,

    -- Immutable creation timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on created_at for fast retrieval of recent activity logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at DESC);

-- Schema Comments for Data Dictionary & Tooling
COMMENT ON TABLE activity_logs IS 'Audit logs tracking administrative student entity mutations and operations.';
COMMENT ON COLUMN activity_logs.id IS 'Primary UUID key for the log entry.';
COMMENT ON COLUMN activity_logs.action_type IS 'Action type tag (CREATE_STUDENT, UPDATE_STUDENT, DELETE_STUDENT, BULK_DELETE_STUDENTS).';
COMMENT ON COLUMN activity_logs.description IS 'Detailed human-readable log description.';
COMMENT ON COLUMN activity_logs.created_at IS 'Timestamp when the activity took place.';
