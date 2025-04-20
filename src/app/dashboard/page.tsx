'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, signOut } from '@/lib/supabase/client'
import { getJournalEntries, createJournalEntry } from '@/lib/services/journal'
import { JournalEntry } from '@/types/journal'

export default function Dashboard() {
  const router = useRouter()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [newEntry, setNewEntry] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function checkSession() {
      try {
        const { user, error } = await getUser()
        
        if (error || !user) {
          console.error('Session check error:', error)
          router.push('/auth/signin')
          return
        }
        
        setUserId(user.id)
        await loadEntries(user.id)
      } catch (err) {
        console.error('Error in dashboard:', err)
        setError('Failed to load user session')
        setLoading(false)
      }
    }
    
    checkSession()
  }, [router])

  const loadEntries = async (userId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await getJournalEntries(userId)
      
      if (error) {
        throw error
      }
      
      setEntries(data || [])
    } catch (err) {
      console.error('Error loading entries:', err)
      setError('Failed to load journal entries')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newEntry.trim()) {
      return
    }
    
    if (!userId) {
      setError('User ID not found. Please sign in again.')
      router.push('/auth/signin')
      return
    }
    
    setSubmitting(true)
    setError(null)
    
    try {
      const { data, error } = await createJournalEntry({
        user_id: userId,
        content: newEntry.trim()
      })
      
      if (error) {
        throw error
      }
      
      if (data) {
        setEntries(prevEntries => [data, ...prevEntries])
        setNewEntry('')
      }
    } catch (err) {
      console.error('Error creating entry:', err)
      setError('Failed to save journal entry')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await signOut()
      if (error) {
        console.error('Sign out error:', error)
      }
      router.push('/auth/signin')
    } catch (err) {
      console.error('Unexpected sign out error:', err)
      router.push('/auth/signin')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">MicroJournal</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => router.push('/settings')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Settings
              </button>
              <button
                onClick={handleSignOut}
                className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-50 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Add New Journal Entry
            </h3>
            <form onSubmit={handleSubmit} className="mt-4">
              <textarea
                rows={3}
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="What's on your mind today?"
                disabled={submitting}
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !newEntry.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Journal Entries
            </h3>
            
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ) : entries.length === 0 ? (
              <p className="text-gray-500 italic">No journal entries yet. Add your first one above!</p>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{entry.content}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(entry.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}