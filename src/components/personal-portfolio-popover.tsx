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
import { useTheme } from '@/lib/theme-context';
import SettingsModal from '@/components/settings-modal';
import { useToast } from '@/components/ui/use-toast';
import {
  User,
  LogOut,
  Info,
  Code,
  Activity,
  Sun,
  Moon,
  Laptop,
  Settings,
} from 'lucide-react';

interface PersonalPortfolioPopoverProps {
  isCollapsed?: boolean;
}

export default function PersonalPortfolioPopover({ isCollapsed = false }: PersonalPortfolioPopoverProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState<{
    followersCount: number;
    followingCount: number;
    postsCount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch additional user data when popover is opened
  const handleOpenChange = (open: boolean) => {
    if (open && !userData && user) {
      fetchUserData();
    }
  };

  const fetchUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${user.username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      setUserData({
        followersCount: data.followersCount || 0,
        followingCount: data.followingCount || 0,
        postsCount: data.postsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out',
        variant: 'destructive',
      });
    }
  };

  if (!user) return null;

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={`flex items-center gap-2 rounded-md p-2 hover:bg-muted transition-colors w-full ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profileImage} alt={user.username} />
            <AvatarFallback>
              {user.displayName?.[0] || user.username[0]}
            </AvatarFallback>
          </Avatar>

          {!isCollapsed && (
            <div className="flex flex-col text-sm text-left">
              <span className="font-medium">{user.displayName || user.username}</span>
              <span className="text-xs text-muted-foreground">@{user.username}</span>
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align={isCollapsed ? "center" : "end"} side="top">
        {isLoading ? (
          <div className="p-4 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.profileImage} alt={user.username} />
                  <AvatarFallback>
                    {user.displayName?.[0] || user.username[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col">
                    <p className="font-medium text-lg">{user.displayName || user.username}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                    {user.summary && (
                      <p className="text-sm mt-2 line-clamp-2">{user.summary}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {userData && (
                <div className="flex gap-4 mt-4 text-sm">
                  <div>
                    <span className="font-medium">{userData.postsCount}</span>{' '}
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
              )}
            </div>
            
            <Separator />
            
            <div className="p-2">
              <div className="grid grid-cols-1 gap-1">
                <Link href={`/users/${user.username}`} className="w-full">
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Button>
                </Link>
                
                <SettingsModal triggerElement={
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Button>
                } />
                
                

              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
