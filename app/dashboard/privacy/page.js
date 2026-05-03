'use client'

import React, { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Shield, AlertTriangle, Download, Trash2, CheckCircle, XCircle } from 'lucide-react'

export default function PrivacyPage() {
  const [anonymousMode, setAnonymousMode] = useState(false)
  const [retentionMonths, setRetentionMonths] = useState(24)

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Privacidad y Datos Personales</h1>
          <p className="text-slate-600 mt-1">Cumplimiento RGPD y LOPDGDD</p>
        </div>

        {/* RGPD Warning */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Protección de Datos Garantizada</h3>
              <p className="text-sm text-blue-800">
                Esta aplicación cumple con el RGPD (Reglamento General de Protección de Datos) y la LOPDGDD (Ley Orgánica de Protección de Datos y Garantía de los Derechos Digitales de España).
              </p>
            </div>
          </div>
        </div>

        {/* Modo Anónimo */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Modo Anónimo</h2>
              <p className="text-sm text-slate-600">
                Corrige exámenes sin guardar datos personales de estudiantes
              </p>
            </div>
            <button
              onClick={() => setAnonymousMode(!anonymousMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                anonymousMode ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                anonymousMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <p className="text-sm text-slate-500">
            En modo anónimo, solo se guardan las calificaciones y respuestas, sin nombres ni grupos de estudiantes.
          </p>
        </div>

        {/* Retención de datos */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Política de Retención de Datos</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tiempo de retención de exámenes: {retentionMonths} meses
              </label>
              <input
                type="range"
                min="6"
                max="60"
                step="6"
                value={retentionMonths}
                onChange={(e) => setRetentionMonths(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-slate-500 mt-2">
                Después de este periodo, los datos se eliminarán automáticamente (soft delete). Los datos pueden recuperarse dentro de 30 días adicionales.
              </p>
            </div>
          </div>
        </div>

        {/* Derechos RGPD */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Derechos de los Interesados (Art. 12-23 RGPD)</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 text-left">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-slate-900">Derecho de Portabilidad (Art. 20)</p>
                  <p className="text-sm text-slate-600">Exportar todos tus datos en formato JSON/CSV</p>
                </div>
              </div>
              <span className="text-blue-600 font-medium">Exportar</span>
            </button>

            <button className="w-full flex items-center justify-between px-4 py-3 border border-red-300 rounded-lg hover:bg-red-50 text-left">
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-slate-900">Derecho al Olvido (Art. 17)</p>
                  <p className="text-sm text-slate-600">Solicitar la eliminación completa de tus datos</p>
                </div>
              </div>
              <span className="text-red-600 font-medium">Eliminar</span>
            </button>
          </div>
        </div>

        {/* Consentimientos */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Mis Consentimientos</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-slate-900">Procesamiento de datos educativos</p>
                <p className="text-sm text-slate-600">Otorgado el 15/01/2025</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-slate-900">Uso de inteligencia artificial</p>
                <p className="text-sm text-slate-600">Otorgado el 15/01/2025</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-slate-900">Comunicaciones de marketing</p>
                <p className="text-sm text-slate-600">No otorgado</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contacto DPO */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">Contacto Delegado de Protección de Datos</h3>
              <p className="text-sm text-amber-800 mb-2">
                Para ejercer tus derechos o resolver dudas sobre privacidad, contacta con nuestro DPO:
              </p>
              <a href="mailto:dpo@colegio.es" className="text-sm font-medium text-amber-900 underline">
                dpo@colegio.es
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
