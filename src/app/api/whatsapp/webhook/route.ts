import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// WhatsApp verification token - should match what you set in WhatsApp Business API
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN

export async function GET(request: Request): Promise<NextResponse> {
  try {
    console.log('Webhook GET request received')
    console.log('Environment variables:', {
      VERIFY_TOKEN,
      URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      // Log other non-sensitive env vars
    })

    const { searchParams } = new URL(request.url)
    
    // Handle the webhook verification from WhatsApp
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    console.log('Webhook verification request:', {
      mode,
      token,
      challenge,
      expectedToken: VERIFY_TOKEN,
      url: request.url,
      headers: Object.fromEntries(request.headers)
    })

    if (!mode || !token || !challenge) {
      console.log('Missing required parameters')
      return new NextResponse('Missing parameters', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified successfully')
      return new NextResponse(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
    }
    
    console.log('Invalid verification token or mode:', {
      receivedToken: token,
      expectedToken: VERIFY_TOKEN,
      mode
    })
    return new NextResponse('Forbidden', { 
      status: 403,
      headers: { 'Content-Type': 'text/plain' }
    })
  } catch (error) {
    console.error('Error during webhook verification:', error)
    return new NextResponse('Internal Server Error', { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    console.log('Received Twilio WhatsApp webhook POST request')
    
    // Parse form data from Twilio
    const formData = await request.formData()
    console.log('Webhook form data:', Object.fromEntries(formData.entries()))
    
    // Extract message details from Twilio's format
    const phoneNumber = formData.get('From')?.toString().replace('whatsapp:', '')
    const content = formData.get('Body')?.toString()

    console.log('Processing message:', {
      phoneNumber,
      content,
      timestamp: new Date().toISOString()
    })

    if (!phoneNumber || !content) {
      console.log('Invalid message format')
      return new NextResponse('Invalid message format', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    // Find user by phone number
    console.log('Looking up user by phone number:', phoneNumber)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('phone_number', phoneNumber)
      .single()

    if (userError || !user) {
      console.error('Error finding user:', {
        error: userError,
        phoneNumber
      })
      return new NextResponse('User not found', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    // Save message as journal entry
    console.log('Saving journal entry for user:', user.id)
    const { error: entryError } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        content,
        source: 'whatsapp',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: []
      })

    if (entryError) {
      console.error('Error saving journal entry:', {
        error: entryError,
        userId: user.id,
        content
      })
      return new NextResponse('Error saving entry', { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    // Send confirmation message back via Twilio
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Entry saved successfully! ✍️</Message></Response>', 
      {
        status: 200,
        headers: { 'Content-Type': 'text/xml' }
      }
    )
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new NextResponse('Internal Server Error', { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
} 