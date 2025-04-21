'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

export function useTimelineUnread() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const response = await fetch('/api/posts/unread-count');
        
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count || 0);
        } else {
          console.error('Failed to fetch unread timeline count');
          setUnreadCount(0);
        }
      } catch (error) {
        console.error('Error fetching unread timeline count:', error);
        setUnreadCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnreadCount();

    // Set up a refresh interval
    const interval = setInterval(fetchUnreadCount, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [user]);

  return { unreadCount, isLoading };
}
