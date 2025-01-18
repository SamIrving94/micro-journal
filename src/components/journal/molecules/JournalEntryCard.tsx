'use client';

import React, { useState } from 'react'
import Button from '../../../components/ui/atoms/Button'
import type { JournalEntry } from '../../../types/api'
import { format } from 'date-fns'

interface JournalEntryCardProps {
  entry: JournalEntry
  onEdit?: (entry: JournalEntry) => void
  onDelete?: (entry: JournalEntry) => void
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleMouseEnter = () => {
    setShowActions(true)
  }

  const handleMouseLeave = () => {
    setShowActions(false)
  }

  return (
    <div
      className="relative bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">
          {format(new Date(entry.createdAt), 'MMMM d, yyyy')}
        </h3>
        {showActions && (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(entry)}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(entry)}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
      <p className={`text-gray-600 ${isExpanded ? '' : 'line-clamp-3'}`}>
        {entry.content}
      </p>
      {entry.content.length > 150 && (
        <button
          onClick={toggleExpand}
          className="text-orange-600 hover:text-orange-700 text-sm mt-2"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  )
}

export default JournalEntryCard