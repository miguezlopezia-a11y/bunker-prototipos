'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import CookieBanner from '@/components/CookieBanner'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <title>Corrector de Exámenes</title>
        <meta name="description" content="Corrige exámenes con inteligencia artificial" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e40af" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Corrector" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.variable} antialiased bg-slate-50 min-h-screen`}>
        <AuthProvider>
          {children}
          <CookieBanner />
        </AuthProvider>
      </body>
    </html>
  )
}
