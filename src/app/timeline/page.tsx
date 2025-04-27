'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Timer, Loader2 } from 'lucide-react';

// Import components with no SSR to avoid hydration mismatches
const TimelineLoadingSkeleton = dynamic(
  () => import('@/components/timeline-loading-skeleton'),
  { ssr: false }
);

const AppLayout = dynamic(
  () => import('@/components/app-layout'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading timeline...</p>
        </div>
      </div>
    )
  }
);

export default function TimelinePage() {
  // Use client-side only rendering to avoid hydration issues
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <TimelineLoadingSkeleton />
    }>
      <AppLayout
        title={
          <>
            <Timer className="inline-block mr-2 mb-1" />
            Timeline
          </>
        }
        apiEndpoint="/api/posts"
      />
    </Suspense>
  );
}
