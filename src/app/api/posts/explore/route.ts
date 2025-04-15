/**
 * Explore posts API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/posts/explore - Get posts for exploration
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'new'; // 'hot', 'new', or 'all'
    const search = searchParams.get('search') || '';
    const username = searchParams.get('username') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Base query
    const baseQuery = {
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
      take: limit,
      skip: offset,
    };

    // Build where clause for search
    const where: Record<string, unknown> = {};

    // Filter by username if provided
    if (username) {
      const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });

      if (user) {
        where.authorId = user.id;
      } else {
        // If username doesn't exist, return empty array
        return NextResponse.json([]);
      }
    }

    // Add search filter if provided
    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { author: { username: { contains: search, mode: 'insensitive' } } },
        { author: { displayName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Get posts based on type
    let posts;
    if (type === 'hot') {
      // Get hot posts - posts with most likes and comments
      posts = await prisma.post.findMany({
        ...baseQuery,
        where,
        orderBy: [
          {
            likes: {
              _count: 'desc',
            },
          },
          {
            comments: {
              _count: 'desc',
            },
          },
        ],
      });
    } else {
      // Get new posts or all posts (default sorting by creation date)
      posts = await prisma.post.findMany({
        ...baseQuery,
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts for exploration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
