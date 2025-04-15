/**
 * Follow/Unfollow API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userService, followService } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// POST /api/follow - Follow a user
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

    // Get username from request body
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

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

// DELETE /api/follow - Unfollow a user
export async function DELETE(req: NextRequest) {
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

    // Get username from URL search params or request body
    let username;

    // First try to get from URL search params
    const url = new URL(req.url);
    username = url.searchParams.get('username');

    // If not found in URL, try to get from request body
    if (!username) {
      try {
        const body = await req.json();
        username = body.username;
      } catch {
        // If parsing JSON fails, that's okay, we'll check if username exists below
      }
    }

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

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
