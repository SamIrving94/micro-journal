import { NextResponse } from 'next/server';
import twilio from 'twilio';

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: Request) {
  try {
    const { to, message, channel } = await request.json();

    if (!to || !message || !channel) {
      return NextResponse.json(
        { status: 'failed', errorMessage: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Format the 'to' number based on the channel
    const formattedTo = channel === 'whatsapp' 
      ? `whatsapp:${to}` 
      : to;

    // Get the 'from' number based on the channel
    const from = channel === 'whatsapp'
      ? process.env.TWILIO_WHATSAPP_FROM
      : process.env.TWILIO_PHONE_NUMBER;

    if (!from) {
      return NextResponse.json(
        { 
          status: 'failed', 
          errorMessage: `Missing ${channel === 'whatsapp' ? 'TWILIO_WHATSAPP_FROM' : 'TWILIO_PHONE_NUMBER'} environment variable` 
        },
        { status: 500 }
      );
    }

    // Send message using Twilio
    const twilioMessage = await client.messages.create({
      body: message,
      from,
      to: formattedTo
    });

    return NextResponse.json({
      status: 'success',
      messageId: twilioMessage.sid,
      channel
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { 
        status: 'failed', 
        errorMessage: error instanceof Error ? error.message : 'Failed to send message',
        channel: 'unknown'
      },
      { status: 500 }
    );
  }
} 