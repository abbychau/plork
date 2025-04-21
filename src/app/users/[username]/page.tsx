'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import AppLayout from '@/components/app-layout';

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

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

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

      // Fetch follow status if user is logged in
      let followStatus = false;
      if (currentUser) {
        try {
          const followResponse = await fetch(`/api/users/${username}/follow-status`);
          if (followResponse.ok) {
            const followData = await followResponse.json();
            followStatus = followData.isFollowing;
          }
        } catch (error) {
          console.error('Error fetching follow status:', error);
        }

        // Mark posts as read when visiting a profile
        if (currentUser.username !== username) {
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
      }

      // Set the data
      setUser({
        ...userData,
        followersCount: userData.followersCount || 0,
        followingCount: userData.followingCount || 0,
      });
      setIsFollowing(followStatus);
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

  const handleFollow = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      if (isFollowing) {
        // Unfollow - use DELETE with query parameter
        const response = await fetch(`/api/follow?username=${encodeURIComponent(username)}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsFollowing(false);
          // Refresh user data to update follower count
          fetchUserProfile();
        }
      } else {
        // Follow - use POST with JSON body
        const response = await fetch('/api/follow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        });

        if (response.ok) {
          setIsFollowing(true);
          // Refresh user data to update follower count
          fetchUserProfile();

          // Show toast notification
          toast({
            title: "Following",
            description: `You are now following ${user?.displayName || username}. They will be notified.`,
            duration: 3000
          });
        }
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  if (isLoading) {
    return (
    <div className="flex justify-center py-20 text-center ">
      
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      <p className="ml-2 ">Loading...</p>
    </div>
    );
  }

  if (error || !user) {
    return <div className="flex justify-center py-12 text-red-500">{error || 'User not found'}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <AppLayout
        apiEndpoint={`/api/posts?username=${username}`}
        title={
          <div className="flex items-center gap-3 -mb-1">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.profileImage} alt={user.username} />
              <AvatarFallback>
                {user.displayName?.[0] || user.username[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="font-bold">{user.displayName || user.username}</span>
              <span className="text-muted-foreground ml-2 text-sm font-medium">@{user.username}</span>
              
            </div>
          </div>
        }
        showSearch={false}
        showNewPostButton={false}
      />
    </div>
  );
}
