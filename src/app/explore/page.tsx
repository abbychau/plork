'use client';

import { Suspense, useState } from 'react';
import AppLayout from '@/components/app-layout';
import { useSearchParams } from 'next/navigation';

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
      return `#${tagParam}`;
    }

    return 'Explore';
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // No need to update an endpoint state, we'll use the getApiEndpoint function
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

  // If we have a tag parameter, we're in tag filtering mode
  if (tagParam) {
    return (
      <AppLayout
        apiEndpoint={getApiEndpoint()}
        title={getTitle()}
        tag={tagParam}
      />
    );
  }

  // Otherwise, show the tabs for hot/new/users in the middle bar
  return (
    <AppLayout
      apiEndpoint={getApiEndpoint()} // Use the function to get the current endpoint
      title={getTitle()}
      showSearch={false}
      tabs={tabsConfig}
    />
  );
}

// Main page component with Suspense boundary
export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-4">Loading explore page...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
