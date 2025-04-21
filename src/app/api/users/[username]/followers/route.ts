/**
 * Followers endpoint for ActivityPub
 */
import { NextRequest, NextResponse } from 'next/server';
import { userService, followService } from '@/lib/db';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = (await context.params);

  // Find the user
  const user = await userService.getUserByUsername(username);

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  // Get followers
  const followers = await followService.getFollowers(user.id);

  // Format as ActivityPub collection
  const collection = {
    '@context': 'https://www.w3.org/ns/activitystreams',
    id: user.followersUrl,
    type: 'Collection',
    totalItems: followers.length,
    items: followers.map(follow => follow.follower.actorUrl),
  };

  return NextResponse.json(collection, {
    headers: {
      'Content-Type': 'application/activity+json',
    },
  });
}
