import { supabase } from '../supabase/client';
import { UserPreferences } from '@/schemas/preferences';
import { logger } from '../logger';
import { currentUser } from '@clerk/nextjs/server';

/**
 * Gets user preferences from the database
 * @returns User preferences and any error
 */
export async function getUserPreferences(): Promise<{
  data: UserPreferences | null;
  error: Error | null;
}> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { 
        data: null, 
        error: new Error('User not authenticated') 
      };
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('preferences, phone_number')
      .eq('clerk_id', user.id)
      .single();
      
    if (error) {
      logger.error('Error fetching user preferences', { error });
      throw error;
    }
    
    // If user doesn't exist yet, return default preferences
    if (!data) {
      return {
        data: {
          notifications_enabled: true,
          prompt_time: '09:00',
          timezone: 'UTC',
          prompt_categories: ['gratitude', 'reflection', 'learning'],
          whatsapp_verified: false,
          phone_number: null,
        },
        error: null
      };
    }
    
    // Merge phone number into preferences object
    const preferences: UserPreferences = {
      ...data.preferences,
      phone_number: data.phone_number || null,
    };
    
    return { data: preferences, error: null };
  } catch (error) {
    logger.error('Exception in getUserPreferences', { error });
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Updates user preferences in the database
 * @param preferences User preferences to update
 * @returns Updated preferences and any error
 */
export async function updateUserPreferences(
  preferences: Partial<UserPreferences>
): Promise<{
  data: UserPreferences | null;
  error: Error | null;
}> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { 
        data: null, 
        error: new Error('User not authenticated') 
      };
    }
    
    // Get current preferences first to merge with updates
    const { data: currentPrefs } = await getUserPreferences();
    
    // Extract phone_number if it exists
    const { phone_number, ...prefsToUpdate } = preferences;
    
    // Prepare the update data
    const updateData: any = {};
    
    // Only update preferences if we have preference values to update
    if (Object.keys(prefsToUpdate).length > 0) {
      updateData.preferences = {
        ...currentPrefs,
        ...prefsToUpdate
      };
    }
    
    // Add phone_number if it was provided
    if (phone_number !== undefined) {
      updateData.phone_number = phone_number;
    }
    
    // Only proceed if we have data to update
    if (Object.keys(updateData).length === 0) {
      return { data: currentPrefs, error: null };
    }
    
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('clerk_id', user.id);
    
    if (error) {
      logger.error('Error updating user preferences', { error, preferences });
      throw error;
    }
    
    // Get the updated preferences
    return getUserPreferences();
  } catch (error) {
    logger.error('Exception in updateUserPreferences', { error });
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Starts the WhatsApp verification process
 * @param phoneNumber Phone number to verify
 * @returns Success status and any error
 */
export async function startWhatsAppVerification(
  phoneNumber: string
): Promise<{
  success: boolean;
  verificationId?: string;
  error: Error | null;
}> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { 
        success: false, 
        error: new Error('User not authenticated') 
      };
    }
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the verification code in the database temporarily
    const { error } = await supabase
      .from('verification_codes')
      .insert({
        user_id: user.id,
        code: verificationCode,
        phone_number: phoneNumber,
        expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
      });
    
    if (error) {
      logger.error('Error storing verification code', { error, phoneNumber });
      throw error;
    }
    
    // Import dynamically to avoid server/client mismatch
    const { sendMessage } = await import('../twilio/client');
    
    // Send verification message via WhatsApp
    const result = await sendMessage(
      phoneNumber,
      `Your MicroJournal verification code is: ${verificationCode}. It will expire in 10 minutes.`,
      'whatsapp'
    );
    
    if (!result.messageId) {
      throw new Error(result.error || 'Failed to send verification message');
    }
    
    logger.info('WhatsApp verification started', { phoneNumber, messageId: result.messageId });
    
    return { 
      success: true, 
      verificationId: result.messageId,
      error: null
    };
  } catch (error) {
    logger.error('Exception in startWhatsAppVerification', { error });
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Completes the WhatsApp verification process
 * @param phoneNumber Phone number being verified
 * @param code Verification code
 * @returns Success status and any error
 */
export async function completeWhatsAppVerification(
  phoneNumber: string,
  code: string
): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { 
        success: false, 
        error: new Error('User not authenticated') 
      };
    }
    
    // Check if verification code is valid
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('user_id', user.id)
      .eq('phone_number', phoneNumber)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error || !data) {
      logger.error('Invalid or expired verification code', { 
        error, 
        phoneNumber, 
        userProvidedCode: code 
      });
      return { 
        success: false, 
        error: new Error('Invalid or expired verification code') 
      };
    }
    
    // Update user preferences to mark WhatsApp as verified
    const { error: updateError } = await updateUserPreferences({
      phone_number: phoneNumber,
      whatsapp_verified: true
    });
    
    if (updateError) {
      throw updateError;
    }
    
    // Delete the used verification code
    await supabase
      .from('verification_codes')
      .delete()
      .eq('id', data.id);
    
    logger.info('WhatsApp verification completed', { phoneNumber });
    
    return { success: true, error: null };
  } catch (error) {
    logger.error('Exception in completeWhatsAppVerification', { error });
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
} 