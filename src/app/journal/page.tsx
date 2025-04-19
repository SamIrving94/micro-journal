'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/supabase/client'
import { createJournalEntry, getJournalEntries } from '@/lib/services/journal'
import { JournalEntry } from '@/lib/types/journal'

export default function JournalPage() {
  const [entry, setEntry] = useState('')
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    try {
      const { user, error: userError } = await getUser()
      if (userError || !user) {
        router.push('/auth/signin')
        return
      }

      const { data, error } = await getJournalEntries(user.id)
      if (error) throw error
      if (data) setEntries(data)
    } catch (err) {
      setError('Failed to load journal entries')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { user, error: userError } = await getUser()
      if (userError || !user) {
        router.push('/auth/signin')
        return
      }

      const { error } = await createJournalEntry({
        content: entry,
        user_id: user.id,
      })

      if (error) throw error

      setEntry('')
      await loadEntries()
    } catch (err) {
      setError('Failed to save journal entry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="entry"
              className="block text-sm font-medium text-gray-700"
            >
              New Journal Entry
            </label>
            <textarea
              id="entry"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              rows={6}
              placeholder="Write your thoughts here..."
              required
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !entry.trim()}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Entry'}
          </button>
        </form>

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Entries</h2>
          {entries.length === 0 ? (
            <p className="text-gray-500">No entries yet. Start writing!</p>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white shadow rounded-lg p-4"
                >
                  <p className="text-gray-900">{entry.content}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 