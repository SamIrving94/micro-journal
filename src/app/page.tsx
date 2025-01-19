'use client'

import React from 'react'
import { redirect } from 'next/navigation'

export default function Home() {
  const isAuthenticated = false // Replace with your actual auth check
  const hasCompletedOnboarding = false // Replace with your actual onboarding check

  if (!isAuthenticated) {
    redirect('/auth/signup')
  }

  if (!hasCompletedOnboarding) {
    redirect('/onboarding')
  }

  redirect('/journal')

  // This code will never be reached due to redirects
  return null
}

