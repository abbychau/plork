/**
 * Utility functions for pinned users
 */
import { PinnedUser } from './pinned-users-context';

/**
 * Fetch pinned users from the API
 * @returns Promise that resolves to an array of pinned users
 */
export async function fetchPinnedUsers(): Promise<PinnedUser[]> {
  try {
    const response = await fetch('/api/pinned-users');
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Error fetching pinned users:', error);
    return [];
  }
}
