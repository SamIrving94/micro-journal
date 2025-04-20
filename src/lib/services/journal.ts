import { supabase } from '../supabase/client'
import { 
  JournalEntry, 
  JournalEntryInput, 
  JournalEntryUpdate, 
  JournalEntryResponse, 
  JournalEntriesResponse,
  JournalEntryQuery
} from '../../types/journal'
import { logger } from '../logger'

/**
 * Create a new journal entry
 * @param input Journal entry input data
 */
export async function createJournalEntry(input: JournalEntryInput): Promise<JournalEntryResponse> {
  try {
    // Add source if not provided
    if (!input.source) {
      input.source = 'web'
    }
    
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([input])
      .select()
      .single()

    if (error) {
      logger.error('Create journal entry error:', { error, input: { ...input, content: input.content?.length || 0 } })
      throw error
    }
    
    logger.info('Journal entry created successfully', { id: data.id })
    return { data, error: null }
  } catch (error) {
    logger.error('Create journal entry exception:', { error })
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
  }
}

/**
 * Get journal entries for a user
 * @param userIdOrQuery User ID string or a query object
 */
export async function getJournalEntries(userIdOrQuery: string | JournalEntryQuery): Promise<JournalEntriesResponse> {
  try {
    let query: JournalEntryQuery
    
    // Handle string user_id for backward compatibility
    if (typeof userIdOrQuery === 'string') {
      query = { user_id: userIdOrQuery }
    } else {
      query = userIdOrQuery
    }
    
    // Build the query
    let builder = supabase.from('journal_entries').select('*')
    
    if (query.user_id) {
      builder = builder.eq('user_id', query.user_id)
    }
    
    if (query.phone_number) {
      builder = builder.eq('phone_number', query.phone_number)
    }
    
    if (query.date) {
      const date = new Date(query.date)
      const nextDay = new Date(date)
      nextDay.setDate(date.getDate() + 1)
      
      builder = builder
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDay.toISOString())
    }
    
    const { data, error } = await builder.order('created_at', { ascending: false })

    if (error) {
      logger.error('Get journal entries error:', { error, query })
      throw error
    }
    
    return { data, error: null }
  } catch (error) {
    logger.error('Get journal entries exception:', { error })
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
    logger.error('Get journal entry error:', { error, id })
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
  }
}

export async function updateJournalEntry(id: string, update: JournalEntryUpdate): Promise<JournalEntryResponse> {
  try {
    // Set updated_at if not provided
    if (!update.updated_at) {
      update.updated_at = new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('journal_entries')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Update journal entry error:', { error, id })
      throw error
    }
    
    logger.info('Journal entry updated successfully', { id })
    return { data, error: null }
  } catch (error) {
    logger.error('Update journal entry exception:', { error })
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
  }
}

export async function deleteJournalEntry(id: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error('Delete journal entry error:', { error, id })
      throw error
    }
    
    logger.info('Journal entry deleted successfully', { id })
    return { error: null }
  } catch (error) {
    logger.error('Delete journal entry exception:', { error })
    return { error: error instanceof Error ? error : new Error('Unknown error') }
  }
} 