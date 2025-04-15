/**
 * Following endpoint for ActivityPub
 */
import { NextRequest, NextResponse } from 'next/server';
import { userService, followService } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const { username } = params;
  
  // Find the user
  const user = await userService.getUserByUsername(username);
  
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }
  
  // Get following
  const following = await followService.getFollowing(user.id);
  
  // Format as ActivityPub collection
  const collection = {
    '@context': 'https://www.w3.org/ns/activitystreams',
    id: user.followingUrl,
    type: 'Collection',
    totalItems: following.length,
    items: following.map(follow => follow.following.actorUrl),
  };
  
  return NextResponse.json(collection, {
    headers: {
      'Content-Type': 'application/activity+json',
    },
  });
}
