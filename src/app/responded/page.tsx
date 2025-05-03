'use client';

import { Suspense } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import PersistentAppLayout from '@/components/persistent-app-layout';
import PostList from '@/components/post-list';

// Loading skeleton for the responded posts page
function RespondedPostsLoadingSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading posts you've responded to...</p>
      </div>
    </div>
  );
}

export default function RespondedPostsPage() {
  return (
    <PersistentAppLayout>
      <Suspense fallback={<RespondedPostsLoadingSkeleton />}>
        <PostList
          title={
            <>
              <MessageSquare className="inline-block mr-2 mb-1" />
              Posts You've Responded To
            </>
          }
          apiEndpoint="/api/posts/responded"
        />
      </Suspense>
    </PersistentAppLayout>
  );
}