/**
 * Database service for the SNS application
 */
import { PrismaClient } from '@prisma/client';
import { generateKeyPair } from './activitypub';
import bcrypt from 'bcryptjs';

// Create a singleton instance of PrismaClient
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// User service
export const userService = {
  // Create a new user
  async createUser(data: {
    username: string;
    displayName?: string;
    summary?: string;
    email?: string;
    password: string;
    profileImage?: string;
    baseUrl: string;
  }) {
    const { username, displayName, summary, email, password, profileImage, baseUrl } = data;

    // Generate password hash
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate key pair for ActivityPub
    const { privateKey, publicKey } = generateKeyPair();

    // Create ActivityPub URLs
    const actorUrl = `${baseUrl}/users/${username}`;
    const inboxUrl = `${actorUrl}/inbox`;
    const outboxUrl = `${actorUrl}/outbox`;
    const followersUrl = `${actorUrl}/followers`;
    const followingUrl = `${actorUrl}/following`;

    // Create user in database
    return prisma.user.create({
      data: {
        username,
        displayName,
        summary,
        email,
        passwordHash,
        privateKey,
        publicKey,
        profileImage,
        actorUrl,
        inboxUrl,
        outboxUrl,
        followersUrl,
        followingUrl,
      },
    });
  },

  // Get user by username
  async getUserByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    });
  },

  // Get user by ID
  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  // Verify user password
  async verifyPassword(user: { passwordHash: string }, password: string) {
    return bcrypt.compare(password, user.passwordHash);
  },
};

// Post service
export const postService = {
  // Create a new post
  async createPost(data: {
    content: string;
    authorId: string;
    activityId: string;
  }) {
    const { content, authorId, activityId } = data;

    return prisma.post.create({
      data: {
        content,
        authorId,
        activityId,
      },
      include: {
        author: true,
      },
    });
  },

  // Get post by ID
  async getPostById(id: string) {
    return prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        likes: {
          include: {
            user: true,
          },
        },
        comments: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  },

  // Get post by ActivityPub ID
  async getPostByActivityId(activityId: string) {
    return prisma.post.findUnique({
      where: { activityId },
      include: {
        author: true,
        comments: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  },

  // Get posts for a specific user
  async getUserPosts(userId: string, limit = 20, offset = 0) {
    return prisma.post.findMany({
      where: {
        authorId: userId,
      },
      include: {
        author: true,
        likes: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  },

  // Get posts for timeline
  async getTimelinePosts(userId: string, limit = 20, offset = 0) {
    // Get posts from users that the current user follows
    const following = await prisma.follow.findMany({
      where: {
        followerId: userId,
        accepted: true,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = following.map((f) => f.followingId);

    // Include the user's own posts
    followingIds.push(userId);

    return prisma.post.findMany({
      where: {
        authorId: {
          in: followingIds,
        },
      },
      include: {
        author: true,
        likes: {
          include: {
            user: true,
          },
        },
        comments: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  },

  // Update a post
  async updatePost(id: string, data: { content: string }) {
    return prisma.post.update({
      where: { id },
      data: {
        content: data.content,
        updatedAt: new Date(),
      },
      include: {
        author: true,
        likes: true,
        comments: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  },

  // Delete a post
  async deletePost(id: string) {
    return prisma.post.delete({
      where: { id },
    });
  },
};

// Comment service
export const commentService = {
  // Create a comment
  async createComment(data: {
    content: string;
    authorId: string;
    postId: string;
    activityId: string;
  }) {
    const { content, authorId, postId, activityId } = data;

    return prisma.comment.create({
      data: {
        content,
        authorId,
        postId,
        activityId,
      },
      include: {
        author: true,
        post: {
          include: {
            author: true,
          },
        },
      },
    });
  },

  // Get comments for a post
  async getCommentsForPost(postId: string, limit = 50, offset = 0) {
    return prisma.comment.findMany({
      where: {
        postId,
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
      skip: offset,
    });
  },

  // Get a comment by ID
  async getCommentById(id: string) {
    return prisma.comment.findUnique({
      where: { id },
      include: {
        author: true,
        post: {
          include: {
            author: true,
          },
        },
      },
    });
  },

  // Update a comment
  async updateComment(id: string, data: { content: string }) {
    return prisma.comment.update({
      where: { id },
      data: {
        content: data.content,
        updatedAt: new Date(),
      },
      include: {
        author: true,
        post: {
          include: {
            author: true,
          },
        },
      },
    });
  },

  // Delete a comment
  async deleteComment(id: string) {
    return prisma.comment.delete({
      where: { id },
    });
  },

  // Get comment by ActivityPub ID
  async getCommentByActivityId(activityId: string) {
    return prisma.comment.findUnique({
      where: { activityId },
      include: {
        author: true,
        post: true,
      },
    });
  },
};

// Like service
export const likeService = {
  // Create a like
  async createLike(data: {
    userId: string;
    postId: string;
    activityId: string;
  }) {
    const { userId, postId, activityId } = data;

    return prisma.like.create({
      data: {
        userId,
        postId,
        activityId,
      },
      include: {
        user: true,
        post: {
          include: {
            author: true,
          },
        },
      },
    });
  },

  // Delete a like
  async deleteLike(userId: string, postId: string) {
    return prisma.like.deleteMany({
      where: {
        userId,
        postId,
      },
    });
  },

  // Get like by ActivityPub ID
  async getLikeByActivityId(activityId: string) {
    return prisma.like.findUnique({
      where: { activityId },
      include: {
        user: true,
        post: true,
      },
    });
  },
};

// Follow service
export const followService = {
  // Create a follow request
  async createFollow(data: {
    followerId: string;
    followingId: string;
    activityId: string;
    accepted?: boolean;
  }) {
    const { followerId, followingId, activityId, accepted = false } = data;

    return prisma.follow.create({
      data: {
        followerId,
        followingId,
        activityId,
        accepted,
      },
      include: {
        follower: true,
        following: true,
      },
    });
  },

  // Accept a follow request
  async acceptFollow(id: string) {
    return prisma.follow.update({
      where: { id },
      data: {
        accepted: true,
      },
      include: {
        follower: true,
        following: true,
      },
    });
  },

  // Delete a follow
  async deleteFollow(followerId: string, followingId: string) {
    return prisma.follow.deleteMany({
      where: {
        followerId,
        followingId,
      },
    });
  },

  // Get follow by ActivityPub ID
  async getFollowByActivityId(activityId: string) {
    return prisma.follow.findUnique({
      where: { activityId },
      include: {
        follower: true,
        following: true,
      },
    });
  },

  // Get followers for a user
  async getFollowers(userId: string) {
    return prisma.follow.findMany({
      where: {
        followingId: userId,
        accepted: true,
      },
      include: {
        follower: true,
      },
    });
  },

  // Get following for a user
  async getFollowing(userId: string) {
    return prisma.follow.findMany({
      where: {
        followerId: userId,
        accepted: true,
      },
      include: {
        following: true,
      },
    });
  },

  // Get specific follow relationship
  async getFollow(followerId: string, followingId: string) {
    return prisma.follow.findFirst({
      where: {
        followerId,
        followingId,
      },
    });
  },
};

// ActivityPub inbox/outbox service
export const activityPubService = {
  // Add item to inbox
  async addToInbox(data: {
    userId: string;
    activityId: string;
    activityType: string;
    activityJson: string;
  }) {
    const { userId, activityId, activityType, activityJson } = data;

    return prisma.inboxItem.create({
      data: {
        userId,
        activityId,
        activityType,
        activityJson,
      },
    });
  },

  // Add item to outbox
  async addToOutbox(data: {
    userId: string;
    activityId: string;
    activityType: string;
    activityJson: string;
  }) {
    const { userId, activityId, activityType, activityJson } = data;

    return prisma.outboxItem.create({
      data: {
        userId,
        activityId,
        activityType,
        activityJson,
      },
    });
  },

  // Get inbox items for a user
  async getInbox(userId: string, limit = 20, offset = 0) {
    return prisma.inboxItem.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  },

  // Get outbox items for a user
  async getOutbox(userId: string, limit = 20, offset = 0) {
    return prisma.outboxItem.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  },

  // Mark inbox item as processed
  async markInboxItemProcessed(id: string) {
    return prisma.inboxItem.update({
      where: { id },
      data: {
        processed: true,
      },
    });
  },
};
