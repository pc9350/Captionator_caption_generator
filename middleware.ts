import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware will handle Firebase diagnostics routes
export function middleware(req: NextRequest) {
  // Block access to Firebase diagnostics in production
  if (process.env.NODE_ENV === 'production') {
    const url = req.nextUrl.pathname;
    
    // Check if the request is for Firebase diagnostics
    if (url.includes('/firebase-diagnostics')) {
      // Redirect to home page
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  
  // Continue with the request
  return NextResponse.next();
}

// Only run this middleware on Firebase diagnostics routes
export const config = {
  matcher: [
    '/firebase-diagnostics/:path*',
    '/api/firebase-diagnostics/:path*',
  ],
};