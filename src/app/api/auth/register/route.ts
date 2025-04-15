/**
 * Register API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { username, displayName, email, password, summary, profileImage } = await req.json();

    // Check if username is already taken
    const existingUser = await userService.getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Create the user
    const baseUrl = `${req.nextUrl.protocol}//${req.headers.get('host')}`;
    const user = await userService.createUser({
      username,
      displayName,
      email,
      password,
      summary,
      profileImage,
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
