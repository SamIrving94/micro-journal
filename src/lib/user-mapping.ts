import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

export async function mapPhoneNumberToUserId(phoneNumber: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('phone_number')
      .eq('phone_number', phoneNumber)
      .single();

    if (error) {
      console.error('Error mapping phone number to user ID:', error);
      return null;
    }

    return data?.phone_number || null;
  } catch (error) {
    console.error('Error in mapPhoneNumberToUserId:', error);
    return null;
  }
}

export async function associatePhoneWithUser(phoneNumber: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .insert({ phone_number: phoneNumber });

    if (error) {
      console.error('Error associating phone with user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in associatePhoneWithUser:', error);
    return false;
  }
} 