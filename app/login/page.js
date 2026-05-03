'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { GraduationCap, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await signIn(email, password)
    
    if (signInError) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-12 h-12 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Corrector IA</h1>
                <p className="text-sm text-slate-500">Sistema de corrección inteligente</p>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="profesor@colegio.es"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-slate-500">
            <p>Acceso restringido a profesores autorizados</p>
            <p className="mt-2">
              ¿Problemas para acceder?{' '}
              <a href="mailto:soporte@colegio.es" className="text-blue-600 hover:underline">
                Contacta con el administrador
              </a>
            </p>
          </div>
        </div>

        {/* Legal notice */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>
            Protegido por RGPD y LOPDGDD. Al acceder, aceptas nuestra{' '}
            <a href="/legal/privacy" className="text-blue-600 hover:underline">
              Política de Privacidad
            </a>
            {' '}y{' '}
            <a href="/legal/terms" className="text-blue-600 hover:underline">
              Términos de Servicio
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
