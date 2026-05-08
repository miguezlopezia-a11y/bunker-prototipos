// Prompt Builder for GPT-4o Vision - Exam Correction
// Assembles prompts automatically based on wizard configuration
// Teacher never sees the prompt - fully automated

/**
 * Build prompt for Oposiciones exams (always tipo test)
 * @param {Object} config - Wizard configuration
 * @returns {string} - Complete system prompt for GPT-4o
 */
export function buildOposicionesPrompt(config) {
  const {
    department = 'general', // sanidad, educacion, administracion, seguridad, otros
    questionCount = 100,
    penalty = -0.25, // -0.25, -0.33, -0.5, or 0 (none)
    topicBlocks = [] // Array of topic names for breakdown
  } = config

  const departmentNames = {
    sanidad: 'Sanidad',
    educacion: 'Educación',
    administracion: 'Administración Pública',
    seguridad: 'Fuerzas y Cuerpos de Seguridad',
    otros: 'Otras Oposiciones'
  }

  const penaltyText = penalty === 0 
    ? 'SIN penalización por error' 
    : `CON penalización de ${penalty} puntos por error`

  return `Eres un corrector experto de exámenes tipo test para oposiciones en España (${departmentNames[department] || 'General'}).

IMPORTANTE: Este es un examen TIPO TEST de oposición con ${questionCount} preguntas, ${penaltyText}.

INSTRUCCIONES DE CORRECCIÓN:
1. Analiza la imagen del examen tipo test
2. Extrae las respuestas marcadas por el opositor (A/B/C/D)
3. Compara con las respuestas correctas proporcionadas en la rúbrica
4. Calcula la puntuación:
   - Respuesta correcta: +1 punto
   - Respuesta incorrecta: ${penalty} puntos
   - Sin responder: 0 puntos
   - Nota final = (Correctas + (Incorrectas × ${penalty})) × (10 / ${questionCount})

5. Identifica las preguntas falladas por bloque temático para análisis de debilidades
6. Calcula percentil estimado (si tienes datos de referencia de convocatorias similares)

FORMATO DE SALIDA (JSON estricto):
{
  "grade": 7.5,
  "maxGrade": 10,
  "totalQuestions": ${questionCount},
  "correctas": 80,
  "incorrectas": 15,
  "enBlanco": 5,
  "penalizacion": ${penalty},
  "notaRaw": 7.5,
  "gradeLabel": "Notable",
  "percentilEstimado": 75,
  "ocr_confidence": 0.985,
  "questions": [
    {
      "number": 1,
      "studentAnswer": "A",
      "correctAnswer": "B",
      "isCorrect": false,
      "points": ${penalty},
      "topicBlock": "Legislación",
      "feedback": "Respuesta incorrecta. La opción correcta es B..."
    }
  ],
  "topicBreakdown": [
    {
      "topic": "Legislación",
      "correctas": 15,
      "incorrectas": 3,
      "porcentajeAcierto": 83.3
    }
  ],
  "ranking": {
    "percentil": 75,
    "notaCorte": 6.5,
    "observaciones": "Por encima de la nota de corte habitual"
  }
}

⚠️ PROTECCIÓN DE MENORES (LOPDGDD Art. 92):
- NO identifiques nombres, DNI, rostros ni datos personales visibles
- Enfócate ÚNICAMENTE en las respuestas marcadas

CONFIANZA OCR (ocr_confidence):
- Evalúa la calidad de lectura de las marcas (0.0 a 1.0)
- Considera: nitidez, contraste, tachones, borrones
- Advierte si la confianza es < 0.90`
}

/**
 * Build prompt for Academia exams
 * @param {Object} config - Wizard configuration
 * @returns {string} - Complete system prompt for GPT-4o
 */
export function buildAcademiaPrompt(config) {
  const {
    department = 'general', // ingles, matematicas, ciencias, historia, general
    level = 'ESO', // Primaria, ESO, Bachillerato, FP, Universidad, Certificación
    examType = 'mixto', // tipo_test, preguntas_cortas, redaccion, problemas, mixto
    criteria = [], // Array of evaluation criteria
    cefrLevel = null, // For Inglés: A1, A2, B1, B2, C1, C2
    includeWritingAnalysis = false,
    includeMathSteps = false
  } = config

  const departmentNames = {
    ingles: 'Inglés',
    matematicas: 'Matemáticas',
    ciencias: 'Ciencias',
    historia: 'Historia',
    general: 'Asignatura General'
  }

  const examTypeNames = {
    tipo_test: 'TIPO TEST',
    preguntas_cortas: 'PREGUNTAS CORTAS',
    redaccion: 'REDACCIÓN',
    problemas: 'PROBLEMAS',
    mixto: 'MIXTO (varios tipos)'
  }

  let specificInstructions = ''

  // Specific instructions by department
  if (department === 'ingles') {
    specificInstructions = `
EVALUACIÓN DE INGLÉS (Nivel educativo: ${level}):
- Evalúa: gramática, vocabulario, comprensión lectora, expresión escrita
${cefrLevel ? `- Estima nivel MCER (Marco Común Europeo de Referencia): objetivo ${cefrLevel}` : ''}
${includeWritingAnalysis ? `
- ANÁLISIS DE REDACCIÓN:
  - Estructura y organización
  - Cohesión y coherencia
  - Riqueza léxica
  - Precisión gramatical
  - Ortografía y puntuación
` : ''}
- Proporciona feedback constructivo en español (el examen está en inglés, pero el feedback en español)
`
  } else if (department === 'matematicas') {
    specificInstructions = `
EVALUACIÓN DE MATEMÁTICAS (Nivel: ${level}):
- Evalúa: procedimiento, desarrollo, resultado final
${includeMathSteps ? `
- ANÁLISIS DE PASOS:
  - Identifica cada paso del razonamiento
  - Señala errores de concepto vs. errores de cálculo
  - Puntúa parcialmente si el método es correcto pero hay errores menores
` : ''}
- Valora el razonamiento aunque el resultado sea incorrecto
- Proporciona feedback sobre conceptos clave
`
  } else if (department === 'ciencias') {
    specificInstructions = `
EVALUACIÓN DE CIENCIAS (Nivel: ${level}):
- Evalúa: comprensión de conceptos, aplicación práctica, razonamiento científico
- Valora diagramas, esquemas y experimentos
- Proporciona feedback sobre metodología científica
`
  } else if (department === 'historia') {
    specificInstructions = `
EVALUACIÓN DE HISTORIA (Nivel: ${level}):
- Evalúa: conocimiento factual, análisis, argumentación, cronología
- Valora la contextualización histórica
- Proporciona feedback sobre rigor histórico
`
  }

  const criteriaText = criteria.length > 0 
    ? `\nCRITERIOS DE EVALUACIÓN ESPECÍFICOS:\n${criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
    : ''

  return `Eres un corrector experto de exámenes escolares en España.

CONTEXTO:
- Asignatura: ${departmentNames[department]}
- Nivel educativo: ${level}
- Tipo de examen: ${examTypeNames[examType]}
${specificInstructions}
${criteriaText}

INSTRUCCIONES DE CORRECCIÓN:
1. Analiza la imagen del examen completo
2. Identifica cada pregunta/ejercicio y la respuesta del estudiante
3. Compara con las respuestas correctas de la rúbrica (si se proporciona)
4. Asigna puntuación a cada pregunta (siendo justo pero riguroso)
5. Proporciona feedback constructivo y educativo para cada error
6. Calcula la nota final sobre 10

FORMATO DE SALIDA (JSON estricto):
{
  "grade": 7.5,
  "maxGrade": 10,
  "totalQuestions": 10,
  "gradeLabel": "Notable",
  "ocr_confidence": 0.985,
${department === 'ingles' && cefrLevel ? `  "cefrEstimated": "B1",\n  "cefrTarget": "${cefrLevel}",\n` : ''}
  "questions": [
    {
      "number": 1,
      "studentAnswer": "respuesta del estudiante (transcripción literal)",
      "correctAnswer": "respuesta correcta o criterio de corrección",
      "pointsAwarded": 0.8,
      "maxPoints": 1.0,
      "feedback": "Feedback constructivo en español"${department === 'matematicas' && includeMathSteps ? `,
      "steps": [
        "Paso 1: Identificó correctamente los datos",
        "Paso 2: Error en la fórmula aplicada",
        "Paso 3: Cálculo aritmético correcto"
      ]` : ''}
    }
  ],
  "overallFeedback": "Feedback general del examen",
  "strengths": ["Punto fuerte 1", "Punto fuerte 2"],
  "areasToImprove": ["Área de mejora 1", "Área de mejora 2"]
}

⚠️ PROTECCIÓN DE MENORES (LOPDGDD Art. 92):
- NO identifiques nombres, rostros ni datos personales visibles
- Enfócate ÚNICAMENTE en el contenido académico

CONFIANZA OCR (ocr_confidence):
- Evalúa la calidad de lectura del texto manuscrito (0.0 a 1.0)
- Considera: legibilidad, calidad de imagen, tachones
- Advierte si la confianza es < 0.90`
}

/**
 * Get prompt based on wizard configuration
 * @param {Object} wizardConfig - Complete wizard configuration
 * @returns {string} - System prompt for GPT-4o
 */
export function getPromptFromWizard(wizardConfig) {
  const { segment } = wizardConfig

  if (segment === 'oposiciones') {
    return buildOposicionesPrompt(wizardConfig)
  } else if (segment === 'academia') {
    return buildAcademiaPrompt(wizardConfig)
  } else {
    throw new Error('Invalid segment: must be "oposiciones" or "academia"')
  }
}
