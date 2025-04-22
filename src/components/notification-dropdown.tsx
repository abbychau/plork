'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications');

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data);
      const newCount = data.filter((n: Notification) => !n.read).length;
      setUnreadCount(newCount);

      // Dispatch event for the DynamicTitle component
      document.dispatchEvent(new CustomEvent('notificationCountUpdated', { detail: { count: newCount } }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [user]);

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
      setUnreadCount(0);

      // Force a refresh of the document title
      document.dispatchEvent(new CustomEvent('notificationCountUpdated', { detail: { count: 0 } }));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
      const newCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newCount);

      // Force a refresh of the document title
      document.dispatchEvent(new CustomEvent('notificationCountUpdated', { detail: { count: newCount } }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map(notification => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-default ${!notification.read ? 'bg-muted/50' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <Link
                  href={getNotificationLink(notification)}
                  className="flex items-start gap-3 w-full"
                  onClick={() => markAsRead(notification.id)}
                  target={notification.type === 'comment' ? "_blank" : undefined}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={notification.actor.profileImage} alt={notification.actor.username} />
                    <AvatarFallback>
                      {notification.actor.displayName?.[0] || notification.actor.username[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="font-medium truncate">
                        {notification.actor.displayName || notification.actor.username}
                      </span>
                      <span>{notification.message}</span>
                    </div>

                    {notification.post && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {notification.post.content}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt))}
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <div className="p-2 border-t text-center">
          <Link href="/notifications" className="text-xs text-primary hover:underline">
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
