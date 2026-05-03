import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

// MongoDB connection
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME || 'corrector_examenes')
  }
  return db
}

// Helper for CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Extract JSON from AI response (handles markdown code blocks)
function extractJSON(text) {
  if (!text) return null
  // Remove markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    text = codeBlockMatch[1].trim()
  }
  // Find JSON object
  const jsonStart = text.indexOf('{')
  const jsonEnd = text.lastIndexOf('}')
  if (jsonStart !== -1 && jsonEnd !== -1) {
    return text.slice(jsonStart, jsonEnd + 1)
  }
  return text
}

// Call AI for exam grading
async function gradeExamWithAI({ imageBase64, mimeType, subject, gradeLevel, rubric }) {
  const systemPrompt = `Eres un corrector de exámenes experto en el sistema educativo español. 
Re cibirás la imagen de un examen de un estudiante y la rúbrica o respuestas correctas.

Tu tarea:
1. Analizar la imagen del examen y extraer las respuestas del estudiante
2. Comparar cada respuesta con la rúbrica proporcionada
3. Asignar puntuación a cada pregunta (siendo justo pero riguroso)
4. Calcular la nota final sobre 10
5. Proporcionar feedback breve y constructivo por cada pregunta

IMPORTANTE: Responde ÚNICAMENTE con JSON válido. Sin texto adicional. Usa este formato exacto:
{
  "grade": 7.5,
  "maxGrade": 10,
  "totalQuestions": 5,
  "gradeLabel": "Notable",
  "questions": [
    {
      "number": 1,
      "studentAnswer": "respuesta del estudiante",
      "correctAnswer": "respuesta correcta según rúbrica",
      "pointsAwarded": 2.0,
      "maxPoints": 2.0,
      "feedback": "Breve feedback constructivo"
    }
  ]
}`

  const userText = `Asignatura: ${subject}\nNivel educativo: ${gradeLevel}\n\nRúbrica / Respuestas correctas:\n${rubric || 'No se ha proporcionado rúbrica. Evalúa según el contenido del examen con criterio general.'}\n\nPor favor, evalúa el examen y devuelve el resultado en formato JSON.`

  const messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: `data:${mimeType};base64,${imageBase64}` }
        },
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
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      max_tokens: 2000,
      temperature: 0.3
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`AI API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''
  const jsonStr = extractJSON(content)

  try {
    const result = JSON.parse(jsonStr)
    return result
  } catch (e) {
    throw new Error(`No se pudo parsear la respuesta de la IA: ${content.slice(0, 200)}`)
  }
}

export async function GET(request) {
  const { pathname } = new URL(request.url)
  const path = pathname.replace('/api', '')

  try {
    // GET /api/results - Get all saved results
    if (path === '/results' || path === '/results/') {
      const db = await connectToMongo()
      const results = await db.collection('results')
        .find({})
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray()

      return handleCORS(NextResponse.json({ success: true, results }))
    }

    // GET /api/health
    if (path === '/health' || path === '/health/') {
      return handleCORS(NextResponse.json({ status: 'ok', service: 'Corrector de Exámenes' }))
    }

    return handleCORS(NextResponse.json({ error: 'Endpoint no encontrado' }, { status: 404 }))
  } catch (error) {
    console.error('GET error:', error)
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
  }
}

export async function POST(request) {
  const { pathname } = new URL(request.url)
  const path = pathname.replace('/api', '')

  try {
    // POST /api/grade - Grade an exam with AI
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
        mimeType: mimeType || 'image/jpeg',
        subject: subject || 'Asignatura no especificada',
        gradeLevel: gradeLevel || 'Nivel no especificado',
        rubric
      })

      const timeTaken = ((Date.now() - startTime) / 1000).toFixed(1)

      return handleCORS(NextResponse.json({
        success: true,
        ...gradeResult,
        timeTaken: parseFloat(timeTaken)
      }))
    }

    // POST /api/save-result - Save grading result
    if (path === '/save-result' || path === '/save-result/') {
      const body = await request.json()
      const { grade, maxGrade, subject, gradeLevel, questions, timeTaken, gradeLabel } = body

      const db = await connectToMongo()
      const resultDoc = {
        id: uuidv4(),
        grade,
        maxGrade: maxGrade || 10,
        gradeLabel: gradeLabel || '',
        subject: subject || '',
        gradeLevel: gradeLevel || '',
        questions: questions || [],
        timeTaken: timeTaken || 0,
        totalQuestions: questions?.length || 0,
        createdAt: new Date()
      }

      await db.collection('results').insertOne(resultDoc)

      return handleCORS(NextResponse.json({
        success: true,
        id: resultDoc.id,
        message: 'Resultado guardado correctamente'
      }))
    }

    return handleCORS(NextResponse.json({ error: 'Endpoint no encontrado' }, { status: 404 }))
  } catch (error) {
    console.error('POST error:', error)
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }))
  }
}
