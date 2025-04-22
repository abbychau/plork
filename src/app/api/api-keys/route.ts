/**
 * API Keys management endpoints
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiKeyService } from '@/lib/db';
import { requireAuth, authenticateRequest } from '@/lib/api-auth';

// GET /api/api-keys - Get all API keys for the current user
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const authError = await requireAuth(req);
    if (authError) return authError;
    
    const userId = await authenticateRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get API keys for the user
    const apiKeys = await apiKeyService.getUserApiKeys(userId);
    
    // Return the API keys (without the actual key value for security)
    return NextResponse.json(
      apiKeys.map(key => ({
        id: key.id,
        name: key.name,
        createdAt: key.createdAt,
        lastUsed: key.lastUsed,
        expiresAt: key.expiresAt,
      }))
    );
  } catch (error) {
    console.error('Error getting API keys:', error);
    return NextResponse.json(
      { error: 'Failed to get API keys' },
      { status: 500 }
    );
  }
}

// POST /api/api-keys - Create a new API key
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get the API key data from the request body
    const body = await req.json();
    const { name, expiresAt } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'API key name is required' },
        { status: 400 }
      );
    }
    
    // Create the API key
    const apiKey = await apiKeyService.createApiKey({
      userId,
      name,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });
    
    // Return the API key (including the actual key value, but only once)
    return NextResponse.json({
      id: apiKey.id,
      name: apiKey.name,
      key: apiKey.key, // Only returned once when created
      createdAt: apiKey.createdAt,
      expiresAt: apiKey.expiresAt,
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}
