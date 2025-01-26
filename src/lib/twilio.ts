// Client-side WhatsApp messaging interface
interface WhatsAppResponse {
  status: 'success' | 'failed';
  messageId?: string;
  errorMessage?: string;
}

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<WhatsAppResponse> {
  try {
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, message }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errorMessage || 'Failed to send message');
    }

    return data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Failed to send message'
    };
  }
}

export async function sendJournalPrompt(to: string): Promise<WhatsAppResponse> {
  const prompts = [
    "How was your day? Share a moment that stood out.",
    "What's one thing you learned or accomplished today?",
    "What made you smile today?",
    "What's on your mind right now?",
    "Share a small win from today.",
  ];
  
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  return sendWhatsAppMessage(to, randomPrompt);
} 