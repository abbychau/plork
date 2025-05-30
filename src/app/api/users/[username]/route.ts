/**
 * User (Actor) endpoint for ActivityPub
 */
import { NextRequest, NextResponse } from 'next/server';
import { userService, followService, postService, prisma } from '@/lib/db';
import { createActorObject } from '@/lib/activitypub';

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

  // Check if the client accepts ActivityPub format
  const accept = req.headers.get('accept') || '';

  if (
    accept.includes('application/activity+json') ||
    accept.includes('application/ld+json')
  ) {
    // Return ActivityPub actor object
    const actorObject = createActorObject(user);

    return NextResponse.json(actorObject, {
      headers: {
        'Content-Type': 'application/activity+json',
      },
    });
  }

  // Get followers and following counts
  const followers = await followService.getFollowers(user.id);
  const following = await followService.getFollowing(user.id);
  // Get post count
  const posts = await postService.getUserPosts(user.id);

  // Get comments count (replies made by this user)
  const repliesCount = await prisma.comment.count({
    where: {
      authorId: user.id
    }
  });

  // Return user data (without sensitive information)
  return NextResponse.json({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    summary: user.summary,
    profileImage: user.profileImage,
    actorUrl: user.actorUrl,
    followersCount: followers.length,
    followingCount: following.length,
    postsCount: posts.length,
    repliesCount: repliesCount,
  });
}
