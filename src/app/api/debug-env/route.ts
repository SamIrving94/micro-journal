import { NextResponse } from 'next/server';

export async function GET() {
  // Only show if certain environment variables are set, not their values
  const envStatus = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  return NextResponse.json({ 
    status: 'OK',
    envStatus,
  });
} 