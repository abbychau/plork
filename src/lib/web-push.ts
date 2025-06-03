/**
 * Web Push notification utilities
 */
import webpush from 'web-push';
import { prisma } from './db';

// VAPID keys configuration
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
};

// Configure web-push
if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:noreply@m2np.com', // Contact email for push notifications (using dev domain)
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
} else {
  console.warn('VAPID keys not configured - push notifications will not work');
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
}

/**
 * Save a push subscription to the database
 */
export async function savePushSubscription(
  userId: string,
  subscription: PushSubscriptionData,
  userAgent?: string
) {
  return prisma.pushSubscription.upsert({
    where: {
      userId_endpoint: {
        userId,
        endpoint: subscription.endpoint,
      },
    },
    update: {
      p256dhKey: subscription.keys.p256dh,
      authKey: subscription.keys.auth,
      userAgent,
      active: true,
      updatedAt: new Date(),
    },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dhKey: subscription.keys.p256dh,
      authKey: subscription.keys.auth,
      userAgent,
      active: true,
    },
  });
}

/**
 * Get all active push subscriptions for a user
 */
export async function getUserPushSubscriptions(userId: string) {
  return prisma.pushSubscription.findMany({
    where: {
      userId,
      active: true,
    },
  });
}

/**
 * Send a push notification to a user
 */
export async function sendPushNotificationToUser(
  userId: string,
  payload: PushNotificationPayload
) {
  if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
    console.warn('VAPID keys not configured, skipping push notification');
    return { success: false, error: 'VAPID keys not configured' };
  }

  const subscriptions = await getUserPushSubscriptions(userId);
  
  if (subscriptions.length === 0) {
    return { success: true, message: 'No active subscriptions found' };
  }

  const results = await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dhKey,
            auth: subscription.authKey,
          },
        };

        const notificationPayload = JSON.stringify({
          title: payload.title,
          body: payload.body,
          url: payload.url || '/',
          icon: payload.icon || '/icons/icon-192x192.png',
          badge: payload.badge || '/icons/icon-72x72.png',
        });

        await webpush.sendNotification(pushSubscription, notificationPayload);
        return { success: true, subscriptionId: subscription.id };
      } catch (error: any) {
        console.error('Push notification failed:', error);
        
        // If the subscription is invalid, mark it as inactive
        if (error.statusCode === 410 || error.statusCode === 404) {
          await prisma.pushSubscription.update({
            where: { id: subscription.id },
            data: { active: false },
          });
        }
        
        return { 
          success: false, 
          subscriptionId: subscription.id, 
          error: error.message 
        };
      }
    })
  );

  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.filter(r => r.status === 'rejected' || !r.value.success).length;

  return {
    success: successful > 0,
    message: `Push notifications sent: ${successful} successful, ${failed} failed`,
    results,
  };
}

/**
 * Remove a push subscription
 */
export async function removePushSubscription(userId: string, endpoint: string) {
  return prisma.pushSubscription.updateMany({
    where: {
      userId,
      endpoint,
    },
    data: {
      active: false,
    },
  });
}

/**
 * Get VAPID public key for client-side subscription
 */
export function getVapidPublicKey() {
  return vapidKeys.publicKey;
}
