'use client';

import { useState, useEffect, Suspense } from 'react';
import AppLayout from '@/components/app-layout';
import { Loader2 } from 'lucide-react';
import { MessageSquare } from 'lucide-react';

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

// Main content component for the responded posts page
function RespondedPostsContent() {
  return (
    <AppLayout
      title={
        <>
          <MessageSquare className="inline-block mr-2 mb-1" />
          Posts You've Responded To
        </>
      }
      apiEndpoint="/api/posts/responded"
    />
  );
}

// Main page component
export default function RespondedPostsPage() {
  // Use client-side only rendering to avoid hydration issues
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <RespondedPostsLoadingSkeleton />;
  }

  return (
    <Suspense fallback={<RespondedPostsLoadingSkeleton />}>
      <RespondedPostsContent />
    </Suspense>
  );
} 