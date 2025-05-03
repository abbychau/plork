/**
 * Register API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { userService, prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { getBaseUrl } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const { username, displayName, email, password, summary, profileImage } = await req.json();

    // Validate required fields
    if (!username || !password || !email) {
      return NextResponse.json(
        { error: 'Username, password, and email are required' },
        { status: 400 }
      );
    }

    // Validate username doesn't contain @
    if (username.includes('@')) {
      return NextResponse.json(
        { error: 'Username cannot contain the @ symbol' },
        { status: 400 }
      );
    }

    // Prevent using "me" as a username
    if (username.toLowerCase() === 'me') {
      return NextResponse.json(
        { error: 'The username "me" is reserved and cannot be used' },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const existingUser = await userService.getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Check if email is already taken
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    // Create the user
    // Use the configured domain name instead of the request host
    const protocol = req.nextUrl.protocol === 'https:' ? 'https' : 'http';
    const baseUrl = getBaseUrl(protocol);
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
