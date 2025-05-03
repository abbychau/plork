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

export function PinnedUsersProvider({ children, initialPinnedUsers }: { children: ReactNode, initialPinnedUsers?: PinnedUser[] }) {
  const [pinnedUsers, setPinnedUsers] = useState<PinnedUser[]>(initialPinnedUsers || []);
  const [isLoading, setIsLoading] = useState(!initialPinnedUsers);

  // Update pinnedUsers state if initialPinnedUsers prop changes after mount
  useEffect(() => {
    // Update only if initialPinnedUsers is not undefined
    // Avoid resetting to empty array if initialPinnedUsers becomes undefined during logout/auth check
    if (initialPinnedUsers !== undefined) {
      setPinnedUsers(initialPinnedUsers || []); // Use empty array if initialPinnedUsers is null
    }
  }, [initialPinnedUsers]);

  // Load pinned users from API on mount if not provided initially
  useEffect(() => {
    // Skip fetching if we already have initial data
    if (initialPinnedUsers) return;

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
  }, [initialPinnedUsers]);

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
