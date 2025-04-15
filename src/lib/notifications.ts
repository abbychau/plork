/**
 * Notification system for the SNS application
 */
import { prisma } from './db';

export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'share';

interface NotificationData {
  type: NotificationType;
  userId: string; // recipient
  actorId: string; // who performed the action
  postId?: string;
  commentId?: string;
  message: string;
}

/**
 * Create a new notification
 */
export async function createNotification(data: NotificationData) {
  const { type, userId, actorId, postId, commentId, message } = data;
  
  return prisma.notification.create({
    data: {
      type,
      userId,
      actorId,
      postId,
      commentId,
      message,
      read: false,
    },
    include: {
      user: true,
      actor: true,
      post: true,
      comment: true,
    },
  });
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(userId: string, limit = 20, offset = 0) {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    include: {
      actor: true,
      post: {
        include: {
          author: true,
        },
      },
      comment: {
        include: {
          author: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    skip: offset,
  });
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: {
      read: true,
    },
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  });
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string) {
  return prisma.notification.delete({
    where: { id },
  });
}
