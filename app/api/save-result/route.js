import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { handleCORS, handleOPTIONS } from '@/lib/cors'

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
      processedAnonymous = false
    } = body

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
        processed_anonymous: processedAnonymous
        // teacher_id and school_id are NULL until auth is implemented
      })
      .select('id')
      .single()

    if (error) throw new Error(error.message)

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
