// Audit log helper for tracking all critical operations
// Writes to immutable audit_log table in Supabase

import { supabaseAdmin } from './supabase'

export async function writeAuditLog({
  userId,
  schoolId,
  action,
  affectedTable,
  affectedRecordId,
  ipAddress,
  metadata = {}
}) {
  try {
    const { error } = await supabaseAdmin
      .from('audit_log')
      .insert({
        user_id: userId || null,
        school_id: schoolId || null,
        action,
        affected_table: affectedTable || null,
        affected_record_id: affectedRecordId || null,
        ip_address: ipAddress || null,
        metadata // Store as JSONB
      })

    if (error) {
      console.error('Audit log write failed:', error)
      // Don't throw - audit failure shouldn't break the operation
    }
  } catch (err) {
    console.error('Audit log exception:', err)
  }
}

// Helper to extract IP from Next.js request
export function getClientIP(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') || // Cloudflare
    'unknown'
  )
}

// Predefined action types for consistency
export const AuditActions = {
  // Exam operations
  GRADE_EXAM: 'grade_exam',
  SAVE_EXAM_RESULT: 'save_exam_result',
  DELETE_EXAM_RESULT: 'delete_exam_result',
  VIEW_EXAM_RESULTS: 'view_exam_results',
  EXPORT_CSV: 'export_csv',
  
  // Rubric operations
  CREATE_RUBRIC: 'create_rubric',
  UPDATE_RUBRIC: 'update_rubric',
  DELETE_RUBRIC: 'delete_rubric',
  
  // School operations
  UPDATE_SCHOOL: 'update_school',
  
  // Teacher operations
  INVITE_TEACHER: 'invite_teacher',
  UPDATE_TEACHER: 'update_teacher',
  DELETE_TEACHER: 'delete_teacher',
  
  // Auth operations
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // Privacy operations
  REQUEST_DATA_EXPORT: 'request_data_export',
  REQUEST_DATA_DELETION: 'request_data_deletion',
  CONSENT_GIVEN: 'consent_given',
  CONSENT_WITHDRAWN: 'consent_withdrawn'
}
