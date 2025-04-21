import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeMessage } from '@/lib/whatsapp/welcome-message';
import { transcribeAudio } from '@/lib/whisper';
import { mapPhoneNumberToUserId } from '@/lib/user-mapping';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

// Create a database-only client for operations requiring admin rights
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
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
 * POST /api/whatsapp/webhook
 * Handles incoming WhatsApp messages via Twilio
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio webhook
    const formData = await request.formData();
    
    // Extract message details
    const messageId = formData.get('MessageSid') as string;
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const numMedia = parseInt(formData.get('NumMedia') as string || '0');
    
    if (!messageId || !from) {
      logger.error('Invalid webhook payload', { messageId, from });
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    
    // Clean up the WhatsApp number format to match our stored format
    const cleanPhoneNumber = from.replace('whatsapp:', '');
    
    // Find the user associated with this phone number
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('clerk_id')
      .eq('phone_number', cleanPhoneNumber)
      .single();
    
    if (userError || !userData) {
      logger.error('User not found for phone number', { 
        phoneNumber: cleanPhoneNumber, 
        error: userError 
      });
      
      // Still return OK to Twilio
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        status: 200,
        headers: {
          'Content-Type': 'text/xml'
        }
      });
    }
    
    // Get the user ID
    const userId = userData.clerk_id;
    
    // Handle media if present (voice notes)
    let content = body || '';
    
    if (numMedia > 0) {
      // Get the media URL (assuming it's a voice note)
      const mediaUrl = formData.get('MediaUrl0') as string;
      
      if (mediaUrl) {
        try {
          // Transcribe the audio
          const transcription = await transcribeAudio(mediaUrl);
          
          if (transcription) {
            content = transcription;
            
            // Log success
            logger.info('Audio transcribed successfully', { 
              userId, 
              mediaUrl,
              transcriptionLength: transcription.length 
            });
          }
        } catch (transcriptionError) {
          logger.error('Error transcribing audio', { 
            userId, 
            mediaUrl, 
            error: transcriptionError 
          });
          
          // Return error to user
          return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response><Message>Sorry, we couldn\'t transcribe your audio message. Please try sending text instead.</Message></Response>', {
            status: 200,
            headers: {
              'Content-Type': 'text/xml'
            }
          });
        }
      }
    }
    
    // Skip empty content
    if (!content.trim()) {
      logger.info('Empty message received, ignoring', { userId });
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response><Message>Your message was empty. Please try again with some content.</Message></Response>', {
        status: 200,
        headers: {
          'Content-Type': 'text/xml'
        }
      });
    }
    
    // Find the most recent prompt sent to this user
    const { data: promptData, error: promptError } = await supabase
      .from('sent_prompts')
      .select('id, prompt_text')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    // Create a journal entry
    const entryId = await createJournalEntry(
      userId, 
      content, 
      promptData?.prompt_text || null
    );
    
    // If this was a response to a prompt, update the prompt record
    if (promptData && !promptError) {
      await supabase
        .from('sent_prompts')
        .update({
          response_text: content,
          response_at: new Date().toISOString(),
          status: 'answered'
        })
        .eq('id', promptData.id);
    }
    
    // Respond to the user
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response><Message>Your journal entry has been saved. Thank you for sharing your thoughts!</Message></Response>', {
      status: 200,
      headers: {
        'Content-Type': 'text/xml'
      }
    });
  } catch (error) {
    logger.error('Error processing WhatsApp webhook', { error });
    
    // Return a valid response to Twilio even on error
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: {
        'Content-Type': 'text/xml'
      }
    });
  }
}

/**
 * Helper function to create a journal entry
 */
async function createJournalEntry(userId: string, content: string, promptText: string | null = null) {
  try {
    const entry = {
      user_id: userId,
      content,
      prompt: promptText,
      source: 'whatsapp'
    };
    
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .insert(entry)
      .select('id')
      .single();
    
    if (error) {
      logger.error('Error creating journal entry', { userId, error });
      return null;
    }
    
    return data.id;
  } catch (error) {
    logger.error('Exception in createJournalEntry', { userId, error });
    return null;
  }
}

/**
 * Handle incoming messages from WhatsApp
 */
export async function POST_OLD(request: Request): Promise<NextResponse> {
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
    const { error } = await supabaseAdmin
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
    const { error } = await supabaseAdmin
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