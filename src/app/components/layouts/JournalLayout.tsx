'use client'

import React from 'react'
import { EntryDetails } from '@/app/components/EntryDetails'
import { JournalEntryCard } from '@/app/components/molecules/JournalEntryCard'

interface JournalLayoutProps {
  children: React.ReactNode
}

export function JournalLayout({ children }: JournalLayoutProps) {
  return (
    <div className="flex h-screen bg-clay-50">
      {/* Sidebar with entries list */}
      <div className="w-96 border-r border-clay-200 overflow-y-auto p-6 space-y-6 bg-white">
        <div className="sticky top-0 z-10 pb-4 bg-white">
          <h1 className="text-2xl font-semibold mb-4">Journal Entries</h1>
          {/* Search or filter controls can go here */}
        </div>
        <div className="space-y-4">
          {children}
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          <EntryDetails selectedEntry={null} />
        </div>
      </div>
    </div>
  )
} 