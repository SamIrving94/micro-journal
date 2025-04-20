export type MessageChannel = 'sms' | 'whatsapp';

export interface MessageResponse {
  messageId: string;
  status: 'sent' | 'failed';
  error?: string;
  channel: MessageChannel;
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

export interface WebhookEvent {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      field: string;
      value: {
        messaging_product?: string;
        metadata?: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: WhatsAppMessage[];
      };
    }>;
  }>;
}

export interface TwilioError {
  code: string;
  message: string;
  status: number;
} 