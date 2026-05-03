'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Utilities ─────────────────────────────────────────────────────────────

const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const maxSize = 1400
      let { width, height } = img

      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)

      const base64Full = canvas.toDataURL('image/jpeg', 0.85)
      resolve({
        base64: base64Full.split(',')[1],
        mimeType: 'image/jpeg',
        preview: base64Full,
      })
    }

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Error al cargar imagen')) }
    img.src = url
  })

const gradeColor = (grade, max = 10) => {
  const pct = grade / max
  if (pct >= 0.7) return { ring: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' }
  if (pct >= 0.5) return { ring: 'border-amber-400', bg: 'bg-amber-50', text: 'text-amber-600', bar: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700' }
  return { ring: 'border-red-500', bg: 'bg-red-50', text: 'text-red-600', bar: 'bg-red-500', badge: 'bg-red-100 text-red-700' }
}

const questionColors = (pts, max) => {
  if (pts >= max) return 'border-emerald-200 bg-emerald-50'
  if (pts > 0) return 'border-amber-200 bg-amber-50'
  return 'border-red-200 bg-red-50'
}

const questionTextColor = (pts, max) => {
  if (pts >= max) return 'text-emerald-600'
  if (pts > 0) return 'text-amber-600'
  return 'text-red-600'
}

const questionIcon = (pts, max) => {
  if (pts >= max) return '✓'
  if (pts > 0) return '~'
  return '✗'
}

// ─── Main App ───────────────────────────────────────────────────────────────

export default function App() {
  // Navigation
  const [screen, setScreen] = useState('scan') // 'scan' | 'results'

  // Camera state
  const [cameraStatus, setCameraStatus] = useState('checking') // 'checking' | 'connected' | 'disconnected'
  const [deviceName, setDeviceName] = useState('')

  // Form state
  const [imageFile, setImageFile] = useState(null)
  const [imageData, setImageData] = useState(null) // { base64, mimeType, preview }
  const [subject, setSubject] = useState('Matemáticas')
  const [gradeLevel, setGradeLevel] = useState('ESO')
  const [rubric, setRubric] = useState('')

  // Loading / error
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('Analizando examen...')
  const [error, setError] = useState('')

  // Results state
  const [results, setResults] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  // Refs
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  // ── Camera detection ──────────────────────────────────────────────────────
  useEffect(() => {
    const checkCamera = async () => {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) {
          setCameraStatus('disconnected')
          return
        }
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cameras = devices.filter((d) => d.kind === 'videoinput')
        if (cameras.length > 0) {
          setCameraStatus('connected')
          const label = cameras[0].label
          setDeviceName(label || 'Cámara del dispositivo')
        } else {
          setCameraStatus('disconnected')
        }
      } catch {
        // Try checking if file input with capture works as proxy
        if (typeof window !== 'undefined') {
          const input = document.createElement('input')
          input.setAttribute('capture', 'environment')
          setCameraStatus(input.hasAttribute('capture') ? 'connected' : 'disconnected')
          setDeviceName('Cámara integrada')
        }
      }
    }
    checkCamera()
  }, [])

  // ── Handle image selection ────────────────────────────────────────────────
  const handleImageSelected = useCallback(async (file) => {
    if (!file) return
    setError('')
    try {
      const compressed = await compressImage(file)
      setImageFile(file)
      setImageData(compressed)
    } catch (e) {
      setError('Error al procesar la imagen. Intenta de nuevo.')
    }
  }, [])

  const handleFileInput = (e) => {
    const file = e.target.files?.[0]
    if (file) handleImageSelected(file)
    e.target.value = ''
  }

  // ── Submit exam ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!imageData) {
      setError('Por favor, sube una imagen del examen primero.')
      return
    }

    setLoading(true)
    setError('')

    const msgs = [
      'Procesando imagen del examen...',
      'Leyendo respuestas del estudiante...',
      'Comparando con la rúbrica...',
      'Calculando puntuación...',
      'Generando feedback...',
    ]
    let msgIdx = 0
    setLoadingMsg(msgs[0])
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % msgs.length
      setLoadingMsg(msgs[msgIdx])
    }, 3000)

    try {
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageData.base64,
          mimeType: imageData.mimeType,
          subject,
          gradeLevel,
          rubric,
        }),
      })

      const data = await res.json()
      clearInterval(msgInterval)

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al corregir el examen')
      }

      setResults({
        ...data,
        subject,
        gradeLevel,
      })
      setSaved(false)
      setScreen('results')
    } catch (e) {
      clearInterval(msgInterval)
      setError(e.message || 'Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // ── Save result ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!results || saved) return
    setSaving(true)
    try {
      const res = await fetch('/api/save-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results),
      })
      const data = await res.json()
      if (data.success) setSaved(true)
    } catch {
      // silent fail
    } finally {
      setSaving(false)
    }
  }

  // ── Reset for next exam ───────────────────────────────────────────────────
  const handleNextExam = () => {
    setImageFile(null)
    setImageData(null)
    setRubric('')
    setResults(null)
    setSaved(false)
    setError('')
    setScreen('scan')
  }

  // ── Print PDF ─────────────────────────────────────────────────────────────
  const handlePrint = () => {
    window.print()
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .print-container { max-width: 100% !important; box-shadow: none !important; }
        }
        .print-only { display: none; }
        .fade-in { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .pulse-slow { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .bar-fill { transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex justify-center">
        <div className="w-full max-w-md print-container">

          {/* ══════════════════ SCAN SCREEN ══════════════════ */}
          {screen === 'scan' && (
            <div className="fade-in">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-6 pt-12 pb-8 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                    📋
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">Corrector de Exámenes</h1>
                    <p className="text-blue-200 text-xs">Corrección automática con IA</p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-5 space-y-4">

                {/* Scanner Status */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        cameraStatus === 'connected' ? 'bg-emerald-400 shadow-emerald-400' :
                        cameraStatus === 'disconnected' ? 'bg-red-400' :
                        'bg-amber-400 pulse-slow'
                      } shadow-lg`} />
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {cameraStatus === 'connected' ? 'Escáner conectado' :
                           cameraStatus === 'disconnected' ? 'Escáner desconectado' :
                           'Verificando...'}
                        </p>
                        {deviceName && (
                          <p className="text-xs text-slate-400">{deviceName}</p>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      cameraStatus === 'connected' ? 'bg-emerald-100 text-emerald-700' :
                      cameraStatus === 'disconnected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {cameraStatus === 'connected' ? 'Activo' :
                       cameraStatus === 'disconnected' ? 'Inactivo' : '...'}
                    </span>
                  </div>
                </div>

                {/* Image Capture Area */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                  {/* Camera button */}
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-98 text-white py-8 flex flex-col items-center gap-3 transition-all"
                  >
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                      <span className="text-4xl">📷</span>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">Escanear Examen</p>
                      <p className="text-blue-200 text-sm mt-0.5">Usa la cámara para fotografiar el examen</p>
                    </div>
                  </button>

                  {/* Gallery option */}
                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    className="w-full py-3.5 flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors border-t border-slate-100"
                  >
                    <span className="text-xl">🖼️</span>
                    <span className="text-sm font-medium">Subir desde galería / archivo</span>
                  </button>
                </div>

                {/* Hidden inputs */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileInput}
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInput}
                />

                {/* Image Preview */}
                {imageData && (
                  <div className="fade-in bg-white rounded-2xl overflow-hidden shadow-sm border border-blue-100">
                    <div className="relative">
                      <img
                        src={imageData.preview}
                        alt="Vista previa del examen"
                        className="w-full max-h-48 object-contain bg-slate-50"
                      />
                      <button
                        onClick={() => { setImageFile(null); setImageData(null) }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full text-sm flex items-center justify-center hover:bg-red-600 shadow-md no-print"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2">
                      <span className="text-emerald-500 text-sm">✓</span>
                      <span className="text-emerald-700 text-sm font-medium">Imagen lista para corregir</span>
                    </div>
                  </div>
                )}

                {/* Exam Info */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
                  <p className="text-sm font-semibold text-slate-600 mb-1">Información del examen</p>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Asignatura</label>
                    <div className="relative">
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option>Matemáticas</option>
                        <option>Lengua</option>
                        <option>Historia</option>
                        <option>Inglés</option>
                        <option>Geografía</option>
                        <option>Ciencias Naturales</option>
                        <option>Física y Química</option>
                        <option>Biología</option>
                        <option>Filosofía</option>
                        <option>Otro</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▾</span>
                    </div>
                  </div>

                  {/* Grade Level */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Nivel educativo</label>
                    <div className="relative">
                      <select
                        value={gradeLevel}
                        onChange={(e) => setGradeLevel(e.target.value)}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option>ESO</option>
                        <option>Bachillerato</option>
                        <option>FP</option>
                        <option>Universidad</option>
                        <option>Oposiciones</option>
                        <option>Primaria</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▾</span>
                    </div>
                  </div>
                </div>

                {/* Rubric */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Respuestas correctas / Rúbrica
                    <span className="ml-2 text-xs font-normal text-slate-400">(opcional pero recomendado)</span>
                  </label>
                  <textarea
                    value={rubric}
                    onChange={(e) => setRubric(e.target.value)}
                    placeholder="Pega aquí las respuestas correctas o la rúbrica de corrección...&#10;&#10;Ejemplo:&#10;1. La fotosíntesis es... (2 puntos)&#10;2. Los reinos de la naturaleza son... (2 puntos)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={5}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="fade-in bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-start gap-3">
                    <span className="text-red-500 mt-0.5">⚠️</span>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !imageData}
                  className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all ${
                    loading || !imageData
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-98 shadow-blue-200'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {loadingMsg}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>✨</span>
                      Corregir con IA
                    </span>
                  )}
                </button>

                <div className="h-6" />
              </div>
            </div>
          )}

          {/* ══════════════════ RESULTS SCREEN ══════════════════ */}
          {screen === 'results' && results && (
            <div className="fade-in">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-6 pt-12 pb-6 text-white shadow-lg no-print">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleNextExam}
                    className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    ←
                  </button>
                  <div>
                    <h1 className="text-xl font-bold">Resultado del examen</h1>
                    <p className="text-blue-200 text-xs">{results.subject} · {results.gradeLevel}</p>
                  </div>
                </div>
              </div>

              {/* Print header */}
              <div className="print-only p-6 border-b">
                <h1 className="text-2xl font-bold">Corrector de Exámenes — Resultado</h1>
                <p className="text-gray-500">{results.subject} · {results.gradeLevel}</p>
              </div>

              <div className="px-4 py-5 space-y-4">

                {/* Grade Card */}
                {(() => {
                  const colors = gradeColor(results.grade, results.maxGrade || 10)
                  const pct = Math.round((results.grade / (results.maxGrade || 10)) * 100)
                  return (
                    <div className={`fade-in bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center`}>
                      {/* Circle */}
                      <div className={`mx-auto w-32 h-32 rounded-full border-8 ${colors.ring} ${colors.bg} flex flex-col items-center justify-center mb-4 shadow-lg`}>
                        <span className={`text-4xl font-black ${colors.text}`}>{results.grade}</span>
                        <span className="text-slate-400 text-sm font-medium">/{results.maxGrade || 10}</span>
                      </div>

                      {/* Label */}
                      {results.gradeLabel && (
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${colors.badge}`}>
                          {results.gradeLabel}
                        </span>
                      )}

                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full bar-fill ${colors.bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-slate-400 text-xs mt-2">{pct}% de la puntuación máxima</p>

                      {/* Time saved */}
                      {results.timeTaken && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                          <span className="text-blue-500">⚡</span>
                          <span className="text-blue-700 text-sm font-medium">
                            Corregido en {results.timeTaken}s
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* Question Breakdown */}
                {results.questions && results.questions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide">Desglose por pregunta</h2>
                      <span className="text-xs text-slate-400">{results.totalQuestions || results.questions.length} preguntas</span>
                    </div>

                    {results.questions.map((q, i) => (
                      <div
                        key={i}
                        className={`fade-in bg-white rounded-2xl border shadow-sm overflow-hidden ${questionColors(q.pointsAwarded, q.maxPoints)}`}
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        {/* Question header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-current/10">
                          <div className="flex items-center gap-2">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                              q.pointsAwarded >= q.maxPoints ? 'bg-emerald-500' :
                              q.pointsAwarded > 0 ? 'bg-amber-400' : 'bg-red-500'
                            }`}>{questionIcon(q.pointsAwarded, q.maxPoints)}</span>
                            <span className="font-semibold text-slate-700 text-sm">Pregunta {q.number}</span>
                          </div>
                          <span className={`text-sm font-bold ${questionTextColor(q.pointsAwarded, q.maxPoints)}`}>
                            {q.pointsAwarded}/{q.maxPoints} pts
                          </span>
                        </div>

                        {/* Question details */}
                        <div className="px-4 py-3 space-y-2 text-sm">
                          <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Respuesta del alumno</span>
                            <p className="text-slate-700 mt-0.5">{q.studentAnswer || '—'}</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Respuesta correcta</span>
                            <p className="text-slate-700 mt-0.5">{q.correctAnswer || '—'}</p>
                          </div>
                          {q.feedback && (
                            <div className="bg-white/60 rounded-xl px-3 py-2 border border-current/10">
                              <p className="text-slate-600 text-xs italic">💬 {q.feedback}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="no-print space-y-3 pt-2">
                  {/* PDF Export */}
                  <button
                    onClick={handlePrint}
                    className="w-full py-4 rounded-2xl bg-slate-700 hover:bg-slate-800 active:scale-98 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <span>📄</span>
                    Exportar PDF
                  </button>

                  {/* Save result */}
                  <button
                    onClick={handleSave}
                    disabled={saved || saving}
                    className={`w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                      saved
                        ? 'bg-emerald-100 text-emerald-700 cursor-default'
                        : saving
                        ? 'bg-slate-200 text-slate-400 cursor-wait'
                        : 'bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 active:scale-98'
                    }`}
                  >
                    {saved ? (
                      <><span>✓</span> Resultado guardado</>
                    ) : saving ? (
                      <><span className="inline-block w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> Guardando...</>
                    ) : (
                      <><span>💾</span> Guardar resultado</>
                    )}
                  </button>

                  {/* Next exam */}
                  <button
                    onClick={handleNextExam}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-98 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200"
                  >
                    <span>→</span>
                    Siguiente examen
                  </button>
                </div>

                <div className="h-6" />
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
