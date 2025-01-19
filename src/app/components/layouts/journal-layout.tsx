'use client'

import React from 'react'
import { EntryDetails } from '@/components/EntryDetails'

interface JournalLayoutProps {
  children: React.ReactNode
}

export function JournalLayout({ children }: JournalLayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Sidebar with entries list */}
      <div className="w-80 border-r border-gray-200 overflow-y-auto">
        {children}
      </div>
      
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        <EntryDetails selectedEntry={null} />
      </div>
    </div>
  )
}

export default JournalLayout 