'use client'

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Calendar } from '@/app/components/ui/atoms/Calendar'
import { Button } from '@/app/components/ui/atoms/Button'
import { Input, Textarea } from '@/app/components/ui/atoms/Input'
import { ScrollArea } from '@/app/components/ui/atoms/ScrollArea'
import { JournalEntryCard } from '@/app/components/molecules/JournalEntryCard'
import { JournalLayout } from '@/app/components/layouts/JournalLayout'
import { type JournalEntry } from '@/types/api'

// Mock data for development
const mockEntries: JournalEntry[] = [
  {
    id: '1',
    content: 'Started learning TypeScript today. Really enjoying the type safety!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'user123',
    tags: ['coding', 'learning']
  },
  {
    id: '2',
    content: 'Had a great workout session at the gym.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    userId: 'user123',
    tags: ['fitness', 'health']
  }
]

export default function JournalPage() {
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load entries and check auth on mount
  useEffect(() => {
    const loadUserAndEntries = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (!user || userError) {
          console.error('Auth error:', userError)
          router.replace('/auth/signup')
          return
        }

        // Load entries since we have a valid user
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) throw error
        setEntries(data || [])
      } catch (error) {
        console.error('Error loading entries:', error)
        // If there's an error loading entries, we still want to show the page
        // just with empty entries
        setEntries([])
      } finally {
        setIsLoading(false)
      }
    }

    loadUserAndEntries()
  }, [router])

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Reload entries when user signs in
        loadEntries()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return // Just return if no user, don't redirect

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error loading entries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!content.trim()) {
      alert('Please write something before saving')
      return
    }

    setIsSaving(true)
    try {
      // Get user first
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user?.id) {
        throw new Error('Please sign in to save entries')
      }

      // First check if user exists by either ID or phone number
      const { data: dbUser, error: dbUserError } = await supabase
        .from('users')
        .select('*')
        .or(`id.eq.${user.id},phone_number.eq.${user.user_metadata.phone_number}`)
        .single();

      if (dbUserError && dbUserError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw dbUserError;
      }

      // If user doesn't exist in the database, create them
      if (!dbUser) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            email: user.email,
            phone_number: user.user_metadata.phone_number
          }]);

        if (insertError) throw insertError;
      } else if (dbUser.id !== user.id) {
        // If user exists with phone number but different ID, update the record
        const { error: updateError } = await supabase
          .from('users')
          .update({ id: user.id, email: user.email })
          .eq('phone_number', user.user_metadata.phone_number);

        if (updateError) throw updateError;
      }

      // Now create the journal entry
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([
          {
            content: content.trim(),
            tags,
            user_id: user.id,
            source: 'web',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error saving:', error)
        throw error
      }

      // Clear form
      setContent('')
      setTags([])
      
      // Refresh entries list
      await loadEntries()

      alert('Entry saved successfully!')
    } catch (error: any) {
      console.error('Error saving:', error)
      alert(error.message || 'Failed to save entry. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <JournalLayout>
      <div className="max-w-3xl mx-auto space-y-16">
        {/* Today's Entry */}
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/paper-texture.png')] opacity-5 pointer-events-none" />
          <time className="block text-lg font-serif italic mb-6 text-clay-400">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          <div className="space-y-6">
            <Textarea
              value={content}
              onChange={(e) => {
                // Limit to 500 characters
                const newContent = e.target.value.slice(0, 500)
                setContent(newContent)
                // Auto-adjust height
                e.target.style.height = 'auto'
                e.target.style.height = e.target.scrollHeight + 'px'
              }}
              placeholder="Write today's entry..."
              className="w-full min-h-[200px] font-serif text-lg leading-relaxed resize-none bg-transparent border-none focus:ring-0 p-0 placeholder-clay-300 transition-all duration-200"
              maxLength={500}
            />
            {/* Character count */}
            <div className="text-sm text-clay-400 text-right">
              {content.length}/500 characters
            </div>
            <div className="flex flex-col gap-4 pt-4 border-t border-clay-100">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Add tags (press Enter)"
                  className="flex-1 bg-transparent border-clay-200 focus:ring-1 focus:ring-orange-600"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      setTags([...tags, e.currentTarget.value])
                      e.currentTarget.value = ''
                    }
                  }}
                />
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-orange-600 text-white hover:bg-orange-700 transition-colors duration-200"
                >
                  {isSaving ? 'Saving...' : 'Save Entry'}
                </Button>
              </div>
              {/* Suggested Tags */}
              <div className="text-sm text-clay-400">
                Suggested: 
                <button 
                  onClick={() => setTags([...tags, 'thoughts'])}
                  className="ml-2 text-clay-500 hover:text-orange-600 transition-colors"
                >
                  thoughts
                </button>
                <button 
                  onClick={() => setTags([...tags, 'daily'])}
                  className="ml-2 text-clay-500 hover:text-orange-600 transition-colors"
                >
                  daily
                </button>
              </div>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-sm transition-all duration-200 hover:bg-orange-100"
                  >
                    #{tag}
                    <button
                      onClick={() => setTags(tags.filter(t => t !== tag))}
                      className="ml-2 hover:text-orange-900 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Entries */}
        <section className="space-y-8">
          <h3 className="text-lg font-medium text-clay-500">Recent Entries</h3>
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center text-clay-400">Loading entries...</div>
            ) : entries.length === 0 ? (
              <div className="text-center text-clay-400">No entries yet. Write your first one!</div>
            ) : (
              entries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-transform duration-200 hover:-translate-y-1"
                >
                  <JournalEntryCard
                    entry={entry}
                    onEdit={() => console.log('Edit:', entry.id)}
                    onDelete={async () => {
                      if (window.confirm('Are you sure you want to delete this entry?')) {
                        try {
                          const { error } = await supabase
                            .from('journal_entries')
                            .delete()
                            .eq('id', entry.id)
                          
                          if (error) throw error
                          await loadEntries()
                        } catch (error) {
                          console.error('Error deleting entry:', error)
                          alert('Failed to delete entry')
                        }
                      }
                    }}
                  />
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </JournalLayout>
  )
}

