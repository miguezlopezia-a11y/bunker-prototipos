'use client'

import React, { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Settings as SettingsIcon, Bell, Lock, Zap, Database } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    aiProvider: 'gpt-4o',
    autoSave: true,
    emailNotifications: true,
    alertThreshold: 5,
    sessionTimeout: 30
  })

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
          <p className="text-slate-600 mt-1">Personaliza tu experiencia</p>
        </div>

        {/* AI Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Proveedor de IA</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Modelo de corrección
            </label>
            <select
              value={settings.aiProvider}
              onChange={(e) => setSettings({...settings, aiProvider: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            >
              <option value="gpt-4o">GPT-4o (OpenAI) - Recomendado</option>
              <option value="gpt-4o-mini">GPT-4o Mini (OpenAI) - Más rápido</option>
              <option value="kimi-k2.6">Kimi K2.6 - Experimental</option>
            </select>
            <p className="text-xs text-slate-500 mt-2">
              GPT-4o ofrece la mejor precisión en corrección de exámenes en español.
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Notificaciones</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Guardado automático</p>
                <p className="text-sm text-slate-600">Guardar resultados al corregir</p>
              </div>
              <button
                onClick={() => setSettings({...settings, autoSave: !settings.autoSave})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoSave ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Notificaciones por email</p>
                <p className="text-sm text-slate-600">Alertas de rendimiento estudiantil</p>
              </div>
              <button
                onClick={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Umbral de alerta (nota mínima): {settings.alertThreshold}
              </label>
              <input
                type="range"
                min="3"
                max="7"
                step="0.5"
                value={settings.alertThreshold}
                onChange={(e) => setSettings({...settings, alertThreshold: parseFloat(e.target.value)})}
                className="w-full"
              />
              <p className="text-xs text-slate-500 mt-1">
                Recibir alerta cuando un estudiante obtenga 3 calificaciones consecutivas por debajo de {settings.alertThreshold}
              </p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Seguridad</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tiempo de sesión (minutos): {settings.sessionTimeout}
            </label>
            <input
              type="range"
              min="15"
              max="120"
              step="15"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
              className="w-full"
            />
            <p className="text-xs text-slate-500 mt-1">
              Cierre automático de sesión por inactividad (RGPD Art. 32)
            </p>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            Guardar configuración
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
