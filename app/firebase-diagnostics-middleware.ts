import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware will handle Firebase diagnostics routes
export function middleware(req: NextRequest) {
  // Block access to Firebase diagnostics in production
  if (process.env.NODE_ENV === 'production') {
    // Redirect to home page
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  // Continue with the request in development mode
  return NextResponse.next();
}

// Only run this middleware on Firebase diagnostics routes
export const config = {
  matcher: [
    '/firebase-diagnostics/:path*',
    '/api/firebase-diagnostics/:path*',
  ],
}; 