'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Heart } from '@mynaui/icons-react';
import ResponsiveAppLayout from '@/components/responsive-app-layout';
import PostList from '@/components/post-list';

// Loading skeleton for the liked posts page
function LikedPostsLoadingSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading liked posts...</p>
      </div>
    </div>
  );
}

export default function LikedPostsPage() {
  return (
    <ResponsiveAppLayout
      title="Liked Posts"
      apiEndpoint="/api/posts/liked"
    >
      <Suspense fallback={<LikedPostsLoadingSkeleton />}>
        <PostList
          title={
            <>
              <Heart className="inline-block mr-2 mb-1" />
              Liked Posts
            </>
          }
          apiEndpoint="/api/posts/liked"
        />
      </Suspense>
    </ResponsiveAppLayout>
  );
}
