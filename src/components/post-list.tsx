'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import CreatePostModal from '@/components/create-post-modal';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { usePinnedUsers } from '@/lib/pinned-users-context';
import { usePost, Post } from '@/lib/post-context';
import { useInfiniteScroll } from '@/hooks';
import { Search, Plus, X, MessageSquare } from 'lucide-react';
import { Heart } from '@mynaui/icons-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import UserProfilePopover from '@/components/user-profile-popover';
import PostTags from '@/components/post-tags';

interface PostListProps {
  initialPosts?: Post[];
  apiEndpoint?: string;
  title?: React.ReactNode;
  showSearch?: boolean;
  showNewPostButton?: boolean;
  tag?: string;
  searchQuery?: string;
  tabs?: {
    defaultValue: string;
    items: { value: string; label: string }[];
    onChange?: (value: string) => void;
  };
  isTagsPage?: boolean;
  showUserInfo?: boolean;
  showCommentCount?: boolean;
  showLikeCount?: boolean;
}

export default function PostList({
  initialPosts = [],
  apiEndpoint = '/api/posts',
  title = 'Posts',
  showSearch = false,
  showNewPostButton = true,
  tag,
  searchQuery: initialSearchQuery = '',
  tabs,
  isTagsPage = false,
  showUserInfo = true,
  showCommentCount = true,
  showLikeCount = true,
}: PostListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedPostId, setSelectedPostId } = usePost();
  const { addPinnedUser } = usePinnedUsers();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [offset, setOffset] = useState(0);
  const [nextOffset, setNextOffset] = useState<number | null>(initialPosts.length);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isMountedRef = useRef(true);
  const isLoadingRef = useRef(false);
  const initialMountRef = useRef(false);
  const currentApiEndpointRef = useRef(apiEndpoint);
  const apiEndpointChangeTimerRef = useRef<number | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  // We still need isLoading state for API calls
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to load more posts
  const loadMorePosts = useCallback(async () => {
    // Prevent duplicate API calls
    if (isLoadingMore || nextOffset === null || isLoadingRef.current || !isMountedRef.current) return false;

    // Set both state and ref to prevent race conditions
    setIsLoadingMore(true);
    isLoadingRef.current = true;

    // Get the current API endpoint from ref - this ensures we're using the most up-to-date endpoint
    const currentEndpoint = currentApiEndpointRef.current;
    console.log('Loading more posts from:', currentEndpoint, 'with offset:', offset);

    try {
      // If we have a search query, use the search endpoint instead
      const baseEndpoint = searchQuery
        ? '/api/posts/search'
        : currentEndpoint;

      // Check if the endpoint already has query parameters
      let url = baseEndpoint.includes('?')
        ? `${baseEndpoint}&offset=${offset}`
        : `${baseEndpoint}?offset=${offset}`;

      if (tag) {
        url += `&tag=${encodeURIComponent(tag)}`;
      }

      if (searchQuery) {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      }

      console.log('Fetching from URL:', url);
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 401) {
          console.log('User not authenticated, showing empty timeline');
          setNextOffset(null);
          return false;
        }
        throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API response:', data);

      // Handle different API response formats
      if (Array.isArray(data)) {
        // If the response is an array of posts
        if (data.length === 0) {
          setNextOffset(null);
          return false;
        }

        // Filter out duplicates before adding new posts
        setPosts(prevPosts => {
          const existingIds = new Set(prevPosts.map(p => p.id));
          const uniqueNewPosts = data.filter(post => !existingIds.has(post.id));
          return [...prevPosts, ...uniqueNewPosts];
        });
        setOffset(prevOffset => prevOffset + data.length);
        setNextOffset(data.length < 10 ? null : offset + data.length);
      } else if (data.posts && Array.isArray(data.posts)) {
        // If the response has a posts array
        if (data.posts.length === 0) {
          setNextOffset(null);
          return false;
        }

        // Filter out duplicates before adding new posts
        setPosts(prevPosts => {
          const existingIds = new Set(prevPosts.map(p => p.id));
          const uniqueNewPosts = data.posts.filter((post: { id: string }) => !existingIds.has(post.id));
          return [...prevPosts, ...uniqueNewPosts];
        });
        setOffset(prevOffset => prevOffset + data.posts.length);
        setNextOffset(data.nextOffset);
      } else {
        console.error('Unexpected API response format:', data);
        setNextOffset(null);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error loading more posts:', error);
      return false;
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setIsLoadingMore(false);
        isLoadingRef.current = false;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpoint, isLoadingMore, nextOffset, offset, searchQuery, tag]);

  // Set up infinite scrolling
  useInfiniteScroll(loadMorePosts, loaderRef, { disabled: isLoadingMore });

  // Set up mounted ref and handle initial mount
  useEffect(() => {
    isMountedRef.current = true;

    // Only load posts on the first mount
    if (!initialMountRef.current) {
      initialMountRef.current = true;
      console.log('Component mounted, loading initial posts');
      if (posts.length === 0 && nextOffset !== null && !isLoadingRef.current) {
        loadMorePosts();
      }
    }

    return () => {
      isMountedRef.current = false;
      // Clear any pending timers
      if (apiEndpointChangeTimerRef.current) {
        cancelAnimationFrame(apiEndpointChangeTimerRef.current);
      }
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload posts when apiEndpoint changes (e.g., when tab changes in explore page or tag changes in tags page)
  useEffect(() => {
    // Skip if it's the same endpoint or component is not mounted
    if (apiEndpoint === currentApiEndpointRef.current || !isMountedRef.current) return;

    console.log('API endpoint changed:', apiEndpoint);
    currentApiEndpointRef.current = apiEndpoint;

    // Clear any pending timers
    if (apiEndpointChangeTimerRef.current) {
      cancelAnimationFrame(apiEndpointChangeTimerRef.current);
    }

    // Reset posts and loading state
    setPosts([]);
    setOffset(0);
    setNextOffset(0);
    isLoadingRef.current = false;

    // Load posts after state is updated in the next render cycle
    apiEndpointChangeTimerRef.current = requestAnimationFrame(() => {
      if (isMountedRef.current && !isLoadingRef.current) {
        loadMorePosts();
      }
      apiEndpointChangeTimerRef.current = null;
    });

    return () => {
      if (apiEndpointChangeTimerRef.current) {
        cancelAnimationFrame(apiEndpointChangeTimerRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpoint]);

  // Function to check for new posts
  const checkForNewPosts = async () => {
    if (!posts.length || !isMountedRef.current) return;

    try {
      const latestPostId = posts[0]?.id;
      // Get the current API endpoint from ref
      const currentEndpoint = currentApiEndpointRef.current;
      // If we have a search query, use the search endpoint instead
      const baseEndpoint = searchQuery
        ? '/api/posts/search'
        : currentEndpoint;

      // Construct URL with proper separator
      let checkNewUrl = baseEndpoint.includes('?')
        ? `${baseEndpoint}&check-new=true&latestId=${latestPostId}`
        : `${baseEndpoint}/check-new?latestId=${latestPostId}`;

      // Add search query if present
      if (searchQuery) {
        checkNewUrl += `&q=${encodeURIComponent(searchQuery)}`;
      }
      const response = await fetch(checkNewUrl);

      // Check if component is still mounted before processing response
      if (!isMountedRef.current) return;

      if (!response.ok) {
        throw new Error('Failed to check for new posts');
      }

      const { hasNew } = await response.json();
      setHasNewPosts(hasNew);
    } catch (error) {
      console.error('Error checking for new posts:', error);
    }
  };

  // Check for new posts periodically
  useEffect(() => {
    const interval = setInterval(checkForNewPosts, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts.length > 0 ? posts[0]?.id : null]);

  // Function to load new posts
  const loadNewPosts = async () => {
    if (!isMountedRef.current || isLoadingRef.current) return;

    // Set loading state to prevent duplicate calls
    isLoadingRef.current = true;

    try {
      const latestPostId = posts[0]?.id;
      // Get the current API endpoint from ref
      const currentEndpoint = currentApiEndpointRef.current;
      // If we have a search query, use the search endpoint instead
      const baseEndpoint = searchQuery
        ? '/api/posts/search'
        : currentEndpoint;

      // Construct URL with proper separator
      let newPostsUrl = baseEndpoint.includes('?')
        ? `${baseEndpoint}&new=true&latestId=${latestPostId}`
        : `${baseEndpoint}/new?latestId=${latestPostId}`;

      // Add search query if present
      if (searchQuery) {
        newPostsUrl += `&q=${encodeURIComponent(searchQuery)}`;
      }
      const response = await fetch(newPostsUrl);

      // Check if component is still mounted before processing response
      if (!isMountedRef.current) return;

      if (!response.ok) {
        throw new Error('Failed to fetch new posts');
      }

      const data = await response.json();

      if (data.posts && data.posts.length > 0) {
        // Filter out duplicates before adding new posts
        setPosts(prevPosts => {
          const existingIds = new Set(prevPosts.map(p => p.id));
          const uniqueNewPosts = data.posts.filter((post: { id: string }) => !existingIds.has(post.id));
          return [...uniqueNewPosts, ...prevPosts];
        });
        setHasNewPosts(false);
      }
    } catch (error) {
      console.error('Error loading new posts:', error);
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        isLoadingRef.current = false;
      }
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isMountedRef.current) return;

    const newQuery = e.target.value;
    setSearchQuery(newQuery);

    // Clear any existing timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // Always use debounce for both tag suggestions and post search
    searchTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;

      if (isTagsPage) {
        // For tags page, fetch tag suggestions
        fetchTagSuggestions(newQuery);
      } else {
        // For regular search, search posts
        setPosts([]);
        setOffset(0);
        setNextOffset(0);
        isLoadingRef.current = false; // Reset loading state
        loadMorePosts();
      }
      searchTimerRef.current = null;
    }, 300);
  };

  // Fetch tag suggestions
  const fetchTagSuggestions = async (query: string) => {
    if (!isMountedRef.current || !query.trim()) {
      setTagSuggestions([]);
      setOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/tags/suggest?q=${encodeURIComponent(query)}`);

      // Check if component is still mounted before processing response
      if (!isMountedRef.current) return;

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setTagSuggestions(data);
          setOpen(data.length > 0);
        } else {
          console.error('Unexpected response format:', data);
          setTagSuggestions([]);
          setOpen(false);
        }
      }
    } catch (error) {
      console.error('Error fetching tag suggestions:', error);
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setTagSuggestions([]);
        setOpen(false);
      }
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    router.push(`/tags?tag=${encodeURIComponent(tag)}`);
    setOpen(false);
  };

  // Handle key press for search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isMountedRef.current) return;

    if (e.key === 'Enter') {
      // Clear any existing search timer
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
        searchTimerRef.current = null;
      }

      if (isTagsPage) {
        // For tags page, navigate to tag page
        if (searchQuery.trim()) {
          router.push(`/tags?tag=${encodeURIComponent(searchQuery)}`);
          setOpen(false);
          // Reset posts and load new ones with the updated tag
          setPosts([]);
          setOffset(0);
          setNextOffset(0);
          // We'll rely on the useEffect that runs when the component re-renders with the new URL
        }
      } else {
        // For regular search, just trigger the search
        setPosts([]);
        setOffset(0);
        setNextOffset(0);
        isLoadingRef.current = false; // Reset loading state
        loadMorePosts();
      }
    }
  };

  // Clear search
  const handleClearSearch = () => {
    if (!isMountedRef.current) return;

    // Clear any existing search timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }

    setSearchQuery('');
    if (isTagsPage) {
      router.push('/tags');
    } else {
      setPosts([]);
      setOffset(0);
      setNextOffset(0);
      isLoadingRef.current = false; // Reset loading state
      loadMorePosts();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-background">
        <div className="flex items-center justify-between px-4 py-2 h-[52px]">
          <h1 className="text-xl font-bold">{title}</h1>

          {tabs ? (
            <Tabs defaultValue={tabs.defaultValue} className="ml-auto">
              <TabsList className="bg-muted">
                {tabs.items.map((item) => (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    onClick={() => tabs.onChange && tabs.onChange(item.value)}
                    className="text-zinc-600 dark:text-zinc-200"
                  >
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          ) : (
            <div className="ml-auto" />
          )}
        </div>

        <Separator />

        <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {isTagsPage ? (
            <div className="relative">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tags..."
                  className="pl-8 h-9 pr-8 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-9 w-9 p-0"
                    onClick={handleClearSearch}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear</span>
                  </Button>
                )}

                {/* Tag suggestions dropdown */}
                {open && tagSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-popover rounded-md border shadow-md">
                    <div className="p-2">
                      <p className="text-xs text-muted-foreground mb-2">Suggestions</p>
                      <div className="space-y-1">
                        {tagSuggestions.map((tag) => (
                          <Button
                            key={tag}
                            variant="ghost"
                            className="w-full justify-start text-sm h-8 px-2"
                            onClick={() => handleTagSelect(tag)}
                          >
                            <span>#{tag}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                className="pl-8 h-9 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}
        </div>

        {tag && (
          <div className="px-4 py-2 border-b">
            <Badge variant="secondary" className="text-xs font-normal">
              #{tag}
            </Badge>
          </div>
        )}

        {hasNewPosts && (
          <div className="px-4 py-2 border-b">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-primary"
              onClick={loadNewPosts}
            >
              Load new posts
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-4 pt-2">
          {!user && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">Please log in to view your timeline</p>
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="default" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="sm">Register</Button>
                </Link>
              </div>
            </div>
          )}

          {user && posts.length === 0 && nextOffset === null && !isTagsPage && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">No posts to display</p>
              <p className="text-sm text-muted-foreground">Follow users to see their posts in your timeline</p>
            </div>
          )}

          {posts.map((post, index) => (
            <button
              key={`${post.id}-${index}`}
              className={`flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent ${
                selectedPostId === post.id ? 'bg-muted' : ''
              }`}
              onClick={() => setSelectedPostId(post.id)}
            >
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center">
                  <div className="md:flex items-center gap-2 hidden">
                    <UserProfilePopover
                      username={post.author.username}
                      onPin={() => addPinnedUser({
                        id: post.author.id,
                        username: post.author.username,
                        displayName: post.author.displayName,
                        profileImage: post.author.profileImage
                      })}
                    >
                      <div className="flex items-center gap-2 cursor-pointer">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={post.author.profileImage} alt={post.author.username} />
                          <AvatarFallback>
                            {post.author.displayName?.[0] || post.author.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-semibold">{post.author.displayName || post.author.username}</div>
                      </div>
                    </UserProfilePopover>
                  </div>
                  <div className="flex md:hidden font-bold">
                      {post.author.displayName || post.author.username}
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground hidden md:block">
                    {formatDistanceToNow(new Date(post.createdAt))}
                  </div>
                </div>
              </div>
              <div className="line-clamp-3 text-xs">
                {post.content.substring(0, 300)}
              </div>

              {/* Display post tags */}
              <PostTags hashtags={post.hashtags} limit={3} className="mt-1" />

              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{post.comments?.length || 0}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Heart className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{post.likes?.length || 0}</span>
                </div>
              </div>
            </button>
          ))}

          {/* Loading indicator and sentinel element for infinite scrolling */}
          <div ref={loaderRef} className="py-4 text-center">
            {isLoadingMore && nextOffset !== null && (
              <div className="inline-block p-3 bg-muted/30 rounded-lg animate-pulse">
                <div className="h-4 w-28 bg-muted rounded"></div>
              </div>
            )}
            {nextOffset === null && posts.length > 0 && (
              <div className="text-sm text-muted-foreground py-2">
                No more posts to load
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
