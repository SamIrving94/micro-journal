'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/ui/atoms/Button'
import { Textarea } from '@/ui/atoms/Input'
import { type JournalEntry } from '@/types/api'

interface EntryEditorProps {
  entryId: string | null // null means new entry
}

export function EntryEditor({ entryId }: EntryEditorProps) {
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (entryId) {
      // TODO: Fetch entry data
      setContent('Loading...')
      setTags([])
    } else {
      setContent('')
      setTags([])
    }
  }, [entryId])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement save functionality with Supabase
      console.log('Saving entry:', { content, tags })
    } catch (error) {
      console.error('Error saving entry:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {entryId ? 'Edit Entry' : 'New Entry'}
        </h2>
        <Button
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your thoughts here..."
        className="flex-1 resize-none mb-4"
      />
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Add tags (press Enter)"
          className="flex-1 px-3 py-2 border rounded-lg"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value) {
              setTags([...tags, e.currentTarget.value])
              e.currentTarget.value = ''
            }
          }}
        />
      </div>
      {tags.length > 0 && (
        <div className="flex gap-2 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-sm bg-gray-100 px-2 py-1 rounded-lg flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => setTags(tags.filter((t) => t !== tag))}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default EntryEditor 