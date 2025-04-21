import { supabase } from '../supabase/client';
import { logger } from '../logger';
import { UserPreferences } from '@/schemas/preferences';
import { generatePrompt } from './prompts';

/**
 * Find users who should receive prompts at the current time
 * @param currentTime Time in HH:MM format (24-hour)
 * @returns Array of users with their preferences
 */
export async function findUsersForPrompts(currentTime: string): Promise<{
  data: Array<{ userId: string; preferences: UserPreferences; phoneNumber: string | null }>;
  error: Error | null;
}> {
  try {
    // Find users who have enabled notifications and whose prompt_time matches currentTime
    const { data, error } = await supabase
      .from('users')
      .select('clerk_id, preferences, phone_number')
      .eq('preferences->notifications_enabled', true)
      .eq('preferences->prompt_time', currentTime);
    
    if (error) {
      logger.error('Error fetching users for prompts', { error, currentTime });
      throw error;
    }
    
    // Map to the expected return format
    const formattedData = data.map(user => ({
      userId: user.clerk_id,
      preferences: user.preferences as UserPreferences,
      phoneNumber: user.phone_number
    }));
    
    return { 
      data: formattedData,
      error: null
    };
  } catch (error) {
    logger.error('Exception in findUsersForPrompts', { error, currentTime });
    return { 
      data: [],
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Send prompts to users based on their preferences
 * @param users Array of users with their preferences
 * @returns Success status and any errors
 */
export async function sendDailyPrompts(
  users: Array<{ userId: string; preferences: UserPreferences; phoneNumber: string | null }>
): Promise<{
  success: boolean;
  sentCount: number;
  errors: Array<{ userId: string; error: string }>;
}> {
  const errors: Array<{ userId: string; error: string }> = [];
  let sentCount = 0;
  
  try {
    // Import dynamically to avoid server/client mismatch
    const { sendMessage } = await import('../twilio/client');
    
    // Process each user
    for (const user of users) {
      try {
        // Skip users without WhatsApp verification
        if (!user.preferences.whatsapp_verified || !user.phoneNumber) {
          logger.info('Skipping user without WhatsApp verification', { userId: user.userId });
          continue;
        }
        
        // Generate a prompt based on user preferences
        const prompt = await generatePrompt(user.preferences.prompt_categories);
        
        // Send the prompt via WhatsApp
        const result = await sendMessage(
          user.phoneNumber,
          `🌟 Your daily MicroJournal prompt:\n\n${prompt}\n\nReply to this message with your thoughts to save it to your journal.`,
          'whatsapp'
        );
        
        if (!result.messageId) {
          throw new Error(result.error || 'Failed to send message');
        }
        
        // Log success
        logger.info('Daily prompt sent successfully', { 
          userId: user.userId, 
          phoneNumber: user.phoneNumber,
          messageId: result.messageId
        });
        
        // Record the sent prompt
        await supabase.from('sent_prompts').insert({
          user_id: user.userId,
          prompt_text: prompt,
          message_id: result.messageId,
          status: 'sent'
        });
        
        sentCount++;
      } catch (error) {
        logger.error('Error sending prompt to user', { 
          userId: user.userId, 
          error 
        });
        
        errors.push({
          userId: user.userId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return { 
      success: errors.length === 0,
      sentCount,
      errors 
    };
  } catch (error) {
    logger.error('Exception in sendDailyPrompts', { error });
    return { 
      success: false,
      sentCount,
      errors: [{ 
        userId: 'system', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }]
    };
  }
} 