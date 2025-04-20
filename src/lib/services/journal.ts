import { supabase } from '../supabase/client'
import { JournalEntry, JournalEntryInput, JournalEntryUpdate, JournalEntryResponse, JournalEntriesResponse } from '../types/journal'

export async function createJournalEntry(input: JournalEntryInput): Promise<JournalEntryResponse> {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([input])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Create journal entry error:', error)
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
  }
}

export async function getJournalEntries(userId: string): Promise<JournalEntriesResponse> {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Get journal entries error:', error)
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
  }
}

export async function getJournalEntry(id: string): Promise<JournalEntryResponse> {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Get journal entry error:', error)
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
  }
}

export async function updateJournalEntry(id: string, update: JournalEntryUpdate): Promise<JournalEntryResponse> {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Update journal entry error:', error)
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
  }
}

export async function deleteJournalEntry(id: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Delete journal entry error:', error)
    return { error: error instanceof Error ? error : new Error('Unknown error') }
  }
} 