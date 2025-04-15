/**
 * Outbox endpoint for ActivityPub
 */
import { NextRequest, NextResponse } from 'next/server';
import { userService, activityPubService, postService } from '@/lib/db';
import {
  ActivityType,
  ObjectType
} from '@/lib/activitypub';

// Define interfaces for ActivityPub objects
interface ActivityPubObject {
  id: string;
  type: string;
  content?: string;
  [key: string]: any;
}

interface ActivityPubActivity {
  id: string;
  type: string;
  actor: string;
  object: string | ActivityPubObject;
  [key: string]: any;
}

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

  // Get outbox items
  const outboxItems = await activityPubService.getOutbox(user.id);

  // Format as ActivityPub collection
  const collection = {
    '@context': 'https://www.w3.org/ns/activitystreams',
    id: user.outboxUrl,
    type: 'OrderedCollection',
    totalItems: outboxItems.length,
    orderedItems: outboxItems.map(item => JSON.parse(item.activityJson)),
  };

  return NextResponse.json(collection, {
    headers: {
      'Content-Type': 'application/activity+json',
    },
  });
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

    // Handle different activity types
    switch (activity.type) {
      case ActivityType.Create:
        // Handle Create activity (e.g., creating a new post)
        if (activity.object?.type === ObjectType.Note) {
          await handleCreateNote(activity, user);
        }
        break;

      case ActivityType.Follow:
        // Handle Follow activity
        await handleFollow(activity, user);
        break;

      case ActivityType.Like:
        // Handle Like activity
        await handleLike(activity, user);
        break;

      case ActivityType.Undo:
        // Handle Undo activity
        await handleUndo(activity, user);
        break;

      default:
        return NextResponse.json(
          { error: 'Unsupported activity type' },
          { status: 400 }
        );
    }

    // Store the activity in the outbox
    await activityPubService.addToOutbox({
      userId: user.id,
      activityId: activity.id,
      activityType: activity.type,
      activityJson: JSON.stringify(activity),
    });

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error processing outbox activity:', error);
    return NextResponse.json(
      { error: 'Error processing activity' },
      { status: 500 }
    );
  }
}

// Handle creating a new Note
async function handleCreateNote(activity: ActivityPubActivity, user: { id: string }) {
  try {
    // Create the post in our database
    await postService.createPost({
      content: activity.object.content,
      authorId: user.id,
      activityId: activity.id,
    });

    // In a real implementation, we would deliver this activity to followers
  } catch (error) {
    console.error('Error handling Create Note activity:', error);
    throw error;
  }
}

// Handle Follow activity
async function handleFollow(activity: ActivityPubActivity, user: { id: string }) {
  // In a real implementation, we would deliver this activity to the target user
  // and handle the follow relationship in our database
}

// Handle Like activity
async function handleLike(activity: ActivityPubActivity, user: { id: string }) {
  // In a real implementation, we would deliver this activity to the post author
  // and handle the like in our database
}

// Handle Undo activity
async function handleUndo(activity: ActivityPubActivity, user: { id: string }) {
  // In a real implementation, we would deliver this activity to the relevant users
  // and handle the undo in our database
}
