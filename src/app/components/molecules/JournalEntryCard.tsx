'use client'

import React from 'react'
import { format } from 'date-fns'
import { Button } from '@/ui/atoms/Button'
import { type JournalEntry } from '@/types/api'

interface JournalEntryCardProps {
  entry: JournalEntry
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function JournalEntryCard({
  entry,
  onEdit,
  onDelete
}: JournalEntryCardProps) {
  return (
    <div className="p-4 space-y-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-start">
        <time className="text-sm text-gray-500">
          {format(new Date(entry.createdAt), 'PPP')}
        </time>
        <div className="space-x-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(entry.id)}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(entry.id)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
      <p className="text-gray-900">{entry.content}</p>
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex gap-2">
          {entry.tags.map((tag) => (
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

export default JournalEntryCard 