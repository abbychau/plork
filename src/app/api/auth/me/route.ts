/**
 * Get current user API endpoint
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userService } from '@/lib/db';

export async function GET() {
  // Get user ID from cookie
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

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
      const cookieStore = await cookies();
      cookieStore.delete('userId');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Return user data (without sensitive information)
    return NextResponse.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}
