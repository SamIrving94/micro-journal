import twilio from 'twilio';
import { MessageChannel, MessageResponse, TwilioError } from './types';
import { logger } from '../logger';

/**
 * Validates that required environment variables are set for Twilio
 * @throws Error if any required environment variables are missing
 */
function validateEnvironment(): void {
  const requiredVars = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_WHATSAPP_FROM'
  ];
  
  const missingVars = requiredVars.filter(
    varName => !process.env[varName]
  );
  
  if (missingVars.length > 0) {
    const errorMsg = `Missing required Twilio environment variables: ${missingVars.join(', ')}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Get a configured Twilio client instance
 * @returns A configured Twilio client
 * @throws Error if environment variables are missing
 */
export function getTwilioClient() {
  validateEnvironment();
  
  return twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );
}

/**
 * Send a message via Twilio
 * @param to - Recipient phone number (with country code)
 * @param body - Message content
 * @param channel - Channel to use (sms or whatsapp)
 * @returns Promise with MessageResponse
 */
export async function sendMessage(
  to: string,
  body: string,
  channel: MessageChannel = 'sms'
): Promise<MessageResponse> {
  try {
    validateEnvironment();
    
    const client = getTwilioClient();
    
    // Add WhatsApp prefix if using WhatsApp channel
    const from = channel === 'whatsapp' 
      ? `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`
      : process.env.TWILIO_PHONE_NUMBER;

    // Add WhatsApp prefix to recipient if using WhatsApp channel
    const formattedTo = channel === 'whatsapp' ? `whatsapp:${to}` : to;
    
    logger.info(`Sending ${channel} message to ${to}`);
    
    const message = await client.messages.create({
      body,
      from,
      to: formattedTo
    });
    
    logger.info(`Successfully sent message, SID: ${message.sid}`);
    
    return {
      messageId: message.sid,
      status: 'sent',
      channel
    };
  } catch (error) {
    const twilioError = error as TwilioError;
    const errorMessage = `Failed to send ${channel} message: ${twilioError.message || 'Unknown error'}`;
    
    logger.error(errorMessage, {
      error: twilioError,
      recipient: to,
      channel
    });
    
    return {
      messageId: '',
      status: 'failed',
      error: errorMessage,
      channel
    };
  }
}

// Export a default client for backward compatibility
export default getTwilioClient(); 