/**
 * Hashtag search API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/posts/hashtag - Search for posts by hashtag
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag parameter is required' },
        { status: 400 }
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
            createdAt: 'asc',
          },
        },
      },
      take: limit,
      skip: offset,
    };

    // Search for posts with the hashtag
    // For SQLite, we need to use a more flexible approach since it's case-sensitive by default
    // We'll also search in the content field for the hashtag
    const posts = await prisma.post.findMany({
      ...baseQuery,
      where: {
        OR: [
          // Try different case variations for the hashtag in content
          { content: { contains: `#${tag}` } },
          { content: { contains: `#${tag.toLowerCase()}` } },
          { content: { contains: `#${tag.toUpperCase()}` } },

          // Try different case variations for the hashtag in hashtags field
          { hashtags: { contains: tag } },
          { hashtags: { contains: tag.toLowerCase() } },
          { hashtags: { contains: tag.toUpperCase() } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the response to match the expected structure
    const formattedResponse = {
      posts: posts,
      nextOffset: posts.length < limit ? null : offset + posts.length
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error('Error searching posts by hashtag:', error);
    return NextResponse.json(
      { error: 'Failed to search posts by hashtag' },
      { status: 500 }
    );
  }
}
