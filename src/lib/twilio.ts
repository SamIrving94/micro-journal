// Client-side WhatsApp messaging interface
interface WhatsAppResponse {
  status: 'success' | 'failed';
  messageId?: string;
  errorMessage?: string;
}

// Message channel type
export type MessageChannel = 'whatsapp' | 'sms';

// Updated interface to include channel
interface MessageResponse {
  status: 'success' | 'failed';
  messageId?: string;
  errorMessage?: string;
  channel: MessageChannel;
}

export async function sendMessage(
  to: string,
  message: string,
  channel: MessageChannel = 'whatsapp'
): Promise<MessageResponse> {
  try {
    const response = await fetch('/api/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, message, channel }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errorMessage || 'Failed to send message');
    }

    return { ...data, channel };
  } catch (error) {
    console.error(`Error sending ${channel} message:`, error);
    return {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Failed to send message',
      channel
    };
  }
}

// Legacy function for backward compatibility
export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<MessageResponse> {
  return sendMessage(to, message, 'whatsapp');
}

// New function for SMS
export async function sendSMSMessage(
  to: string,
  message: string
): Promise<MessageResponse> {
  return sendMessage(to, message, 'sms');
}

export async function sendJournalPrompt(
  to: string,
  channel: MessageChannel = 'whatsapp'
): Promise<MessageResponse> {
  const prompts = [
    "How was your day? Share a moment that stood out.",
    "What's one thing you learned or accomplished today?",
    "What made you smile today?",
    "What's on your mind right now?",
    "Share a small win from today.",
  ];
  
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  return sendMessage(to, randomPrompt, channel);
} 