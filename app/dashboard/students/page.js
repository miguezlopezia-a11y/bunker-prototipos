'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Users, TrendingDown, TrendingUp, AlertTriangle, Search } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)

  useEffect(() => {
    loadStudents()
  }, [])

  async function loadStudents() {
    // TODO: Fetch from API - aggregate exam_results by student_name
    setStudents([
      {
        id: '1',
        name: 'Ana García López',
        group: '3º ESO B',
        totalExams: 12,
        avgGrade: 8.2,
        trend: 'up',
        lastExam: '2025-06-10',
        lowScoreCount: 0,
        history: [
          { date: '2025-01-15', grade: 7.5, subject: 'Matemáticas' },
          { date: '2025-02-10', grade: 8.0, subject: 'Lengua' },
          { date: '2025-03-05', grade: 8.5, subject: 'Inglés' },
          { date: '2025-04-12', grade: 9.0, subject: 'Historia' },
          { date: '2025-05-08', grade: 8.2, subject: 'Matemáticas' },
          { date: '2025-06-10', grade: 8.7, subject: 'Lengua' },
        ]
      },
      {
        id: '2',
        name: 'Carlos Martínez Ruiz',
        group: '3º ESO B',
        totalExams: 15,
        avgGrade: 4.8,
        trend: 'down',
        lastExam: '2025-06-08',
        lowScoreCount: 3,
        history: [
          { date: '2025-01-20', grade: 6.0, subject: 'Matemáticas' },
          { date: '2025-02-15', grade: 5.5, subject: 'Lengua' },
          { date: '2025-03-10', grade: 4.5, subject: 'Inglés' },
          { date: '2025-04-18', grade: 4.0, subject: 'Historia' },
          { date: '2025-05-12', grade: 3.8, subject: 'Matemáticas' },
          { date: '2025-06-08', grade: 4.2, subject: 'Lengua' },
        ]
      },
      {
        id: '3',
        name: 'María Fernández Sánchez',
        group: '4º ESO A',
        totalExams: 10,
        avgGrade: 7.5,
        trend: 'stable',
        lastExam: '2025-06-05',
        lowScoreCount: 0,
        history: [
          { date: '2025-02-01', grade: 7.2, subject: 'Matemáticas' },
          { date: '2025-02-20', grade: 7.8, subject: 'Lengua' },
          { date: '2025-03-15', grade: 7.5, subject: 'Inglés' },
          { date: '2025-04-10', grade: 7.3, subject: 'Historia' },
          { date: '2025-05-05', grade: 7.6, subject: 'Matemáticas' },
          { date: '2025-06-05', grade: 7.8, subject: 'Lengua' },
        ]
      },
    ])
  }

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.group.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Progreso de Estudiantes</h1>
          <p className="text-slate-600 mt-1">Seguimiento individual y alertas tempranas</p>
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
              placeholder="Buscar por nombre o grupo..."
            />
          </div>
        </div>

        {/* Students list */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{student.name}</h3>
                  <p className="text-sm text-slate-600">{student.group}</p>
                </div>
                {student.trend === 'up' && <TrendingUp className="w-6 h-6 text-green-600" />}
                {student.trend === 'down' && <TrendingDown className="w-6 h-6 text-red-600" />}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-600">Nota Media</p>
                  <p className={`text-2xl font-bold ${
                    student.avgGrade >= 7 ? 'text-green-600' :
                    student.avgGrade >= 5 ? 'text-yellow-600' : 'text-red-600'
                  }`}>{student.avgGrade.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Exámenes</p>
                  <p className="text-2xl font-bold text-slate-900">{student.totalExams}</p>
                </div>
              </div>

              {/* Alert */}
              {student.lowScoreCount >= 3 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Alerta de rendimiento</p>
                    <p className="text-xs text-red-700">
                      {student.lowScoreCount} calificaciones inferiores a 5. Se recomienda intervención.
                    </p>
                  </div>
                </div>
              )}

              {/* Mini chart */}
              <div className="mt-4 h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={student.history}>
                    <Line type="monotone" dataKey="grade" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <YAxis domain={[0, 10]} hide />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>

        {/* Student detail modal (simplified) */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedStudent(null)}>
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-slate-900 mb-4">{selectedStudent.name}</h2>
              <div className="space-y-2">
                {selectedStudent.history.map((exam, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-200">
                    <div>
                      <p className="font-medium text-slate-900">{exam.subject}</p>
                      <p className="text-sm text-slate-600">{new Date(exam.date).toLocaleDateString('es-ES')}</p>
                    </div>
                    <p className={`text-lg font-bold ${
                      exam.grade >= 7 ? 'text-green-600' :
                      exam.grade >= 5 ? 'text-yellow-600' : 'text-red-600'
                    }`}>{exam.grade.toFixed(1)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
