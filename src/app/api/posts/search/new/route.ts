/**
 * Get new search results API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const latestId = searchParams.get('latestId');
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!latestId) {
      return NextResponse.json(
        { error: 'Latest post ID is required' },
        { status: 400 }
      );
    }

    if (!query.trim()) {
      return NextResponse.json(
        { error: 'Search query is required' },
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
    };

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

    // Get newer posts matching the search query
    const posts = await prisma.post.findMany({
      ...baseQuery,
      where: {
        AND: [
          ...whereConditions,
          { createdAt: { gt: latestPost.createdAt } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      posts,
    });
  } catch (error) {
    console.error('Error getting new search results:', error);
    return NextResponse.json(
      { error: 'Failed to get new search results' },
      { status: 500 }
    );
  }
}
