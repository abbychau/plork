/**
 * Get new liked posts API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

// GET /api/posts/liked/new?latestId=xxx - Get new liked posts since the latest post ID
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
    const limit = parseInt(searchParams.get('limit') || '20', 10);

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

    // Get newer posts that the user has liked
    const newerPosts = await prisma.post.findMany({
      where: {
        likes: {
          some: {
            userId: userId,
          },
        },
        createdAt: { gt: latestPost.createdAt },
      },
      include: {
        author: true,
        likes: {
          include: {
            user: true,
          },
        },
        comments: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      posts: newerPosts,
    });
  } catch (error) {
    console.error('Error getting new liked posts:', error);
    return NextResponse.json(
      { error: 'Failed to get new liked posts' },
      { status: 500 }
    );
  }
}
