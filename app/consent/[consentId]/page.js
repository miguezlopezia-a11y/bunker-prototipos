'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Shield, Check, X } from 'lucide-react'

export default function ConsentPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [consent, setConsent] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadConsent()
  }, [])

  async function loadConsent() {
    // TODO: Load consent details from API
    // For now, mock data
    setLoading(false)
    setConsent({
      id: params.consentId,
      studentName: 'Estudiante Example',
      schoolName: 'IES Miguel de Cervantes',
      requestedAt: new Date().toISOString()
    })
  }

  async function handleConfirm() {
    setConfirming(true)
    setError('')

    try {
      // TODO: Call API to confirm consent
      await new Promise(resolve => setTimeout(resolve, 1000))
      setConfirmed(true)
    } catch (err) {
      setError('Error al confirmar consentimiento. Intente nuevamente.')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            ¡Consentimiento Confirmado!
          </h1>
          <p className="text-slate-600 mb-6">
            Gracias por otorgar su consentimiento. Los exámenes de su hijo/a podrán ser procesados conforme a la normativa RGPD y LOPDGDD.
          </p>
          <button
            onClick={() => window.close()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Cerrar esta ventana
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-10 h-10 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Consentimiento Parental</h1>
            <p className="text-sm text-slate-600">LOPDGDD Art. 92 - Menores de 14 años</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900 leading-relaxed">
            <strong>Estimado padre/madre/tutor:</strong><br /><br />
            Según el artículo 92 de la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), 
            el tratamiento de datos personales de menores de 14 años requiere el consentimiento de los padres o tutores.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estudiante:</label>
            <p className="text-lg font-semibold text-slate-900">{consent?.studentName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Centro Educativo:</label>
            <p className="text-lg font-semibold text-slate-900">{consent?.schoolName}</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-slate-900 mb-3">¿Qué datos se tratarán?</h2>
          <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
            <li>Nombre del estudiante</li>
            <li>Clase/grupo</li>
            <li>Imágenes de exámenes (contenido académico, NO fotografías personales)</li>
            <li>Calificaciones y feedback educativo</li>
          </ul>

          <h2 className="font-semibold text-slate-900 mt-4 mb-3">Finalidad del tratamiento:</h2>
          <p className="text-sm text-slate-700">
            Corrección automatizada de exámenes mediante inteligencia artificial para fines exclusivamente educativos.
          </p>

          <h2 className="font-semibold text-slate-900 mt-4 mb-3">Derechos del interesado:</h2>
          <p className="text-sm text-slate-700">
            Puede ejercer sus derechos de acceso, rectificación, supresión, limitación y portabilidad contactando con 
            el Delegado de Protección de Datos (DPO) en: <strong>dpo@colegio.es</strong>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
            <X className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => window.close()}
            className="flex-1 px-6 py-3 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {confirming ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Confirmando...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Otorgo mi Consentimiento
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-center text-slate-500 mt-6">
          Al confirmar, acepta el tratamiento de datos según nuestra{' '}
          <a href="/legal/privacy" className="text-blue-600 underline" target="_blank">
            Política de Privacidad
          </a>
        </p>
      </div>
    </div>
  )
}
