import { supabase } from './supabase';
import { JournalEntry, JournalEntryQuery } from '../types/journal';

export async function getJournalEntries(query: JournalEntryQuery): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('phone_number', query.phone_number)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createJournalEntry(phoneNumber: string, content: string): Promise<void> {
  console.log('Creating journal entry:', { phoneNumber, content });
  
  try {
    // First verify the user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('phone_number')
      .eq('phone_number', phoneNumber)
      .single();

    if (userError || !user) {
      console.error('User verification failed:', userError);
      throw new Error('User not found. Please sign in again.');
    }

    // Create the journal entry
    const { data: newEntry, error } = await supabase
      .from('journal_entries')
      .insert({
        phone_number: phoneNumber,
        content: content,
        source: 'web',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating journal entry:', error);
      if (error.code === 'PGRST204') {
        throw new Error('Database schema error. Please contact support.');
      }
      throw error;
    }

    console.log('Journal entry created successfully:', newEntry);
  } catch (err) {
    console.error('Error in createJournalEntry:', err);
    throw err;
  }
} 