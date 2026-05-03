'use client'

import React, { useState, useEffect } from 'react'
import { Cookie, X } from 'lucide-react'

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  function acceptAll() {
    localStorage.setItem('cookieConsent', 'all')
    setShowBanner(false)
  }

  function acceptEssential() {
    localStorage.setItem('cookieConsent', 'essential')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Icon + Text */}
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">🍪 Uso de Cookies</h3>
              <p className="text-sm text-slate-700">
                Utilizamos cookies esenciales para el funcionamiento del sitio y cookies analíticas (opcionales) para mejorar la experiencia. 
                Al hacer clic en "Aceptar todas", consientes el uso de todas las cookies. 
                Lee nuestra{' '}
                <a href="/legal/privacy" className="text-blue-600 underline">Política de Privacidad</a> para más información.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={acceptEssential}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Solo esenciales
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Aceptar todas
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
