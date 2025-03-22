import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Maps a WhatsApp phone number to a user ID
 * @param phoneNumber WhatsApp phone number
 * @returns The user ID if found, null otherwise
 */
export async function mapPhoneNumberToUserId(phoneNumber: string): Promise<string | null> {
  // Clean the phone number - remove "whatsapp:" prefix if present
  const cleanedNumber = phoneNumber.replace('whatsapp:', '');
  
  try {
    // Query the phone_mappings table to find the corresponding user ID
    const { data, error } = await supabase
      .from('phone_mappings')
      .select('user_id')
      .eq('phone_number', cleanedNumber)
      .maybeSingle();
    
    if (error) {
      console.error('Error mapping phone number to user ID:', error);
      return null;
    }
    
    return data?.user_id || null;
  } catch (error) {
    console.error('Exception in mapPhoneNumberToUserId:', error);
    return null;
  }
}

/**
 * Gets phone mapping for a specific user
 * @param userId The user ID to get the phone mapping for
 * @returns The phone number if found, null otherwise
 */
export async function getPhoneMappingForUser(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('phone_mappings')
      .select('phone_number')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error getting phone mapping for user:', error);
      return null;
    }
    
    return data?.phone_number || null;
  } catch (error) {
    console.error('Exception in getPhoneMappingForUser:', error);
    return null;
  }
}

/**
 * Associates a phone number with a user ID
 * @param phoneNumber The phone number to associate
 * @param userId The user ID to associate the phone number with
 * @returns Success boolean
 */
export async function associatePhoneWithUser(phoneNumber: string, userId: string): Promise<boolean> {
  // Clean the phone number
  const cleanedNumber = phoneNumber.replace('whatsapp:', '');
  
  try {
    const { error } = await supabase
      .from('phone_mappings')
      .upsert({
        phone_number: cleanedNumber,
        user_id: userId,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error associating phone with user:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in associatePhoneWithUser:', error);
    return false;
  }
} 