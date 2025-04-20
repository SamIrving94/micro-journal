import twilioClient from '../twilio/client';

export const WELCOME_MESSAGE = `Welcome to MicroJournal! 📝

Here's how to use me:
1. Send any text message to create a journal entry
2. Send a voice message to create a voice journal entry
3. Use /help anytime to see these instructions again

Your messages will be automatically saved and organized in your journal. Happy journaling! ✨`;

export async function sendWelcomeMessage(to: string) {
  try {
    await twilioClient.messages.create({
      body: WELCOME_MESSAGE,
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: `whatsapp:${to}`
    });
  } catch (error) {
    console.error('Error sending welcome message:', error);
  }
} 