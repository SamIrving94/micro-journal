import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

// Create and export the Supabase client
// This is only used for database access, not authentication (Clerk handles auth)
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables', { 
      urlSet: !!supabaseUrl, 
      keySet: !!supabaseAnonKey 
    })
    // Return a dummy client in development to avoid breaking the app
    if (process.env.NODE_ENV === 'development') {
      return createSupabaseClient<Database>(
        'https://example.supabase.co',
        'dummy-key'
      )
    }
    throw new Error('Missing Supabase environment variables')
  }

  try {
    return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    throw error
  }
}

export const supabase = createClient()

// Dummy functions that do nothing - replaced by Clerk
// These are kept to avoid breaking existing imports
export async function signIn() {
  console.warn('signIn is deprecated - auth is now handled by Clerk')
  return { data: null, error: new Error('Auth is now handled by Clerk') }
}

export async function signUp() {
  console.warn('signUp is deprecated - auth is now handled by Clerk')
  return { data: null, error: new Error('Auth is now handled by Clerk') }
}

export async function signOut() {
  console.warn('signOut is deprecated - auth is now handled by Clerk')
  return { error: null }
}

export async function getSession() {
  console.warn('getSession is deprecated - auth is now handled by Clerk')
  return { session: null, error: null }
}

export async function resetPassword() {
  console.warn('resetPassword is deprecated - auth is now handled by Clerk')
  return { error: new Error('Auth is now handled by Clerk') }
}

export async function updatePassword() {
  console.warn('updatePassword is deprecated - auth is now handled by Clerk')
  return { error: new Error('Auth is now handled by Clerk') }
}

export async function getUser() {
  console.warn('getUser is deprecated - auth is now handled by Clerk')
  return { user: null, error: null }
} 