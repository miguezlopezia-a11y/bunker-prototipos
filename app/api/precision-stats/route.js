import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { handleCORS, handleOPTIONS } from '@/lib/cors'

export async function OPTIONS() {
  return handleOPTIONS()
}

// Returns precision (OCR confidence) statistics
// - currentMonthAvg: average for current month (for header badge)
// - monthly: array of last 12 months { month, avgConfidence, examCount }
// - global: lifetime average
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId') // optional filter

    let query = supabaseAdmin
      .from('exam_results')
      .select('ocr_confidence, created_at, school_id')
      .is('deleted_at', null)
      .not('ocr_confidence', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5000)

    if (schoolId) query = query.eq('school_id', schoolId)

    const { data, error } = await query
    if (error) throw new Error(error.message)

    const rows = data || []

    // Lifetime average
    const globalAvg = rows.length > 0
      ? rows.reduce((s, r) => s + parseFloat(r.ocr_confidence), 0) / rows.length
      : null

    // Current month
    const now = new Date()
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // Group by month
    const monthMap = {}
    for (const r of rows) {
      const d = new Date(r.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!monthMap[key]) monthMap[key] = { sum: 0, count: 0 }
      monthMap[key].sum += parseFloat(r.ocr_confidence)
      monthMap[key].count += 1
    }

    const SPANISH_MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

    // Build last 12 months
    const monthly = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const entry = monthMap[key]
      monthly.push({
        month: SPANISH_MONTHS[d.getMonth()],
        monthKey: key,
        avgConfidence: entry ? Math.round((entry.sum / entry.count) * 10000) / 10000 : null,
        examCount: entry ? entry.count : 0,
        precision: entry ? Math.round((entry.sum / entry.count) * 1000) / 10 : null  // as percentage e.g. 98.7
      })
    }

    const currentMonth = monthMap[currentMonthKey]
    const currentMonthAvg = currentMonth
      ? Math.round((currentMonth.sum / currentMonth.count) * 10000) / 10000
      : null

    return handleCORS(NextResponse.json({
      success: true,
      currentMonthAvg,
      currentMonthCount: currentMonth?.count || 0,
      globalAvg: globalAvg !== null ? Math.round(globalAvg * 10000) / 10000 : null,
      totalGradedWithConfidence: rows.length,
      monthly,
      target: 0.99
    }))
  } catch (error) {
    console.error('GET /api/precision-stats error:', error)
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
  }
}
