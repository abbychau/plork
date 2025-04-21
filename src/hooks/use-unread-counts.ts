'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

export function useUnreadCounts(usernames: string[]) {
  const { user } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (!user || usernames.length === 0) return;

      setIsLoading(true);
      const counts: Record<string, number> = {};

      try {
        // Fetch unread counts for each username
        await Promise.all(
          usernames.map(async (username) => {
            try {
              const response = await fetch(`/api/users/unread-count?username=${encodeURIComponent(username)}`);

              if (response.ok) {
                const data = await response.json();
                counts[username] = data.count || 0;
              } else {
                console.error(`Failed to fetch unread count for ${username}`);
                counts[username] = 0;
              }
            } catch (error) {
              console.error(`Error fetching unread count for ${username}:`, error);
              counts[username] = 0;
            }
          })
        );

        setUnreadCounts(counts);
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnreadCounts();

    // Set up a refresh interval
    const interval = setInterval(fetchUnreadCounts, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [user, usernames.join(',')]);

  return { unreadCounts, isLoading };
}
