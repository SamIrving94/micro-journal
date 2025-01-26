import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

export async function POST(request: Request) {
  try {
    const { to, message } = await request.json();
    
    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Missing Twilio configuration');
    }

    const client = twilio(accountSid, authToken);
    
    const response = await client.messages.create({
      body: message,
      from: fromNumber,
      to: `whatsapp:${to}`
    });

    return NextResponse.json({ 
      status: 'success',
      messageId: response.sid 
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json({ 
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Failed to send message'
    }, { status: 500 });
  }
} 