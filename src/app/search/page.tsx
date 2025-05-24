'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/components/app-layout';

// Create a client component that uses the search params
function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const tagParam = searchParams.get('tag');
  const [activeTab, setActiveTab] = useState('posts');
  const [displayQuery, setDisplayQuery] = useState(searchQuery || (tagParam ? `#${tagParam}` : ''));

  // Update display query when URL parameters change
  useEffect(() => {
    const tag = searchParams.get('tag');
    const search = searchParams.get('q');

    if (tag) {
      setDisplayQuery(`#${tag}`);
    } else if (search) {
      setDisplayQuery(search);
    } else {
      setDisplayQuery('');
    }
  }, [searchParams]);

  // Determine the API endpoint based on the active tab and search parameters
  const getApiEndpoint = () => {
    if (tagParam) {
      return `/api/posts/hashtag?tag=${encodeURIComponent(tagParam)}`;
    }

    if (!searchQuery) {
      return '';
    }

    return activeTab === 'posts'
      ? `/api/posts/search?q=${encodeURIComponent(searchQuery)}`
      : `/api/users?search=${encodeURIComponent(searchQuery)}`;
  };

  // Get the title based on the search parameters
  const getTitle = () => {
    if (tagParam) {
      return `#${tagParam}`;
    }

    if (!displayQuery) {
      return 'Search';
    }

    return `Search: ${displayQuery}`;
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle clear search
  const handleClearSearch = () => {
    router.push('/search');
  };

  // If we have no search query, show a message
  if (!searchQuery && !tagParam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Search</h1>
          <p className="text-muted-foreground mt-2">
            Enter a search term in the search box above to find posts and users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {displayQuery && (
        <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Results for:
              </p>
              {displayQuery.startsWith('#') ? (
                <Badge variant="secondary" className="mr-2">
                  {displayQuery}
                </Badge>
              ) : (
                <span className="font-medium">{displayQuery}</span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSearch}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      <Tabs defaultValue="posts" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="w-full justify-start px-4 py-2">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <div className="flex-1">
          <AppLayout
            apiEndpoint={getApiEndpoint()}
            title={getTitle()}
            showSearch={false}
          />
        </div>
      </Tabs>
    </div>
  );
}

// Main page component with Suspense boundary for useSearchParams
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading search results...</div>}>
      <SearchContent />
    </Suspense>
  );
}
