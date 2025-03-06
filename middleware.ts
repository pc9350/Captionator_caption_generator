import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  '/auth',
  '/reset-password',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
];

// Define auth routes that should redirect to dashboard if already authenticated
const authRoutes = ['/sign-in', '/sign-up', '/auth', '/reset-password'];

export async function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('firebase-auth-token');
  const path = request.nextUrl.pathname;

  // Check if the path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );

  // Check if the path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );

  // If user is authenticated and trying to access an auth route, redirect to dashboard
  if (authCookie && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard/dashboard', request.url));
  }

  // If user is not authenticated and trying to access a protected route, redirect to sign in
  if (!authCookie && !isPublicRoute) {
    const redirectUrl = new URL('/auth', request.url);
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }

  // For the old sign-in and sign-up routes, redirect to the new auth page
  if (path === '/sign-in' || path === '/sign-up') {
    return NextResponse.redirect(new URL('/auth', request.url));
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
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};