import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userService, postService } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get the offset from query parameters
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = 20;

    // Check authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get posts that the user has commented on
    const posts = await postService.getPostsWithUserComments(userId);

    // Convert dates to strings
    const formattedPosts = posts.map(post => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      comments: post.comments?.map(comment => ({
        ...comment,
        createdAt: comment.createdAt.toISOString()
      })),
      likes: post.likes?.map(like => ({
        ...like,
        createdAt: like.createdAt.toISOString()
      }))
    }));

    return NextResponse.json({
      posts: formattedPosts.slice(offset, offset + limit),
      nextOffset: offset + limit < formattedPosts.length ? offset + limit : null
    });
  } catch (error) {
    console.error('Error getting responded posts:', error);
    return NextResponse.json(
      { error: 'Failed to get responded posts' },
      { status: 500 }
    );
  }
} 