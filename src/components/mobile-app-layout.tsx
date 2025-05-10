'use client';

import { useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { PostProvider } from '@/lib/post-context';
import { useAuth } from '@/lib/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import PostList from '@/components/post-list';
import PostDisplay from '@/components/post-display';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Compass, User, MessageSquare, ArrowLeft } from 'lucide-react';
import { Heart } from '@mynaui/icons-react';
import CreatePostModal from '@/components/create-post-modal';
import NotificationDropdown from '@/components/notification-dropdown';
import { SimpleThemeToggle } from '@/components/simple-theme-toggle';

interface MobileAppLayoutProps {
  children?: ReactNode;
  initialPosts?: any[];
  apiEndpoint?: string;
  title?: string;
  showSearch?: boolean;
  showNewPostButton?: boolean;
  tag?: string;
  searchQuery?: string;
  tabs?: { label: string; value: string }[];
  isTagsPage?: boolean;
}

export default function MobileAppLayout({
  children,
  initialPosts,
  apiEndpoint,
  title,
  showSearch = false,
  showNewPostButton = false,
  tag,
  searchQuery,
  tabs,
  isTagsPage = false,
}: MobileAppLayoutProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  // Update refreshKey when tab changes to force reload of posts
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [activeTab]);

  // Determine which tab should be active based on the current path
  useEffect(() => {
    if (pathname.includes('/timeline')) {
      setActiveTab('feed');
    } else if (pathname.includes('/explore')) {
      setActiveTab('explore');
    } else if (pathname.includes('/my-posts') || pathname.includes('/users/')) {
      setActiveTab('myposts');
    } else if (pathname.includes('/liked')) {
      setActiveTab('liked');
    }
  }, [pathname]);

  // Listen for post selection from the PostProvider
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedPostId') {
        setSelectedPost(e.newValue);
      }
    };

    // Custom event listener for direct communication
    const handlePostSelected = (e: CustomEvent) => {
      setSelectedPost(e.detail.postId);
    };

    // Check if localStorage is available (client-side only)
    if (typeof window !== 'undefined') {
      const storedPostId = localStorage.getItem('selectedPostId');
      if (storedPostId) {
        setSelectedPost(storedPostId);
      }

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('postSelected' as any, handlePostSelected);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('postSelected' as any, handlePostSelected);
      }
    };
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Navigate to the corresponding page
    switch (value) {
      case 'feed':
        router.push('/timeline');
        break;
      case 'explore':
        router.push('/explore');
        break;
      case 'myposts':
        router.push(`/users/${user?.username}`);
        break;
      case 'liked':
        router.push('/liked');
        break;
    }
  };

  const handleBackToFeed = () => {
    setSelectedPost(null);
    localStorage.removeItem('selectedPostId');
    // Dispatch a custom event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'selectedPostId',
        newValue: null
      }));
    }
  };

  if (!user) return null;

  return (
    <PostProvider>
      <TooltipProvider delayDuration={0}>
        <div className="h-full flex flex-col">
          {/* Top Bar - Fixed position */}
          <div className="sticky top-0 z-20 bg-background flex items-center justify-between p-3 border-b w-full">
            <div className="flex items-center gap-2">
              {selectedPost ? (
                <Button variant="ghost" size="icon" onClick={handleBackToFeed}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              ) : (
                <h1 className="text-lg font-semibold">{title || "Plork"}</h1>
              )}
            </div>
            <div className="flex items-center gap-2">
              <SimpleThemeToggle />
              <NotificationDropdown />
              <CreatePostModal compact triggerClassName="h-8 w-8" />
            </div>
          </div>

          {/* Main Content - with padding to ensure content isn't hidden under fixed bars */}
          <div className="flex-1 overflow-hidden">
            {selectedPost ? (
              <ScrollArea className="h-full pb-[calc(3.5rem+env(safe-area-inset-bottom,0))]">
                <PostDisplay />
              </ScrollArea>
            ) : (
              <>
                {children || (
                  <div className="h-full">
                    <ScrollArea
                      className="h-full"
                      key={`scroll-area-${refreshKey}`}
                    >
                      <div className="pb-[calc(3.5rem+env(safe-area-inset-bottom,0))]">
                        <PostList
                          initialPosts={initialPosts}
                          apiEndpoint={apiEndpoint}
                          title={title}
                          showSearch={showSearch}
                          showNewPostButton={showNewPostButton}
                          tag={tag}
                          searchQuery={searchQuery}
                          tabs={tabs ? {
                            defaultValue: tabs[0]?.value || '',
                            items: tabs.map(tab => ({ value: tab.value, label: tab.label })),
                          } : undefined}
                          isTagsPage={isTagsPage}
                          refreshKey={refreshKey}
                          hideTitleInMobile={true}
                        />
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom Navigation - Fixed position with safe area inset padding for iOS */}
          <div className="fixed bottom-0 left-0 right-0 z-20 bg-background border-t w-full pb-safe">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid grid-cols-4 w-full h-14">
                <TabsTrigger value="feed" className="flex flex-col items-center justify-center h-full data-[state=active]:bg-muted">
                  <Home className="h-4 w-4" />
                  <span className="text-[10px] mt-1">Feed</span>
                </TabsTrigger>
                <TabsTrigger value="explore" className="flex flex-col items-center justify-center h-full data-[state=active]:bg-muted">
                  <Compass className="h-4 w-4" />
                  <span className="text-[10px] mt-1">Explore</span>
                </TabsTrigger>
                <TabsTrigger value="liked" className="flex flex-col items-center justify-center h-full data-[state=active]:bg-muted">
                  <Heart className="h-4 w-4" />
                  <span className="text-[10px] mt-1">Liked</span>
                </TabsTrigger>
                <TabsTrigger value="myposts" className="flex flex-col items-center justify-center h-full data-[state=active]:bg-muted">
                  <User className="h-4 w-4" />
                  <span className="text-[10px] mt-1">My Posts</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </TooltipProvider>
    </PostProvider>
  );
}
