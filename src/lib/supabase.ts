// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { JournalEntry } from '@/types/api'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a Supabase client with auth enabled
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const createClientSupabase = createClientComponentClient()

// Utility function to format phone numbers consistently
export function formatPhoneNumber(phoneNumber: string): string {
  let formatted = phoneNumber.trim();
  if (!formatted.startsWith('+')) {
    formatted = '+' + formatted;
  }
  // Remove all non-digit characters except the leading +
  formatted = '+' + formatted.replace(/\D/g, '');
  return formatted;
}

// Session management using Supabase Auth
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return { session: data.session }
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    }
  })
  
  if (error) throw error
  return { user: data.user }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// Journal entry functions
export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createJournalEntry(userId: string, content: string): Promise<void> {
  console.log('Creating journal entry:', { userId, content })
  
  try {
    // First verify the user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      console.error('User verification failed:', userError)
      throw new Error('User not found. Please sign in again.')
    }

    // Create the journal entry
    const { data: newEntry, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        content: content,
        source: 'web',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating journal entry:', error)
      if (error.code === 'PGRST204') {
        throw new Error('Database schema error. Please contact support.')
      }
      throw error
    }

    console.log('Journal entry created successfully:', newEntry)
  } catch (err) {
    console.error('Error in createJournalEntry:', err)
    throw err
  }
}

export async function deleteJournalEntry(userId: string, entryId: string): Promise<void> {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId)

  if (error) throw error
}

// Database operations
export const createUser = async (email: string) => {
  const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  })

  if (authError) throw authError

  // User record will be created automatically by Supabase's auth hooks
  return authData
}

export const updateUserPreferences = async (userId: string, preferences: { journal_time?: string; timezone?: string }) => {
  const { error } = await supabase
    .from('users')
    .update(preferences)
    .eq('id', userId)

  if (error) {
    console.error('Error updating preferences:', error)
    throw error
  }
}

export const getUserByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return data
}

// Password reset functions
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });
  
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) throw error;
}