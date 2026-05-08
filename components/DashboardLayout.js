'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SessionTimeout from './SessionTimeout'
import { 
  GraduationCap, 
  BarChart3, 
  Settings, 
  FileText, 
  Users, 
  School,
  LogOut,
  Shield,
  BookOpen,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Corregir Examen', href: '/', icon: GraduationCap },
  { name: 'Estadísticas', href: '/dashboard/stats', icon: BarChart3 },
  { name: 'Mis Rúbricas', href: '/dashboard/rubrics', icon: BookOpen },
  { name: 'Progreso Estudiantes', href: '/dashboard/students', icon: Users },
  { name: 'Historial', href: '/dashboard/history', icon: FileText },
  { name: 'Mi Centro', href: '/dashboard/school', icon: School, adminOnly: true },
  { name: 'Privacidad', href: '/dashboard/privacy', icon: Shield },
  { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const { user, teacher, school, signOut } = useAuth()

  const isAdmin = teacher?.role === 'admin'

  // Get session timeout from settings (default 30 minutes)
  const [sessionTimeout, setSessionTimeout] = React.useState(30)
  
  // Precision badge (current month average)
  const [precisionBadge, setPrecisionBadge] = React.useState(null)

  React.useEffect(() => {
    const settings = localStorage.getItem('userSettings')
    if (settings) {
      const parsed = JSON.parse(settings)
      setSessionTimeout(parsed.sessionTimeout || 30)
    }
  }, [])

  React.useEffect(() => {
    let cancelled = false
    fetch('/api/precision-stats')
      .then(r => r.json())
      .then(d => {
        if (cancelled) return
        if (d.success && d.currentMonthAvg !== null) {
          setPrecisionBadge({
            pct: (d.currentMonthAvg * 100).toFixed(1),
            count: d.currentMonthCount
          })
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [pathname])

  return (
    <div className="min-h-screen bg-slate-50">
      <SessionTimeout timeoutMinutes={sessionTimeout} />
      
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-200">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-slate-900">Corrector IA</h1>
              {school && <p className="text-xs text-slate-500 truncate">{school.name}</p>}
            </div>
          </div>

          {/* Precision Badge (current month) */}
          {precisionBadge && (
            <div className={`mx-3 mt-3 mb-1 px-3 py-2 rounded-lg flex items-center gap-2 border ${
              parseFloat(precisionBadge.pct) >= 99
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : parseFloat(precisionBadge.pct) >= 95
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <Target className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium leading-tight">Precisión OCR</p>
                <p className="text-sm font-bold leading-tight">{precisionBadge.pct}%</p>
              </div>
              <span className="text-xs opacity-75">mes</span>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              if (item.adminOnly && !isAdmin) return null
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info + Logout */}
          <div className="p-4 border-t border-slate-200">
            {teacher && (
              <div className="mb-3">
                <p className="text-sm font-medium text-slate-900">{teacher.name}</p>
                <p className="text-xs text-slate-500">{teacher.email}</p>
              </div>
            )}
            <button
              onClick={signOut}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
