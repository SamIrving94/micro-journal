import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Only return the first few characters of sensitive values for security
  return NextResponse.json({ 
    supabaseUrl: supabaseUrl ? 'Set correctly' : 'Missing',
    supabaseAnonKey: supabaseAnonKey ? 'Set correctly (starts with: ' + supabaseAnonKey.substring(0, 10) + '...)' : 'Missing',
    appUrl: process.env.NEXT_PUBLIC_APP_URL
  });
} 