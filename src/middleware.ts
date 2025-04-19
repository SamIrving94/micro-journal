import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res });
    
    // Refresh session if expired
    await supabase.auth.getSession();

    // Get the pathname
    const path = request.nextUrl.pathname;

    // Get the current session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Session error in middleware:', error);
    }

    // Auth routes handling
    if (path.startsWith('/auth')) {
      if (session) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return res;
    }

    // Protected routes handling
    if (path === '/' || path.startsWith('/dashboard') || path.startsWith('/journal') || path.startsWith('/settings')) {
      if (!session) {
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }
      return res;
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
}; 