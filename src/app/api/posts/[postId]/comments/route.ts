/**
 * Comments API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userService, postService, commentService, prisma } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import crypto from 'crypto';

// GET /api/posts/[postId]/comments - Get comments for a post
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
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

    // Get comments for the post
    const comments = await commentService.getCommentsForPost(postId);

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error getting comments:', error);
    return NextResponse.json(
      { error: 'Failed to get comments' },
      { status: 500 }
    );
  }
}

// POST /api/posts/[postId]/comments - Create a new comment
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
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

    // Generate ActivityPub ID
    const baseUrl = `${req.nextUrl.protocol}//${req.headers.get('host')}`;
    const activityId = `${baseUrl}/activities/${crypto.randomBytes(16).toString('hex')}`;

    // Create the comment in the database
    const comment = await commentService.createComment({
      content,
      authorId: userId,
      postId,
      activityId,
    });

    // Create notification for the post author (if not the same as the commenter)
    if (post.authorId !== userId) {
      await createNotification({
        type: 'comment',
        userId: post.authorId, // recipient
        actorId: userId, // who performed the action
        postId: post.id,
        commentId: comment.id,
        message: 'commented on your post',
      });
    }

    // Check for mentions in the comment content and create notifications
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const mentions = content.match(mentionRegex);

    if (mentions) {
      const uniqueMentions = [...new Set(mentions)];

      for (const mention of uniqueMentions) {
        const username = mention.substring(1); // Remove the @ symbol

        // Find the mentioned user
        const mentionedUser = await prisma.user.findUnique({
          where: { username },
        });

        if (mentionedUser && mentionedUser.id !== userId && mentionedUser.id !== post.authorId) {
          await createNotification({
            type: 'mention',
            userId: mentionedUser.id,
            actorId: userId,
            postId: post.id,
            commentId: comment.id,
            message: 'mentioned you in a comment',
          });
        }
      }
    }

    // Return the created comment
    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
