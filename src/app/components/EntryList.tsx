'use client'

import React from 'react'
import { JournalEntryCard } from '@/app/components/molecules/JournalEntryCard'
import { ScrollArea } from '@/app/components/ui/atoms/ScrollArea'
import { type JournalEntry } from '@/types/api'

interface EntryListProps {
  view: 'list' | 'calendar' | 'timeline'
  onSelectEntryAction: (id: string | null) => void
}

// Mock data - replace with actual data fetching
const mockEntries: JournalEntry[] = [
  {
    id: '1',
    content: 'Started learning TypeScript today. Really enjoying the type safety!',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'user123',
    tags: ['coding', 'learning'],
    source: 'web'
  },
  {
    id: '2',
    content: 'Had a great workout session at the gym.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    user_id: 'user123',
    tags: ['fitness', 'health'],
    source: 'web'
  }
]

export function EntryList({ view, onSelectEntryAction }: EntryListProps) {
  const renderListView = () => (
    <div className="space-y-4">
      {mockEntries.map((entry) => (
        <div key={entry.id} onClick={() => onSelectEntryAction(entry.id)}>
          <JournalEntryCard
            entry={entry}
            onEdit={() => onSelectEntryAction(entry.id)}
          />
        </div>
      ))}
    </div>
  )

  const renderCalendarView = () => (
    <div className="text-gray-500 text-center py-4">
      Calendar view coming soon...
    </div>
  )

  const renderTimelineView = () => (
    <div className="text-gray-500 text-center py-4">
      Timeline view coming soon...
    </div>
  )

  return (
    <div className="h-full">
      {view === 'list' && renderListView()}
      {view === 'calendar' && renderCalendarView()}
      {view === 'timeline' && renderTimelineView()}
    </div>
  )
}

export default EntryList 