/**
 * Posts API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userService, postService } from '@/lib/db';
// import { generateActivityId, createNoteObject, createCreateActivity } from '@/lib/activitypub';
import crypto from 'crypto';
import { getBaseUrl } from '@/lib/config';

// GET /api/posts - Get posts for the timeline
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const username = searchParams.get('username');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let posts;

    if (username) {
      // Get posts for a specific user
      const user = await userService.getUserByUsername(username);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      posts = await postService.getUserPosts(user.id, limit, offset);
    } else {
      // Get timeline posts for the current user
      posts = await postService.getTimelinePosts(userId, limit, offset);
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error getting posts:', error);
    return NextResponse.json(
      { error: 'Failed to get posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get the user
    const user = await userService.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse the request body
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Generate ActivityPub IDs
    // Use the configured domain name instead of the request host
    const protocol = req.nextUrl.protocol === 'https:' ? 'https' : 'http';
    const baseUrl = getBaseUrl(protocol);
    // const postId = crypto.randomBytes(16).toString('hex');
    // const noteId = `${baseUrl}/posts/${postId}`;
    const activityId = `${baseUrl}/activities/${crypto.randomBytes(16).toString('hex')}`;

    // Create the post in the database
    const post = await postService.createPost({
      content,
      authorId: userId,
      activityId,
    });

    // Return the created post
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
