'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { getSession, getJournalEntries, createJournalEntry, deleteJournalEntry } from '@/lib/supabase'
import { Button } from '@/app/components/ui/atoms/Button'
import { Textarea } from '@/app/components/ui/atoms/Input'
import { JournalLayout } from '@/app/components/layouts/JournalLayout'
import type { JournalEntry } from '@/types/api'

export default function JournalPage() {
    const [content, setContent] = useState('')
    const [entries, setEntries] = useState<JournalEntry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        const checkSession = async () => {
            const session = await getSession()
            if (!session?.user?.id) {
                router.replace('/auth/signin')
                return
            }
            loadEntries(session.user.id)
        }
        checkSession()
    }, [router])

    const loadEntries = async (userId: string) => {
        try {
            const data = await getJournalEntries(userId)
            setEntries(data)
        } catch (err) {
            console.error('Error loading entries:', err)
            setError('Failed to load entries')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        if (!content.trim()) {
            setError('Please write something before saving')
            return
        }

        const session = await getSession()
        if (!session?.user?.id) {
            router.replace('/auth/signin')
            return
        }

        setIsSaving(true)
        setError('')

        try {
            await createJournalEntry(session.user.id, content.trim())
            setContent('')
            await loadEntries(session.user.id)
        } catch (err) {
            console.error('Error saving entry:', err)
            setError('Failed to save entry')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (entryId: string) => {
        const session = await getSession()
        if (!session?.user?.id) {
            router.replace('/auth/signin')
            return
        }

        if (window.confirm('Are you sure you want to delete this entry?')) {
            try {
                await deleteJournalEntry(session.user.id, entryId)
                await loadEntries(session.user.id)
            } catch (err) {
                console.error('Error deleting entry:', err)
                setError('Failed to delete entry')
            }
        }
    }

    return (
        <JournalLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {/* New Entry Form */}
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your journal entry..."
                        className="w-full min-h-[200px] resize-none"
                    />
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !content.trim()}
                        loading={isSaving}
                        variant="primary"
                        size="lg"
                    >
                        {isSaving ? 'Saving...' : 'Save Entry'}
                    </Button>
                </div>

                {/* Entries List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">Your Entries</h2>
                    
                    {isLoading ? (
                        <div className="text-center text-gray-500">Loading entries...</div>
                    ) : entries.length === 0 ? (
                        <div className="text-center text-gray-500">No entries yet. Write your first one!</div>
                    ) : (
                        entries.map(entry => (
                            <div key={entry.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <time className="text-sm text-gray-500">
                                        {format(new Date(entry.created_at), 'EEEE, MMMM d, yyyy')}
                                    </time>
                                    <Button
                                        onClick={() => handleDelete(entry.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Delete
                                    </Button>
                                </div>
                                <p className="mt-4 text-gray-700 whitespace-pre-wrap">{entry.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </JournalLayout>
    )
}

