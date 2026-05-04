import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { handleOPTIONS } from '@/lib/cors'
import { writeAuditLog, getClientIP, AuditActions } from '@/lib/auditLog'

export async function OPTIONS() {
  return handleOPTIONS()
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const studentName = searchParams.get('studentName')

    // Build query with same filters as history page
    let query = supabaseAdmin
      .from('exam_results')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1000) // Max 1000 records per export

    if (subject && subject !== 'Todas') query = query.eq('subject', subject)
    if (dateFrom) query = query.gte('created_at', dateFrom)
    if (dateTo) query = query.lte('created_at', dateTo)
    if (studentName) query = query.ilike('student_name', `%${studentName}%`)

    const { data, error } = await query

    if (error) throw new Error(error.message)

    // Audit log: CSV export
    await writeAuditLog({
      userId: null, // TODO: Get from auth when implemented
      schoolId: null, // TODO: Get from auth when implemented
      action: AuditActions.EXPORT_CSV,
      affectedTable: 'exam_results',
      affectedRecordId: null,
      ipAddress: getClientIP(request),
      metadata: {
        recordCount: data?.length || 0,
        filters: { subject, dateFrom, dateTo, studentName }
      }
    })

    // Generate CSV
    const csv = generateCSV(data || [])

    // Return CSV with proper headers
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="examenes_${new Date().toISOString().split('T')[0]}.csv"`,
        'Access-Control-Allow-Origin': process.env.CORS_ORIGINS || '*'
      }
    })
  } catch (error) {
    console.error('GET /api/export-csv error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Error al exportar CSV' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

function generateCSV(results) {
  // CSV Headers (Spanish)
  const headers = [
    'Nombre del Estudiante',
    'Clase/Grupo',
    'Asignatura',
    'Nivel',
    'Nota',
    'Nota Máxima',
    'Calificación',
    'Número de Preguntas',
    'Tiempo de Corrección (s)',
    'Modelo IA',
    'Procesado Anónimamente',
    'Fecha de Corrección'
  ]

  // Build CSV rows
  const rows = results.map(result => {
    const feedback = result.feedback || {}
    const aiModel = 'GPT-4o' // Default AI model used
    
    return [
      escapeCsvField(result.student_name || 'Anónimo'),
      escapeCsvField(result.student_group || ''),
      escapeCsvField(result.subject || ''),
      escapeCsvField(result.level || ''),
      result.grade?.toFixed(2) || '0.00',
      result.max_grade?.toFixed(2) || '10.00',
      escapeCsvField(feedback.gradeLabel || ''),
      feedback.totalQuestions || (feedback.questions?.length ?? 0),
      feedback.timeTaken?.toFixed(1) || '0.0',
      aiModel,
      result.processed_anonymous ? 'Sí' : 'No',
      formatDateForCSV(result.created_at)
    ]
  })

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Add BOM for Excel UTF-8 compatibility
  return '\uFEFF' + csvContent
}

function escapeCsvField(field) {
  if (field == null) return ''
  const str = String(field)
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function formatDateForCSV(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
