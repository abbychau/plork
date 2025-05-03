/**
 * API authentication utilities
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiKeyService, userService } from './db';

/**
 * Authenticate a request using either cookies, API key, or the user ID set in request headers
 * @param req The Next.js request object
 * @returns The authenticated user ID or null if not authenticated
 */
export async function authenticateRequest(req: NextRequest): Promise<string | null> {
  // First, check if user ID is set in request headers by middleware
  const headerUserId = req.headers.get('x-user-id');
  if (headerUserId) {
    return headerUserId;
  }
  
  // If not in headers, try to authenticate using cookies
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  
  if (userId) {
    return userId;
  }
  
  // If no cookie, try to authenticate using API key from Authorization header
  const authHeader = req.headers.get('Authorization');
  let apiKey: string | null = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
  } else {
    // Try the x-api-key header if Authorization header isn't valid
    const xApiKey = req.headers.get('x-api-key');
    if (xApiKey) {
      apiKey = xApiKey;
    }
  }
  
  if (!apiKey) {
    return null;
  }
  
  // Validate the API key
  const validApiKey = await apiKeyService.validateApiKey(apiKey);
  
  if (!validApiKey) {
    return null;
  }
  
  return validApiKey.userId;
}

/**
 * Get the user ID from the request context without re-authenticating
 * @param req The Next.js request object
 * @returns The user ID from the request context or null if not available
 */
export function getUserIdFromContext(req: NextRequest): string | null {
  return req.headers.get('x-user-id');
}

/**
 * Middleware to require authentication
 * @param req The Next.js request object
 * @returns A response object if authentication fails, or null if authentication succeeds
 */
export async function requireAuth(req: NextRequest): Promise<NextResponse | null> {
  // First try to get the user ID from the context (set by middleware)
  const userId = getUserIdFromContext(req) || await authenticateRequest(req);
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }
  
  // Check if the user exists
  const user = await userService.getUserById(userId);
  
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 401 }
    );
  }
  
  return null;
}
