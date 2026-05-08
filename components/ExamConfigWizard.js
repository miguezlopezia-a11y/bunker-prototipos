'use client'

import React, { useState } from 'react'
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Save,
  Award,
  School,
  Calculator,
  Globe,
  FlaskConical,
  ScrollText
} from 'lucide-react'

const SEGMENTS = [
  {
    id: 'oposiciones',
    name: 'Oposiciones',
    icon: Award,
    description: 'Sanidad, Educación, Administración, Seguridad',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'academia',
    name: 'Academia y Refuerzo',
    icon: BookOpen,
    description: 'Inglés, Matemáticas, Ciencias, Historia',
    color: 'from-blue-500 to-cyan-600'
  }
]

const OPOSICIONES_DEPARTMENTS = [
  { id: 'sanidad', name: 'Sanidad', icon: '🏥' },
  { id: 'educacion', name: 'Educación', icon: '📚' },
  { id: 'administracion', name: 'Administración Pública', icon: '🏛️' },
  { id: 'seguridad', name: 'Seguridad', icon: '👮' },
  { id: 'otros', name: 'Otros', icon: '📋' }
]

const ACADEMIA_DEPARTMENTS = [
  { id: 'ingles', name: 'Inglés', icon: Globe },
  { id: 'matematicas', name: 'Matemáticas', icon: Calculator },
  { id: 'ciencias', name: 'Ciencias', icon: FlaskConical },
  { id: 'historia', name: 'Historia', icon: ScrollText },
  { id: 'general', name: 'General', icon: BookOpen }
]

const LEVELS = [
  'Primaria',
  'ESO',
  'Bachillerato',
  'FP',
  'Universidad',
  'Certificación'
]

const EXAM_TYPES = [
  { id: 'tipo_test', name: 'Tipo Test', icon: '☑️', description: 'Opción múltiple A/B/C/D' },
  { id: 'preguntas_cortas', name: 'Preguntas Cortas', icon: '✍️', description: 'Respuestas breves' },
  { id: 'redaccion', name: 'Redacción', icon: '📝', description: 'Composición escrita' },
  { id: 'problemas', name: 'Problemas', icon: '🔢', description: 'Desarrollo matemático' },
  { id: 'mixto', name: 'Mixto', icon: '📊', description: 'Varios tipos combinados' }
]

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const PENALTIES = [
  { value: 0, label: 'Sin penalización' },
  { value: -0.25, label: '-0.25 (estándar)' },
  { value: -0.33, label: '-0.33 (tres opciones)' },
  { value: -0.5, label: '-0.5 (estricta)' }
]

export default function ExamConfigWizard({ onComplete, onCancel }) {
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState({
    segment: null,
    department: null,
    // Oposiciones
    questionCount: 100,
    penalty: -0.25,
    topicBlocks: [],
    // Academia
    level: 'ESO',
    examType: 'mixto',
    criteria: [],
    cefrLevel: null,
    includeWritingAnalysis: false,
    includeMathSteps: false,
    // Template
    templateName: ''
  })

  const totalSteps = config.segment === 'oposiciones' ? 3 : 4

  function handleSegmentSelect(segmentId) {
    setConfig({ ...config, segment: segmentId })
    setStep(2)
  }

  function handleNext() {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      handleFinish()
    }
  }

  function handleBack() {
    if (step > 1) setStep(step - 1)
  }

  function handleFinish(saveAsTemplate = false) {
    onComplete({ ...config, saveAsTemplate })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold mb-2">Configurar Corrección de Examen</h2>
          <p className="text-blue-100">Paso {step} de {totalSteps}</p>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step 1: Segment Selection */}
          {step === 1 && (
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Selecciona el segmento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SEGMENTS.map((segment) => {
                  const Icon = segment.icon
                  return (
                    <button
                      key={segment.id}
                      onClick={() => handleSegmentSelect(segment.id)}
                      className={`bg-gradient-to-br ${segment.color} text-white p-8 rounded-xl hover:scale-105 transition-transform shadow-lg`}
                    >
                      <Icon className="w-16 h-16 mx-auto mb-4" />
                      <h4 className="text-2xl font-bold mb-2">{segment.name}</h4>
                      <p className="text-white/90">{segment.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Oposiciones Configuration */}
          {step === 2 && config.segment === 'oposiciones' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900">Configuración de Oposiciones</h3>
              
              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Departamento</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {OPOSICIONES_DEPARTMENTS.map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => setConfig({...config, department: dept.id})}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        config.department === dept.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{dept.icon}</div>
                      <div className="text-sm font-medium text-slate-900">{dept.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Número de preguntas: {config.questionCount}
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="10"
                  value={config.questionCount}
                  onChange={(e) => setConfig({...config, questionCount: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>50</span>
                  <span>200</span>
                </div>
              </div>

              {/* Penalty */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Penalización por error</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PENALTIES.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setConfig({...config, penalty: p.value})}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        config.penalty === p.value
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-bold text-lg text-slate-900">{p.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Academia Department */}
          {step === 2 && config.segment === 'academia' && (
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Selecciona la asignatura</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {ACADEMIA_DEPARTMENTS.map((dept) => {
                  const Icon = dept.icon
                  return (
                    <button
                      key={dept.id}
                      onClick={() => setConfig({...config, department: dept.id})}
                      className={`p-6 border-2 rounded-xl text-center transition-all ${
                        config.department === dept.id
                          ? 'border-blue-600 bg-blue-50 scale-105'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <Icon className="w-12 h-12 mx-auto mb-3 text-slate-700" />
                      <div className="font-semibold text-slate-900">{dept.name}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Academia Level & Type */}
          {step === 3 && config.segment === 'academia' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Nivel educativo</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => setConfig({...config, level})}
                      className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                        config.level === level
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Tipo de examen</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {EXAM_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setConfig({...config, examType: type.id})}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        config.examType === type.id
                          ? 'border-blue-600 bg-blue-50 scale-105'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <div className="font-semibold text-slate-900 text-sm mb-1">{type.name}</div>
                      <div className="text-xs text-slate-600">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Special options for Inglés */}
              {config.department === 'ingles' && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Nivel MCER objetivo</h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {CEFR_LEVELS.map((level) => (
                      <button
                        key={level}
                        onClick={() => setConfig({...config, cefrLevel: level})}
                        className={`px-4 py-3 border-2 rounded-lg font-bold transition-all ${
                          config.cefrLevel === level
                            ? 'border-green-600 bg-green-50'
                            : 'border-slate-200 hover:border-green-300'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Special options for Matemáticas */}
              {config.department === 'matematicas' && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="mathSteps"
                    checked={config.includeMathSteps}
                    onChange={(e) => setConfig({...config, includeMathSteps: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <label htmlFor="mathSteps" className="text-sm font-medium text-slate-700">
                    Analizar pasos del razonamiento matemático
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Step 3/4: Save as Template */}
          {step === totalSteps && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900">¿Guardar como plantilla?</h3>
              <p className="text-slate-600">
                Guarda esta configuración para reutilizarla en futuros exámenes
              </p>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre de la plantilla (opcional)
                </label>
                <input
                  type="text"
                  value={config.templateName}
                  onChange={(e) => setConfig({...config, templateName: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="Ej: Oposiciones Sanidad 2025"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Resumen de configuración</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Segmento: <strong>{config.segment === 'oposiciones' ? 'Oposiciones' : 'Academia y Refuerzo'}</strong></li>
                  {config.segment === 'oposiciones' && (
                    <>
                      <li>• Preguntas: <strong>{config.questionCount}</strong></li>
                      <li>• Penalización: <strong>{config.penalty === 0 ? 'Sin penalización' : config.penalty}</strong></li>
                    </>
                  )}
                  {config.segment === 'academia' && (
                    <>
                      <li>• Nivel: <strong>{config.level}</strong></li>
                      <li>• Tipo: <strong>{EXAM_TYPES.find(t => t.id === config.examType)?.name}</strong></li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-slate-200">
          <button
            onClick={step === 1 ? onCancel : handleBack}
            className="flex items-center gap-2 px-6 py-3 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 1 ? 'Cancelar' : 'Atrás'}
          </button>

          <button
            onClick={() => step === totalSteps ? handleFinish(!!config.templateName) : handleNext()}
            disabled={
              (step === 2 && !config.department) ||
              (step === 3 && config.segment === 'academia' && !config.examType)
            }
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === totalSteps ? (
              <>
                <CheckCircle className="w-5 h-5" />
                {config.templateName ? 'Guardar y Comenzar' : 'Comenzar Corrección'}
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
