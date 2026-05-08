'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { BarChart3, TrendingUp, Users, FileText, Calendar, Target, Activity } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts'

export default function StatsPage() {
  const [stats, setStats] = useState({
    totalExams: 0,
    avgGrade: 0,
    totalStudents: 0,
    thisMonth: 0
  })
  const [chartData, setChartData] = useState([])
  const [subjectData, setSubjectData] = useState([])

  // Precision metrics (CER)
  const [precisionData, setPrecisionData] = useState({
    currentMonthAvg: null,
    globalAvg: null,
    monthly: [],
    totalGradedWithConfidence: 0
  })
  const [loadingPrecision, setLoadingPrecision] = useState(true)

  useEffect(() => {
    loadStats()
    loadPrecision()
  }, [])

  async function loadStats() {
    // TODO: Fetch real data from API
    setStats({
      totalExams: 127,
      avgGrade: 7.2,
      totalStudents: 45,
      thisMonth: 23
    })

    setChartData([
      { month: 'Ene', promedio: 6.8, examenes: 12 },
      { month: 'Feb', promedio: 7.1, examenes: 18 },
      { month: 'Mar', promedio: 7.5, examenes: 22 },
      { month: 'Abr', promedio: 7.0, examenes: 19 },
      { month: 'May', promedio: 7.3, examenes: 25 },
      { month: 'Jun', promedio: 7.2, examenes: 31 },
    ])

    setSubjectData([
      { subject: 'Matemáticas', avg: 6.9, count: 42 },
      { subject: 'Lengua', avg: 7.8, count: 38 },
      { subject: 'Inglés', avg: 7.2, count: 25 },
      { subject: 'Historia', avg: 7.5, count: 22 },
    ])
  }

  async function loadPrecision() {
    setLoadingPrecision(true)
    try {
      const res = await fetch('/api/precision-stats')
      const data = await res.json()
      if (data.success) {
        setPrecisionData({
          currentMonthAvg: data.currentMonthAvg,
          currentMonthCount: data.currentMonthCount,
          globalAvg: data.globalAvg,
          monthly: data.monthly || [],
          totalGradedWithConfidence: data.totalGradedWithConfidence
        })
      }
    } catch (e) {
      console.error('Error loading precision stats:', e)
    } finally {
      setLoadingPrecision(false)
    }
  }

  const currentMonthPct = precisionData.currentMonthAvg !== null
    ? (precisionData.currentMonthAvg * 100).toFixed(1)
    : null
  const globalPct = precisionData.globalAvg !== null
    ? (precisionData.globalAvg * 100).toFixed(1)
    : null

  return (
    <DashboardLayout>
      <div>
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Estadísticas</h1>
            <p className="text-slate-600 mt-1">Análisis de rendimiento y tendencias</p>
          </div>
          {/* Precision Badge - Current Month */}
          {currentMonthPct !== null && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-sm border ${
              parseFloat(currentMonthPct) >= 99
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : parseFloat(currentMonthPct) >= 95
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <Target className="w-4 h-4" />
              <span className="text-sm">Precisión OCR (mes actual):</span>
              <span className="text-lg">{currentMonthPct}%</span>
            </div>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Total Exámenes</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalExams}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Nota Media</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.avgGrade.toFixed(1)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Estudiantes</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalStudents}</p>
          </div>

          {/* PRECISION KPI - replaces "Este Mes" */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Precisión Global</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {globalPct !== null ? `${globalPct}%` : '—'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {precisionData.totalGradedWithConfidence > 0
                ? `${precisionData.totalGradedWithConfidence} exámenes`
                : 'Sin datos aún'}
            </p>
          </div>
        </div>

        {/* PRECISION CHART (CER) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                Precisión de Lectura OCR (CER)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Confianza media de GPT-4o Vision en la lectura del manuscrito (objetivo: 99%)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-emerald-500"></span>
                <span className="text-slate-600">Precisión</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-red-500"></span>
                <span className="text-slate-600">Objetivo 99%</span>
              </span>
            </div>
          </div>

          {loadingPrecision ? (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin mb-2"></div>
                <p className="text-sm">Cargando datos de precisión...</p>
              </div>
            </div>
          ) : precisionData.totalGradedWithConfidence === 0 ? (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium text-slate-600">Sin datos de precisión todavía</p>
                <p className="text-sm mt-1">La precisión se calcula automáticamente al corregir nuevos exámenes</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={precisionData.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  domain={[80, 100]}
                  tickFormatter={(v) => `${v}%`}
                  label={{ value: 'Precisión (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (value === null) return ['Sin datos', 'Precisión']
                    return [`${value}%`, 'Precisión OCR']
                  }}
                />
                {/* Target line at 99% */}
                <ReferenceLine
                  y={99}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{ value: 'Objetivo 99%', position: 'right', fill: '#ef4444', fontSize: 11 }}
                />
                <Line
                  type="monotone"
                  dataKey="precision"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  name="Precisión"
                  connectNulls
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Tendencia temporal */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Evolución Mensual</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" domain={[0, 10]} label={{ value: 'Nota Media', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Exámenes', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="promedio" stroke="#3b82f6" strokeWidth={2} name="Nota Promedio" />
              <Line yAxisId="right" type="monotone" dataKey="examenes" stroke="#10b981" strokeWidth={2} name="Nº Exámenes" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Por asignatura */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Rendimiento por Asignatura</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="avg" fill="#3b82f6" name="Nota Media" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  )
}
