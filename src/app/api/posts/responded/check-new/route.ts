/**
 * Check for new responded posts API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

// GET /api/posts/responded/check-new?latestId=xxx - Check if there are new posts since the latest post ID
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
    const latestId = searchParams.get('latestId');

    if (!latestId) {
      return NextResponse.json(
        { error: 'Latest post ID is required' },
        { status: 400 }
      );
    }

    // Get the latest post to find its creation date
    const latestPost = await prisma.post.findUnique({
      where: { id: latestId },
      select: { createdAt: true },
    });

    if (!latestPost) {
      return NextResponse.json(
        { error: 'Latest post not found' },
        { status: 404 }
      );
    }

    // Count newer posts that the user has commented on
    const newerPostsCount = await prisma.post.count({
      where: {
        comments: {
          some: {
            authorId: userId,
          },
        },
        createdAt: { gt: latestPost.createdAt },
      },
    });

    return NextResponse.json({
      hasNew: newerPostsCount > 0,
      count: newerPostsCount,
    });
  } catch (error) {
    console.error('Error checking for new responded posts:', error);
    return NextResponse.json(
      { error: 'Failed to check for new responded posts' },
      { status: 500 }
    );
  }
} 