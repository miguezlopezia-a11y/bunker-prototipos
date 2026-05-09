import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { handleCORS, handleOPTIONS } from '@/lib/cors'
import { writeAuditLog, getClientIP, AuditActions } from '@/lib/auditLog'

export async function OPTIONS() {
  return handleOPTIONS()
}

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      grade, maxGrade, subject, gradeLevel,
      questions, timeTaken, gradeLabel,
      studentName, studentGroup,
      processedAnonymous = false,
      ocr_confidence = null,
      wizardConfig = null
    } = body

    // Sanitize ocr_confidence: must be DECIMAL(5,4) between 0 and 1
    let cleanConfidence = null
    if (ocr_confidence !== null && ocr_confidence !== undefined) {
      const c = parseFloat(ocr_confidence)
      if (!isNaN(c)) cleanConfidence = Math.max(0, Math.min(1, c))
    }

    const { data, error } = await supabaseAdmin
      .from('exam_results')
      .insert({
        student_name:        studentName  || null,
        student_group:       studentGroup || null,
        subject:             subject      || '',
        level:               gradeLevel   || '',
        grade:               grade        ?? 0,
        max_grade:           maxGrade     ?? 10,
        feedback: {
          gradeLabel:     gradeLabel || '',
          questions:      questions  || [],
          timeTaken:      timeTaken  || 0,
          totalQuestions: questions?.length ?? 0
        },
        processed_anonymous: processedAnonymous,
        ocr_confidence:      cleanConfidence,
        wizard_config:       wizardConfig || {}
        // teacher_id and school_id are NULL until auth is implemented
      })
      .select('id')
      .single()

    if (error) throw new Error(error.message)

    // Auto-log AI corrections for ANECA audit trail (Feature 2)
    // Each question with feedback becomes a logged AI correction
    if (Array.isArray(questions) && questions.length > 0) {
      try {
        const aiCorrections = questions.map((q, idx) => ({
          exam_result_id: data.id,
          question_index: idx,
          original_text: String(q.studentAnswer || '').slice(0, 5000),
          corrected_text: String(q.correctAnswer || '').slice(0, 5000),
          correction_type: 'ERROR_REPAIR',
          correction_source: 'AI_MODEL',
          confidence_score: cleanConfidence,
          notes: q.feedback ? String(q.feedback).slice(0, 2000) : null,
          corrected_by: null
        }))
        await supabaseAdmin.from('text_corrections').insert(aiCorrections)
      } catch (corrErr) {
        // Don't fail save if corrections logging fails (table may not exist yet)
        console.warn('Could not log AI corrections (table may not exist yet):', corrErr.message)
      }
    }

    // Increment monthly consumption (Feature 1: Hybrid Pricing)
    // Counts 1 page per saved result. Skips silently if no schoolId yet (auth not implemented).
    try {
      // For MVP: count globally even without school auth
      // When auth lands, replace with: schoolId from teacher session
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1

      // Try to find a school_id from the saved row (will be null until auth)
      // We still track usage for MVP via aggregate; full per-school tracking starts when teacher_id is set
      // Using 'global' consumption tracking is skipped for now; instead, /api/consumption GET aggregates
    } catch (e) {
      console.warn('Consumption tracking skipped:', e.message)
    }

    // Audit log: Result saved
    await writeAuditLog({
      userId: null, // TODO: Get from auth when implemented
      schoolId: null, // TODO: Get from auth when implemented  
      action: AuditActions.SAVE_EXAM_RESULT,
      affectedTable: 'exam_results',
      affectedRecordId: data.id,
      ipAddress: getClientIP(request),
      metadata: {
        studentName: studentName || 'Anónimo',
        subject,
        grade,
        processedAnonymous
      }
    })

    return handleCORS(NextResponse.json({
      success: true,
      id:      data.id,
      message: 'Resultado guardado correctamente'
    }))
  } catch (error) {
    console.error('POST /api/save-result error:', error)
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
  }
}
