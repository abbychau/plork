/**
 * Check for new search results API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/posts/search/check-new?latestId=xxx&q=xxx - Check if there are new search results since the latest post ID
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const latestId = searchParams.get('latestId');
    const query = searchParams.get('q') || '';

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

    // Count newer posts matching the search query
    const newerPostsCount = await prisma.post.count({
      where: {
        AND: [
          ...whereConditions,
          { createdAt: { gt: latestPost.createdAt } },
        ],
      },
    });

    return NextResponse.json({
      hasNew: newerPostsCount > 0,
      count: newerPostsCount,
    });
  } catch (error) {
    console.error('Error checking for new search results:', error);
    return NextResponse.json(
      { error: 'Failed to check for new search results' },
      { status: 500 }
    );
  }
}
