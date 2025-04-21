/**
 * Tag suggestions API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/tags/suggest?q=xxx - Get tag suggestions for autocomplete
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!query.trim()) {
      return NextResponse.json([]);
    }

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
    });

    // Extract all unique tags
    const allTags = new Set<string>();
    posts.forEach(post => {
      if (post.hashtags) {
        const tags = post.hashtags.split(',');
        tags.forEach(tag => {
          allTags.add(tag.toLowerCase());
        });
      }
    });

    // Filter tags that match the query
    const matchingTags = Array.from(allTags)
      .filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
      .sort()
      .slice(0, limit);

    // Return the matching tags
    return NextResponse.json(matchingTags);
  } catch (error) {
    console.error('Error getting tag suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to get tag suggestions' },
      { status: 500 }
    );
  }
}
