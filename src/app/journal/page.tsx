'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/supabase/client';
import { getJournalEntries, createJournalEntry, deleteJournalEntry } from '@/lib/services/journal';
import { JournalEntry } from '@/lib/types/journal';

export default function JournalPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const { user, error } = await getUser();
        
        if (error || !user) {
          console.error('Session check error:', error);
          router.push('/auth/signin');
          return;
        }
        
        setUserId(user.id);
        await loadEntries(user.id);
      } catch (err) {
        console.error('Error in journal page:', err);
        setError('Failed to load user session');
        setLoading(false);
      }
    }
    
    checkSession();
  }, [router]);

  const loadEntries = async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await getJournalEntries(userId);
      
      if (error) {
        throw error;
      }
      
      setEntries(data || []);
    } catch (err) {
      console.error('Error loading entries:', err);
      setError('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEntry.trim()) {
      return;
    }
    
    if (!userId) {
      setError('User ID not found. Please sign in again.');
      router.push('/auth/signin');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const { data, error } = await createJournalEntry({
        user_id: userId,
        content: newEntry.trim()
      });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setEntries(prevEntries => [data, ...prevEntries]);
        setNewEntry('');
      }
    } catch (err) {
      console.error('Error creating entry:', err);
      setError('Failed to save journal entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }
    
    setDeleting(entryId);
    
    try {
      const { error } = await deleteJournalEntry(entryId);
      
      if (error) {
        throw error;
      }
      
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('Failed to delete journal entry');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="md:flex md:justify-between md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Journal</h1>
        <p className="text-sm text-gray-500 mt-2 md:mt-0">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </p>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white shadow sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">
            New Entry
          </h2>
          <form onSubmit={handleSubmit} className="mt-4">
            <textarea
              rows={4}
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-36 bg-gray-200 rounded"></div>
          <div className="h-36 bg-gray-200 rounded"></div>
          <div className="h-36 bg-gray-200 rounded"></div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 bg-white shadow sm:rounded-lg">
          <p className="text-gray-500 text-lg">No journal entries yet. Start writing above!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {formatDate(entry.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  disabled={deleting === entry.id}
                  className="text-sm text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  {deleting === entry.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <p className="text-gray-900 whitespace-pre-wrap">{entry.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}