/**
 * Debug API endpoint
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userService, followService, prisma } from '@/lib/db';

// GET /api/debug - Debug endpoint
export async function GET() {
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

    // Get the current user
    const currentUser = await userService.getUserById(userId);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all users
    const users = await prisma.user.findMany();

    // Get following
    const following = await followService.getFollowing(userId);

    // Get followers
    const followers = await followService.getFollowers(userId);

    return NextResponse.json({
      currentUser,
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
      })),
      following: following.map(f => ({
        id: f.following.id,
        username: f.following.username,
        displayName: f.following.displayName,
      })),
      followers: followers.map(f => ({
        id: f.follower.id,
        username: f.follower.username,
        displayName: f.follower.displayName,
      })),
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Debug error' },
      { status: 500 }
    );
  }
}
