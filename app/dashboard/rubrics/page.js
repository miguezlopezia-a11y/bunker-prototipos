'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { BookOpen, Plus, Search, Edit2, Trash2, Copy } from 'lucide-react'

export default function RubricsPage() {
  const [rubrics, setRubrics] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    loadRubrics()
  }, [])

  async function loadRubrics() {
    // TODO: Fetch from API
    setRubrics([
      {
        id: '1',
        name: 'Matemáticas - Álgebra ESO',
        subject: 'Matemáticas',
        level: '3º ESO',
        content: 'Ecuaciones de primer grado...\nEcuaciones de segundo grado...\nSistemas de ecuaciones...',
        created_at: '2025-01-15T10:00:00Z',
        is_shared: true
      },
      {
        id: '2',
        name: 'Lengua - Sintaxis',
        subject: 'Lengua',
        level: '4º ESO',
        content: 'Identificar sujeto y predicado...\nClasificar oraciones...\nAnalizar sintagmas...',
        created_at: '2025-01-10T12:00:00Z',
        is_shared: false
      }
    ])
  }

  const filteredRubrics = rubrics.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mis Rúbricas</h1>
            <p className="text-slate-600 mt-1">Crea y gestiona rúbricas reutilizables</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nueva Rúbrica
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Buscar por nombre o asignatura..."
            />
          </div>
        </div>

        {/* Rubrics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRubrics.map((rubric) => (
            <div key={rubric.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900">{rubric.name}</h3>
                </div>
                {rubric.is_shared && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                    Compartida
                  </span>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Asignatura:</span> {rubric.subject}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Nivel:</span> {rubric.level}
                </p>
                <p className="text-sm text-slate-500 line-clamp-3">
                  {rubric.content}
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-200">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <Copy className="w-4 h-4" />
                  Duplicar
                </button>
                <button className="flex items-center justify-center gap-2 px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredRubrics.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay rúbricas</h3>
            <p className="text-slate-600 mb-4">Crea tu primera rúbrica para empezar</p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Nueva Rúbrica
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
