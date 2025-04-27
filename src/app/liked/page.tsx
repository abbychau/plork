'use client';

import { useState, useEffect, Suspense } from 'react';
import AppLayout from '@/components/app-layout';
import { Loader2 } from 'lucide-react';
import { Heart } from '@mynaui/icons-react';

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

// Main content component for the liked posts page
function LikedPostsContent() {
  return (
    <AppLayout
      title={
        <>
          <Heart className="inline-block mr-2 mb-1" />
          Liked Posts
        </>
      }
      apiEndpoint="/api/posts/liked"
    />
  );
}

// Main page component
export default function LikedPostsPage() {
  // Use client-side only rendering to avoid hydration issues
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <LikedPostsLoadingSkeleton />;
  }

  return (
    <Suspense fallback={<LikedPostsLoadingSkeleton />}>
      <LikedPostsContent />
    </Suspense>
  );
}
