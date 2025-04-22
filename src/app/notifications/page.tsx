'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'share';
  message: string;
  read: boolean;
  createdAt: string;
  actor: {
    id: string;
    username: string;
    displayName?: string;
    profileImage?: string;
  };
  post?: {
    id: string;
    content: string;
  };
  comment?: {
    id: string;
    content: string;
  };
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/notifications');

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user, router]);

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }

      // Update local state
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'mention':
        return notification.post ? `/posts/${notification.post.id}` : '#';
      case 'follow':
        return `/users/${notification.actor.username}`;
      default:
        return '#';
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>

        {notifications.some(n => !n.read) && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">You don&apos;t have any notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <Link
              key={notification.id}
              href={getNotificationLink(notification)}
              target={notification.type === 'comment' ? "_blank" : undefined}
            >
              <Card className={`hover:border-primary/20 transition-colors ${!notification.read ? 'bg-muted/30' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={notification.actor.profileImage} alt={notification.actor.username} />
                      <AvatarFallback>
                        {notification.actor.displayName?.[0] || notification.actor.username[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1">
                        <Link
                          href={`/users/${notification.actor.username}`}
                          className="font-semibold hover:underline"
                          onClick={e => e.stopPropagation()}
                        >
                          {notification.actor.displayName || notification.actor.username}
                        </Link>
                        <span>{notification.message}</span>
                      </div>

                      {notification.post && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.post.content}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
