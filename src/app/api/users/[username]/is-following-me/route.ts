/**
 * Check if a user is following the current user
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma, userService } from '@/lib/db';

// GET /api/users/[username]/is-following-me - Check if a user is following the current user
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ username: string }> }
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

    const { username } = (await context.params);

    // Find the target user
    const targetUser = await userService.getUserByUsername(username);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if the target user is following the current user
    const follow = await prisma.follow.findFirst({
      where: {
        followerId: targetUser.id,
        followingId: userId,
      },
    });

    return NextResponse.json({
      isFollowingMe: !!follow,
    });
  } catch (error) {
    console.error('Error checking if user is following me:', error);
    return NextResponse.json(
      { error: 'Failed to check if user is following me' },
      { status: 500 }
    );
  }
}
