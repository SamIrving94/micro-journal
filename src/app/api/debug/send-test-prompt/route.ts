import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { sendDailyPrompts } from '@/lib/services/scheduler';
import { supabase } from '@/lib/supabase/client';
import { auth } from '@clerk/nextjs/server';

/**
 * POST /api/debug/send-test-prompt
 * Send a test prompt to the currently authenticated user
 * Only works in development environment
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure we're in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }
    
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('preferences, phone_number')
      .eq('clerk_id', userId)
      .single();
    
    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found or error fetching user data' },
        { status: 404 }
      );
    }
    
    // Check if WhatsApp is verified
    if (!userData.preferences?.whatsapp_verified || !userData.phone_number) {
      return NextResponse.json(
        { error: 'WhatsApp is not verified for this user' },
        { status: 400 }
      );
    }
    
    // Send a test prompt
    const result = await sendDailyPrompts([{
      userId,
      preferences: userData.preferences,
      phoneNumber: userData.phone_number
    }]);
    
    if (result.errors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send test prompt',
          details: result.errors
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test prompt sent successfully',
      sentCount: result.sentCount
    });
  } catch (error) {
    logger.error('Error in send-test-prompt', { error });
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 