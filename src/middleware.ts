import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that require authentication
const protectedPaths = [
  '/settings',
  '/api-docs',
];

// Define paths that are only for non-authenticated users
const guestOnlyPaths = [
  '/login',
];

export function middleware(request: NextRequest) {
  // Check cookie authentication
  const userId = request.cookies.get('userId')?.value;

  // Check if user has authorization headers that might contain API keys
  const authHeader = request.headers.get('Authorization');
  const apiKeyHeader = request.headers.get('x-api-key');

  // Consider authenticated if we have userId cookie or if API key headers are present
  // The actual API key validation will happen in the API routes
  let isAuthenticated = !!userId;

  if (!isAuthenticated && (authHeader?.startsWith('Bearer ') || apiKeyHeader)) {
    // Consider potentially authenticated if API key headers are present
    // Actual validation will happen in the API routes
    isAuthenticated = true;
  }

  const path = request.nextUrl.pathname;

  // Handle CORS and set authenticated user ID for API routes
  if (path.startsWith('/api')) {
    // Handle OPTIONS requests for CORS preflight
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });

      // Set CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
      response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

      return response;
    }

    // For actual API requests, add CORS headers
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

    // Pass the cookie-based user ID in request headers if available
    if (userId) {
      response.headers.set('x-user-id', userId);
    }

    return response;
  }

  // Check if the path is protected and user is not authenticated
  if (protectedPaths.some(p => path.startsWith(p)) && !isAuthenticated) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', path);
    return NextResponse.redirect(url);
  }

  // Check if the path is for guests only and user is authenticated
  if (guestOnlyPaths.some(p => path.startsWith(p)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/timeline', request.url));
  }

  // Redirect authenticated users from root path to timeline
  if (path === '/' && isAuthenticated) {
    return NextResponse.redirect(new URL('/timeline', request.url));
  }

  const response = NextResponse.next();

  // Add user ID to non-API routes headers as well for server components
  if (userId) {
    response.headers.set('x-user-id', userId);
  }

  return response;
}

export const config = {
  matcher: [
    '/',
    '/settings/:path*',
    '/api-docs/:path*',
    '/login',
    '/api/:path*', // Add API routes to the matcher
  ],
};
