/**
 * Load new posts API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma, postService } from '@/lib/db';

// GET /api/posts/new?latestId=xxx - Get new posts since the latest post ID
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
    const username = searchParams.get('username');
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

    // Build the query to get newer posts
    let whereClause: any = {
      createdAt: { gt: latestPost.createdAt },
    };

    // If username is provided, filter by that user's posts
    if (username) {
      const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      whereClause.authorId = user.id;
    } else {
      // For timeline, get posts from users the current user follows
      const following = await prisma.follow.findMany({
        where: {
          followerId: userId,
          accepted: true,
        },
        select: {
          followingId: true,
        },
      });

      const followingIds = following.map((f) => f.followingId);
      
      // Include the user's own posts
      followingIds.push(userId);

      whereClause.authorId = { in: followingIds };
    }

    // Get newer posts
    const newerPosts = await prisma.post.findMany({
      where: whereClause,
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
    console.error('Error getting new posts:', error);
    return NextResponse.json(
      { error: 'Failed to get new posts' },
      { status: 500 }
    );
  }
}
