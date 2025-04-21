'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import MarkdownContent from '@/components/markdown-content';
import TagCloud from '@/components/tag-cloud';
import { formatDistanceToNow } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import CommentSidebar from '@/components/comment-sidebar';
import PostInteractionButtons from '@/components/post-interaction-buttons';
import { useInfiniteScroll } from '@/hooks';

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
}

function ExplorePageContent() {
  const { } = useAuth();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const tagParam = searchParams.get('tag');

  const [commentSidebarOpen, setCommentSidebarOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const [hotPosts, setHotPosts] = useState<Post[]>([]);
  const [newPosts, setNewPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('hot');
  const [taggedPosts, setTaggedPosts] = useState<Post[]>([]);

  // Pagination state
  const [hotPage, setHotPage] = useState(0);
  const [newPage, setNewPage] = useState(0);
  const [usersPage, setUsersPage] = useState(0);
  const [tagPage, setTagPage] = useState(0);
  const [hasMoreHot, setHasMoreHot] = useState(true);
  const [hasMoreNew, setHasMoreNew] = useState(true);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [hasMoreTagged, setHasMoreTagged] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Fetch posts by tag
  const fetchTaggedPosts = useCallback(async (reset = false) => {
    if (!tagParam) return;

    if (reset) {
      setTagPage(0);
      setTaggedPosts([]);
      setHasMoreTagged(true);
      return; // Exit early after reset to avoid duplicate fetches
    }

    // Don't fetch if we've reached the end
    if (!hasMoreTagged) {
      return;
    }

    const currentPageValue = tagPage;
    const limit = 10;
    const offset = currentPageValue * limit;

    console.log(`Fetching tagged posts with tag: ${tagParam}, offset: ${offset}, page: ${currentPageValue}`);

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/posts/hashtag?tag=${encodeURIComponent(tagParam)}&limit=${limit}&offset=${offset}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch posts with tag #${tagParam}`);
      }

      const data = await response.json();

      // If we received fewer posts than the limit, we've reached the end
      if (data.length < limit) {
        setHasMoreTagged(false);
      }

      setTaggedPosts(prev => [...prev, ...data]);
      setTagPage(prev => prev + 1);
      setFilteredPosts(prev => [...prev, ...data]);

      // Update liked posts set
      const userId = localStorage.getItem('userId');
      if (userId) {
        const newLikedPosts = new Set<string>(likedPosts);
        data.forEach((post: Post) => {
          if (post.likes && post.likes.some((like: Like) => like.userId === userId)) {
            newLikedPosts.add(post.id);
          }
        });
        setLikedPosts(newLikedPosts);
      }
    } catch (err) {
      console.error(`Error fetching tagged posts:`, err);
      setError(`Failed to load posts with tag #${tagParam}`);
    } finally {
      setIsLoading(false);
    }
  }, [tagParam, tagPage, hasMoreTagged, likedPosts]);

  const fetchPosts = useCallback(async (type: string, reset = false) => {
    if (reset) {
      if (type === 'hot') {
        setHotPage(0);
        setHotPosts([]);
        setHasMoreHot(true);
      } else {
        setNewPage(0);
        setNewPosts([]);
        setHasMoreNew(true);
      }
      return; // Exit early after reset to avoid duplicate fetches
    }

    // Don't fetch if we've reached the end
    if ((type === 'hot' && !hasMoreHot) || (type === 'new' && !hasMoreNew)) {
      return;
    }

    // Get current page values directly
    const currentPageValue = type === 'hot' ? hotPage : newPage;
    const limit = 10;
    const offset = currentPageValue * limit;

    console.log(`Fetching ${type} posts with offset: ${offset}, page: ${currentPageValue}`);

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/posts/explore?type=${type}&limit=${limit}&offset=${offset}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} posts`);
      }

      const data = await response.json();

      // If we received fewer posts than the limit, we've reached the end
      if (data.length < limit) {
        if (type === 'hot') {
          setHasMoreHot(false);
        } else {
          setHasMoreNew(false);
        }
      }

      if (type === 'hot') {
        setHotPosts(prev => [...prev, ...data]);
        setHotPage(prev => prev + 1);
        if (activeTab === 'hot') {
          setFilteredPosts(prev => [...prev, ...data]);
        }
      } else {
        setNewPosts(prev => [...prev, ...data]);
        setNewPage(prev => prev + 1);
        if (activeTab === 'new') {
          setFilteredPosts(prev => [...prev, ...data]);
        }
      }

      // Update liked posts set
      const userId = localStorage.getItem('userId');
      if (userId) {
        const newLikedPosts = new Set<string>(likedPosts);
        data.forEach((post: Post) => {
          if (post.likes && post.likes.some((like: Like) => like.userId === userId)) {
            newLikedPosts.add(post.id);
          }
        });
        setLikedPosts(newLikedPosts);
      }
    } catch (err) {
      console.error(`Error fetching ${type} posts:`, err);
      setError(`Failed to load ${type} posts`);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, likedPosts, hotPage, newPage, hasMoreHot, hasMoreNew]);



  const fetchUsers = useCallback(async (reset = false) => {
    if (reset) {
      setUsersPage(0);
      setUsers([]);
      setHasMoreUsers(true);
      return; // Exit early after reset to avoid duplicate fetches
    }

    // Don't fetch if we've reached the end
    if (!hasMoreUsers) {
      return;
    }

    // Get current page value directly
    const currentPageValue = usersPage;
    const limit = 10;
    const offset = currentPageValue * limit;

    console.log(`Fetching users with offset: ${offset}, page: ${currentPageValue}`);

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/users?limit=${limit}&offset=${offset}`);

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();

      // Check if we've reached the end
      if (data.length < limit) {
        setHasMoreUsers(false);
      }

      setUsers(prev => [...prev, ...data]);
      setUsersPage(prev => prev + 1);

      if (activeTab === 'users') {
        setFilteredUsers(prev => [...prev, ...data]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, usersPage, hasMoreUsers]);

  // Load more content based on the active tab
  const loadMore = useCallback(async () => {
    if (isLoading) return false;

    // If we have a tag parameter, we're in tag filtering mode
    if (tagParam) {
      if (!hasMoreTagged) return false;
      await fetchTaggedPosts();
      return hasMoreTagged;
    }

    // Check if there's more content to load based on the current view
    const hasMore = activeTab === 'hot'
      ? hasMoreHot
      : activeTab === 'new'
        ? hasMoreNew
        : activeTab === 'users'
          ? hasMoreUsers
          : false;

    // If there's no more content, stop the infinite scroll
    if (!hasMore) return false;

    if (activeTab === 'hot') {
      // Load more hot posts
      await fetchPosts('hot');
      return hasMoreHot;
    } else if (activeTab === 'new') {
      // Load more new posts
      await fetchPosts('new');
      return hasMoreNew;
    } else if (activeTab === 'users') {
      // Load more users
      await fetchUsers();
      return hasMoreUsers;
    }

    return false; // Default case, stop infinite scroll
  }, [isLoading, activeTab, fetchPosts, fetchUsers, hasMoreHot, hasMoreNew, hasMoreUsers, tagParam, fetchTaggedPosts, hasMoreTagged]);

  // Set up infinite scrolling
  const { isLoading: isLoadingMore, hasMore } = useInfiniteScroll(
    loadMore,
    loaderRef
  );

  // Sync the hook's hasMore state with our component states
  useEffect(() => {
    if (!hasMore) {
      if (tagParam && hasMoreTagged) {
        setHasMoreTagged(false);
      } else if (activeTab === 'hot' && hasMoreHot) {
        setHasMoreHot(false);
      } else if (activeTab === 'new' && hasMoreNew) {
        setHasMoreNew(false);
      } else if (activeTab === 'users' && hasMoreUsers) {
        setHasMoreUsers(false);
      }
    }
  }, [hasMore, activeTab, hasMoreHot, hasMoreNew, hasMoreUsers, tagParam, hasMoreTagged]);

  // Initial data loading
  useEffect(() => {
    // Reset everything and load first pages directly
    // to avoid circular dependency issues
    const fetchInitialData = async () => {
      setIsLoading(true);

      try {
        // Reset pagination state
        setHotPage(0);
        setNewPage(0);
        setUsersPage(0);
        setTagPage(0);
        setHotPosts([]);
        setNewPosts([]);
        setUsers([]);
        setTaggedPosts([]);
        setHasMoreHot(true);
        setHasMoreNew(true);
        setHasMoreUsers(true);
        setHasMoreTagged(true);
        setFilteredPosts([]);

        // If we have a tag parameter, fetch tagged posts
        if (tagParam) {
          const taggedResponse = await fetch(`/api/posts/hashtag?tag=${encodeURIComponent(tagParam)}&limit=10&offset=0`);

          if (!taggedResponse.ok) {
            throw new Error(`Failed to fetch posts with tag #${tagParam}`);
          }

          const taggedData = await taggedResponse.json();
          setTaggedPosts(taggedData);
          setFilteredPosts(taggedData);
          setTagPage(1);

          if (taggedData.length < 10) {
            setHasMoreTagged(false);
          }

          // Update liked posts set
          const userId = localStorage.getItem('userId');
          if (userId) {
            const newLikedPosts = new Set<string>();
            taggedData.forEach((post: Post) => {
              if (post.likes && post.likes.some((like: Like) => like.userId === userId)) {
                newLikedPosts.add(post.id);
              }
            });
            setLikedPosts(newLikedPosts);
          }
        } else {
          // Fetch initial data in parallel for regular explore view
          const [hotResponse, newResponse, usersResponse] = await Promise.all([
            fetch('/api/posts/explore?type=hot&limit=10&offset=0'),
            fetch('/api/posts/explore?type=new&limit=10&offset=0'),
            fetch('/api/users?limit=10&offset=0')
          ]);

          if (!hotResponse.ok || !newResponse.ok || !usersResponse.ok) {
            throw new Error('Failed to fetch initial data');
          }

          const [hotData, newData, usersData] = await Promise.all([
            hotResponse.json(),
            newResponse.json(),
            usersResponse.json()
          ]);

          // Update state with fetched data
          setHotPosts(hotData);
          setNewPosts(newData);
          setUsers(usersData);

          // Set pagination state
          setHotPage(1);
          setNewPage(1);
          setUsersPage(1);

          // Check if we've reached the end
          if (hotData.length < 10) setHasMoreHot(false);
          if (newData.length < 10) setHasMoreNew(false);
          if (usersData.length < 10) setHasMoreUsers(false);

          // Set filtered content based on active tab
          if (activeTab === 'hot') {
            setFilteredPosts(hotData);
          } else if (activeTab === 'new') {
            setFilteredPosts(newData);
          } else if (activeTab === 'users') {
            setFilteredUsers(usersData);
          }

          // Update liked posts set
          const userId = localStorage.getItem('userId');
          if (userId) {
            const newLikedPosts = new Set<string>();
            [...hotData, ...newData].forEach((post: Post) => {
              if (post.likes && post.likes.some((like: Like) => like.userId === userId)) {
                newLikedPosts.add(post.id);
              }
            });
            setLikedPosts(newLikedPosts);
          }
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load initial data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [activeTab, tagParam]); // Add tagParam to dependencies

  useEffect(() => {
    // If we have a tag parameter, we're in tag filtering mode
    if (tagParam) {
      setFilteredPosts(taggedPosts);
    } else if (activeTab === 'users') {
      setFilteredUsers(users);
    } else {
      setFilteredPosts(activeTab === 'hot' ? hotPosts : newPosts);
    }
  }, [activeTab, hotPosts, newPosts, users, tagParam, taggedPosts]);

  const handleTabChange = (value: string) => {
    // If we're in tag filtering mode, don't change tabs
    if (tagParam) return;

    setActiveTab(value);
    // Reset filtered content when changing tabs
    if (value === 'users') {
      setFilteredUsers(users);
    } else {
      setFilteredPosts(value === 'hot' ? hotPosts : newPosts);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const isLiked = likedPosts.has(postId);
      const method = isLiked ? 'DELETE' : 'POST';

      const response = await fetch(`/api/likes?postId=${postId}`, {
        method,
      });

      if (response.ok) {
        // Update local state
        const newLikedPosts = new Set(likedPosts);
        if (isLiked) {
          newLikedPosts.delete(postId);
        } else {
          newLikedPosts.add(postId);
        }
        setLikedPosts(newLikedPosts);

        // Refresh posts to get updated like counts
        fetchPosts('hot');
        fetchPosts('new');
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };



  if (isLoading && !filteredPosts.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Explore</h1>
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
        <h1 className="text-3xl font-bold">Explore</h1>
        {tagParam && (
          <div className="text-lg font-medium">
            <Badge variant="secondary" className="text-base px-3 py-1">
              #{tagParam}
            </Badge>
          </div>
        )}
      </div>

      {!tagParam && (
        <Tabs defaultValue="hot" className="mb-6" onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="hot">Hot Posts</TabsTrigger>
            <TabsTrigger value="new">New Posts</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          {error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <Button
                onClick={() => {
                  fetchPosts('hot');
                  fetchPosts('new');
                }}
                variant="outline"
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : activeTab === 'users' ? (
            filteredUsers.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">No users found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
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
                {activeTab === 'users' && hasMoreUsers && (
                  <div ref={loaderRef} className="py-4 text-center">
                    {isLoadingMore && (
                      <div className="inline-block p-3 bg-muted/30 rounded-lg animate-pulse">
                        <div className="h-4 w-28 bg-muted rounded"></div>
                      </div>
                    )}
                  </div>
                )}

                {/* End of users message */}
                {activeTab === 'users' && !hasMoreUsers && users.length > 0 && (
                  <div className="text-sm text-muted-foreground py-2 text-center">
                    No more users to load
                  </div>
                )}
              </div>
            )
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">No posts found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="
                  p-1
                  border border-border/40 hover:border-primary/20 transition-all duration-200"
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
                            onLike={(postId) => {
                              handleLikePost(postId);
                            }}
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
                {((tagParam && hasMoreTagged) ||
                  (activeTab === 'hot' && hasMoreHot) ||
                  (activeTab === 'new' && hasMoreNew)) && isLoadingMore && (
                  <div className="inline-block p-3 bg-muted/30 rounded-lg animate-pulse">
                    <div className="h-4 w-28 bg-muted rounded"></div>
                  </div>
                )}

                {/* End of posts message */}
                {((tagParam && !hasMoreTagged && taggedPosts.length > 0) ||
                  (activeTab === 'hot' && !hasMoreHot && hotPosts.length > 0) ||
                  (activeTab === 'new' && !hasMoreNew && newPosts.length > 0)) && (
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

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading...</div>}>
      <ExplorePageContent />
    </Suspense>
  );
}
