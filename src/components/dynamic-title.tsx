'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function DynamicTitle() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotificationCount = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/notifications/count');

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotificationCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);

    // Listen for notification count updates from NotificationDropdown
    const handleNotificationUpdate = (event: CustomEvent) => {
      if (event.detail && typeof event.detail.count === 'number') {
        setUnreadCount(event.detail.count);
      }
    };

    document.addEventListener('notificationCountUpdated', handleNotificationUpdate as EventListener);

    return () => {
      clearInterval(interval);
      document.removeEventListener('notificationCountUpdated', handleNotificationUpdate as EventListener);
    };
  }, [user]);

  useEffect(() => {
    // Update the document title based on notification count and user
    if (user) {
      const displayName = user.displayName || user.username;
      document.title = unreadCount > 0
        ? `(${unreadCount}) ${displayName} - Plork`
        : `${displayName} - Plork`;
    } else {
      document.title = 'Plork - ActivityPub SNS';
    }
  }, [unreadCount, user]);

  // This component doesn't render anything visible
  return null;
}
