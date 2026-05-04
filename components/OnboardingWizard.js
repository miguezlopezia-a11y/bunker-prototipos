'use client'

import React, { useState } from 'react'
import { School, Upload, User, BookOpen, Check, ArrowRight, ArrowLeft } from 'lucide-react'

export default function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    // Step 1: School info
    schoolName: '',
    cifNif: '',
    address: '',
    dpoEmail: '',
    
    // Step 2: Logo
    logoUrl: '',
    
    // Step 3: Admin teacher
    adminName: '',
    adminEmail: '',
    
    // Step 4: First rubric
    rubricName: '',
    rubricSubject: '',
    rubricLevel: '',
    rubricContent: ''
  })

  const totalSteps = 4

  function handleNext() {
    // Validation per step
    if (step === 1) {
      if (!data.schoolName || !data.cifNif || !data.dpoEmail) {
        alert('Por favor completa todos los campos obligatorios')
        return
      }
    }
    if (step === 3) {
      if (!data.adminName || !data.adminEmail) {
        alert('Por favor completa todos los campos obligatorios')
        return
      }
    }
    if (step === 4) {
      if (!data.rubricName || !data.rubricContent) {
        alert('Por favor completa todos los campos obligatorios')
        return
      }
    }
    
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      handleFinish()
    }
  }

  function handleBack() {
    if (step > 1) setStep(step - 1)
  }

  async function handleFinish() {
    // TODO: Send data to API to create school, admin, and rubric
    console.log('Onboarding data:', data)
    alert('✅ Centro configurado correctamente')
    onComplete?.()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 $
                  s <= step ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-slate-400'
                }`}
              >
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
            ))}
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="mb-8">
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <School className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Información del Centro</h2>
                  <p className="text-slate-600">Configuración básica de tu centro educativo</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre del Centro *
                  </label>
                  <input
                    type="text"
                    value={data.schoolName}
                    onChange={(e) => setData({...data, schoolName: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="IES Miguel de Cervantes"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    CIF/NIF *
                  </label>
                  <input
                    type="text"
                    value={data.cifNif}
                    onChange={(e) => setData({...data, cifNif: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Q1234567A"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Dirección
                  </label>
                  <textarea
                    value={data.address}
                    onChange={(e) => setData({...data, address: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Calle Principal, 123\n28001 Madrid, España"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email del DPO (Delegado de Protección de Datos) *
                  </label>
                  <input
                    type="email"
                    value={data.dpoEmail}
                    onChange={(e) => setData({...data, dpoEmail: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="dpo@colegio.es"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Obligatorio según Art. 37 RGPD</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Upload className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Logo del Centro</h2>
                  <p className="text-slate-600">Opcional - puedes añadirlo después</p>
                </div>
              </div>

              <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
                <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">Arrastra una imagen o haz clic para subir</p>
                <p className="text-sm text-slate-500">PNG o JPG, máximo 2MB</p>
                <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                  Seleccionar archivo
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <User className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Primer Profesor (Administrador)</h2>
                  <p className="text-slate-600">Crea tu cuenta de administrador</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={data.adminName}
                    onChange={(e) => setData({...data, adminName: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="María García López"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={data.adminEmail}
                    onChange={(e) => setData({...data, adminEmail: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="maria.garcia@colegio.es"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Recibirás un email para establecer tu contraseña</p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Primera Rúbrica</h2>
                  <p className="text-slate-600">Crea una rúbrica para empezar a corregir</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre de la rúbrica *
                  </label>
                  <input
                    type="text"
                    value={data.rubricName}
                    onChange={(e) => setData({...data, rubricName: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Matemáticas - Álgebra ESO"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Asignatura
                    </label>
                    <input
                      type="text"
                      value={data.rubricSubject}
                      onChange={(e) => setData({...data, rubricSubject: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Matemáticas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nivel
                    </label>
                    <input
                      type="text"
                      value={data.rubricLevel}
                      onChange={(e) => setData({...data, rubricLevel: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="3º ESO"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contenido de la rúbrica *
                  </label>
                  <textarea
                    value={data.rubricContent}
                    onChange={(e) => setData({...data, rubricContent: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    placeholder="Pregunta 1: Resolver ecuaciones de primer grado (2 puntos)\nPregunta 2: Ecuaciones de segundo grado (3 puntos)..."
                    required
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-2 px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            {step === totalSteps ? 'Finalizar' : 'Siguiente'}
            {step < totalSteps && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
