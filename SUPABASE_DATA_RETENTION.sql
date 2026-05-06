-- ============================================================================
-- DATA RETENTION AUTOMATION - Supabase pg_cron Configuration
-- ============================================================================
-- This script sets up automated data retention for RGPD compliance
-- Runs nightly at 02:00 UTC to soft-delete old exam results
-- ============================================================================

-- Step 1: Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Step 2: Grant permissions
-- Note: Run this as postgres user in Supabase SQL Editor
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Step 3: Create the data retention function
CREATE OR REPLACE FUNCTION apply_data_retention_policy()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_count INTEGER;
  school_record RECORD;
  retention_period INTERVAL;
BEGIN
  -- Default retention period: 24 months
  -- TODO: In production, fetch retention_period from schools.retention_months column
  retention_period := INTERVAL '24 months';

  -- Soft delete exam_results older than retention period
  UPDATE exam_results
  SET deleted_at = NOW(),
      updated_at = NOW()
  WHERE deleted_at IS NULL
    AND created_at < (NOW() - retention_period);

  GET DIAGNOSTICS affected_count = ROW_COUNT;

  -- Log to audit_log
  IF affected_count > 0 THEN
    INSERT INTO audit_log (
      user_id,
      school_id,
      action,
      affected_table,
      affected_record_id,
      ip_address,
      metadata,
      created_at
    )
    VALUES (
      NULL,
      NULL,
      'retention_policy_applied',
      'exam_results',
      NULL,
      'system',
      jsonb_build_object(
        'affected_count', affected_count,
        'retention_period', retention_period::text,
        'execution_time', NOW()
      ),
      NOW()
    );

    RAISE NOTICE 'Data retention policy applied: % records soft-deleted', affected_count;
  ELSE
    RAISE NOTICE 'Data retention policy: No records to delete';
  END IF;

  -- Optional: Hard delete records that have been soft-deleted for > 30 days
  -- Uncomment if you want to enable hard deletion
  /*
  DELETE FROM exam_results
  WHERE deleted_at IS NOT NULL
    AND deleted_at < (NOW() - INTERVAL '30 days');

  GET DIAGNOSTICS affected_count = ROW_COUNT;

  IF affected_count > 0 THEN
    INSERT INTO audit_log (
      user_id,
      school_id,
      action,
      affected_table,
      affected_record_id,
      ip_address,
      metadata,
      created_at
    )
    VALUES (
      NULL,
      NULL,
      'retention_policy_hard_delete',
      'exam_results',
      NULL,
      'system',
      jsonb_build_object(
        'affected_count', affected_count,
        'execution_time', NOW()
      ),
      NOW()
    );

    RAISE NOTICE 'Hard delete applied: % records permanently removed', affected_count;
  END IF;
  */

END;
$$;

-- Step 4: Schedule the cron job to run nightly at 02:00 UTC
-- First, remove any existing job with the same name (idempotent)
SELECT cron.unschedule('data-retention-nightly')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'data-retention-nightly'
);

-- Now schedule the job
SELECT cron.schedule(
  'data-retention-nightly',           -- Job name
  '0 2 * * *',                         -- Cron expression: 02:00 UTC daily
  $$ SELECT apply_data_retention_policy(); $$  -- Function to execute
);

-- Step 5: Verify the scheduled job
SELECT * FROM cron.job WHERE jobname = 'data-retention-nightly';

-- ============================================================================
-- MANUAL TESTING (Optional - Run to test the function immediately)
-- ============================================================================
-- Uncomment the line below to test the retention policy manually:
-- SELECT apply_data_retention_policy();

-- ============================================================================
-- MONITORING QUERIES
-- ============================================================================

-- Check how many records will be affected (DRY RUN)
SELECT COUNT(*) as records_to_soft_delete
FROM exam_results
WHERE deleted_at IS NULL
  AND created_at < (NOW() - INTERVAL '24 months');

-- View recent audit log entries for retention policy
SELECT *
FROM audit_log
WHERE action IN ('retention_policy_applied', 'retention_policy_hard_delete')
ORDER BY created_at DESC
LIMIT 10;

-- Check cron job execution history
SELECT *
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'data-retention-nightly')
ORDER BY start_time DESC
LIMIT 10;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. This script uses SOFT DELETE (sets deleted_at column)
-- 2. Hard delete is commented out by default for safety
-- 3. All operations are logged to audit_log for compliance
-- 4. Cron runs as postgres user with SECURITY DEFINER
-- 5. Retention period is currently hardcoded to 24 months
--    In production, add retention_months column to schools table
-- 6. Time zone is UTC - adjust if your business logic requires different TZ
-- ============================================================================
