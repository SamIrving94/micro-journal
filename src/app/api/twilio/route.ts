import { NextRequest, NextResponse } from 'next/server'
import { createJournalEntry } from '@/lib/services/journal'
import { TwilioMessage, TwilioMessageResponse } from '@/lib/types/twilio'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData()
    const message: TwilioMessage = {
      body: formData.get('Body') as string,
      from: formData.get('From') as string,
      to: formData.get('To') as string,
      messageId: formData.get('MessageSid') as string,
    }
    
    logger.info('Received SMS message', { from: message.from, to: message.to, messageId: message.messageId })
    
    // Skip if no message body
    if (!message.body || message.body.trim() === '') {
      logger.warn('Empty message body received', { from: message.from })
      return createTwilioResponse('Please send a non-empty message.')
    }
    
    // Create journal entry
    const phoneNumber = normalizePhoneNumber(message.from)
    const journalResult = await createJournalEntry({
      content: message.body,
      phone_number: phoneNumber,
      source: 'sms'
    })
    
    if (journalResult.error) {
      logger.error('Failed to create journal entry from SMS', { 
        error: journalResult.error,
        phoneNumber,
        messageId: message.messageId 
      })
      return createTwilioResponse('Sorry, we could not save your journal entry. Please try again later.')
    }
    
    logger.info('Journal entry created from SMS', { 
      entryId: journalResult.data?.id,
      phoneNumber,
      messageId: message.messageId
    })
    
    return createTwilioResponse('Your journal entry has been saved. Thank you!')
  } catch (error) {
    logger.error('Twilio webhook error', { error })
    return createTwilioResponse('An error occurred. Please try again later.')
  }
}

/**
 * Creates a TwiML response
 */
function createTwilioResponse(message: string): NextResponse<TwilioMessageResponse> {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${message}</Message>
</Response>`

  return new NextResponse(twiml, {
    headers: {
      'Content-Type': 'text/xml',
    },
  })
}

/**
 * Normalizes a phone number by removing any non-digit characters
 */
function normalizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, '')
} 