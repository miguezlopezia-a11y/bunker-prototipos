'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { School, Upload, Loader2, Save } from 'lucide-react'

export default function SchoolConfigPage() {
  const { school, teacher } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    cif_nif: '',
    address: '',
    dpo_email: '',
    logo_url: ''
  })

  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name || '',
        cif_nif: school.cif_nif || '',
        address: school.address || '',
        dpo_email: school.dpo_email || '',
        logo_url: school.logo_url || ''
      })
    }
  }, [school])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    
    // TODO: Implement school update API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSaving(false)
    alert('Configuración guardada correctamente')
  }

  if (teacher?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <School className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Acceso restringido</h2>
          <p className="text-slate-600">Solo los administradores pueden gestionar la configuración del centro.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Configuración del Centro</h1>
          <p className="text-slate-600 mt-1">Gestiona la información de tu centro educativo</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Logo del centro
            </label>
            <div className="flex items-center gap-4">
              {formData.logo_url ? (
                <img src={formData.logo_url} alt="Logo" className="w-20 h-20 object-contain border border-slate-200 rounded-lg" />
              ) : (
                <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center">
                  <School className="w-8 h-8 text-slate-400" />
                </div>
              )}
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Upload className="w-4 h-4" />
                Subir logo
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Formatos: PNG, JPG. Máximo 2MB.</p>
          </div>

          {/* Nombre del centro */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre del centro *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="IES Miguel de Cervantes"
              required
            />
          </div>

          {/* CIF/NIF */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              CIF/NIF *
            </label>
            <input
              type="text"
              value={formData.cif_nif}
              onChange={(e) => setFormData({...formData, cif_nif: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Q1234567A"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Requerido para cumplimiento RGPD</p>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Dirección completa *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Calle Principal, 123\n28001 Madrid, España"
              required
            />
          </div>

          {/* DPO Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email del Delegado de Protección de Datos (DPO) *
            </label>
            <input
              type="email"
              value={formData.dpo_email}
              onChange={(e) => setFormData({...formData, dpo_email: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="dpo@colegio.es"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Obligatorio según Art. 37 RGPD</p>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
