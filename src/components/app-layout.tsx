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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [defaultLayout, setDefaultLayout] = useState([20, 32, 48]);
  const { user } = useAuth();

  // Load layout from cookies on mount
  useEffect(() => {
    const layout = document.cookie
      .split('; ')
      .find(row => row.startsWith('react-resizable-panels:layout:plork'))
      ?.split('=')[1];

    const collapsed = document.cookie
      .split('; ')
      .find(row => row.startsWith('react-resizable-panels:collapsed'))
      ?.split('=')[1];

    if (layout) {
      try {
        setDefaultLayout(JSON.parse(layout));
      } catch (e) {
        console.error('Error parsing layout from cookie:', e);
      }
    }

    if (collapsed) {
      try {
        setIsCollapsed(JSON.parse(collapsed));
      } catch (e) {
        console.error('Error parsing collapsed state from cookie:', e);
      }
    }
  }, []);

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
            document.cookie = `react-resizable-panels:layout:plork=${JSON.stringify(
              sizes
            )}`;
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
              document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
                true
              )}`;
            }}
            onResize={() => {
              setIsCollapsed(false);
              document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
                false
              )}`;
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
