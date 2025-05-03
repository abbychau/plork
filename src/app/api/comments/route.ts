/**
 * Comments API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userService, postService, commentService } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import crypto from 'crypto';

// GET /api/comments?postId=xxx - Get comments for a post
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

// POST /api/comments?postId=xxx - Create a new comment
export async function POST(request: NextRequest) {
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

    // Get the comment content from the request body
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Generate ActivityPub ID for the comment
    const baseUrl = `${request.nextUrl.protocol}//${request.headers.get('host')}`;
    const activityId = `${baseUrl}/activities/${crypto.randomBytes(16).toString('hex')}`;

    // Create the comment
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

        // Skip if the mentioned user is the commenter
        if (username === user.username) continue;

        // Find the mentioned user
        const mentionedUser = await userService.getUserByUsername(username);

        if (mentionedUser) {
          // Create a notification for the mentioned user
          await createNotification({
            type: 'mention',
            userId: mentionedUser.id, // recipient
            actorId: userId, // who performed the action
            postId: post.id,
            commentId: comment.id,
            message: 'mentioned you in a comment',
          });
        }
      }
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

// PUT /api/comments?commentId=xxx - Update a comment
export async function PUT(request: NextRequest) {
  try {
    // Get the commentId from the query parameters
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
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

    // Get the comment
    const comment = await commentService.getCommentById(commentId);

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if the user is the author of the comment
    if (comment.authorId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to edit this comment' },
        { status: 403 }
      );
    }

    // Get the updated content from the request body
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Update the comment
    const updatedComment = await commentService.updateComment(commentId, { content });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

// DELETE /api/comments?commentId=xxx - Delete a comment
export async function DELETE(request: NextRequest) {
  try {
    // Get the commentId from the query parameters
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
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

    // Get the comment
    const comment = await commentService.getCommentById(commentId);

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if the user is the author of the comment
    if (comment.authorId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this comment' },
        { status: 403 }
      );
    }

    // Delete the comment
    await commentService.deleteComment(commentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}