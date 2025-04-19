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
    changes: Array<{
      field: string;
      value: {
        messages?: WhatsAppMessage[];
      };
    }>;
  }>;
} 