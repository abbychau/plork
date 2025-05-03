/**
 * API endpoint to fetch the current user's data
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userService, apiKeyService } from '@/lib/db';

export async function GET(req: NextRequest) {
  // Try multiple authentication methods
  let userId = null;
  
  // 1. Check if user ID is in the request headers (set by middleware from cookie)
  const headerUserId = req.headers.get('x-user-id');
  if (headerUserId) {
    userId = headerUserId;
  }
  
  // 2. If no user ID from headers, try direct cookie authentication
  if (!userId) {
    const cookieStore = await cookies();
    userId = cookieStore.get('userId')?.value;
  }
  
  // 3. If still no user ID, try API key authentication
  if (!userId) {
    // Check Authorization header
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
      const validApiKey = await apiKeyService.validateApiKey(apiKey);
      
      if (validApiKey) {
        userId = validApiKey.userId;
      }
    }
    
    // If no valid Authorization header, check x-api-key
    if (!userId) {
      const xApiKey = req.headers.get('x-api-key');
      if (xApiKey) {
        const validApiKey = await apiKeyService.validateApiKey(xApiKey);
        
        if (validApiKey) {
          userId = validApiKey.userId;
        }
      }
    }
  }

  if (!userId) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    // Find the user
    const user = await userService.getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Redirect to the user's profile API endpoint
    const url = new URL(`/api/users/${user.username}`, req.url);
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}