'use client'

import React from 'react'
import { format } from 'date-fns'
import { Edit2, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/app/components/ui/atoms/Button'
import { type JournalEntry } from '@/types/api'

interface JournalEntryCardProps {
  entry: JournalEntry
  onEdit?: () => void
  onDelete?: () => void
}

export function JournalEntryCard({
  entry,
  onEdit,
  onDelete
}: JournalEntryCardProps) {
  return (
    <article className="p-6 group">
      <header className="flex justify-between items-start">
        <time className="text-xl text-clay-500 font-medium">
          {format(new Date(entry.created_at), 'EEEE, MMMM d, yyyy')}
        </time>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 text-clay-400 hover:text-clay-600 transition-colors"
              title="Edit entry"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-clay-400 hover:text-red-600 transition-colors"
              title="Delete entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>
      
      <div className="mt-4 text-clay-600 whitespace-pre-wrap">{entry.content}</div>
      
      {entry.tags && entry.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-sm text-orange-600 bg-orange-50 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}

export default JournalEntryCard 