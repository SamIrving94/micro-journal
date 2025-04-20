import { Twilio } from 'twilio';
import { MessageChannel, MessageResponse } from './types';

if (!process.env.TWILIO_ACCOUNT_SID) {
  throw new Error('TWILIO_ACCOUNT_SID is not set');
}

if (!process.env.TWILIO_AUTH_TOKEN) {
  throw new Error('TWILIO_AUTH_TOKEN is not set');
}

if (!process.env.TWILIO_WHATSAPP_FROM) {
  throw new Error('TWILIO_WHATSAPP_FROM is not set');
}

const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendMessage = async (
  to: string,
  body: string,
  channel: MessageChannel = 'sms'
): Promise<MessageResponse> => {
  try {
    const message = await twilioClient.messages.create({
      body,
      to,
      from: process.env.TWILIO_WHATSAPP_FROM,
    });

    return {
      messageId: message.sid,
      status: 'sent',
      channel,
    };
  } catch (error) {
    return {
      messageId: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      channel,
    };
  }
};

export default twilioClient; 