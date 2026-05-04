'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { FileText, Filter, Download, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function HistoryPage() {
  const [results, setResults] = useState([])
  const [filters, setFilters] = useState({
    subject: 'Todas',
    dateFrom: '',
    dateTo: '',
    studentName: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadResults()
  }, [filters])

  async function loadResults() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.subject !== 'Todas') params.append('subject', filters.subject)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)
      if (filters.studentName) params.append('studentName', filters.studentName)

      const response = await fetch(`/api/results?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setResults(data.results)
      }
    } catch (error) {
      console.error('Error loading results:', error)
    } finally {
      setLoading(false)
    }
  }

  async function exportCSV() {
    try {
      const params = new URLSearchParams()
      if (filters.subject !== 'Todas') params.append('subject', filters.subject)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)
      if (filters.studentName) params.append('studentName', filters.studentName)

      const response = await fetch(`/api/export-csv?${params.toString()}`)
      
      if (!response.ok) throw new Error('Error al exportar')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `examenes_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Error al exportar CSV. Intente nuevamente.')
    }
  }

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Historial de Exámenes</h1>
            <p className="text-slate-600 mt-1">{results.length} exámenes encontrados</p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Asignatura</label>
              <select
                value={filters.subject}
                onChange={(e) => setFilters({...filters, subject: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option>Todas</option>
                <option>Matemáticas</option>
                <option>Lengua</option>
                <option>Inglés</option>
                <option>Historia</option>
                <option>Física</option>
                <option>Química</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Desde</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hasta</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estudiante</label>
              <input
                type="text"
                value={filters.studentName}
                onChange={(e) => setFilters({...filters, studentName: e.target.value})}
                placeholder="Nombre..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Results table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Estudiante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Asignatura</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Nivel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Nota</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {results.map((result) => (
                <tr key={result.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{result.studentName || 'Anónimo'}</p>
                      <p className="text-sm text-slate-600">{result.studentGroup}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-900">{result.subject}</td>
                  <td className="px-6 py-4 text-slate-900">{result.gradeLevel}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                      result.grade >= 9 ? 'bg-green-100 text-green-800' :
                      result.grade >= 7 ? 'bg-blue-100 text-blue-800' :
                      result.grade >= 5 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.grade.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{formatDate(result.createdAt)}</td>
                  <td className="px-6 py-4">
                    <button className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {results.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No se encontraron exámenes con estos filtros</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
