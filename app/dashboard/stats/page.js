'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { BarChart3, TrendingUp, Users, FileText, Calendar } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function StatsPage() {
  const [stats, setStats] = useState({
    totalExams: 0,
    avgGrade: 0,
    totalStudents: 0,
    thisMonth: 0
  })
  const [chartData, setChartData] = useState([])
  const [subjectData, setSubjectData] = useState([])

  useEffect(() => {
    loadStats()
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

  return (
    <DashboardLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Estadísticas</h1>
          <p className="text-slate-600 mt-1">Análisis de rendimiento y tendencias</p>
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

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Este Mes</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.thisMonth}</p>
          </div>
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
