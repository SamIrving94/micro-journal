import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession();
  
  return res;
}

// Match all routes except for static files, API routes we don't want
// to refresh auth for, and non-auth requiring public routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api routes that don't require authentication
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/public).*)',
  ],
}; 