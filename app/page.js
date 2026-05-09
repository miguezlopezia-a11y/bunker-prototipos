'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ExamConfigWizard from '@/components/ExamConfigWizard'

// ── Utilities ────────────────────────────────────────────────────────────────

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
        const r = Math.min(maxSize / width, maxSize / height)
        width = Math.floor(width * r); height = Math.floor(height * r)
      }
      canvas.width = width; canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      const b = canvas.toDataURL('image/jpeg', 0.85)
      resolve({ base64: b.split(',')[1], mimeType: 'image/jpeg', preview: b })
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Error al cargar imagen')) }
    img.src = url
  })

const gradeColor = (grade, max = 10) => {
  const p = grade / max
  if (p >= 0.7) return { ring: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', hex: '#10b981' }
  if (p >= 0.5) return { ring: 'border-amber-400', bg: 'bg-amber-50', text: 'text-amber-600', bar: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700', hex: '#f59e0b' }
  return { ring: 'border-red-500', bg: 'bg-red-50', text: 'text-red-600', bar: 'bg-red-500', badge: 'bg-red-100 text-red-700', hex: '#ef4444' }
}

const qBorder = (pts, max) => pts >= max ? 'border-emerald-200 bg-emerald-50' : pts > 0 ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'
const qText = (pts, max) => pts >= max ? 'text-emerald-600' : pts > 0 ? 'text-amber-600' : 'text-red-600'
const qIcon = (pts, max) => pts >= max ? '✓' : pts > 0 ? '~' : '✗'

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

const getDateRange = (range) => {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  if (range === 'today') return { from: today.toISOString(), to: null }
  if (range === 'week') { const d = new Date(today); d.setDate(d.getDate() - 7); return { from: d.toISOString(), to: null } }
  if (range === 'month') { const d = new Date(today); d.setMonth(d.getMonth() - 1); return { from: d.toISOString(), to: null } }
  return { from: null, to: null }
}

const SUBJECTS = ['Matemáticas', 'Lengua', 'Historia', 'Inglés', 'Geografía', 'Ciencias Naturales', 'Física y Química', 'Biología', 'Filosofía', 'Otro']
const LEVELS = ['ESO', 'Bachillerato', 'FP', 'Universidad', 'Oposiciones', 'Primaria']
const DATE_FILTERS = [{ label: 'Todo', v: 'all' }, { label: 'Hoy', v: 'today' }, { label: 'Semana', v: 'week' }, { label: 'Mes', v: 'month' }]

// ── Print Document ────────────────────────────────────────────────────────────

function PrintDocument({ results }) {
  if (!results) return <div id="print-doc" style={{ display: 'none' }} />

  const colors = gradeColor(results.grade, results.maxGrade || 10)
  const pct = Math.round((results.grade / (results.maxGrade || 10)) * 100)
  const date = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

  const cell = (label, value) => (
    <div>
      <p style={{ fontWeight: 'bold', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#111827' }}>{value || '—'}</p>
    </div>
  )

  return (
    <div id="print-doc" style={{ display: 'none', fontFamily: 'Arial, sans-serif', padding: '20mm', color: '#111827', maxWidth: '210mm', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid #1e40af', paddingBottom: '15px', marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '68px', height: '68px', border: '2px dashed #9ca3af', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '10px', textAlign: 'center', background: '#f9fafb' }}>
            <span style={{ fontSize: '24px' }}>🏫</span>
            <span style={{ marginTop: '3px', lineHeight: 1.2 }}>Logo del<br />colegio</span>
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#1e40af', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Informe de Correción de Examen</h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '12px' }}>Corrector de Exámenes IA • Generado el {date}</p>
          </div>
        </div>
      </div>

      {/* Student info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
        {cell('Alumno/a', results.studentName)}
        {cell('Clase / Grupo', results.studentGroup)}
        {cell('Asignatura', results.subject)}
        {cell('Nivel educativo', results.gradeLevel)}
      </div>

      {/* Grade */}
      <div style={{ textAlign: 'center', margin: '0 0 22px', padding: '20px', border: '2px solid #e2e8f0', borderRadius: '12px' }}>
        <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 14px' }}>NOTA FINAL</p>
        <div style={{ display: 'inline-block', padding: '14px 30px', border: `4px solid ${colors.hex}`, borderRadius: '50%', marginBottom: '10px' }}>
          <span style={{ fontSize: '52px', fontWeight: '900', color: colors.hex, lineHeight: 1 }}>{results.grade}</span>
          <span style={{ fontSize: '20px', color: '#6b7280' }}>/{results.maxGrade || 10}</span>
        </div>
        {results.gradeLabel && <p style={{ fontSize: '18px', fontWeight: '700', color: '#374151', margin: '8px 0 4px' }}>{results.gradeLabel}</p>}
        <div style={{ background: '#f1f5f9', borderRadius: '4px', height: '10px', margin: '12px 0 6px', overflow: 'hidden' }}>
          <div style={{ background: colors.hex, height: '10px', width: `${pct}%`, borderRadius: '4px', transition: 'none' }} />
        </div>
        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{pct}% de la puntuación máxima</p>
        {results.timeTaken && <p style={{ fontSize: '11px', color: '#9ca3af', margin: '6px 0 0' }}>⚡ Corregido en {results.timeTaken}s</p>}
      </div>

      {/* Questions table */}
      {results.questions && results.questions.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px' }}>
            Desglose por preguntas
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ background: '#1e40af', color: 'white' }}>
                <th style={{ padding: '7px 10px', textAlign: 'center', width: '30px' }}>P.</th>
                <th style={{ padding: '7px 10px', textAlign: 'left', width: '28%' }}>Respuesta del alumno</th>
                <th style={{ padding: '7px 10px', textAlign: 'left', width: '28%' }}>Respuesta correcta</th>
                <th style={{ padding: '7px 10px', textAlign: 'left' }}>Feedback</th>
                <th style={{ padding: '7px 10px', textAlign: 'center', width: '50px' }}>Pts.</th>
              </tr>
            </thead>
            <tbody>
              {results.questions.map((q, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#f8fafc' : 'white', borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '7px 10px', fontWeight: 'bold', color: '#1e40af', textAlign: 'center' }}>{q.number}</td>
                  <td style={{ padding: '7px 10px', color: '#374151' }}>{q.studentAnswer || '—'}</td>
                  <td style={{ padding: '7px 10px', color: '#059669' }}>{q.correctAnswer || '—'}</td>
                  <td style={{ padding: '7px 10px', color: '#6b7280', fontStyle: 'italic' }}>{q.feedback || '—'}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 'bold', color: q.pointsAwarded >= q.maxPoints ? '#059669' : q.pointsAwarded > 0 ? '#d97706' : '#dc2626' }}>
                    {q.pointsAwarded}/{q.maxPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Signature & Seal */}
      <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div>
          <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', margin: '0 0 45px' }}>Firma del profesor/a:</p>
          <div style={{ borderBottom: '1px solid #111827' }} />
          <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '5px' }}>Nombre, apellidos y firma</p>
        </div>
        <div>
          <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', margin: '0 0 10px' }}>Sello del centro:</p>
          <div style={{ border: '1px dashed #9ca3af', height: '65px', borderRadius: '4px', background: '#f8fafc' }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px dashed #e2e8f0', paddingTop: '10px' }}>
        <p style={{ fontSize: '9px', color: '#9ca3af', margin: 0 }}>Documento generado automáticamente • Corrector de Exámenes IA • {date}</p>
      </div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  // Navigation
  const [screen, setScreen] = useState('scan') // 'scan' | 'results' | 'history'
  const [resultSource, setResultSource] = useState('new') // 'new' | 'history'

  // Student info
  const [studentName, setStudentName] = useState('')
  const [studentGroup, setStudentGroup] = useState('')

  // Camera
  const [cameraStatus, setCameraStatus] = useState('checking')
  const [deviceName, setDeviceName] = useState('')

  // Form
  const [imageData, setImageData] = useState(null)
  const [subject, setSubject] = useState('Matemáticas')
  const [gradeLevel, setGradeLevel] = useState('ESO')
  const [rubric, setRubric] = useState('')

  // Bulk mode
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkQueue, setBulkQueue] = useState([])
  const [bulkProcessing, setBulkProcessing] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 })

  // Exam Config Wizard (Feature #1)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardConfig, setWizardConfig] = useState(null) // active config for current session
  const [pendingAction, setPendingAction] = useState(null) // 'single' | 'bulk' | 'pdf'

  // PDF Import (Feature #2)
  const [inputMode, setInputMode] = useState('camera') // 'camera' | 'gallery' | 'pdf'
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfStage, setPdfStage] = useState('') // 'extracting' | 'grading' | 'done'
  const [pdfProgress, setPdfProgress] = useState({ current: 0, total: 0 })
  const pdfRef = useRef(null)

  // UI
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState('')

  // Results
  const [results, setResults] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  // History
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyStats, setHistoryStats] = useState({ total: 0, avgGrade: 0 })
  const [filterSubject, setFilterSubject] = useState('Todas')
  const [filterDate, setFilterDate] = useState('all')

  const cameraRef = useRef(null)
  const galleryRef = useRef(null)

  // Camera detection
  useEffect(() => {
    const check = async () => {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) { setCameraStatus('connected'); setDeviceName('Cámara integrada'); return }
        const devs = await navigator.mediaDevices.enumerateDevices()
        const cams = devs.filter(d => d.kind === 'videoinput')
        if (cams.length > 0) { setCameraStatus('connected'); setDeviceName(cams[0].label || 'Cámara del dispositivo') }
        else { setCameraStatus('disconnected') }
      } catch { setCameraStatus('connected'); setDeviceName('Cámara integrada') }
    }
    check()
  }, [])

  // Auto-fetch history when switching to history screen or filter changes
  useEffect(() => {
    if (screen === 'history') fetchHistory()
  }, [screen, filterSubject, filterDate])

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const { from } = getDateRange(filterDate)
      const p = new URLSearchParams()
      if (filterSubject !== 'Todas') p.set('subject', filterSubject)
      if (from) p.set('dateFrom', from)
      const res = await fetch(`/api/results?${p.toString()}`)
      const data = await res.json()
      if (data.success) { setHistory(data.results || []); setHistoryStats({ total: data.total || 0, avgGrade: data.avgGrade || 0 }) }
    } catch (e) { console.error(e) } finally { setHistoryLoading(false) }
  }

  const handleImageSelected = useCallback(async (file) => {
    if (!file) return
    setError('')
    try { setImageData(await compressImage(file)) }
    catch { setError('Error al procesar la imagen.') }
  }, [])

  const handleFileInput = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    if (bulkMode && files.length > 1) {
      // Bulk mode: Process multiple files
      setBulkQueue(files)
      setBulkProgress({ current: 0, total: files.length })
      await processBulkExams(files)
    } else {
      // Single mode
      const f = files[0]
      if (f) handleImageSelected(f)
    }
    
    e.target.value = ''
  }

  const processBulkExams = async (files) => {
    setBulkProcessing(true)
    const results = []
    
    for (let i = 0; i < files.length; i++) {
      setBulkProgress({ current: i + 1, total: files.length })
      
      try {
        const imageData = await compressImage(files[i])
        const res = await fetch('/api/grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            imageBase64: imageData.base64, 
            mimeType: imageData.mimeType, 
            subject, 
            gradeLevel, 
            rubric,
            wizardConfig
          })
        })
        const data = await res.json()
        
        if (data.success) {
          results.push({ ...data, studentName, studentGroup })
          // Auto-save each result
          await fetch('/api/save-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...data,
              subject,
              gradeLevel,
              studentName,
              studentGroup,
              ocr_confidence: data.ocr_confidence,
              wizardConfig
            })
          })
        }
      } catch (error) {
        console.error(`Error processing exam ${i + 1}:`, error)
      }
      
      // Small delay between requests to avoid rate limiting
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    setBulkProcessing(false)
    alert(`✅ Procesados ${results.length} de ${files.length} exámenes correctamente`)
    fetchHistory() // Refresh history
  }

  const handleSubmit = async () => {
    if (!imageData) { setError('Sube una imagen del examen primero.'); return }
    setLoading(true); setError('')
    const msgs = ['Procesando imagen...', 'Leyendo respuestas...', 'Comparando con rúbrica...', 'Calculando puntuación...', 'Generando feedback...']
    let idx = 0; setLoadingMsg(msgs[0])
    const t = setInterval(() => { idx = (idx + 1) % msgs.length; setLoadingMsg(msgs[idx]) }, 3000)
    try {
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imageData.base64, mimeType: imageData.mimeType, subject, gradeLevel, rubric, wizardConfig })
      })
      const data = await res.json()
      clearInterval(t)
      if (!res.ok || !data.success) throw new Error(data.error || 'Error al corregir')
      setResults({ ...data, subject, gradeLevel, studentName, studentGroup, wizardConfig })
      setSaved(false); setResultSource('new'); setScreen('results')
    } catch (e) { clearInterval(t); setError(e.message || 'Error de conexión.') }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    if (!results || saved) return
    setSaving(true)
    try {
      const res = await fetch('/api/save-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...results,
          ocr_confidence: results.ocr_confidence,
          wizardConfig: results.wizardConfig || wizardConfig
        })
      })
      const data = await res.json()
      if (data.success) setSaved(true)
    } catch {} finally { setSaving(false) }
  }

  // PDF Import handler (Feature #2)
  const handlePdfFileSelected = (e) => {
    const f = e.target.files?.[0]
    if (f) setPdfFile(f)
    e.target.value = ''
  }

  const runPdfImport = async (configToUse) => {
    if (!pdfFile) { setError('Selecciona un archivo PDF primero.'); return }
    const cfg = configToUse || wizardConfig
    if (!cfg) {
      setPendingAction('pdf')
      setWizardOpen(true)
      return
    }
    setError('')
    setPdfStage('extracting')
    setPdfProgress({ current: 0, total: 0 })

    try {
      // Step 1: Upload PDF and extract pages
      const formData = new FormData()
      formData.append('pdf', pdfFile)
      formData.append('wizardConfig', JSON.stringify(cfg))
      formData.append('pagesPerExam', '1')

      const res = await fetch('/api/import-pdf', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Error al importar PDF')

      const pages = data.pages || []
      setPdfProgress({ current: pages.length, total: data.totalPages })

      // Step 2: Grade each extracted page
      setPdfStage('grading')
      const graded = []
      for (let i = 0; i < pages.length; i++) {
        setPdfProgress({ current: i + 1, total: pages.length })
        try {
          // Fetch image and convert to base64
          const imgRes = await fetch(pages[i].imageUrl)
          const blob = await imgRes.blob()
          const compressed = await compressImage(blob)

          const gradeRes = await fetch('/api/grade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: compressed.base64,
              mimeType: compressed.mimeType,
              subject,
              gradeLevel,
              rubric,
              wizardConfig: cfg
            })
          })
          const gradeData = await gradeRes.json()
          if (gradeData.success) {
            graded.push(gradeData)
            // Auto-save
            await fetch('/api/save-result', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...gradeData,
                subject,
                gradeLevel,
                studentName: studentName || `PDF p.${pages[i].pageNumber}`,
                studentGroup,
                ocr_confidence: gradeData.ocr_confidence,
                wizardConfig: cfg
              })
            })
          }
        } catch (err) {
          console.error(`Error grading page ${i + 1}:`, err)
        }
        if (i < pages.length - 1) {
          await new Promise(r => setTimeout(r, 800))
        }
      }

      setPdfStage('done')
      alert(`✅ PDF procesado: ${graded.length} de ${pages.length} páginas corregidas correctamente`)
      setPdfFile(null)
      fetchHistory()
    } catch (e) {
      setError(e.message || 'Error al procesar PDF')
      setPdfStage('')
    }
  }

  const handlePdfImport = () => runPdfImport(null)

  // Wizard handlers
  const handleOpenWizard = (action) => {
    setPendingAction(action)
    setWizardOpen(true)
  }

  const handleWizardComplete = (config) => {
    setWizardConfig(config)
    setWizardOpen(false)
    // Resume pending action after wizard closes
    if (pendingAction === 'bulk') {
      setTimeout(() => galleryRef.current?.click(), 100)
    } else if (pendingAction === 'pdf') {
      // Pass config directly because state may not be updated yet
      setTimeout(() => runPdfImport(config), 100)
    }
    setPendingAction(null)
  }

  const handleWizardCancel = () => {
    setWizardOpen(false)
    setPendingAction(null)
  }

  const handleClearWizardConfig = () => {
    setWizardConfig(null)
  }

  const handleNextExam = () => {
    setImageData(null); setResults(null); setSaved(false); setError('')
    setScreen(resultSource === 'history' ? 'history' : 'scan')
  }

  const handleViewExam = (exam) => {
    setResults(exam); setResultSource('history'); setSaved(true); setScreen('results')
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex justify-center" style={{ paddingBottom: screen !== 'results' ? '72px' : '0' }}>
        <div className="w-full max-w-md">

          {/* ══════════════ SCAN SCREEN ══════════════ */}
          {screen === 'scan' && (
            <div className="fade-in">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-5 pt-12 pb-7 text-white shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">📋</div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">Corrector de Exámenes</h1>
                    <p className="text-blue-200 text-xs">Corrección automática con IA</p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-4 space-y-3">

                {/* Scanner status */}
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full shadow-lg ${
                      cameraStatus === 'connected' ? 'bg-emerald-400' : cameraStatus === 'disconnected' ? 'bg-red-400' : 'bg-amber-400 pulse-slow'
                    }`} />
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {cameraStatus === 'connected' ? 'Escáner conectado' : cameraStatus === 'disconnected' ? 'Escáner desconectado' : 'Verificando...'}
                      </p>
                      {deviceName && <p className="text-xs text-slate-400">{deviceName}</p>}
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    cameraStatus === 'connected' ? 'bg-emerald-100 text-emerald-700' : cameraStatus === 'disconnected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {cameraStatus === 'connected' ? 'Activo' : cameraStatus === 'disconnected' ? 'Inactivo' : '...'}
                  </span>
                </div>

                {/* Student ID */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
                  <p className="text-sm font-semibold text-slate-600">Datos del alumno</p>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Nombre del alumno/a</label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      placeholder="Ej: María García López"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Clase / Grupo</label>
                    <input
                      type="text"
                      value={studentGroup}
                      onChange={e => setStudentGroup(e.target.value)}
                      placeholder="Ej: 3º ESO B"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Image capture */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                  {/* Wizard Config Card */}
                  <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-slate-200">
                    {wizardConfig ? (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">✨</span>
                            <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">Asistente activo</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {wizardConfig.segment === 'oposiciones' ? 'Oposiciones' : 'Academia'}
                            {' · '}
                            {wizardConfig.department || 'general'}
                            {wizardConfig.segment === 'oposiciones' && ` · ${wizardConfig.questionCount}p`}
                            {wizardConfig.segment === 'academia' && ` · ${wizardConfig.level}`}
                          </p>
                        </div>
                        <button
                          onClick={handleClearWizardConfig}
                          className="text-xs text-slate-500 hover:text-red-600 px-2 py-1"
                          title="Limpiar configuración"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenWizard('single')}
                        className="w-full flex items-center justify-between gap-2 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⚙️</span>
                          <div>
                            <p className="text-sm font-bold text-slate-800">Configurar examen</p>
                            <p className="text-xs text-slate-600">Pulsa para abrir el asistente (Oposiciones / Academia)</p>
                          </div>
                        </div>
                        <span className="text-blue-600 text-sm font-semibold">Abrir →</span>
                      </button>
                    )}
                  </div>

                  {/* Input Mode Tabs: Cámara | Galería | PDF */}
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex gap-1">
                    <button
                      onClick={() => setInputMode('camera')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                        inputMode === 'camera' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'
                      }`}
                    >
                      📷 Cámara
                    </button>
                    <button
                      onClick={() => setInputMode('gallery')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                        inputMode === 'gallery' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'
                      }`}
                    >
                      🖼 Galería
                    </button>
                    <button
                      onClick={() => setInputMode('pdf')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                        inputMode === 'pdf' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'
                      }`}
                    >
                      📄 PDF
                    </button>
                  </div>

                  {/* Bulk mode toggle (only for camera/gallery, not PDF) */}
                  {inputMode !== 'pdf' && (
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">Modo por lotes</span>
                        <span className="text-xs text-slate-500">(Múltiples exámenes)</span>
                      </div>
                      <button
                        onClick={() => setBulkMode(!bulkMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          bulkMode ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          bulkMode ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  )}

                  {/* CAMERA MODE */}
                  {inputMode === 'camera' && (
                    <button
                      onClick={() => cameraRef.current?.click()}
                      disabled={bulkMode}
                      className="w-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-7 flex flex-col items-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <span className="text-4xl">📷</span>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold">Escanear Examen</p>
                        <p className="text-blue-200 text-sm mt-0.5">
                          {bulkMode ? 'No disponible en modo por lotes' : 'Usa la cámara para fotografiar el examen'}
                        </p>
                      </div>
                    </button>
                  )}

                  {/* GALLERY MODE */}
                  {inputMode === 'gallery' && (
                    <button
                      onClick={() => bulkMode ? handleOpenWizard('bulk') : galleryRef.current?.click()}
                      className="w-full bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-7 flex flex-col items-center gap-3 transition-all active:scale-95"
                    >
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <span className="text-4xl">🖼</span>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold">
                          {bulkMode ? 'Subir múltiples exámenes' : 'Subir desde galería'}
                        </p>
                        <p className="text-emerald-100 text-sm mt-0.5">
                          {bulkMode ? 'Selecciona varias imágenes a la vez' : 'Selecciona una imagen del examen'}
                        </p>
                      </div>
                    </button>
                  )}

                  {/* PDF MODE */}
                  {inputMode === 'pdf' && (
                    <div className="p-5 space-y-3">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
                          <span className="text-4xl">📄</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Importar PDF del escáner</h3>
                        <p className="text-xs text-slate-600 mt-1">
                          Sube un PDF con varios exámenes (cada página se corregirá automáticamente)
                        </p>
                      </div>

                      {!pdfFile ? (
                        <button
                          onClick={() => pdfRef.current?.click()}
                          className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-slate-600"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl">📁</span>
                            <span className="text-sm font-semibold">Seleccionar PDF</span>
                            <span className="text-xs text-slate-400">Máximo 50 MB</span>
                          </div>
                        </button>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-2xl">📄</span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{pdfFile.name}</p>
                              <p className="text-xs text-slate-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setPdfFile(null)}
                            className="w-8 h-8 bg-red-500 text-white rounded-full text-sm flex items-center justify-center hover:bg-red-600 flex-shrink-0"
                          >×</button>
                        </div>
                      )}

                      {pdfFile && pdfStage === '' && (
                        <button
                          onClick={() => wizardConfig ? handlePdfImport() : handleOpenWizard('pdf')}
                          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 active:scale-95 transition-all shadow-md"
                        >
                          {wizardConfig ? '✨ Procesar PDF' : '⚙️ Configurar y Procesar'}
                        </button>
                      )}

                      {/* PDF Progress */}
                      {pdfStage === 'extracting' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-semibold text-blue-900">Extrayendo páginas...</span>
                          </div>
                          <p className="text-xs text-blue-700">Convirtiendo PDF a imágenes (300 DPI)</p>
                        </div>
                      )}

                      {pdfStage === 'grading' && (
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-purple-900">Corrigiendo páginas...</span>
                            <span className="text-sm font-bold text-purple-700">
                              {pdfProgress.current} / {pdfProgress.total}
                            </span>
                          </div>
                          <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-purple-600 h-full transition-all duration-300"
                              style={{ width: `${pdfProgress.total > 0 ? (pdfProgress.current / pdfProgress.total) * 100 : 0}%` }}
                            />
                          </div>
                          <p className="text-xs text-purple-700 mt-2">Cada página se está corrigiendo con IA. Por favor espera...</p>
                        </div>
                      )}

                      {pdfStage === 'done' && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                          <span className="text-3xl">✅</span>
                          <p className="text-sm font-bold text-emerald-900 mt-1">PDF procesado correctamente</p>
                          <button
                            onClick={() => { setPdfStage(''); setScreen('history') }}
                            className="text-xs text-blue-600 font-semibold mt-2 hover:underline"
                          >
                            Ver resultados en el historial →
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Secondary action - only on camera/gallery */}
                  {inputMode === 'camera' && (
                    <button
                      onClick={() => galleryRef.current?.click()}
                      className="w-full py-3.5 flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors border-t border-slate-100"
                    >
                      <span className="text-xl">🖼</span>
                      <span className="text-sm font-medium">
                        {bulkMode ? 'Seleccionar múltiples exámenes' : 'Subir desde galería / archivo'}
                      </span>
                    </button>
                  )}
                </div>

                {/* Bulk processing progress */}
                {bulkProcessing && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">
                        Procesando exámenes...
                      </span>
                      <span className="text-sm font-bold text-blue-700">
                        {bulkProgress.current} / {bulkProgress.total}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full transition-all duration-300"
                        style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-blue-700 mt-2">Por favor espera, esto puede tomar varios minutos...</p>
                  </div>
                )}

                <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileInput} />
                <input ref={galleryRef} type="file" accept="image/*" multiple={bulkMode} className="hidden" onChange={handleFileInput} />
                <input ref={pdfRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={handlePdfFileSelected} />

                {/* Image preview */}
                {imageData && (
                  <div className="fade-in bg-white rounded-2xl overflow-hidden shadow-sm border border-blue-100">
                    <div className="relative">
                      <img src={imageData.preview} alt="Vista previa" className="w-full max-h-48 object-contain bg-slate-50" />
                      <button
                        onClick={() => setImageData(null)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full text-sm flex items-center justify-center hover:bg-red-600 shadow-md"
                      >×</button>
                    </div>
                    <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span className="text-emerald-700 text-sm font-medium">Imagen lista para corregir</span>
                    </div>
                  </div>
                )}

                {/* Exam info */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
                  <p className="text-sm font-semibold text-slate-600">Información del examen</p>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Asignatura</label>
                    <div className="relative">
                      <select value={subject} onChange={e => setSubject(e.target.value)}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▾</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Nivel educativo</label>
                    <div className="relative">
                      <select value={gradeLevel} onChange={e => setGradeLevel(e.target.value)}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {LEVELS.map(l => <option key={l}>{l}</option>)}
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
                    value={rubric} onChange={e => setRubric(e.target.value)}
                    placeholder={`Pega aquí las respuestas correctas o la rúbrica...\n\nEjemplo:\n1. La fotosíntesis es... (2 puntos)\n2. Los reinos son... (2 puntos)`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={5}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="fade-in bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-start gap-3">
                    <span className="text-red-500 mt-0.5">⚠</span>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !imageData}
                  className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all ${
                    loading || !imageData ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-95 shadow-blue-200'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {loadingMsg}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>✨</span> Corregir con IA
                    </span>
                  )}
                </button>

                <div className="h-2" />
              </div>
            </div>
          )}

          {/* ══════════════ RESULTS SCREEN ══════════════ */}
          {screen === 'results' && results && (() => {
            const colors = gradeColor(results.grade, results.maxGrade || 10)
            const pct = Math.round((results.grade / (results.maxGrade || 10)) * 100)
            return (
              <div className="fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-5 pt-12 pb-6 text-white shadow-lg">
                  <div className="flex items-center gap-3">
                    <button onClick={handleNextExam} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors text-lg">←</button>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl font-bold truncate">
                        {results.studentName || 'Resultado del examen'}
                      </h1>
                      <p className="text-blue-200 text-xs">
                        {results.studentGroup && <span>{results.studentGroup} · </span>}
                        {results.subject} · {results.gradeLevel}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-5 space-y-4">

                  {/* Grade card */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
                    <div className={`mx-auto w-32 h-32 rounded-full border-8 ${colors.ring} ${colors.bg} flex flex-col items-center justify-center mb-4 shadow-lg`}>
                      <span className={`text-4xl font-black ${colors.text}`}>{results.grade}</span>
                      <span className="text-slate-400 text-sm font-medium">/{results.maxGrade || 10}</span>
                    </div>
                    {results.gradeLabel && (
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${colors.badge}`}>{results.gradeLabel}</span>
                    )}
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div className={`h-3 rounded-full bar-fill ${colors.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-slate-400 text-xs mt-2">{pct}% de la puntuación máxima</p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      {results.timeTaken && (
                        <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                          <span className="text-blue-500">⚡</span>
                          <span className="text-blue-700 text-sm font-medium">Corregido en {results.timeTaken}s</span>
                        </div>
                      )}
                      {(() => {
                        const conf = results.ocr_confidence ?? results.ocrConfidence
                        if (conf === null || conf === undefined) return null
                        const confPct = (parseFloat(conf) * 100).toFixed(1)
                        const confColor = parseFloat(confPct) >= 99 ? 'bg-emerald-50 text-emerald-700' :
                                          parseFloat(confPct) >= 95 ? 'bg-amber-50 text-amber-700' :
                                          'bg-red-50 text-red-700'
                        return (
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${confColor}`}>
                            <span>🎯</span>
                            <span className="text-sm font-medium">Precisión: {confPct}%</span>
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Question breakdown */}
                  {results.questions && results.questions.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide">Desglose por pregunta</h2>
                        <span className="text-xs text-slate-400">{results.questions.length} preguntas</span>
                      </div>
                      {results.questions.map((q, i) => (
                        <div key={i} className={`fade-in bg-white rounded-2xl border shadow-sm overflow-hidden ${qBorder(q.pointsAwarded, q.maxPoints)}`} style={{ animationDelay: `${i * 0.05}s` }}>
                          <div className="flex items-center justify-between px-4 py-3 border-b border-current/10">
                            <div className="flex items-center gap-2">
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                                q.pointsAwarded >= q.maxPoints ? 'bg-emerald-500' : q.pointsAwarded > 0 ? 'bg-amber-400' : 'bg-red-500'
                              }`}>{qIcon(q.pointsAwarded, q.maxPoints)}</span>
                              <span className="font-semibold text-slate-700 text-sm">Pregunta {q.number}</span>
                            </div>
                            <span className={`text-sm font-bold ${qText(q.pointsAwarded, q.maxPoints)}`}>{q.pointsAwarded}/{q.maxPoints} pts</span>
                          </div>
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
                              <div className="bg-white/70 rounded-xl px-3 py-2 border border-current/10">
                                <p className="text-slate-600 text-xs italic">💬 {q.feedback}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="space-y-3 pt-1">
                    <button onClick={() => window.print()}
                      className="w-full py-4 rounded-2xl bg-slate-700 hover:bg-slate-800 active:scale-95 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-sm">
                      <span>📄</span> Exportar PDF
                    </button>
                    <button onClick={handleSave} disabled={saved || saving}
                      className={`w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                        saved ? 'bg-emerald-100 text-emerald-700 cursor-default'
                          : saving ? 'bg-slate-200 text-slate-400 cursor-wait'
                          : 'bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 active:scale-95'
                      }`}>
                      {saved ? <><span>✓</span> Guardado</> : saving ? <><span className="inline-block w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> Guardando...</> : <><span>💾</span> Guardar resultado</>}
                    </button>
                    <button onClick={handleNextExam}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-95 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200">
                      {resultSource === 'history' ? <><span>←</span> Volver al historial</> : <><span>→</span> Siguiente examen</>}
                    </button>
                  </div>

                  <div className="h-4" />
                </div>
              </div>
            )
          })()}

          {/* ══════════════ HISTORY SCREEN ══════════════ */}
          {screen === 'history' && (
            <div className="fade-in">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-5 pt-12 pb-7 text-white shadow-lg">
                <h1 className="text-xl font-bold">Historial de exámenes</h1>
                <p className="text-blue-200 text-xs mt-0.5">Exámenes corregidos con IA</p>
              </div>

              <div className="px-4 py-4 space-y-4">

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
                    <p className="text-3xl font-black text-blue-600">{historyStats.total}</p>
                    <p className="text-xs text-slate-500 mt-1">Exámenes corregidos</p>
                  </div>
                  <div className={`rounded-2xl p-4 shadow-sm border text-center ${
                    historyStats.avgGrade >= 7 ? 'bg-emerald-50 border-emerald-100'
                    : historyStats.avgGrade >= 5 ? 'bg-amber-50 border-amber-100'
                    : historyStats.total > 0 ? 'bg-red-50 border-red-100'
                    : 'bg-white border-slate-100'
                  }`}>
                    <p className={`text-3xl font-black ${
                      historyStats.avgGrade >= 7 ? 'text-emerald-600'
                      : historyStats.avgGrade >= 5 ? 'text-amber-600'
                      : historyStats.total > 0 ? 'text-red-600'
                      : 'text-slate-400'
                    }`}>{historyStats.total > 0 ? historyStats.avgGrade : '—'}</p>
                    <p className="text-xs text-slate-500 mt-1">Nota media</p>
                  </div>
                </div>

                {/* Subject filter */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Filtrar por asignatura</p>
                  <div className="sx flex gap-2 pb-1">
                    {['Todas', ...SUBJECTS].map(s => (
                      <button key={s} onClick={() => setFilterSubject(s)}
                        className={`pill ${filterSubject === s ? 'pill-on' : 'pill-off'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date filter */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Filtrar por fecha</p>
                  <div className="flex gap-2">
                    {DATE_FILTERS.map(f => (
                      <button key={f.v} onClick={() => setFilterDate(f.v)}
                        className={`pill ${filterDate === f.v ? 'pill-on' : 'pill-off'}`}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results list */}
                {historyLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <span className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Cargando historial...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
                    <p className="text-4xl mb-3">📚</p>
                    <p className="text-slate-600 font-semibold">No hay exámenes{filterSubject !== 'Todas' || filterDate !== 'all' ? ' con estos filtros' : ' aún'}</p>
                    <p className="text-slate-400 text-sm mt-1">¡Empieza a corregir con IA!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((exam, i) => {
                      const c = gradeColor(exam.grade, exam.maxGrade || 10)
                      return (
                        <button
                          key={exam.id || i}
                          onClick={() => handleViewExam(exam)}
                          className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all text-left flex items-center gap-4 active:scale-98"
                        >
                          {/* Grade circle */}
                          <div className={`w-14 h-14 rounded-full border-4 ${c.ring} ${c.bg} flex flex-col items-center justify-center flex-shrink-0`}>
                            <span className={`text-lg font-black ${c.text} leading-none`}>{exam.grade}</span>
                            <span className="text-slate-400 text-xs">/{exam.maxGrade || 10}</span>
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate">
                              {exam.studentName || <span className="text-slate-400 italic">Sin nombre</span>}
                            </p>
                            {exam.studentGroup && (
                              <p className="text-xs text-blue-500 font-medium truncate">{exam.studentGroup}</p>
                            )}
                            <p className="text-xs text-slate-500 truncate">{exam.subject} · {exam.gradeLevel}</p>
                            <p className="text-xs text-slate-400">{formatDate(exam.createdAt)}</p>
                          </div>
                          {/* Arrow */}
                          <span className="text-slate-300 text-xl flex-shrink-0">›</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                <div className="h-2" />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom navigation */}
      {screen !== 'results' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 z-50 shadow-lg">
          <div className="flex max-w-md mx-auto">
            <button
              onClick={() => setScreen('scan')}
              className={`flex-1 py-3.5 flex flex-col items-center gap-1 text-xs font-semibold transition-colors ${
                screen === 'scan' ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <span className="text-2xl">{screen === 'scan' ? '📸' : '📷'}</span>
              <span>Nuevo examen</span>
            </button>
            <div className="w-px bg-slate-200 my-2" />
            <button
              onClick={() => setScreen('history')}
              className={`flex-1 py-3.5 flex flex-col items-center gap-1 text-xs font-semibold transition-colors ${
                screen === 'history' ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <span className="text-2xl">📊</span>
              <span>Historial</span>
            </button>
          </div>
        </div>
      )}

      {/* Print document (hidden, only for PDF export) */}
      <PrintDocument results={results} />

      {/* Exam Configuration Wizard Modal (Feature #1) */}
      {wizardOpen && (
        <ExamConfigWizard
          onComplete={handleWizardComplete}
          onCancel={handleWizardCancel}
        />
      )}
    </>
  )
}
