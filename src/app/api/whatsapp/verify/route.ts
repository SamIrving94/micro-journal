import { NextRequest, NextResponse } from 'next/server';
import { startWhatsAppVerification, completeWhatsAppVerification } from '@/lib/services/preferences';
import { whatsappVerificationSchema } from '@/schemas/preferences';
import { logger } from '@/lib/logger';
import { auth } from '@clerk/nextjs/server';

/**
 * POST /api/whatsapp/verify
 * Start WhatsApp verification process
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    
    try {
      whatsappVerificationSchema.parse(body);
    } catch (validationError) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationError },
        { status: 400 }
      );
    }
    
    // If verification code is provided, complete verification
    if (body.verification_code) {
      const { success, error } = await completeWhatsAppVerification(
        body.phone_number,
        body.verification_code
      );
      
      if (!success) {
        return NextResponse.json(
          { error: error?.message || 'Verification failed' },
          { status: 400 }
        );
      }
      
      return NextResponse.json({ 
        success, 
        message: 'WhatsApp verified successfully' 
      });
    }
    
    // Otherwise start new verification
    const { success, error, verificationId } = await startWhatsAppVerification(
      body.phone_number
    );
    
    if (!success) {
      return NextResponse.json(
        { error: error?.message || 'Verification failed to start' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success,
      verificationId,
      message: 'Verification code sent to WhatsApp'
    });
  } catch (error) {
    logger.error('Exception in WhatsApp verification', { error });
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 