import { NextRequest, NextResponse } from 'next/server';
import { getUserPreferences, updateUserPreferences } from '@/lib/services/preferences';
import { preferencesSchema } from '@/schemas/preferences';
import { logger } from '@/lib/logger';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/preferences
 * Get user preferences
 */
export async function GET() {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { data, error } = await getUserPreferences();
    
    if (error) {
      logger.error('Error getting preferences', { error });
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    logger.error('Exception in GET /api/preferences', { error });
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/preferences
 * Update user preferences
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
    
    // Parse request body
    const body = await request.json();
    
    // Validate preferences
    try {
      preferencesSchema.parse(body);
    } catch (validationError) {
      return NextResponse.json(
        { error: 'Invalid preferences data', details: validationError },
        { status: 400 }
      );
    }
    
    // Update preferences
    const { data, error } = await updateUserPreferences(body);
    
    if (error) {
      logger.error('Error updating preferences', { error, body });
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    logger.error('Exception in POST /api/preferences', { error });
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 