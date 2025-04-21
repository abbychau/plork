/**
 * Follow/Unfollow API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userService, followService } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { v4 as uuidv4 } from 'uuid';

// POST /api/users/[username]/follow - Follow a user
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ username: string }> }
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

    const { username } = (await context.params);

    // Find the target user
    const targetUser = await userService.getUserByUsername(username);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Don't allow following yourself
    if (userId === targetUser.id) {
      return NextResponse.json(
        { error: 'You cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if already following
    const existingFollow = await followService.getFollow(userId, targetUser.id);

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Already following this user' },
        { status: 400 }
      );
    }

    // Create a follow
    const activityId = `https://${req.headers.get('host')}/activities/${uuidv4()}`;
    const follow = await followService.createFollow({
      followerId: userId,
      followingId: targetUser.id,
      activityId,
      accepted: true, // Auto-accept for now
    });

    // Create notification for the target user
    try {
      await createNotification({
        type: 'follow',
        userId: targetUser.id, // recipient
        actorId: userId, // who performed the action
        message: 'started following you',
      });
      console.log('Follow notification created for user:', targetUser.id);
    } catch (notificationError) {
      console.error('Error creating follow notification:', notificationError);
      // Continue even if notification creation fails
    }

    return NextResponse.json({
      message: `Now following ${username}`,
      follow,
    });
  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json(
      { error: 'Failed to follow user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[username]/follow - Unfollow a user
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ username: string }> }
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

    const { username } = (await context.params);

    // Find the target user
    const targetUser = await userService.getUserByUsername(username);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete the follow
    await followService.deleteFollow(userId, targetUser.id);

    return NextResponse.json({
      message: `Unfollowed ${username}`,
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json(
      { error: 'Failed to unfollow user' },
      { status: 500 }
    );
  }
}
