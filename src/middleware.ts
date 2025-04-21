import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default clerkMiddleware(async (auth, req) => {
  const publicRoutes = ["/", "/api/whatsapp/webhook"];
  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname === route || 
    req.nextUrl.pathname.startsWith('/auth/')
  );

  // Handle users who aren't authenticated
  const userId = await auth().then(auth => auth.userId);
  
  if (!userId && !isPublicRoute) {
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // If the user is logged in and trying to access the index page,
  // redirect them to the dashboard
  if (userId && req.nextUrl.pathname === "/") {
    const dashboard = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboard);
  }

  // Allow users to visit public routes and routes they have access to
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 