import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeMessage } from '../../../../lib/whatsapp/welcome-message';
import { transcribeAudio } from '../../../../lib/whisper';
import { mapPhoneNumberToUserId } from '../../../../lib/user-mapping';

// Create a database-only client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

// Constants
const VERIFICATION_ERROR = {
  MISSING_PARAMS: 'Missing required verification parameters',
  INVALID_TOKEN: 'Invalid verification token'
};

const WEBHOOK_RESPONSE = {
  VERIFIED: 'WEBHOOK_VERIFIED',
  FAILED: 'VERIFICATION_FAILED',
  USER_NOT_FOUND: 'User not found for this phone number',
  SUCCESS: 'Success',
  UNHANDLED: 'Unhandled webhook event',
  ERROR: 'An error occurred processing the webhook'
};

/**
 * Handle webhook verification from WhatsApp
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  // Log the verification attempt for debugging
  console.log('Webhook verification attempt with:', { mode, token, challenge: !!challenge });

  // Validate required parameters
  if (!mode || !token || !challenge) {
    console.warn(VERIFICATION_ERROR.MISSING_PARAMS, { mode, token: token?.substring(0, 3) });
    return NextResponse.json({ error: VERIFICATION_ERROR.MISSING_PARAMS }, { status: 400 });
  }

  // Verify token
  if (mode === 'subscribe' && token === verifyToken) {
    console.log(WEBHOOK_RESPONSE.VERIFIED);
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } else {
    console.warn(WEBHOOK_RESPONSE.FAILED, { 
      expectedToken: verifyToken?.substring(0, 3), 
      receivedToken: token?.substring(0, 3),
      mode 
    });
    return NextResponse.json({ error: VERIFICATION_ERROR.INVALID_TOKEN }, { status: 403 });
  }
}

/**
 * Handle incoming messages from WhatsApp
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Log with limited data to avoid exposing sensitive information
    console.log('Received webhook event:', { 
      object: body.object,
      entries: body.entry?.length || 0
    });

    // Validate webhook structure
    if (body.object !== 'whatsapp_business_account' || !body.entry?.length) {
      return NextResponse.json({ status: WEBHOOK_RESPONSE.UNHANDLED }, { status: 200 });
    }

    // Process each message
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field === 'messages' && change.value?.messages?.length > 0) {
          const message = change.value.messages[0];
          const from = message.from;
          
          // Map phone number to user ID
          const userId = await mapPhoneNumberToUserId(from);
          
          if (!userId) {
            console.warn(`No user ID found for phone number: ${from}`);
            // Send welcome message to new users
            await sendWelcomeMessage(from);
            return NextResponse.json({ 
              status: 'success', 
              message: 'Welcome message sent to new user'
            }, { status: 200 });
          }
          
          // Handle text messages
          if (message.type === 'text' && message.text?.body) {
            // Check for help command
            if (message.text.body.toLowerCase() === '/help') {
              await sendWelcomeMessage(from);
              return NextResponse.json({ status: 'success' }, { status: 200 });
            }
            return await handleTextMessage(userId, from, message.text.body);
          }
          // Handle voice messages
          else if ((message.type === 'audio' || message.type === 'voice') && 
                    (message.audio?.id || message.voice?.id)) {
            return await handleVoiceMessage(userId, from, message.audio?.id || message.voice?.id);
          }
        }
      }
    }

    return NextResponse.json({ status: WEBHOOK_RESPONSE.UNHANDLED }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: WEBHOOK_RESPONSE.ERROR
    }, { status: 500 });
  }
}

/**
 * Handle text messages from WhatsApp
 */
async function handleTextMessage(userId: string, from: string, content: string): Promise<NextResponse> {
  console.log(`Received text from ${from} (userId: ${userId}): ${content.substring(0, 20)}...`);
  
  try {
    const { error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        content,
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to save journal entry' 
    }, { status: 500 });
  }
}

/**
 * Handle voice messages from WhatsApp
 */
async function handleVoiceMessage(userId: string, from: string, audioId: string): Promise<NextResponse> {
  console.log(`Received voice message from ${from} (userId: ${userId})`);
  
  try {
    // Transcribe the audio
    const transcription = await transcribeAudio(audioId);
    console.log(`Transcription complete: ${transcription.substring(0, 30)}...`);
    
    // Create journal entry with transcribed text
    const { error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        content: transcription,
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error processing voice message:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to process voice message' 
    }, { status: 500 });
  }
} 