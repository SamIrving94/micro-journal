'use client'

import React from 'react'
import { type JournalEntry } from '@/types/api'

interface EntryDetailsProps {
  selectedEntry: JournalEntry | null
}

export function EntryDetails({ selectedEntry }: EntryDetailsProps) {
  if (!selectedEntry) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Select an entry to view its details
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="text-sm text-gray-500 mb-4">
        {new Date(selectedEntry.created_at).toLocaleDateString()}
      </div>
      <div className="prose">{selectedEntry.content}</div>
      {selectedEntry.tags && selectedEntry.tags.length > 0 && (
        <div className="flex gap-2 mt-4">
          {selectedEntry.tags.map((tag) => (
            <span
              key={tag}
              className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
} 