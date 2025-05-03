'use client';

import { Suspense, useState } from 'react';
import { Compass, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import PersistentAppLayout from '@/components/persistent-app-layout';
import PostList from '@/components/post-list';

// Loading skeleton for the explore page
function ExploreLoadingSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading explore page...</p>
      </div>
    </div>
  );
}

// Client component that uses search params
function ExploreContent() {
  const searchParams = useSearchParams();
  const tagParam = searchParams.get('tag');
  const [activeTab, setActiveTab] = useState('hot');

  // Determine the API endpoint based on the active tab and tag parameter
  const getApiEndpoint = () => {
    if (tagParam) {
      return `/api/posts/hashtag?tag=${encodeURIComponent(tagParam)}`;
    }

    return `/api/posts/explore?type=${activeTab}`;
  };

  // Get the title based on the active tab and tag parameter
  const getTitle = () => {
    if (tagParam) {
      return (
        <>
          <Compass className="inline-block mr-2 mb-1" />
          #{tagParam}
        </>
      );
    }

    return (
      <>
        <Compass className="inline-block mr-2 mb-1" />
        Explore
      </>
    );
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Define the tabs configuration
  const tabsConfig = {
    defaultValue: 'hot',
    items: [
      { value: 'hot', label: 'Hot' },
      { value: 'new', label: 'New' },
    ],
    onChange: handleTabChange
  };

  return (
    <PostList
      apiEndpoint={getApiEndpoint()}
      title={getTitle()}
      showSearch={false}
      tag={tagParam || undefined}
      tabs={tagParam ? undefined : tabsConfig}
    />
  );
}

// Main page component with Suspense boundary
export default function ExplorePage() {
  return (
    <PersistentAppLayout>
      <Suspense fallback={<ExploreLoadingSkeleton />}>
        <ExploreContent />
      </Suspense>
    </PersistentAppLayout>
  );
}
