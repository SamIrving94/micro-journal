'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { getJournalEntries, createJournalEntry, deleteJournalEntry } from '@/lib/services/journal';
import { JournalEntry } from '@/types/journal';
import { Plus, Trash2, Calendar, Zap, MessageCircle, Home, Settings, LogOut } from 'lucide-react';

export default function JournalPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('journal');

  // Character limit for micro-journaling
  const MAX_CHARS = 280;
  
  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn || !user) {
      router.push('/auth/signin');
      return;
    }
    
    loadEntries(user.id);
  }, [isLoaded, isSignedIn, user, router]);

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
    
    if (!newEntry.trim() || !isSignedIn || !user) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      console.log('Creating journal entry with:', {
        user_id: user.id,
        content_length: newEntry.trim().length
      });
      
      const { data, error } = await createJournalEntry({
        user_id: user.id,
        content: newEntry.trim()
      });
      
      if (error) {
        console.error('Journal creation error:', error);
        throw error;
      }
      
      if (data) {
        console.log('Journal entry created successfully:', data.id);
        setEntries(prevEntries => [data, ...prevEntries]);
        setNewEntry('');
      } else {
        console.error('No data returned but no error either');
        setError('Entry could not be saved. No data returned.');
      }
    } catch (err) {
      console.error('Error creating entry:', err);
      setError('Failed to save journal entry: ' + (err instanceof Error ? err.message : String(err)));
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

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Group entries by date for better organization
  const entriesByDate = useMemo(() => {
    const grouped: { [key: string]: JournalEntry[] } = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      
      grouped[date].push(entry);
    });
    
    return grouped;
  }, [entries]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get entry length category
  const getEntryLengthClass = (content: string) => {
    if (content.length < 50) return 'bg-green-50 border-green-200';
    if (content.length < 150) return 'bg-blue-50 border-blue-200';
    return 'bg-purple-50 border-purple-200';
  };

  // Generate mock related entries (just for UI demonstration)
  const getRelatedEntries = (entryId: string, content: string) => {
    // In a real implementation, this would use AI to find related entries
    // For now, just return a random subset of other entries
    const otherEntries = entries.filter(e => e.id !== entryId);
    if (otherEntries.length === 0) return [];
    
    // Get 1-2 random entries
    const count = Math.min(otherEntries.length, Math.floor(Math.random() * 2) + 1);
    const shuffled = [...otherEntries].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">MicroJournal</h1>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/dashboard')} 
                className="text-gray-600 hover:text-gray-900 p-2 rounded-md text-sm font-medium flex items-center"
              >
                <Home className="h-5 w-5 mr-1" />
                Dashboard
              </button>
              <button 
                onClick={() => router.push('/settings')} 
                className="text-gray-600 hover:text-gray-900 p-2 rounded-md text-sm font-medium flex items-center"
              >
                <Settings className="h-5 w-5 mr-1" />
                Settings
              </button>
              <button 
                onClick={handleSignOut} 
                className="text-gray-600 hover:text-gray-900 p-2 rounded-md text-sm font-medium flex items-center"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-20">
        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'journal'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Journal
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'discover'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Discover
          </button>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* New Entry Input */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl mb-8 overflow-hidden transition-all duration-200 hover:shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <textarea
                rows={2}
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                className="block w-full border-0 p-4 focus:ring-0 text-gray-900 placeholder:text-gray-400 resize-none"
                placeholder="What's on your mind right now?"
                disabled={submitting}
                maxLength={MAX_CHARS}
              />
              <div className="flex items-center justify-between p-3 bg-gray-50 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  {newEntry.length}/{MAX_CHARS}
                  {newEntry.length > 0 && newEntry.length < 30 && 
                    <span className="ml-2 text-amber-600">Keep it short and sweet!</span>
                  }
                </div>
                <button
                  type="submit"
                  disabled={submitting || !newEntry.trim()}
                  className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {submitting ? 'Saving...' : 'Add'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="animate-pulse h-24 bg-gray-100 rounded-xl"></div>
            <div className="animate-pulse h-24 bg-gray-100 rounded-xl"></div>
            <div className="animate-pulse h-24 bg-gray-100 rounded-xl"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-100 rounded-xl shadow-sm">
            <p className="text-gray-500 text-base">No journal entries yet.</p>
            <p className="text-gray-400 text-sm mt-1">Start your micro-journaling journey above!</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(entriesByDate).map(([date, dateEntries]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-500">{date}</h3>
                </div>
                
                <div className="space-y-4">
                  {dateEntries.map((entry) => {
                    const relatedEntries = getRelatedEntries(entry.id, entry.content);
                    
                    return (
                      <div key={entry.id} className="space-y-2">
                        <div 
                          className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 ${getEntryLengthClass(entry.content)}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="font-light text-xs text-gray-500 mb-2">
                              {formatTime(entry.created_at)}
                            </div>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              disabled={deleting === entry.id}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-gray-900 whitespace-pre-wrap text-sm leading-relaxed">{entry.content}</p>
                        </div>
                        
                        {/* Related entries - placeholder UI */}
                        {relatedEntries.length > 0 && (
                          <div className="ml-6 space-y-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <Zap className="w-3 h-3 mr-1" /> 
                              <span>Related memories</span>
                            </div>
                            
                            {relatedEntries.map(related => (
                              <div key={related.id} className="border border-gray-100 bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                                <div className="text-gray-400 text-xs mb-1">
                                  {new Date(related.created_at).toLocaleDateString('en-US', {
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </div>
                                {related.content.length > 100 
                                  ? related.content.slice(0, 100) + '...' 
                                  : related.content
                                }
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Floating action button for mobile */}
        <div className="fixed bottom-6 right-6 md:hidden">
          <button
            onClick={() => document.querySelector('textarea')?.focus()}
            className="bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 