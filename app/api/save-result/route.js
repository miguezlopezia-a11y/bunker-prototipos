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
