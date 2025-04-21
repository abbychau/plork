'use client';

import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/app-layout';
import TagsPageContent from '@/components/tags-page-content';
import { Suspense } from 'react';

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
      return `#${tagParam}`;
    }
    return 'Tags';
  };

  return (
    <AppLayout
      apiEndpoint={getApiEndpoint()}
      title={getTitle()}
      showSearch={true}
      tag={tagParam || undefined}
      isTagsPage={true}
      searchQuery={tagParam || ''}
    >
      {!tagParam && <TagsPageContent />}
    </AppLayout>
  );
}

// Main page component with Suspense boundary
export default function TagsPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading tags page...</div>}>
      <TagsContent />
    </Suspense>
  );
}
