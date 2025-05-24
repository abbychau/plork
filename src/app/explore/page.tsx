'use client';

import { useState } from 'react';
import { Compass } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import ResponsiveAppLayout from '@/components/responsive-app-layout';
import PostList from '@/components/post-list';

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

// Wrapper component for the layout that uses search params
function ExplorePageContent() {
  const searchParams = useSearchParams();
  const tagParam = searchParams.get('tag');

  return (
    <ResponsiveAppLayout
      title={tagParam ? `#${tagParam}` : "Explore"}
      apiEndpoint={tagParam
        ? `/api/posts/hashtag?tag=${encodeURIComponent(tagParam)}`
        : "/api/posts/explore?type=hot"
      }
    >
      <ExploreContent />
    </ResponsiveAppLayout>
  );
}

// Main page component without Suspense boundary since ResponsiveAppLayout provides it
export default function ExplorePage() {
  return <ExplorePageContent />;
}
