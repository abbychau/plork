/**
 * Post likes API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { likeService, postService, prisma } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import crypto from 'crypto';

// POST /api/posts/[postId]/likes - Like a post
export async function POST(request: NextRequest, context: { params: Promise<{ postId: string }> }) {
  try {
    // Get the postId from the URL
    const { postId } = (await context.params);

    // Check authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if post exists
    const post = await postService.getPostById(postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user has already liked the post
    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        postId,
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { error: 'Post already liked' },
        { status: 400 }
      );
    }

    // Generate ActivityPub ID for the like
    const baseUrl = `${request.nextUrl.protocol}//${request.headers.get('host')}`;
    const activityId = `${baseUrl}/activities/${crypto.randomBytes(16).toString('hex')}`;

    // Create the like
    const like = await likeService.createLike({
      userId,
      postId,
      activityId,
    });

    // Create notification for the post author (if not the same as the liker)
    if (post.authorId !== userId) {
      await createNotification({
        type: 'like',
        userId: post.authorId, // recipient
        actorId: userId, // who performed the action
        postId: post.id,
        message: 'liked your post',
      });
    }

    return NextResponse.json(like);
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json(
      { error: 'Failed to like post' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[postId]/likes - Unlike a post
export async function DELETE(request: NextRequest, context: { params: Promise<{ postId: string }> }) {
  try {
    // Get the postId from the URL
    const { postId } = (await context.params);

    // Check authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if post exists
    const post = await postService.getPostById(postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Delete the like
    await likeService.deleteLike(userId, postId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unliking post:', error);
    return NextResponse.json(
      { error: 'Failed to unlike post' },
      { status: 500 }
    );
  }
}

// GET /api/posts/[postId]/likes - Get likes for a post
export async function GET(request: NextRequest, context: { params: Promise<{ postId: string }> }) {
  try {
    // Get the postId from the URL
    const { postId } = (await context.params);

    // Check if post exists
    const post = await postService.getPostById(postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Get likes for the post
    const likes = await prisma.like.findMany({
      where: {
        postId,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(likes);
  } catch (error) {
    console.error('Error getting likes:', error);
    return NextResponse.json(
      { error: 'Failed to get likes' },
      { status: 500 }
    );
  }
}
