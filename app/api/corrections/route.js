import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { handleCORS, handleOPTIONS } from '@/lib/cors'
import { writeAuditLog, getClientIP } from '@/lib/auditLog'

export async function OPTIONS() {
  return handleOPTIONS()
}

// GET /api/corrections?examResultId=xxx — list corrections for an exam
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const examResultId = searchParams.get('examResultId')
    if (!examResultId) {
      return handleCORS(NextResponse.json(
        { success: false, error: 'examResultId requerido' },
        { status: 400 }
      ))
    }

    const { data, error } = await supabaseAdmin
      .from('text_corrections')
      .select('*')
      .eq('exam_result_id', examResultId)
      .order('corrected_at', { ascending: false })

    if (error) throw new Error(error.message)

    return handleCORS(NextResponse.json({
      success: true,
      total: data?.length || 0,
      corrections: (data || []).map(c => ({
        id: c.id,
        examResultId: c.exam_result_id,
        questionIndex: c.question_index,
        originalText: c.original_text,
        correctedText: c.corrected_text,
        correctionType: c.correction_type,
        correctionSource: c.correction_source,
        confidenceScore: c.confidence_score !== null ? parseFloat(c.confidence_score) : null,
        notes: c.notes,
        correctedBy: c.corrected_by,
        correctedAt: c.corrected_at
      }))
    }))
  } catch (error) {
    console.error('GET /api/corrections error:', error)
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
  }
}

// POST /api/corrections — create new correction (manual or AI-logged)
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      examResultId,
      questionIndex,
      originalText,
      correctedText,
      correctionType,
      correctionSource = 'HUMAN_TEACHER',
      confidenceScore = null,
      notes = null,
      correctedBy = null
    } = body

    if (!examResultId || questionIndex === undefined || !originalText) {
      return handleCORS(NextResponse.json(
        { success: false, error: 'examResultId, questionIndex y originalText son obligatorios' },
        { status: 400 }
      ))
    }

    const validTypes = ['ERROR_REPAIR', 'EDITORIAL_NORMALIZATION', 'FORMATTING_STANDARDIZATION', 'AMBIGUITY_RESOLUTION']
    const validSources = ['AI_MODEL', 'HUMAN_TEACHER', 'RULE_AUTOMATIC']

    if (correctionType && !validTypes.includes(correctionType)) {
      return handleCORS(NextResponse.json(
        { success: false, error: `correctionType debe ser uno de: ${validTypes.join(', ')}` },
        { status: 400 }
      ))
    }
    if (!validSources.includes(correctionSource)) {
      return handleCORS(NextResponse.json(
        { success: false, error: `correctionSource debe ser uno de: ${validSources.join(', ')}` },
        { status: 400 }
      ))
    }

    let cleanScore = null
    if (confidenceScore !== null && confidenceScore !== undefined) {
      const c = parseFloat(confidenceScore)
      if (!isNaN(c)) cleanScore = Math.max(0, Math.min(1, c))
    }

    const { data, error } = await supabaseAdmin
      .from('text_corrections')
      .insert({
        exam_result_id: examResultId,
        question_index: questionIndex,
        original_text: originalText,
        corrected_text: correctedText || null,
        correction_type: correctionType || null,
        correction_source: correctionSource,
        confidence_score: cleanScore,
        notes,
        corrected_by: correctedBy
      })
      .select('*')
      .single()

    if (error) throw new Error(error.message)

    // Audit log
    await writeAuditLog({
      userId: correctedBy,
      schoolId: null,
      action: 'CORRECTION_LOGGED',
      affectedTable: 'text_corrections',
      affectedRecordId: data.id,
      ipAddress: getClientIP(request),
      metadata: {
        examResultId,
        questionIndex,
        correctionType,
        correctionSource,
        hasNotes: !!notes
      }
    })

    return handleCORS(NextResponse.json({
      success: true,
      id: data.id,
      correction: {
        id: data.id,
        examResultId: data.exam_result_id,
        questionIndex: data.question_index,
        originalText: data.original_text,
        correctedText: data.corrected_text,
        correctionType: data.correction_type,
        correctionSource: data.correction_source,
        confidenceScore: data.confidence_score !== null ? parseFloat(data.confidence_score) : null,
        notes: data.notes,
        correctedBy: data.corrected_by,
        correctedAt: data.corrected_at
      },
      message: 'Corrección registrada correctamente'
    }))
  } catch (error) {
    console.error('POST /api/corrections error:', error)
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
  }
}
