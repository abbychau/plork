/**
 * Pin status API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma, userService } from '@/lib/db';

// GET /api/users/[username]/pin-status - Check if a user is pinned
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

    // Check if the current user has pinned the target user
    const pinnedUser = await prisma.pinnedUser.findUnique({
      where: {
        userId_pinnedUserId: {
          userId,
          pinnedUserId: targetUser.id,
        },
      },
    });

    return NextResponse.json({
      isPinned: !!pinnedUser,
    });
  } catch (error) {
    console.error('Error checking pin status:', error);
    return NextResponse.json(
      { error: 'Failed to check pin status' },
      { status: 500 }
    );
  }
}
