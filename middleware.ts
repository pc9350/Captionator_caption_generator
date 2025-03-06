import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_NAME = 'firebase-auth-token';

// List of routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/saved',
];

// List of routes that are only accessible to non-authenticated users
const authRoutes = [
  '/sign-in',
  '/sign-up',
];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_NAME)?.value;
  const isAuthenticated = !!token;
  const path = request.nextUrl.pathname;

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );

  // Check if the route is only for non-authenticated users
  const isAuthRoute = authRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );

  // Redirect authenticated users away from auth routes
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users away from protected routes
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};