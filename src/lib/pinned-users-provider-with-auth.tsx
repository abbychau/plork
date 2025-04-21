'use client';

import { ReactNode } from 'react';
import { PinnedUsersProvider } from './pinned-users-context';
import { useAuth } from './auth-context';

/**
 * A wrapper component that provides pinned users data from auth context
 */
export function PinnedUsersProviderWithAuth({ children }: { children: ReactNode }) {
  const { pinnedUsers } = useAuth();
  
  return (
    <PinnedUsersProvider initialPinnedUsers={pinnedUsers || undefined}>
      {children}
    </PinnedUsersProvider>
  );
}
