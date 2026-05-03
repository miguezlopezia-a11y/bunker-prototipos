import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// ── Supabase server-side client ──────────────────────────────────────────────
// Uses service role key to bypass RLS for all server-side operations.
// Never expose this key to the frontend.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false } }
)

// ── CORS ─────────────────────────────────────────────────────────────────────
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// ── Transform Supabase row → frontend camelCase format ───────────────────────
function transformResult(row) {
  const fb = row.feedback || {}
  return {
    id:             row.id,
    studentName:    row.student_name  || '',
    studentGroup:   row.student_group || '',
    subject:        row.subject       || '',
    gradeLevel:     row.level         || '',
    grade:          parseFloat(row.grade)     || 0,
    maxGrade:       parseFloat(row.max_grade) || 10,
    gradeLabel:     fb.gradeLabel  || '',
    questions:      fb.questions   || [],
    timeTaken:      fb.timeTaken   || 0,
    totalQuestions: fb.totalQuestions ?? (fb.questions || []).length,
    createdAt:      row.created_at,
  }
}

// ── Extract JSON from AI response (handles markdown code blocks) ─────────────
function extractJSON(text) {
  if (!text) return null
  const block = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (block) text = block[1].trim()
  const s = text.indexOf('{')
  const e = text.lastIndexOf('}')
  if (s !== -1 && e !== -1) return text.slice(s, e + 1)
  return text
}

// ── AI exam grading ───────────────────────────────────────────────────────────
async function gradeExamWithAI({ imageBase64, mimeType, subject, gradeLevel, rubric }) {
  const systemPrompt = `Eres un corrector de examenes experto en el sistema educativo espanol.
Recibiras la imagen de un examen de un estudiante y la rubrica o respuestas correctas.

Tu tarea:
1. Analizar la imagen del examen y extraer las respuestas del estudiante
2. Comparar cada respuesta con la rubrica proporcionada
3. Asignar puntuacion a cada pregunta (siendo justo pero riguroso)
4. Calcular la nota final sobre 10
5. Proporcionar feedback breve y constructivo por cada pregunta

IMPORTANTE: Responde UNICAMENTE con JSON valido. Sin texto adicional. Usa este formato exacto:
{
  "grade": 7.5,
  "maxGrade": 10,
  "totalQuestions": 5,
  "gradeLabel": "Notable",
  "questions": [
    {
      "number": 1,
      "studentAnswer": "respuesta del estudiante",
      "correctAnswer": "respuesta correcta segun rubrica",
      "pointsAwarded": 2.0,
      "maxPoints": 2.0,
      "feedback": "Breve feedback constructivo"
    }
  ]
}`

  const userText = `Asignatura: ${subject}\nNivel educativo: ${gradeLevel}\n\nRubrica / Respuestas correctas:\n${rubric || 'No se ha proporcionado rubrica. Evalua segun el contenido del examen con criterio general.'}\n\nPor favor, evalua el examen y devuelve el resultado en formato JSON.`

  const messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
        { type: 'text', text: userText }
      ]
    }
  ]

  const response = await fetch('https://integrations.emergentagent.com/llm/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.EMERGENT_LLM_KEY}`,
      'X-App-ID': process.env.NEXT_PUBLIC_BASE_URL || ''
    },
    body: JSON.stringify({ model: 'gpt-4o', messages, max_tokens: 2000, temperature: 0.3 })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`AI API error: ${response.status} - ${err}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''
  const jsonStr = extractJSON(content)

  try {
    return JSON.parse(jsonStr)
  } catch {
    throw new Error(`No se pudo parsear la respuesta de la IA: ${content.slice(0, 200)}`)
  }
}

// ── GET handler ───────────────────────────────────────────────────────────────
export async function GET(request) {
  const { pathname, searchParams } = new URL(request.url)
  const path = pathname.replace('/api', '')

  try {
    // ── GET /api/health ───────────────────────────────────────────────────────
    if (path === '/health' || path === '/health/') {
      return handleCORS(NextResponse.json({
        status: 'ok',
        service: 'Corrector de Examenes',
        database: 'Supabase PostgreSQL'
      }))
    }

    // ── GET /api/results ──────────────────────────────────────────────────────
    if (path === '/results' || path === '/results/') {
      const subject     = searchParams.get('subject')
      const dateFrom    = searchParams.get('dateFrom')
      const dateTo      = searchParams.get('dateTo')
      const studentName = searchParams.get('studentName')

      let query = supabase
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

      return handleCORS(NextResponse.json({
        success: true,
        results,
        total:    results.length,
        avgGrade
      }))
    }

    return handleCORS(NextResponse.json({ error: 'Endpoint no encontrado' }, { status: 404 }))

  } catch (error) {
    console.error('GET error:', error)
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
  }
}

// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(request) {
  const { pathname } = new URL(request.url)
  const path = pathname.replace('/api', '')

  try {
    // ── POST /api/grade ───────────────────────────────────────────────────────
    if (path === '/grade' || path === '/grade/') {
      const body = await request.json()
      const { imageBase64, mimeType, subject, gradeLevel, rubric } = body

      if (!imageBase64) {
        return handleCORS(NextResponse.json(
          { success: false, error: 'Se requiere imagen del examen' },
          { status: 400 }
        ))
      }

      const startTime = Date.now()
      const gradeResult = await gradeExamWithAI({
        imageBase64,
        mimeType:   mimeType   || 'image/jpeg',
        subject:    subject    || 'Asignatura no especificada',
        gradeLevel: gradeLevel || 'Nivel no especificado',
        rubric
      })
      const timeTaken = parseFloat(((Date.now() - startTime) / 1000).toFixed(1))

      return handleCORS(NextResponse.json({ success: true, ...gradeResult, timeTaken }))
    }

    // ── POST /api/save-result ─────────────────────────────────────────────────
    if (path === '/save-result' || path === '/save-result/') {
      const body = await request.json()
      const {
        grade, maxGrade, subject, gradeLevel,
        questions, timeTaken, gradeLabel,
        studentName, studentGroup
      } = body

      const { data, error } = await supabase
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
          processed_anonymous: false
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
    }

    return handleCORS(NextResponse.json({ error: 'Endpoint no encontrado' }, { status: 404 }))

  } catch (error) {
    console.error('POST error:', error)
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
  }
}
