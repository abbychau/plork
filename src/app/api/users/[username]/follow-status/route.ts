/**
 * Follow status API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userService, prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
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

    const { username } = await params;

    // Find the target user
    const targetUser = await userService.getUserByUsername(username);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if the current user is following the target user
    const follow = await prisma.follow.findFirst({
      where: {
        followerId: userId,
        followingId: targetUser.id,
      },
    });

    return NextResponse.json({
      isFollowing: !!follow,
      accepted: follow?.accepted || false,
    });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json(
      { error: 'Failed to check follow status' },
      { status: 500 }
    );
  }
}
