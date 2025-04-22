/**
 * API Key management for a specific key
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiKeyService } from '@/lib/db';

// DELETE /api/api-keys/[keyId] - Revoke an API key
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ keyId: string }> }
) {
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
    
    const { keyId } = (await context.params);
    
    // Get the API key
    const apiKey = await apiKeyService.getApiKeyById(keyId);
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }
    
    // Check if the API key belongs to the user
    if (apiKey.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Revoke the API key
    await apiKeyService.revokeApiKey(keyId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking API key:', error);
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}
