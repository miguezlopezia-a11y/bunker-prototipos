'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function SessionTimeout({ timeoutMinutes = 30 }) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const timeoutRef = useRef(null)
  const warningRef = useRef(null)

  useEffect(() => {
    if (!user) return

    const timeout = timeoutMinutes * 60 * 1000 // Convert to milliseconds
    const warningTime = timeout - (2 * 60 * 1000) // Warn 2 minutes before

    function resetTimer() {
      // Clear existing timers
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)

      // Set warning timer (2 minutes before logout)
      warningRef.current = setTimeout(() => {
        const shouldStay = confirm(
          `Tu sesión expirará en 2 minutos por inactividad.\\n\\n¿Deseas continuar trabajando?`
        )
        if (shouldStay) {
          resetTimer() // Reset if user wants to stay
        }
      }, warningTime)

      // Set logout timer
      timeoutRef.current = setTimeout(async () => {
        alert('Sesión cerrada por inactividad (seguridad RGPD Art. 32)')
        await signOut()
        router.push('/login')
      }, timeout)
    }

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer)
    })

    // Initialize timer
    resetTimer()

    // Cleanup
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
      events.forEach(event => {
        document.removeEventListener(event, resetTimer)
      })
    }
  }, [user, timeoutMinutes, signOut, router])

  return null // This component doesn't render anything
}
