import { supabase } from './supabase/client';
import { currentUser } from '@clerk/nextjs/server';
import { 
  JournalEntry, 
  JournalEntryQuery, 
  JournalEntryInput, 
  JournalEntryResponse,
  JournalEntriesResponse 
} from '../types/journal';
import { logger } from './logger';

// Custom error interface
interface JournalError {
  name: string;
  message: string;
}

// Helper function to get current user ID from Clerk
export const getCurrentUserId = async () => {
  const user = await currentUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  return user.id;
};

/**
 * Get journal entries based on query parameters
 * @param query Query parameters including phone_number or user_id
 * @returns Promise with journal entries array
 */
export async function getJournalEntries(query: JournalEntryQuery): Promise<JournalEntry[]> {
  try {
    let builder = supabase.from('journal_entries').select('*');
    
    // Filter by phone_number if provided
    if (query.phone_number) {
      builder = builder.eq('phone_number', query.phone_number);
    }
    
    // Filter by user_id if provided
    if (query.user_id) {
      builder = builder.eq('user_id', query.user_id);
    }
    
    // Filter by date if provided
    if (query.date) {
      const date = new Date(query.date);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      builder = builder
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDay.toISOString());
    }
    
    const { data, error } = await builder.order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching journal entries', { error, query });
      throw error;
    }
    
    return data || [];
  } catch (err) {
    logger.error('Exception in getJournalEntries', { error: err });
    throw err;
  }
}

/**
 * Create a new journal entry
 * Either phoneNumber or userId must be provided
 */
export async function createJournalEntry(
  content: string, 
  phoneNumber?: string, 
  userId?: string, 
  source: string = 'web'
): Promise<JournalEntryResponse> {
  logger.info('Creating journal entry', { phoneNumber, userId, contentLength: content?.length });
  
  try {
    // Validate input
    if (!content) {
      return {
        data: null,
        error: { 
          name: 'ValidationError',
          message: 'Content is required' 
        }
      };
    }
    
    if (!phoneNumber && !userId) {
      return {
        data: null,
        error: { 
          name: 'ValidationError',
          message: 'Either phone number or user ID is required' 
        }
      };
    }

    // Create entry object
    const entry: JournalEntryInput = {
      content,
      source
    };
    
    if (phoneNumber) entry.phone_number = phoneNumber;
    if (userId) entry.user_id = userId;

    // Insert the journal entry
    const { data, error } = await supabase
      .from('journal_entries')
      .insert(entry)
      .select()
      .single();

    if (error) {
      logger.error('Error creating journal entry', { error });
      return {
        data: null,
        error: { 
          name: 'DatabaseError',
          message: error.message 
        }
      };
    }

    logger.info('Journal entry created successfully', { entryId: data.id });
    return {
      data,
      error: null
    };
  } catch (err: any) {
    logger.error('Exception in createJournalEntry', { error: err });
    return {
      data: null,
      error: { 
        name: 'InternalError', 
        message: err.message || 'An unexpected error occurred' 
      }
    };
  }
}

// Get a specific journal entry
export const getJournalEntry = async (id: string) => {
  try {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    return { data: null, error };
  }
};

// Update a journal entry
export const updateJournalEntry = async (id: string, content: string) => {
  try {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('journal_entries')
      .update({ content })
      .eq('id', id)
      .eq('user_id', userId)
      .select();
    
    if (error) throw error;
    return { data: data?.[0], error: null };
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return { data: null, error };
  }
};

// Delete a journal entry
export const deleteJournalEntry = async (id: string) => {
  try {
    const userId = await getCurrentUserId();
    
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return { error };
  }
}; 