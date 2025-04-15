/**
 * Single post API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { postService } from '@/lib/db';

// GET /api/posts/[postId] - Get a single post
export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    // Get the postId from the URL
    const { postId } = params;

    // Get the post
    const post = await postService.getPostById(postId);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error getting post:', error);
    return NextResponse.json(
      { error: 'Failed to get post' },
      { status: 500 }
    );
  }
}
