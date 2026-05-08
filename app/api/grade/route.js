import { NextResponse } from 'next/server'
import { handleCORS, handleOPTIONS } from '@/lib/cors'
import { rateLimit } from '@/lib/rateLimit'
import { validateImageUpload } from '@/lib/fileValidation'
import { sanitizeStudentData } from '@/lib/sanitize'
import { writeAuditLog, getClientIP, AuditActions } from '@/lib/auditLog'
import { getPromptFromWizard } from '@/lib/promptBuilder'

export async function OPTIONS() {
  return handleOPTIONS()
}

// Extract JSON from AI response (handles markdown code blocks)
function extractJSON(text) {
  if (!text) return null
  const block = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (block) text = block[1].trim()
  const s = text.indexOf('{')
  const e = text.lastIndexOf('}')
  if (s !== -1 && e !== -1) return text.slice(s, e + 1)
  return text
}

// Default Spanish prompt (fallback if no wizard config)
function buildDefaultPrompt() {
  return `Eres un corrector de examenes experto en el sistema educativo espanol.
Recibiras la imagen de un examen de un estudiante y la rubrica o respuestas correctas.

⚠️ PROTECCION DE MENORES (LOPDGDD Art. 92):
- NO identifiques ni describas rostros, nombres completos o datos personales visibles
- Enfocate UNICAMENTE en el contenido academico del examen

Tu tarea:
1. Analizar la imagen del examen y extraer las respuestas del estudiante
2. Comparar cada respuesta con la rubrica proporcionada
3. Asignar puntuacion a cada pregunta (siendo justo pero riguroso)
4. Calcular la nota final sobre 10
5. Proporcionar feedback breve y constructivo por cada pregunta
6. Estimar tu confianza OCR (0.0 a 1.0) en la lectura del manuscrito

IMPORTANTE: Responde UNICAMENTE con JSON valido. Sin texto adicional. Usa este formato exacto:
{
  "grade": 7.5,
  "maxGrade": 10,
  "totalQuestions": 5,
  "gradeLabel": "Notable",
  "ocr_confidence": 0.985,
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
}

CONFIANZA OCR (ocr_confidence):
- Evalua la calidad de lectura del texto manuscrito (0.0 a 1.0)
- Considera: legibilidad, calidad de imagen, tachones, borrones
- Si la confianza es < 0.90, advierte en gradeLabel`
}

// AI exam grading with optional wizard config
async function gradeExamWithAI({ imageBase64, mimeType, subject, gradeLevel, rubric, wizardConfig }) {
  // Build prompt: wizard config takes priority, fallback to default
  let systemPrompt
  if (wizardConfig && wizardConfig.segment) {
    try {
      systemPrompt = getPromptFromWizard(wizardConfig)
    } catch (e) {
      console.error('Wizard prompt error, using default:', e.message)
      systemPrompt = buildDefaultPrompt()
    }
  } else {
    systemPrompt = buildDefaultPrompt()
  }

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
    body: JSON.stringify({ model: 'gpt-4o', messages, max_tokens: 3000, temperature: 0.3 })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`AI API error: ${response.status} - ${err}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''
  const jsonStr = extractJSON(content)

  try {
    const parsed = JSON.parse(jsonStr)
    // Ensure ocr_confidence is a number between 0 and 1
    if (parsed.ocr_confidence !== undefined && parsed.ocr_confidence !== null) {
      const c = parseFloat(parsed.ocr_confidence)
      parsed.ocr_confidence = isNaN(c) ? null : Math.max(0, Math.min(1, c))
    } else {
      parsed.ocr_confidence = null
    }
    return parsed
  } catch {
    throw new Error(`No se pudo parsear la respuesta de la IA: ${content.slice(0, 200)}`)
  }
}

export async function POST(request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateCheck = rateLimit('/api/grade', ip)

    if (!rateCheck.allowed) {
      return handleCORS(NextResponse.json(
        {
          success: false,
          error: `L\u00edmite de solicitudes excedido. Intente nuevamente en ${rateCheck.resetIn} segundos.`,
          retryAfter: rateCheck.resetIn
        },
        { status: 429 }
      ))
    }

    const body = await request.json()
    const { imageBase64, mimeType, subject, gradeLevel, rubric, wizardConfig } = body

    if (!imageBase64) {
      return handleCORS(NextResponse.json(
        { success: false, error: 'Se requiere imagen del examen' },
        { status: 400 }
      ))
    }

    // File validation (security)
    const validation = validateImageUpload(imageBase64, mimeType || 'image/jpeg')
    if (!validation.valid) {
      return handleCORS(NextResponse.json(
        { success: false, error: validation.errors.join('. ') },
        { status: 400 }
      ))
    }

    // Sanitize inputs (prevent XSS and prompt injection)
    const sanitized = sanitizeStudentData({ subject, gradeLevel, rubric })

    const startTime = Date.now()
    const gradeResult = await gradeExamWithAI({
      imageBase64,
      mimeType:   mimeType   || 'image/jpeg',
      subject:    sanitized.subject    || 'Asignatura no especificada',
      gradeLevel: sanitized.gradeLevel || 'Nivel no especificado',
      rubric: sanitized.rubric,
      wizardConfig: wizardConfig || null
    })
    const timeTaken = parseFloat(((Date.now() - startTime) / 1000).toFixed(1))

    // Audit log: Exam graded
    await writeAuditLog({
      userId: null,
      schoolId: null,
      action: AuditActions.GRADE_EXAM,
      affectedTable: null,
      affectedRecordId: null,
      ipAddress: getClientIP(request),
      metadata: {
        subject: sanitized.subject,
        gradeLevel: sanitized.gradeLevel,
        grade: gradeResult.grade,
        timeTaken,
        ocrConfidence: gradeResult.ocr_confidence,
        wizardSegment: wizardConfig?.segment || null,
        imageSize: validation.sizeMB + ' MB'
      }
    })

    return handleCORS(NextResponse.json({
      success: true,
      ...gradeResult,
      timeTaken,
      remaining: rateCheck.remaining
    }))
  } catch (error) {
    console.error('POST /api/grade error:', error)
    return handleCORS(NextResponse.json(
      { error: 'Error al procesar el examen. Intente nuevamente.' },
      { status: 500 }
    ))
  }
}
