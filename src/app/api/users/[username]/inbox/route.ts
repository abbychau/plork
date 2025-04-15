/**
 * Inbox endpoint for ActivityPub
 */
import { NextRequest, NextResponse } from 'next/server';
import { userService, activityPubService, followService, likeService } from '@/lib/db';
// import { verifySignature } from '@/lib/http-signature';
import { ActivityType } from '@/lib/activitypub';

// Define interfaces for ActivityPub objects
interface ActivityPubObject {
  id: string;
  type: string;
  [key: string]: any;
}

interface ActivityPubActivity extends ActivityPubObject {
  actor: string;
  object: string | ActivityPubObject;
}

export async function POST(
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

  try {
    // Parse the activity
    const activity = await req.json();

    // Store the activity in the inbox
    await activityPubService.addToInbox({
      userId: user.id,
      activityId: activity.id,
      activityType: activity.type,
      activityJson: JSON.stringify(activity),
    });

    // Process the activity based on its type
    switch (activity.type) {
      case ActivityType.Follow:
        // Handle Follow request
        await handleFollow(activity, user.id);
        break;

      case ActivityType.Accept:
        // Handle Accept (for Follow)
        await handleAccept(activity);
        break;

      case ActivityType.Create:
        // Handle Create (for Note)
        // This would typically involve fetching the created object
        // and storing it in our database, but we'll skip that for now
        break;

      case ActivityType.Like:
        // Handle Like
        await handleLike(activity);
        break;

      case ActivityType.Undo:
        // Handle Undo (for Follow, Like, etc.)
        await handleUndo(activity);
        break;

      default:
        // Unhandled activity type
        console.log(`Unhandled activity type: ${activity.type}`);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error processing inbox activity:', error);
    return NextResponse.json(
      { error: 'Error processing activity' },
      { status: 500 }
    );
  }
}

// Handle Follow activity
async function handleFollow(activity: ActivityPubActivity, userId: string) {
  try {
    // Get the user who is being followed (target user)
    const targetUser = await userService.getUserById(userId);

    if (!targetUser) {
      throw new Error('Target user not found');
    }

    // Get the user who is following (actor)
    // In a real implementation, we would fetch this user from their ActivityPub endpoint
    // For simplicity, we'll assume the actor is a local user
    const actorUsername = activity.actor.split('/').pop();
    const actorUser = await userService.getUserByUsername(actorUsername);

    if (!actorUser) {
      throw new Error('Actor user not found');
    }

    // Create the follow relationship
    await followService.createFollow({
      followerId: actorUser.id,
      followingId: targetUser.id,
      activityId: activity.id,
      accepted: true, // Auto-accept for simplicity
    });

    // In a real implementation, we would send an Accept activity to the actor
  } catch (error) {
    console.error('Error handling Follow activity:', error);
  }
}

// Handle Accept activity
async function handleAccept(activity: ActivityPubActivity) {
  try {
    // Check if this is accepting a Follow
    if (activity.object?.type === ActivityType.Follow) {
      // Find the original Follow activity
      const follow = await followService.getFollowByActivityId(activity.object.id);

      if (follow) {
        // Update the follow to be accepted
        await followService.acceptFollow(follow.id);
      }
    }
  } catch (error) {
    console.error('Error handling Accept activity:', error);
  }
}

// Handle Like activity
async function handleLike(activity: ActivityPubActivity) {
  try {
    // Get the post that was liked
    // In a real implementation, we would fetch this post from its ActivityPub endpoint
    // For simplicity, we'll assume the object is a local post
    const postId = activity.object.split('/').pop();

    // Get the user who liked the post (actor)
    // In a real implementation, we would fetch this user from their ActivityPub endpoint
    // For simplicity, we'll assume the actor is a local user
    const actorUsername = activity.actor.split('/').pop();
    const actorUser = await userService.getUserByUsername(actorUsername);

    if (!actorUser) {
      throw new Error('Actor user not found');
    }

    // Create the like
    await likeService.createLike({
      userId: actorUser.id,
      postId,
      activityId: activity.id,
    });
  } catch (error) {
    console.error('Error handling Like activity:', error);
  }
}

// Handle Undo activity
async function handleUndo(activity: ActivityPubActivity) {
  try {
    // Check what is being undone
    if (activity.object?.type === ActivityType.Follow) {
      // Find the original Follow activity
      const follow = await followService.getFollowByActivityId(activity.object.id);

      if (follow) {
        // Delete the follow
        await followService.deleteFollow(follow.followerId, follow.followingId);
      }
    } else if (activity.object?.type === ActivityType.Like) {
      // Find the original Like activity
      const like = await likeService.getLikeByActivityId(activity.object.id);

      if (like) {
        // Delete the like
        await likeService.deleteLike(like.userId, like.postId);
      }
    }
  } catch (error) {
    console.error('Error handling Undo activity:', error);
  }
}
