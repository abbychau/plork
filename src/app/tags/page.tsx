'use client';

import { Hash } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ResponsiveAppLayout from '@/components/responsive-app-layout';
import PostList from '@/components/post-list';
import TagsPageContent from '@/components/tags-page-content';

// Client component that uses search params
function TagsContent() {
  const searchParams = useSearchParams();
  const tagParam = searchParams.get('tag');

  if (!tagParam) {
    return <TagsPageContent selectedTag={tagParam || undefined} />;
  }

  return (
    <PostList
      apiEndpoint={`/api/posts/hashtag?tag=${encodeURIComponent(tagParam)}`}
      title={
        <>
          <Hash className="inline-block mr-2 mb-1" />
          #{tagParam}
        </>
      }
      showSearch={true}
      tag={tagParam}
      isTagsPage={true}
      searchQuery={tagParam}
    />
  );
}

// Wrapper component that uses search params
function TagsPageWrapper() {
  const searchParams = useSearchParams();
  const tagParam = searchParams.get('tag');

  // Get the title for the responsive layout
  const getTitle = () => {
    if (tagParam) {
      return `#${tagParam}`;
    }
    return "Tags";
  };

  // Get the API endpoint for the responsive layout
  const getApiEndpoint = () => {
    if (tagParam) {
      return `/api/posts/hashtag?tag=${encodeURIComponent(tagParam)}`;
    }
    return '/api/posts/empty';
  };

  return (
    <ResponsiveAppLayout
      title={getTitle()}
      apiEndpoint={getApiEndpoint()}
      showSearch={!!tagParam}
      tag={tagParam || undefined}
      isTagsPage={true}
      searchQuery={tagParam || ''}
    >
      <TagsContent />
    </ResponsiveAppLayout>
  );
}

// Main page component with Suspense boundary for useSearchParams
export default function TagsPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading tags...</div>}>
      <TagsPageWrapper />
    </Suspense>
  );
}
