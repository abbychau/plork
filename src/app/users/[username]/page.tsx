'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

import { useAuth } from '@/lib/auth-context';
import ResponsiveAppLayout from '@/components/responsive-app-layout';
import PostList from '@/components/post-list';
import UserProfilePopover from '@/components/user-profile-popover';
import { usePinnedUsers } from '@/lib/pinned-users-context';

interface User {
  id: string;
  username: string;
  displayName?: string;
  summary?: string;
  profileImage?: string;
  actorUrl: string;
  followersCount: number;
  followingCount: number;
  postsCount?: number;
}

// Separate component for user profile content
function UserProfileContent() {
  const params = useParams();
  const { user: currentUser } = useAuth();
  const { addPinnedUser } = usePinnedUsers();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const username = params.username as string;

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      // Fetch user data
      const userResponse = await fetch(`/api/users/${username}`);
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user');
      }
      const userData = await userResponse.json();

      // Mark posts as read when visiting a profile
      if (currentUser && currentUser.username !== username) {
        try {
          await fetch('/api/users/read-state', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ authorUsername: username }),
          });
        } catch (error) {
          console.error('Error updating read state:', error);
        }
      }

      // Set the data
      setUser({
        ...userData,
        followersCount: userData.followersCount || 0,
        followingCount: userData.followingCount || 0,
      });

    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [username, currentUser]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading user profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div className="flex justify-start text-red-500 p-4">
        {error || 'User not found'}
      </div>
    );
  }

  // Normal render with user data
  return (
    <PostList
      apiEndpoint={`/api/posts?username=${username}`}
      title={
        <div className="flex items-center gap-3 -mb-1">
          <UserProfilePopover
            username={user.username}
            onPin={() => addPinnedUser({
              id: user.id,
              username: user.username,
              displayName: user.displayName,
              profileImage: user.profileImage
            })}
          >
            <div className="cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImage} alt={user.username} />
                <AvatarFallback>
                  {user.displayName?.[0] || user.username[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </UserProfilePopover>
          <div>
            <span className="font-bold">{user.displayName || user.username}</span>
            <span className="text-muted-foreground ml-2 text-sm font-medium">@{user.username}</span>
          </div>
        </div>
      }
      showSearch={false}
      showNewPostButton={false}
    />
  );
}

// Main page component without Suspense boundary since ResponsiveAppLayout provides it
export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  return (
    <ResponsiveAppLayout
      title={`@${username}`}
      apiEndpoint={`/api/posts?username=${username}`}
    >
      <UserProfileContent />
    </ResponsiveAppLayout>
  );
}
