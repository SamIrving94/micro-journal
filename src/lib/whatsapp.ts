const WHATSAPP_API_URL = process.env.NEXT_PUBLIC_WHATSAPP_API_URL;
const WHATSAPP_PHONE_ID = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN;

interface WhatsAppResponse {
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}

interface WhatsAppMessagePayload {
  messaging_product: string;
  recipient_type: string;
  to: string;
  type: string;
  text: { body: string };
}

export async function sendWhatsAppMessage(to: string, message: string): Promise<WhatsAppResponse> {
  if (!WHATSAPP_API_URL || !WHATSAPP_PHONE_ID || !WHATSAPP_ACCESS_TOKEN) {
    throw new Error('WhatsApp configuration is missing');
  }

  const payload: WhatsAppMessagePayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { body: message }
  };

  const response = await fetch(
    `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data as WhatsAppResponse;
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