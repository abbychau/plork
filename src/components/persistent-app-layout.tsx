'use client';

import { useState, useEffect, Suspense, ReactNode } from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
import { PostProvider } from '@/lib/post-context';
import { useAuth } from '@/lib/auth-context';
import AppNav from '@/components/app-nav';
import PostDisplay from '@/components/post-display';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

// Create a static instance to persist across renders
const layoutState = {
  isInitialized: false,
  defaultLayout: [15, 37, 48],
  isCollapsed: false
};

interface PersistentAppLayoutProps {
  children: ReactNode;
}

export default function PersistentAppLayout({ children }: PersistentAppLayoutProps) {
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

  // Initialize state with values from the static instance
  const [isCollapsed, setIsCollapsed] = useState(layoutState.isCollapsed);
  const [defaultLayout, setDefaultLayout] = useState(layoutState.defaultLayout);
  const [isClient, setIsClient] = useState(false);

  // Load saved layout from localStorage after initial render
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    setIsClient(true);

    // Only load from localStorage if we haven't initialized yet
    if (!layoutState.isInitialized) {
      try {
        // Load layout from localStorage
        const layoutStr = localStorage.getItem('react-resizable-panels:layout:plork');
        if (layoutStr) {
          const storedLayout = JSON.parse(layoutStr);
          setDefaultLayout(storedLayout);
          layoutState.defaultLayout = storedLayout;
        }

        // Load collapsed state from localStorage
        const collapsedStr = localStorage.getItem('react-resizable-panels:collapsed');
        if (collapsedStr) {
          const storedCollapsed = JSON.parse(collapsedStr);
          setIsCollapsed(storedCollapsed);
          layoutState.isCollapsed = storedCollapsed;
        }

        layoutState.isInitialized = true;
      } catch (e) {
        console.error('Error reading layout from localStorage:', e);
      }
    }
  }, []);

  // Track if layout has been loaded from localStorage
  const [layoutLoaded, setLayoutLoaded] = useState(layoutState.isInitialized);

  // Update layoutLoaded flag when layout is loaded from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLayoutLoaded(true);
    }
  }, [defaultLayout]);

  if (!isClient) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading app...</p>
        </div>
      </div>
    );
  }

  return (
    <PostProvider>
      <TooltipProvider delayDuration={0}>
        <ResizablePanelGroup
          key={layoutLoaded ? 'loaded' : 'initial'}
          direction="horizontal"
          onLayout={(sizes: number[]) => {
            safeLocalStorage.setItem('react-resizable-panels:layout:plork', JSON.stringify(sizes));
            setDefaultLayout(sizes); // Update state to match localStorage
            layoutState.defaultLayout = sizes; // Update static instance
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
              layoutState.isCollapsed = true;
              safeLocalStorage.setItem('react-resizable-panels:collapsed', JSON.stringify(true));
            }}
            onResize={() => {
              setIsCollapsed(false);
              layoutState.isCollapsed = false;
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
              {/* This is where the dynamic content will be rendered */}
              <Suspense fallback={
                <div className="h-full w-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading content...</p>
                  </div>
                </div>
              }>
                {children}
              </Suspense>
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
  );
}
