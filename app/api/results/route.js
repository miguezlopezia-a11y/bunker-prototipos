import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { handleCORS, handleOPTIONS } from '@/lib/cors'
import { transformResult } from '@/lib/transforms'

export async function OPTIONS() {
  return handleOPTIONS()
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const subject     = searchParams.get('subject')
    const dateFrom    = searchParams.get('dateFrom')
    const dateTo      = searchParams.get('dateTo')
    const studentName = searchParams.get('studentName')

    let query = supabaseAdmin
      .from('exam_results')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100)

    if (subject && subject !== 'Todas') query = query.eq('subject', subject)
    if (dateFrom)     query = query.gte('created_at', dateFrom)
    if (dateTo)       query = query.lte('created_at', dateTo)
    if (studentName)  query = query.ilike('student_name', `%${studentName}%`)

    const { data, error } = await query

    if (error) throw new Error(error.message)

    const results = (data || []).map(transformResult)
    const avgGrade = results.length > 0
      ? Math.round((results.reduce((s, r) => s + r.grade, 0) / results.length) * 10) / 10
      : 0

    // Average OCR confidence (precision metric / 1 - CER)
    const withConfidence = results.filter(r => r.ocrConfidence !== null && r.ocrConfidence !== undefined)
    const avgConfidence = withConfidence.length > 0
      ? Math.round((withConfidence.reduce((s, r) => s + r.ocrConfidence, 0) / withConfidence.length) * 10000) / 10000
      : null

    return handleCORS(NextResponse.json({
      success: true,
      results,
      total:    results.length,
      avgGrade,
      avgConfidence,
      precisionExamCount: withConfidence.length
    }))
  } catch (error) {
    console.error('GET /api/results error:', error)
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
  }
}
