'use client';

import { Suspense } from 'react';
import { Timer, Loader2 } from 'lucide-react';
import PersistentAppLayout from '@/components/persistent-app-layout';
import PostList from '@/components/post-list';

// Loading skeleton for the timeline page
function TimelineLoadingSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading timeline...</p>
      </div>
    </div>
  );
}

export default function TimelinePage() {
  return (
    <PersistentAppLayout>
      <Suspense fallback={<TimelineLoadingSkeleton />}>
        <PostList
          title={
            <>
              <Timer className="inline-block mr-2 mb-1" />
              Timeline
            </>
          }
          apiEndpoint="/api/posts"
        />
      </Suspense>
    </PersistentAppLayout>
  );
}
