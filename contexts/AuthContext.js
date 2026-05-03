'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

// Import Supabase conditionally - handle placeholder gracefully
let supabaseBrowser = null
try {
  const { supabaseBrowser: sb } = require('@/lib/supabase')
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    supabaseBrowser = sb
  }
} catch (error) {
  console.warn('Supabase not configured:', error.message)
}

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [teacher, setTeacher] = useState(null)
  const [school, setSchool] = useState(null)

  useEffect(() => {
    // Skip auth if Supabase is not configured
    if (!supabaseBrowser) {
      setLoading(false)
      return
    }

    // Get initial session
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserData(session.user.id)
      } else {
        setLoading(false)
      }
    }).catch(err => {
      console.warn('Auth session error:', err)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserData(session.user.id)
      } else {
        setTeacher(null)
        setSchool(null)
        setLoading(false)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  async function loadUserData(userId) {
    if (!supabaseBrowser) {
      setLoading(false)
      return
    }

    try {
      // Load teacher data
      const { data: teacherData } = await supabaseBrowser
        .from('teachers')
        .select('*, schools(*)')
        .eq('id', userId)
        .single()

      if (teacherData) {
        setTeacher(teacherData)
        setSchool(teacherData.schools)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email, password) {
    if (!supabaseBrowser) {
      return { data: null, error: { message: 'Supabase no configurado (placeholder)' } }
    }

    const { data, error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  async function signOut() {
    if (!supabaseBrowser) return

    await supabaseBrowser.auth.signOut()
    setUser(null)
    setTeacher(null)
    setSchool(null)
  }

  const value = {
    user,
    teacher,
    school,
    loading,
    signIn,
    signOut,
    isConfigured: !!supabaseBrowser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
