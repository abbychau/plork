/**
 * Search posts API endpoint
 * Uses SQLite's LIKE operator for text search
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/posts/search - Search for posts
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Don't search if no query provided
    if (!query.trim()) {
      return NextResponse.json([]);
    }

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

    // Check if the query is a hashtag search
    if (query.startsWith('#')) {
      const tag = query.substring(1);
      // Redirect to the hashtag API
      const response = await fetch(`${request.nextUrl.origin}/api/posts/hashtag?tag=${encodeURIComponent(tag)}&limit=${limit}&offset=${offset}`);
      const data = await response.json();
      return NextResponse.json(data);
    }

    // Split search terms for better matching
    const searchTerms = query.trim().split(/\s+/).filter(term => term.length > 0);

    // Build where clause for search with multiple terms
    const whereConditions = searchTerms.map(term => ({
      OR: [
        { content: { contains: term } },
        { hashtags: { contains: term } },
        { author: { username: { contains: term } } },
        { author: { displayName: { contains: term } } },
      ],
    }));

    // Get posts matching all search terms (AND logic)
    const posts = await prisma.post.findMany({
      ...baseQuery,
      where: {
        AND: whereConditions,
      },
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
