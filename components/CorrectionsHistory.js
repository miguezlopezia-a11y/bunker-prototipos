'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus, Bot, User, Wrench, Clock, Download, FileText } from 'lucide-react'

const CORRECTION_TYPES = {
  ERROR_REPAIR: { label: 'Reparación de error', color: 'bg-red-100 text-red-700 border-red-200' },
  EDITORIAL_NORMALIZATION: { label: 'Normalización editorial', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  FORMATTING_STANDARDIZATION: { label: 'Estandarización de formato', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  AMBIGUITY_RESOLUTION: { label: 'Resolución de ambigüedad', color: 'bg-amber-100 text-amber-700 border-amber-200' }
}

const SOURCE_LABELS = {
  AI_MODEL: { label: 'IA (GPT-4o)', icon: Bot, color: 'text-blue-600 bg-blue-50' },
  HUMAN_TEACHER: { label: 'Profesor', icon: User, color: 'text-emerald-600 bg-emerald-50' },
  RULE_AUTOMATIC: { label: 'Regla automática', icon: Wrench, color: 'text-slate-600 bg-slate-50' }
}

export default function CorrectionsHistory({ examResultId, examQuestions = [], onClose }) {
  const [corrections, setCorrections] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    questionIndex: 0,
    originalText: '',
    correctedText: '',
    correctionType: 'ERROR_REPAIR',
    notes: ''
  })

  useEffect(() => {
    if (examResultId) loadCorrections()
  }, [examResultId])

  async function loadCorrections() {
    setLoading(true)
    try {
      const res = await fetch(`/api/corrections?examResultId=${examResultId}`)
      const data = await res.json()
      if (data.success) setCorrections(data.corrections || [])
    } catch (e) {
      console.error('Error loading corrections:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examResultId,
          questionIndex: parseInt(form.questionIndex, 10),
          originalText: form.originalText,
          correctedText: form.correctedText,
          correctionType: form.correctionType,
          correctionSource: 'HUMAN_TEACHER',
          notes: form.notes
        })
      })
      const data = await res.json()
      if (data.success) {
        await loadCorrections()
        setShowAddForm(false)
        setForm({ questionIndex: 0, originalText: '', correctedText: '', correctionType: 'ERROR_REPAIR', notes: '' })
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      alert(`Error de red: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  function exportAuditLog() {
    const lines = [
      'AUDITORÍA DE CORRECCIONES — Trazabilidad ANECA',
      `Examen ID: ${examResultId}`,
      `Generado: ${new Date().toLocaleString('es-ES')}`,
      `Total de correcciones: ${corrections.length}`,
      '─'.repeat(80),
      ''
    ]
    corrections.forEach((c, i) => {
      lines.push(`#${i + 1} — Pregunta ${c.questionIndex + 1}`)
      lines.push(`  Fuente: ${SOURCE_LABELS[c.correctionSource]?.label || c.correctionSource}`)
      lines.push(`  Tipo: ${CORRECTION_TYPES[c.correctionType]?.label || c.correctionType || '—'}`)
      lines.push(`  Confianza: ${c.confidenceScore !== null ? (c.confidenceScore * 100).toFixed(1) + '%' : '—'}`)
      lines.push(`  Fecha: ${new Date(c.correctedAt).toLocaleString('es-ES')}`)
      lines.push(`  Texto original: ${c.originalText}`)
      if (c.correctedText) lines.push(`  Texto corregido: ${c.correctedText}`)
      if (c.notes) lines.push(`  Notas: ${c.notes}`)
      lines.push('')
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `auditoria-correcciones-${examResultId.slice(0, 8)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Auditoría de correcciones
            </h2>
            <p className="text-xs text-slate-500 mt-1">Trazabilidad completa para auditoría académica (ANECA)</p>
          </div>
          <div className="flex items-center gap-2">
            {corrections.length > 0 && (
              <button
                onClick={exportAuditLog}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                title="Exportar log de auditoría"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" aria-label="Cerrar">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Add manual correction button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mb-4 inline-flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Añadir corrección manual del profesor
            </button>
          )}

          {/* Add form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-emerald-900 text-sm flex items-center gap-1.5">
                  <User className="w-4 h-4" /> Corrección manual del profesor
                </h3>
                <button type="button" onClick={() => setShowAddForm(false)} className="text-emerald-700 hover:text-emerald-900">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Pregunta nº</label>
                  <select
                    value={form.questionIndex}
                    onChange={(e) => setForm({ ...form, questionIndex: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm bg-white"
                  >
                    {(examQuestions.length > 0 ? examQuestions : [...Array(20)].map((_, i) => ({ number: i + 1 }))).map((q, idx) => (
                      <option key={idx} value={idx}>Pregunta {q.number || idx + 1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tipo de corrección</label>
                  <select
                    value={form.correctionType}
                    onChange={(e) => setForm({ ...form, correctionType: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm bg-white"
                  >
                    {Object.entries(CORRECTION_TYPES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Texto original *</label>
                <textarea
                  required
                  value={form.originalText}
                  onChange={(e) => setForm({ ...form, originalText: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Lo que escribió el alumno"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Texto corregido</label>
                <textarea
                  value={form.correctedText}
                  onChange={(e) => setForm({ ...form, correctedText: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Tu corrección (opcional si solo es una nota)"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Notas / justificación</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  placeholder="Explicación pedagógica (visible en auditoría)"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-1.5 border border-slate-300 text-slate-700 rounded text-sm hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar corrección'}
                </button>
              </div>
            </form>
          )}

          {/* List of corrections */}
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              <div className="inline-block w-6 h-6 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin mb-2"></div>
              <p className="text-sm">Cargando historial...</p>
            </div>
          ) : corrections.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Sin correcciones registradas todavía</p>
              <p className="text-xs mt-1">Las correcciones de IA y manuales aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-2">{corrections.length} correcciones registradas</p>
              {corrections.map((c) => {
                const source = SOURCE_LABELS[c.correctionSource] || SOURCE_LABELS.AI_MODEL
                const Icon = source.icon
                const typeBadge = CORRECTION_TYPES[c.correctionType]
                return (
                  <div key={c.id} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${source.color}`}>
                          <Icon className="w-3 h-3" />
                          {source.label}
                        </span>
                        {typeBadge && (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${typeBadge.color}`}>
                            {typeBadge.label}
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          Pregunta {c.questionIndex + 1}
                        </span>
                        {c.confidenceScore !== null && (
                          <span className="text-xs text-slate-500">
                            · Confianza {(c.confidenceScore * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(c.correctedAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-sm">
                      <div>
                        <span className="text-xs font-medium text-slate-500">Original:</span>
                        <p className="text-slate-700 bg-slate-50 px-2 py-1 rounded mt-0.5">{c.originalText}</p>
                      </div>
                      {c.correctedText && (
                        <div>
                          <span className="text-xs font-medium text-emerald-700">Corregido:</span>
                          <p className="text-slate-700 bg-emerald-50 px-2 py-1 rounded mt-0.5">{c.correctedText}</p>
                        </div>
                      )}
                      {c.notes && (
                        <div>
                          <span className="text-xs font-medium text-amber-700">Notas:</span>
                          <p className="text-slate-700 bg-amber-50 px-2 py-1 rounded mt-0.5 italic">{c.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 rounded-b-2xl">
          <p className="text-xs text-slate-500 text-center">
            🔒 Todas las correcciones se registran de forma inmutable en cumplimiento con los requisitos de auditoría académica.
          </p>
        </div>
      </div>
    </div>
  )
}
