/**
 * GitHub OAuth API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/db';
import { cookies } from 'next/headers';
import { getBaseUrl } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const { idToken, displayName, email, photoURL } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Get the base URL for ActivityPub URLs
    const protocol = req.nextUrl.protocol === 'https:' ? 'https' : 'http';
    const baseUrl = getBaseUrl(protocol);

    // Find or create user with GitHub provider
    const user = await userService.findOrCreateOAuthUser({
      providerId: idToken,
      provider: 'github',
      email: email || `${idToken}@github.user`, // GitHub might not provide email
      displayName: displayName || `GitHub User ${idToken.substring(0, 8)}`,
      profileImage: photoURL,
      baseUrl,
    });

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    // Return user data (without sensitive information)
    return NextResponse.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error('GitHub authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
