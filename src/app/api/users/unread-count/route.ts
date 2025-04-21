/**
 * User unread posts count API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

// GET /api/users/unread-count?username=xxx - Get unread post count for a specific user
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let count = 0;

    try {
      // Try to get the user's last read timestamp for this author
      // This is wrapped in a try/catch in case the UserReadState model isn't available yet
      const userReadState = await prisma.userReadState.findUnique({
        where: {
          userId_authorUsername: {
            userId,
            authorUsername: username,
          },
        },
      });

      // If no read state exists, count all posts from this author
      if (!userReadState) {
        count = await prisma.post.count({
          where: {
            authorId: targetUser.id,
          },
        });
      } else {
        // Count posts newer than the last read timestamp
        count = await prisma.post.count({
          where: {
            authorId: targetUser.id,
            createdAt: {
              gt: userReadState.lastReadAt,
            },
          },
        });
      }
    } catch (error) {
      console.log('UserReadState model may not be available yet, counting all posts');
      // If UserReadState model isn't available, count all posts
      count = await prisma.post.count({
        where: {
          authorId: targetUser.id,
        },
      });
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error getting unread post count:', error);
    return NextResponse.json(
      { error: 'Failed to get unread post count' },
      { status: 500 }
    );
  }
}
