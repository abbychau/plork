import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that require authentication
const protectedPaths = [
  '/compose',
  '/settings',
];

// Define paths that are only for non-authenticated users
const guestOnlyPaths = [
  '/login',
  '/register',
];

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('userId')?.value;
  const isAuthenticated = !!userId;
  const path = request.nextUrl.pathname;

  // Check if the path is protected and user is not authenticated
  if (protectedPaths.some(p => path.startsWith(p)) && !isAuthenticated) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', path);
    return NextResponse.redirect(url);
  }

  // Check if the path is for guests only and user is authenticated
  if (guestOnlyPaths.some(p => path.startsWith(p)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/compose/:path*',
    '/settings/:path*',
    '/login',
    '/register',
  ],
};
