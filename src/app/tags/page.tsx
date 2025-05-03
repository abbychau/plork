'use client';

import { Suspense } from 'react';
import { Hash, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import PersistentAppLayout from '@/components/persistent-app-layout';
import PostList from '@/components/post-list';
import TagsPageContent from '@/components/tags-page-content';

// Loading skeleton for the tags page
function TagsLoadingSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading tags page...</p>
      </div>
    </div>
  );
}

// Client component that uses search params
function TagsContent() {
  const searchParams = useSearchParams();
  const tagParam = searchParams.get('tag');

  // Determine the API endpoint based on the tag parameter
  const getApiEndpoint = () => {
    if (tagParam) {
      return `/api/posts/hashtag?tag=${encodeURIComponent(tagParam)}`;
    }
    // Return a default endpoint that returns an empty array when no tag is selected
    return '/api/posts/empty';
  };

  // Get the title based on the tag parameter
  const getTitle = () => {
    if (tagParam) {
      return (
        <>
          <Hash className="inline-block mr-2 mb-1" />
          #{tagParam}
        </>
      );
    }
    return (
      <>
        <Hash className="inline-block mr-2 mb-1" />
        Tags
      </>
    );
  };

  if (!tagParam) {
    return <TagsPageContent />;
  }

  return (
    <PostList
      apiEndpoint={getApiEndpoint()}
      title={getTitle()}
      showSearch={true}
      tag={tagParam || undefined}
      isTagsPage={true}
      searchQuery={tagParam || ''}
    />
  );
}

// Main page component with Suspense boundary
export default function TagsPage() {
  return (
    <PersistentAppLayout>
      <Suspense fallback={<TagsLoadingSkeleton />}>
        <TagsContent />
      </Suspense>
    </PersistentAppLayout>
  );
}
