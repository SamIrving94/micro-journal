import { 
  getJournalEntries, 
  createJournalEntry, 
  deleteJournalEntry 
} from '../lib/supabase';
import { journalEntrySchema } from '../schemas/journal';

/**
 * Fetch journal entries for a specific user
 */
export async function fetchJournalEntries(userId: string) {
  try {
    if (!userId) {
      return { data: null, error: { message: 'User ID is required' } };
    }

    const data = await getJournalEntries(userId);
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return { data: null, error: { message: 'An unexpected error occurred while fetching journal entries' } };
  }
}

/**
 * Create a new journal entry
 */
export async function addJournalEntry(userId: string, content: string) {
  try {
    // Validate input
    const result = journalEntrySchema.safeParse({ 
      content, 
      date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD
      userId 
    });
    
    if (!result.success) {
      return { data: null, error: result.error.format() };
    }

    await createJournalEntry(userId, content);
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return { data: null, error: { message: 'An unexpected error occurred while creating the journal entry' } };
  }
}

/**
 * Delete a journal entry
 */
export async function removeJournalEntry(userId: string, entryId: string) {
  try {
    if (!entryId) {
      return { error: { message: 'Entry ID is required' } };
    }

    if (!userId) {
      return { error: { message: 'User ID is required' } };
    }

    await deleteJournalEntry(userId, entryId);
    return { error: null };
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return { error: { message: 'An unexpected error occurred while deleting the journal entry' } };
  }
} 