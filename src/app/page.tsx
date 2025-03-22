'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/atoms/Button'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-clay-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MicroJournal</h1>
          <p className="text-xl text-gray-600">Your daily journaling companion</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => router.push('/auth/signup')}
            variant="primary"
            size="lg"
            className="w-full"
          >
            Sign Up
          </Button>
          
          <Button
            onClick={() => router.push('/auth/signin')}
            variant="secondary"
            size="lg"
            className="w-full"
          >
            Sign In
          </Button>

          <p className="text-sm text-center text-gray-500">
            Already have an account? Click "Sign In" to access your journal
          </p>
        </div>
      </div>
    </div>
  )
}

