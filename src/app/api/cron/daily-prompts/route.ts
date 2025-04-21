import { NextRequest, NextResponse } from 'next/server';
import { findUsersForPrompts, sendDailyPrompts } from '@/lib/services/scheduler';
import { logger } from '@/lib/logger';

// Expected format: HH:MM in 24-hour time
const TIME_REGEX = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;

/**
 * GET /api/cron/daily-prompts
 * CRON job endpoint to send daily prompts to users
 * Query params:
 * - time: Current time in HH:MM format (24-hour)
 * - key: Secret API key for authorization
 */
export async function GET(request: NextRequest) {
  try {
    // Check API key
    const apiKey = request.nextUrl.searchParams.get('key');
    const expectedApiKey = process.env.CRON_API_KEY;
    
    if (!apiKey || apiKey !== expectedApiKey) {
      logger.warn('Unauthorized attempt to trigger daily prompts', { 
        ip: request.ip || 'unknown'
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get current time from query params
    const timeParam = request.nextUrl.searchParams.get('time');
    
    if (!timeParam || !TIME_REGEX.test(timeParam)) {
      return NextResponse.json(
        { error: 'Invalid time parameter. Expected format: HH:MM' },
        { status: 400 }
      );
    }
    
    // Find users who should receive prompts at this time
    const { data: users, error } = await findUsersForPrompts(timeParam);
    
    if (error) {
      throw error;
    }
    
    logger.info('Found users for daily prompts', { count: users.length, time: timeParam });
    
    if (users.length === 0) {
      return NextResponse.json({
        message: 'No users to send prompts to at this time',
        time: timeParam,
        count: 0
      });
    }
    
    // Send prompts to users
    const result = await sendDailyPrompts(users);
    
    return NextResponse.json({
      message: 'Daily prompts processed',
      time: timeParam,
      count: users.length,
      sentCount: result.sentCount,
      errors: result.errors.length
    });
  } catch (error) {
    logger.error('Error processing daily prompts', { error });
    return NextResponse.json(
      { error: 'Error processing daily prompts' },
      { status: 500 }
    );
  }
} 