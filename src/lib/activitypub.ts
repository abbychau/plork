/**
 * ActivityPub utilities for the SNS application
 */
import crypto from 'crypto';

// ActivityPub Context
export const ACTIVITYPUB_CONTEXT = [
  'https://www.w3.org/ns/activitystreams',
  'https://w3id.org/security/v1',
];

// ActivityPub Types
export enum ActivityType {
  Create = 'Create',
  Follow = 'Follow',
  Accept = 'Accept',
  Reject = 'Reject',
  Like = 'Like',
  Announce = 'Announce',
  Undo = 'Undo',
  Delete = 'Delete',
}

export enum ObjectType {
  Note = 'Note',
  Person = 'Person',
}

// Generate ActivityPub ID
export function generateActivityId(baseUrl: string, path: string): string {
  return `${baseUrl}${path}`;
}

// Generate a key pair for ActivityPub signing
export function generateKeyPair(): { privateKey: string; publicKey: string } {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  return { privateKey, publicKey };
}

// Create an Actor object (Person)
export function createActorObject(user: {
  username: string;
  displayName?: string | null;
  summary?: string | null;
  profileImage?: string | null;
  actorUrl: string;
  inboxUrl: string;
  outboxUrl: string;
  followersUrl: string;
  followingUrl: string;
  publicKey: string;
}) {
  const { 
    username, 
    displayName, 
    summary, 
    profileImage, 
    actorUrl, 
    inboxUrl, 
    outboxUrl, 
    followersUrl, 
    followingUrl,
    publicKey
  } = user;

  return {
    '@context': ACTIVITYPUB_CONTEXT,
    id: actorUrl,
    type: ObjectType.Person,
    preferredUsername: username,
    name: displayName || username,
    summary: summary || '',
    icon: profileImage ? { type: 'Image', url: profileImage } : undefined,
    inbox: inboxUrl,
    outbox: outboxUrl,
    followers: followersUrl,
    following: followingUrl,
    publicKey: {
      id: `${actorUrl}#main-key`,
      owner: actorUrl,
      publicKeyPem: publicKey,
    },
  };
}

// Create a Note object
export function createNoteObject(
  id: string,
  content: string,
  actor: string,
  to: string[] = ['https://www.w3.org/ns/activitystreams#Public'],
  cc: string[] = []
) {
  return {
    '@context': ACTIVITYPUB_CONTEXT,
    id,
    type: ObjectType.Note,
    published: new Date().toISOString(),
    attributedTo: actor,
    content,
    to,
    cc,
  };
}

// Create a Create activity for a Note
export function createCreateActivity(
  id: string,
  actor: string,
  object: any,
  to: string[] = ['https://www.w3.org/ns/activitystreams#Public'],
  cc: string[] = []
) {
  return {
    '@context': ACTIVITYPUB_CONTEXT,
    id,
    type: ActivityType.Create,
    actor,
    object,
    published: new Date().toISOString(),
    to,
    cc,
  };
}

// Create a Follow activity
export function createFollowActivity(
  id: string,
  actor: string,
  object: string
) {
  return {
    '@context': ACTIVITYPUB_CONTEXT,
    id,
    type: ActivityType.Follow,
    actor,
    object,
    published: new Date().toISOString(),
  };
}

// Create an Accept activity (for Follow)
export function createAcceptActivity(
  id: string,
  actor: string,
  object: any
) {
  return {
    '@context': ACTIVITYPUB_CONTEXT,
    id,
    type: ActivityType.Accept,
    actor,
    object,
    published: new Date().toISOString(),
  };
}

// Create a Like activity
export function createLikeActivity(
  id: string,
  actor: string,
  object: string
) {
  return {
    '@context': ACTIVITYPUB_CONTEXT,
    id,
    type: ActivityType.Like,
    actor,
    object,
    published: new Date().toISOString(),
  };
}

// Create an Undo activity
export function createUndoActivity(
  id: string,
  actor: string,
  object: any
) {
  return {
    '@context': ACTIVITYPUB_CONTEXT,
    id,
    type: ActivityType.Undo,
    actor,
    object,
    published: new Date().toISOString(),
  };
}

// Create a Delete activity
export function createDeleteActivity(
  id: string,
  actor: string,
  object: any
) {
  return {
    '@context': ACTIVITYPUB_CONTEXT,
    id,
    type: ActivityType.Delete,
    actor,
    object,
    published: new Date().toISOString(),
  };
}
