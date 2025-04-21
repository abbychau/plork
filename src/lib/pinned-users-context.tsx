'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface PinnedUser {
  id: string;
  username: string;
  displayName?: string;
  profileImage?: string;
  timestamp: number; // For LRU tracking
}

interface PinnedUsersContextType {
  pinnedUsers: PinnedUser[];
  addPinnedUser: (user: Omit<PinnedUser, 'timestamp'>) => Promise<void>;
  removePinnedUser: (username: string) => Promise<void>;
  isPinned: (username: string) => boolean;
  isLoading: boolean;
}

const PinnedUsersContext = createContext<PinnedUsersContextType | undefined>(undefined);

export function PinnedUsersProvider({ children }: { children: ReactNode }) {
  const [pinnedUsers, setPinnedUsers] = useState<PinnedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load pinned users from API on mount
  useEffect(() => {
    const fetchPinnedUsers = async () => {
      try {
        const response = await fetch('/api/pinned-users');
        if (response.ok) {
          const data = await response.json();
          setPinnedUsers(data);
        }
      } catch (error) {
        console.error('Error fetching pinned users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPinnedUsers();
  }, []);

  const addPinnedUser = async (user: Omit<PinnedUser, 'timestamp'>) => {
    try {
      const response = await fetch('/api/pinned-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user.username }),
      });

      if (response.ok) {
        // Refresh the list of pinned users
        const pinnedResponse = await fetch('/api/pinned-users');
        if (pinnedResponse.ok) {
          const data = await pinnedResponse.json();
          setPinnedUsers(data);
        }
      }
    } catch (error) {
      console.error('Error pinning user:', error);
    }
  };

  const removePinnedUser = async (username: string) => {
    try {
      const response = await fetch(`/api/pinned-users?username=${username}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update the local state
        setPinnedUsers(prevUsers => prevUsers.filter(user => user.username !== username));
      }
    } catch (error) {
      console.error('Error unpinning user:', error);
    }
  };

  const isPinned = (username: string) => {
    return pinnedUsers.some(user => user.username === username);
  };

  return (
    <PinnedUsersContext.Provider value={{ pinnedUsers, addPinnedUser, removePinnedUser, isPinned, isLoading }}>
      {children}
    </PinnedUsersContext.Provider>
  );
}

export function usePinnedUsers() {
  const context = useContext(PinnedUsersContext);
  if (context === undefined) {
    throw new Error('usePinnedUsers must be used within a PinnedUsersProvider');
  }
  return context;
}
