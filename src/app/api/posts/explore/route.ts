/**
 * Explore posts API endpoint
 * For browsing posts by type (hot/new) or by username
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/posts/explore - Get posts for exploration
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'new'; // 'hot' or 'new'
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
            createdAt: 'asc' as const,
          },
        },
      },
      take: limit,
      skip: offset,
    };

    // Build where clause
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
              _count: 'desc' as const,
            },
          },
          {
            comments: {
              _count: 'desc' as const,
            },
          },
        ],
      });
    } else {
      // Get new posts (default sorting by creation date)
      posts = await prisma.post.findMany({
        ...baseQuery,
        where,
        orderBy: {
          createdAt: 'desc' as const,
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
