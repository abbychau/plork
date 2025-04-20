/**
 * Search posts API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/posts/search - Search for posts
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || '';
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

    // Add search filter if provided
    if (search) {
      where.OR = [
        { content: { contains: search } },
        { author: { username: { contains: search } } },
        { author: { displayName: { contains: search } } },
      ];
    }

    // Get posts
    const posts = await prisma.post.findMany({
      ...baseQuery,
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error searching posts:', error);
    return NextResponse.json(
      { error: 'Failed to search posts' },
      { status: 500 }
    );
  }
}
