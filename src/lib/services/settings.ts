import { supabase } from '../supabase/client'
import { UserSettings, UserSettingsInput, UserSettingsUpdate, UserSettingsResponse } from '../types/settings'

export async function getUserSettings(userId: string): Promise<UserSettingsResponse> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Get user settings error:', error)
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
  }
}

export async function createUserSettings(input: UserSettingsInput): Promise<UserSettingsResponse> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .insert([input])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Create user settings error:', error)
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
  }
}

export async function updateUserSettings(userId: string, update: UserSettingsUpdate): Promise<UserSettingsResponse> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .update(update)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Update user settings error:', error)
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
  }
}

export async function deleteUserSettings(userId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Delete user settings error:', error)
    return { error: error instanceof Error ? error : new Error('Unknown error') }
  }
} 