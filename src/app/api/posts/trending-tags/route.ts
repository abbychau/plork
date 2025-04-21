/**
 * Trending tags API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/posts/trending-tags - Get trending hashtags
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Get all posts with hashtags
    const posts = await prisma.post.findMany({
      where: {
        hashtags: {
          not: null,
        },
      },
      select: {
        hashtags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limit to recent posts for performance
    });

    // Count occurrences of each tag
    const tagCounts: Record<string, number> = {};
    
    posts.forEach(post => {
      if (post.hashtags) {
        const tags = post.hashtags.split(',');
        tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Convert to array and sort by count
    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return NextResponse.json(sortedTags);
  } catch (error) {
    console.error('Error fetching trending tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending tags' },
      { status: 500 }
    );
  }
}
