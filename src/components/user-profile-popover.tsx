'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/lib/auth-context';
import { usePinnedUsers } from '@/lib/pinned-users-context';
import { useToast } from '@/components/ui/use-toast';
import { User } from 'lucide-react';
import { UserPlus, UserMinus, Pin } from '@mynaui/icons-react';

interface UserData {
  id: string;
  username: string;
  displayName?: string;
  summary?: string;
  profileImage?: string;
  followersCount: number;
  followingCount: number;
  postsCount?: number;
}

interface UserProfilePopoverProps {
  username: string;
  children: React.ReactNode;
  onPin?: (userData: UserData) => void;
}

export default function UserProfilePopover({ username, children, onPin }: UserProfilePopoverProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const { addPinnedUser, removePinnedUser } = usePinnedUsers();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingMe, setIsFollowingMe] = useState(false);
  const [isPinnedUser, setIsPinnedUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  // Fetch user data when popover is opened
  const handleOpenChange = (open: boolean) => {
    if (open && !userData) {
      fetchUserData();
    }
  };

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setUserData(data);

      // Check if current user is following this user
      if (currentUser) {
        const followResponse = await fetch(`/api/users/${username}/follow-status`);
        if (followResponse.ok) {
          const { isFollowing } = await followResponse.json();
          setIsFollowing(isFollowing);
        }

        // Check if this user is following the current user
        const followingMeResponse = await fetch(`/api/users/${username}/is-following-me`);
        if (followingMeResponse.ok) {
          const { isFollowingMe } = await followingMeResponse.json();
          setIsFollowingMe(isFollowingMe);
        }

        // Check if this user is pinned
        const pinResponse = await fetch(`/api/users/${username}/pin-status`);
        if (pinResponse.ok) {
          const { isPinned } = await pinResponse.json();
          setIsPinnedUser(isPinned);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to follow users',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingFollow(true);
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/users/${username}/follow`, {
        method,
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
      }

      setIsFollowing(!isFollowing);
      toast({
        title: isFollowing ? 'Unfollowed' : 'Followed',
        description: isFollowing
          ? `You have unfollowed @${username}`
          : `You are now following @${username}`,
      });
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isFollowing ? 'unfollow' : 'follow'} user`,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const handlePin = async () => {
    if (!userData || !currentUser) return;

    try {
      if (isPinnedUser) {
        // Unpin user
        await removePinnedUser(username);
        setIsPinnedUser(false);
        toast({
          title: 'User unpinned',
          description: `@${username} has been removed from your sidebar`,
        });
      } else {
        // Pin user
        if (onPin) {
          onPin(userData);
        } else {
          await addPinnedUser({
            id: userData.id,
            username: userData.username,
            displayName: userData.displayName,
            profileImage: userData.profileImage
          });
        }
        setIsPinnedUser(true);
        toast({
          title: 'User pinned',
          description: `@${username} has been pinned to your sidebar`,
        });
      }
    } catch (error) {
      console.error('Error pinning/unpinning user:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isPinnedUser ? 'unpin' : 'pin'} user`,
        variant: 'destructive',
      });
    }
  };

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        {isLoading ? (
          <div className="p-4 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : userData ? (
          <div className="flex flex-col">
            <div className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 rounded-lg">
                  <AvatarImage src={userData.profileImage} alt={userData.username} />
                  <AvatarFallback>
                    {userData.displayName?.[0] || userData.username[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <div className="truncate">
                        <p className="font-medium text-lg">{userData.displayName || userData.username}</p>
                        <div className="flex items-center gap-1">
                          <p className="text-sm text-muted-foreground truncate">@{userData.username}</p>
                          {isFollowingMe && currentUser && currentUser.username !== userData.username && (
                            <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Follows you</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {userData.summary && (
                      <p className="text-sm mt-2 text-muted-foreground">{userData.summary}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-4 text-sm">
                <div>
                  <span className="font-medium">{userData.postsCount || 0}</span>{' '}
                  <span className="text-muted-foreground">Posts</span>
                </div>
                <div>
                  <span className="font-medium">{userData.followersCount}</span>{' '}
                  <span className="text-muted-foreground">Followers</span>
                </div>
                <div>
                  <span className="font-medium">{userData.followingCount}</span>{' '}
                  <span className="text-muted-foreground">Following</span>
                </div>
              </div>

              {currentUser && currentUser.username !== userData.username && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button
                    variant={isFollowing ? 'outline' : 'default'}
                    onClick={handleFollow}
                    disabled={isLoadingFollow}
                    className="flex items-center gap-1"
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="h-3 w-3" />
                        <span>Unfollow</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3 w-3" />
                        <span>Follow</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handlePin}
                    className="flex items-center gap-1"
                  >
                    {isPinnedUser ? (
                      <>
                        <Pin className="h-3 w-3" />
                        <span>Unpin</span>
                      </>
                    ) : (
                      <>
                        <Pin className="h-3 w-3" />
                        <span>Pin</span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              {currentUser && currentUser.username !== userData.username && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {isFollowing && isFollowingMe ? (
                    <span>Mutually followed</span>
                  ) : isFollowing ? (
                    <span>Followed by you</span>
                  ) : isFollowingMe ? (
                    <span>Follows you</span>
                  ) : null}
                </div>
              )}
            </div>
            <Separator />
            <div className="p-2">
              <Link href={`/users/${userData.username}`} className="block w-full">
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  View full profile
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            User not found
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
