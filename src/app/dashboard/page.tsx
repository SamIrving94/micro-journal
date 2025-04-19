'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser, signOut } from '@/lib/supabase/client'
import { getJournalEntries, createJournalEntry } from '@/lib/services/journal'

interface JournalEntry {
  id: string
  content: string
  created_at: string
  user_id: string
}

interface ErrorWithMessage {
  message?: string;
}

export default function Dashboard() {
  const router = useRouter()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [newEntry, setNewEntry] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  // Fetch user data and journal entries
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const { user: userData, error: userError } = await getUser()
        
        if (userError || !userData) {
          throw new Error(userError?.message || 'Failed to fetch user data')
        }
        
        setUser(userData)
        
        const { data: entriesData, error: entriesError } = await getJournalEntries(userData.id)
        
        if (entriesError) {
          const errorMsg = (entriesError as ErrorWithMessage).message || 'Failed to fetch journal entries'
          throw new Error(errorMsg)
        }
        
        setEntries(entriesData || [])
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err.message || 'An error occurred while fetching data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newEntry.trim() || !user?.id) return
    
    try {
      setLoading(true)
      const { data, error: createError } = await createJournalEntry({
        user_id: user.id,
        content: newEntry
      })
      
      if (createError) {
        const errorMsg = (createError as ErrorWithMessage).message || 'Failed to create journal entry'
        throw new Error(errorMsg)
      }
      
      if (data) {
        setEntries([data, ...entries])
        setNewEntry('')
      }
    } catch (err: any) {
      console.error('Error creating entry:', err)
      setError(err.message || 'An error occurred while creating your entry')
    } finally {
      setLoading(false)
    }
  }

  // Rest of the component remains the same
  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      router.push('/auth/signin')
    }
  }

  if (loading && !entries.length) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">Microjournal</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/dashboard" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/journal" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Journal
                </Link>
                <Link href="/settings" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Settings
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold mb-6">Welcome back, {user?.email}</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">What's on your mind today?</h3>
            <form onSubmit={handleSubmit}>
              <textarea
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Write your journal entry here..."
              />
              <div className="mt-3">
                <button
                  type="submit"
                  disabled={loading || !newEntry.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Recent Entries</h3>
            {entries.length === 0 ? (
              <p className="text-gray-500">No journal entries yet. Start writing to see your entries here.</p>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-700">{entry.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(entry.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}