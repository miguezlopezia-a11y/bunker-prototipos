'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import OnboardingWizard from '@/components/OnboardingWizard'

export default function OnboardingPage() {
  const router = useRouter()

  function handleComplete() {
    // Redirect to dashboard after onboarding
    router.push('/dashboard/stats')
  }

  return <OnboardingWizard onComplete={handleComplete} />
}
