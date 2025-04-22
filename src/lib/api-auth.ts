/**
 * API authentication utilities
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiKeyService, userService } from './db';

/**
 * Authenticate a request using either cookies or API key
 * @param req The Next.js request object
 * @returns The authenticated user ID or null if not authenticated
 */
export async function authenticateRequest(req: NextRequest): Promise<string | null> {
  // First, try to authenticate using cookies
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  
  if (userId) {
    return userId;
  }
  
  // If no cookie, try to authenticate using API key
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  // Validate the API key
  const validApiKey = await apiKeyService.validateApiKey(apiKey);
  
  if (!validApiKey) {
    return null;
  }
  
  return validApiKey.userId;
}

/**
 * Middleware to require authentication
 * @param req The Next.js request object
 * @returns A response object if authentication fails, or null if authentication succeeds
 */
export async function requireAuth(req: NextRequest): Promise<NextResponse | null> {
  const userId = await authenticateRequest(req);
  
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
