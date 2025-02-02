'use client'

import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/app/components/ui/atoms/Input'
import { type JournalEntry } from '@/types/api'

interface SearchEntriesProps {
  onSearch?: (query: string) => void
  onResultClick?: (entry: JournalEntry) => void
}

export function SearchEntries({ onSearch, onResultClick }: SearchEntriesProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<JournalEntry[]>([])

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery)
    if (searchQuery.trim().length === 0) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      // TODO: Implement search with Supabase
      // For now, using mock data
      const mockResults: JournalEntry[] = [
        {
          id: 'mock1',
          content: `Found in: ${searchQuery}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 'user123',
          tags: ['search'],
          source: 'web'
        }
      ]
      setResults(mockResults)
      onSearch?.(searchQuery)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search entries..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9 w-full"
        />
      </div>
      
      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg border shadow-lg max-h-60 overflow-auto">
          {results.map((entry) => (
            <button
              key={entry.id}
              onClick={() => onResultClick?.(entry)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            >
              <div className="text-sm truncate">{entry.content}</div>
              <div className="text-xs text-gray-500">
                {new Date(entry.created_at).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 