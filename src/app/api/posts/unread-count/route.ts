/**
 * Timeline unread posts count API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

// GET /api/posts/unread-count - Get unread post count for timeline
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

    // Get the user's last read timestamp for timeline
    try {
      const userReadState = await prisma.userReadState.findUnique({
        where: {
          userId_authorUsername: {
            userId,
            authorUsername: 'timeline', // Special case for timeline
          },
        },
      });

      // If no read state exists, count all posts
      if (!userReadState) {
        const count = await prisma.post.count();
        return NextResponse.json({ count });
      }

      // Count posts newer than the last read timestamp
      const count = await prisma.post.count({
        where: {
          createdAt: {
            gt: userReadState.lastReadAt,
          },
        },
      });

      return NextResponse.json({ count });
    } catch (error) {
      console.log('UserReadState model may not be available yet, counting all posts');
      // If UserReadState model isn't available, count all posts
      const count = await prisma.post.count();
      return NextResponse.json({ count });
    }
  } catch (error) {
    console.error('Error getting unread timeline count:', error);
    return NextResponse.json(
      { error: 'Failed to get unread timeline count' },
      { status: 500 }
    );
  }
}
