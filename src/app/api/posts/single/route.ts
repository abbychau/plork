/**
 * Single post API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { postService } from '@/lib/db';

// GET /api/posts/single?postId=xxx - Get a single post
// GET /api/posts/single?postId=xxx - Get a single post
export async function GET(request: NextRequest) {
  try {
    // Get the postId from the query parameters
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

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

// PUT /api/posts/single?postId=xxx - Update a post
export async function PUT(request: NextRequest) {
  try {
    // Get the postId from the query parameters
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Check authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get the post
    const post = await postService.getPostById(postId);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if the user is the author of the post
    if (post.authorId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to edit this post' },
        { status: 403 }
      );
    }

    // Get the updated content from the request body
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Post content is required' },
        { status: 400 }
      );
    }

    // Update the post
    const updatedPost = await postService.updatePost(postId, { content });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}