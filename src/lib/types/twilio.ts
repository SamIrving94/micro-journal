/**
 * Twilio related types
 */

/**
 * Message channel types
 */
export type MessageChannel = 'sms' | 'whatsapp';

/**
 * Message response structure
 */
export interface MessageResponse {
  success: boolean;
  messageId?: string;
  error?: TwilioError;
}

/**
 * Twilio error structure
 */
export interface TwilioError {
  code: string;
  message: string;
  status?: number;
}

export interface TwilioMessage {
  body: string;
  from: string;
  to: string;
  messageId: string;
}

export interface TwilioMessageResponse {
  message: string;
}

export interface WhatsAppMessage {
  from: string;
  type: 'text' | 'audio' | 'voice';
  text?: {
    body: string;
  };
  audio?: {
    id: string;
  };
  voice?: {
    id: string;
  };
} 