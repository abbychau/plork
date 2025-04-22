'use client';

import { useState, useEffect, Suspense } from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
import { PostProvider } from '@/lib/post-context';
import { useAuth } from '@/lib/auth-context';
import AppNav from '@/components/app-nav';
import PostList from '@/components/post-list';
import PostDisplay from '@/components/post-display';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AppLayoutProps {
  children?: React.ReactNode;
  initialPosts?: any[];
  apiEndpoint?: string;
  title?: React.ReactNode;
  showSearch?: boolean;
  showNewPostButton?: boolean;
  tag?: string;
  searchQuery?: string;
  tabs?: {
    defaultValue: string;
    items: { value: string; label: string }[];
    onChange?: (value: string) => void;
  };
  isTagsPage?: boolean;
}

export default function AppLayout({
  children,
  initialPosts = [],
  apiEndpoint = '/api/posts',
  title = 'Posts',
  showSearch = false,
  showNewPostButton = true,
  tag,
  searchQuery,
  tabs,
  isTagsPage = false,
}: AppLayoutProps) {
  const { user } = useAuth();

  // Safely access localStorage (handles cases where it might be unavailable)
  const safeLocalStorage = {
    getItem: (key: string): string | null => {
      if (typeof window === 'undefined') return null;
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.error('Error accessing localStorage:', e);
        return null;
      }
    },
    setItem: (key: string, value: string): void => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('Error setting localStorage item:', e);
      }
    }
  };

  // Initialize state from localStorage
  // This is done outside useEffect to avoid layout shift during hydration
  const initializeStateFromStorage = () => {
    if (typeof window === 'undefined') return { isCollapsed: false, layout: [20, 32, 48] };

    let storedLayout = [20, 32, 48];
    let storedCollapsed = false;

    try {
      const layoutStr = localStorage.getItem('react-resizable-panels:layout:plork');
      if (layoutStr) storedLayout = JSON.parse(layoutStr);

      const collapsedStr = localStorage.getItem('react-resizable-panels:collapsed');
      if (collapsedStr) storedCollapsed = JSON.parse(collapsedStr);
    } catch (e) {
      console.error('Error reading layout from localStorage:', e);
    }

    return { isCollapsed: storedCollapsed, layout: storedLayout };
  };

  // Initialize state directly from localStorage
  const initialState = initializeStateFromStorage();
  const [isCollapsed, setIsCollapsed] = useState(initialState.isCollapsed);
  const [defaultLayout, setDefaultLayout] = useState(initialState.layout);

  // Mark timeline posts as read when the timeline is viewed
  useEffect(() => {
    const markTimelineAsRead = async () => {
      if (!user || apiEndpoint !== '/api/posts') return;

      try {
        await fetch('/api/posts/read-state', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
      } catch (error) {
        console.error('Error updating timeline read state:', error);
      }
    };

    markTimelineAsRead();
  }, [user, apiEndpoint]);

  return (
    <Suspense>
    <PostProvider>
      <TooltipProvider delayDuration={0}>
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={(sizes: number[]) => {
            safeLocalStorage.setItem('react-resizable-panels:layout:plork', JSON.stringify(sizes));
            setDefaultLayout(sizes); // Update state to match localStorage
          }}
          className="h-full items-stretch"
        >
          <ResizablePanel
            defaultSize={defaultLayout[0]}
            collapsedSize={4}
            collapsible={true}
            minSize={15}
            maxSize={20}
            onCollapse={() => {
              setIsCollapsed(true);
              safeLocalStorage.setItem('react-resizable-panels:collapsed', JSON.stringify(true));
            }}
            onResize={() => {
              setIsCollapsed(false);
              safeLocalStorage.setItem('react-resizable-panels:collapsed', JSON.stringify(false));
            }}
            className={cn(
              isCollapsed &&
                "min-w-[50px] transition-all duration-300 ease-in-out"
            )}
          >
            <AppNav isCollapsed={isCollapsed} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={defaultLayout[1]} minSize={30} className="overflow-hidden">
            <ScrollArea className="h-full">
              {children || (
                <PostList
                  initialPosts={initialPosts}
                  apiEndpoint={apiEndpoint}
                  title={title}
                  showSearch={showSearch}
                  showNewPostButton={showNewPostButton}
                  tag={tag}
                  searchQuery={searchQuery}
                  tabs={tabs}
                  isTagsPage={isTagsPage}
                />
              )}
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={defaultLayout[2]} minSize={30} className="overflow-hidden">
            <ScrollArea className="h-full">
              <PostDisplay />
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
    </PostProvider>
    </Suspense>
  );
}
