'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import MarkdownContent from '@/components/markdown-content';
import TagCloud from '@/components/tag-cloud';
import { formatDistanceToNow } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import CommentSidebar from '@/components/comment-sidebar';
import PostInteractionButtons from '@/components/post-interaction-buttons';
import { useInfiniteScroll } from '@/hooks';

// Types for our data
interface Author {
  id: string;
  username: string;
  displayName?: string;
  profileImage?: string;
}

interface Like {
  userId: string;
  user: {
    id: string;
    username: string;
  };
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
  likes?: Like[];
  comments?: { id: string }[];
}

interface User {
  id: string;
  username: string;
  displayName?: string;
  profileImage?: string;
  summary?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
}

function SearchPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParam = searchParams.get('q');
  const tagParam = searchParams.get('tag');

  // State for comment sidebar
  const [commentSidebarOpen, setCommentSidebarOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Search state
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(searchParam || (tagParam ? `#${tagParam}` : ''));
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('posts');

  // Pagination state
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Function to fetch search results
  const fetchSearchResults = useCallback(async (reset = false) => {
    // Don't search if no search term
    if (!searchTerm.trim()) {
      setPosts([]);
      setUsers([]);
      setIsLoading(false);
      return;
    }

    // Reset pagination if needed
    if (reset) {
      setPage(0);
      setPosts([]);
      setUsers([]);
      setHasMore(true);
      return; // Exit early to avoid duplicate fetches
    }

    // Don't fetch if we've reached the end
    if (!hasMore) return;

    const limit = 10;
    const offset = page * limit;

    setIsLoading(true);
    setError('');

    try {

      // Regular search based on active tab
      if (activeTab === 'users') {
        const response = await fetch(`/api/users?search=${encodeURIComponent(searchTerm)}&limit=${limit}&offset=${offset}`);

        if (!response.ok) throw new Error('Failed to search users');

        const data = await response.json();
        setUsers(prev => reset ? data : [...prev, ...data]);
        setHasMore(data.length === limit);
        setPage(prev => prev + 1);
      } else {
        // For posts, we'll use the search API which handles both regular and hashtag searches
        const response = await fetch(`/api/posts/search?q=${encodeURIComponent(searchTerm)}&limit=${limit}&offset=${offset}`);

        if (!response.ok) throw new Error('Failed to search posts');

        const data = await response.json();
        setPosts(prev => reset ? data : [...prev, ...data]);
        setHasMore(data.length === limit);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error searching:', err);
      setError('Failed to search');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, activeTab, page, hasMore]);

  // Load more content when scrolling
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return false;
    fetchSearchResults();
    return hasMore;
  }, [isLoading, hasMore, fetchSearchResults]);

  // Set up infinite scrolling
  const { isLoading: isLoadingMore } = useInfiniteScroll(loadMore, loaderRef);

  // Listen for URL parameter changes
  useEffect(() => {
    const tag = searchParams.get('tag');
    const search = searchParams.get('q');

    if (tag) {
      setSearchTerm(`#${tag}`);
    } else if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  // Perform search when URL parameters change
  useEffect(() => {
    if (searchTerm) {
      fetchSearchResults(true);
    }
  }, [searchParams, fetchSearchResults]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(0);
    setPosts([]);
    setUsers([]);
    setHasMore(true);
    fetchSearchResults(true);
  };

  // Handle post like/unlike
  const handleLikePost = async (postId: string) => {
    try {
      const isLiked = likedPosts.has(postId);
      const method = isLiked ? 'DELETE' : 'POST';

      const response = await fetch(`/api/likes?postId=${postId}`, { method });

      if (response.ok) {
        // Update local state
        const newLikedPosts = new Set(likedPosts);
        isLiked ? newLikedPosts.delete(postId) : newLikedPosts.add(postId);
        setLikedPosts(newLikedPosts);

        // Update the post in the list
        setPosts(posts.map(post => {
          if (post.id === postId) {
            const currentLikes = post.likes || [];
            if (isLiked) {
              // Remove the like
              return {
                ...post,
                likes: currentLikes.filter(like => like.userId !== user?.id)
              };
            } else {
              // Add the like
              return {
                ...post,
                likes: [...currentLikes, { userId: user?.id || '', user: { id: user?.id || '', username: user?.username || '' } }]
              };
            }
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  // Initial loading state
  if (isLoading && !posts.length && !users.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Search</h1>
        </div>
        <div className="text-center py-8">
          <div className="inline-block p-3 bg-muted/30 rounded-lg animate-pulse">
            <div className="h-5 w-28 bg-muted rounded mb-2"></div>
            <div className="h-4 w-40 bg-muted/70 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Search</h1>
      </div>

      {searchTerm && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            {activeTab === 'users'
              ? `${users.length} ${users.length === 1 ? 'user' : 'users'}`
              : `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`}
            found for &quot;{searchTerm}&quot;
          </p>
          {searchTerm.startsWith('#') && (
            <Badge variant="secondary" className="mr-2 cursor-pointer">
              {searchTerm}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              router.push('/search');
            }}
            className="ml-2"
          >
            Clear
          </Button>
        </div>
      )}

      <Tabs defaultValue="posts" className="mb-6" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          {error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <Button
                onClick={() => fetchSearchResults(true)}
                variant="outline"
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : activeTab === 'users' ? (
            users.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">No users found matching your search.</p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm('');
                      router.push('/search');
                    }}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user: User) => (
                  <Card
                    key={user.id}
                    className="p-1 border border-border/40 hover:border-primary/20 transition-all duration-200"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Link href={`/users/${user.username}`}>
                          <Avatar className="h-12 w-12 border border-background">
                            <AvatarImage src={user.profileImage} alt={user.username} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                              {user.displayName?.[0] || user.username[0]}
                            </AvatarFallback>
                          </Avatar>
                        </Link>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1">
                            <Link href={`/users/${user.username}`} className="font-semibold hover:text-primary hover:underline transition-colors duration-200 truncate">
                              {user.displayName || user.username}
                            </Link>
                            <span className="text-muted-foreground text-sm">@{user.username}</span>
                          </div>
                          {user.summary && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{user.summary}</p>
                          )}
                          <div className="mt-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/users/${user.username}`}>View Profile</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Loading indicator for users */}
                {activeTab === 'users' && hasMore && (
                  <div ref={loaderRef} className="py-4 text-center">
                    {isLoadingMore && (
                      <div className="inline-block p-3 bg-muted/30 rounded-lg animate-pulse">
                        <div className="h-4 w-28 bg-muted rounded"></div>
                      </div>
                    )}
                  </div>
                )}

                {/* End of users message */}
                {activeTab === 'users' && !hasMore && users.length > 0 && (
                  <div className="text-sm text-muted-foreground py-2 text-center">
                    No more users to load
                  </div>
                )}
              </div>
            )
          ) : posts.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">No posts found matching your search.</p>
              {searchTerm && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    router.push('/search');
                  }}
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post: Post) => (
                <Card
                  key={post.id}
                  className="p-1 border border-border/40 hover:border-primary/20 transition-all duration-200"
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Link href={`/users/${post.author.username}`}>
                        <Avatar className="h-8 w-8 border border-background">
                          <AvatarImage src={post.author.profileImage} alt={post.author.username} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                            {post.author.displayName?.[0] || post.author.username[0]}
                          </AvatarFallback>
                        </Avatar>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 text-sm">
                          <Link href={`/users/${post.author.username}`} className="font-semibold hover:text-primary hover:underline transition-colors duration-200 truncate">
                            {post.author.displayName || post.author.username}
                          </Link>
                          <span className="text-muted-foreground text-xs">@{post.author.username}</span>
                          <span className="text-muted-foreground text-xs">·</span>
                          <span className="text-muted-foreground text-xs">
                            {formatDistanceToNow(new Date(post.createdAt))}
                          </span>
                        </div>

                        <div className="mt-1">
                          <div className="prose prose-sm dark:prose-invert max-w-none transition-colors duration-200">
                            <MarkdownContent content={post.content} />
                          </div>
                        </div>

                        <div className="flex gap-4 mt-2 text-sm">
                          <PostInteractionButtons
                            postId={post.id}
                            authorId={post.author.id}
                            isLiked={likedPosts.has(post.id)}
                            likesCount={post.likes?.length || 0}
                            commentsCount={post.comments?.length || 0}
                            onLike={(postId) => handleLikePost(postId)}
                            onComment={() => {
                              setSelectedPostId(post.id);
                              setCommentSidebarOpen(true);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Loading indicator for posts */}
              <div ref={loaderRef} className="py-4 text-center">
                {hasMore && isLoadingMore && (
                  <div className="inline-block p-3 bg-muted/30 rounded-lg animate-pulse">
                    <div className="h-4 w-28 bg-muted rounded"></div>
                  </div>
                )}

                {/* End of posts message */}
                {!hasMore && posts.length > 0 && (
                  <div className="text-sm text-muted-foreground py-2">
                    No more posts to load
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block">
          <div className="sticky top-20">
            <TagCloud maxTags={20} />
          </div>
        </div>
      </div>

      {/* Comment Sidebar */}
      <CommentSidebar
        isOpen={commentSidebarOpen}
        onClose={() => setCommentSidebarOpen(false)}
        postId={selectedPostId}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
