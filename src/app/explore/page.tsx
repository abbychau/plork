'use client';

import { useState, useEffect, useCallback, Suspense, KeyboardEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import MarkdownContent from '@/components/markdown-content';
import TagCloud from '@/components/tag-cloud';
import { formatDistanceToNow, extractHashtags } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import CommentSidebar from '@/components/comment-sidebar';

import PostInteractionButtons from '@/components/post-interaction-buttons';

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
  const { user } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();
  const tagParam = searchParams.get('tag');
  const searchParam = searchParams.get('search');
  const [commentSidebarOpen, setCommentSidebarOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const [hotPosts, setHotPosts] = useState<Post[]>([]);
  const [newPosts, setNewPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(searchParam || (tagParam ? `#${tagParam}` : ''));
  const [inputValue, setInputValue] = useState(searchParam || (tagParam ? `#${tagParam}` : ''));
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('hot');

  const fetchPosts = useCallback(async (type: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/posts/explore?type=${type}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} posts`);
      }

      const data = await response.json();

      if (type === 'hot') {
        setHotPosts(data);
        if (activeTab === 'hot') {
          setFilteredPosts(data);
        }
      } else {
        setNewPosts(data);
        if (activeTab === 'new') {
          setFilteredPosts(data);
        }
      }

      // Update liked posts set
      const userId = localStorage.getItem('userId');
      if (userId) {
        const newLikedPosts = new Set<string>();
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
  }, [activeTab]);

  const searchPosts = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      // If searching for user's own posts
      if (searchTerm.toLowerCase() === 'my posts' && user) {
        const response = await fetch(`/api/posts/explore?username=${user.username}`);
        if (!response.ok) {
          throw new Error('Failed to fetch your posts');
        }
        const data = await response.json();
        setFilteredPosts(data);
        return;
      }

      // If term starts with #, treat it as a hashtag search
      if (searchTerm.startsWith('#')) {
        const tag = searchTerm.substring(1).toLowerCase();
        const allPosts = [...hotPosts, ...newPosts];
        // Remove duplicates
        const uniquePosts = allPosts.filter((post, index, self) =>
          index === self.findIndex((p) => p.id === post.id)
        );

        const filtered = uniquePosts.filter(post => {
          const hashtags = extractHashtags(post.content);
          return hashtags.some(hashtag => hashtag.toLowerCase().includes(tag));
        });
        setFilteredPosts(filtered);
        return;
      }

      // Regular search - use the appropriate search endpoint based on active tab
      if (activeTab === 'users') {
        const response = await fetch(`/api/users?search=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
          throw new Error('Failed to search users');
        }
        const data = await response.json();
        setFilteredUsers(data);
      } else {
        // Search posts
        const response = await fetch(`/api/posts/search?q=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
          throw new Error('Failed to search posts');
        }
        const data = await response.json();
        setFilteredPosts(data);
      }
    } catch (err) {
      console.error('Error searching:', err);
      setError('Failed to search');
    } finally {
      setIsLoading(false);
    }
  }, [user, hotPosts, newPosts, searchTerm, activeTab]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users');

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);

      if (activeTab === 'users') {
        setFilteredUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchPosts('hot');
    fetchPosts('new');
    fetchUsers();
  }, [fetchPosts, fetchUsers]);

  // Listen for URL parameter changes
  useEffect(() => {
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    if (tag) {
      const newValue = `#${tag}`;
      setSearchTerm(newValue);
      setInputValue(newValue);
    } else if (search) {
      setSearchTerm(search);
      setInputValue(search);
    }
  }, [searchParams]);

  // Only search when URL parameters change, not on every searchTerm change
  useEffect(() => {
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    if (tag || search) {
      searchPosts();
    } else {
      // If no search parameters, show content based on active tab
      if (activeTab === 'users') {
        setFilteredUsers(users);
      } else {
        setFilteredPosts(activeTab === 'hot' ? hotPosts : newPosts);
      }
    }
  }, [searchParams, searchPosts, activeTab, hotPosts, newPosts, users]);

  useEffect(() => {
    if (!searchTerm) {
      if (activeTab === 'users') {
        setFilteredUsers(users);
      } else {
        setFilteredPosts(activeTab === 'hot' ? hotPosts : newPosts);
      }
    }
  }, [activeTab, searchTerm, hotPosts, newPosts, users]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (!searchTerm) {
      if (value === 'users') {
        setFilteredUsers(users);
      } else {
        setFilteredPosts(value === 'hot' ? hotPosts : newPosts);
      }
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
        <div className="w-full md:w-auto flex-1 md:max-w-md">
          <div className="flex gap-2">
            <Input
              type="search"
              placeholder="Search posts..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  setSearchTerm(inputValue);
                  router.push(`/explore?search=${encodeURIComponent(inputValue)}`);
                }
              }}
              className="w-full"
            />
            <Button
              onClick={() => {
                setSearchTerm(inputValue);
                router.push(`/explore?search=${encodeURIComponent(inputValue)}`);
              }}
              type="submit"
              size="sm"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      {searchTerm ? (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'} for &quot;{searchTerm}&quot;
          </p>
          {searchTerm.startsWith('#') && (
            <Badge variant="secondary" className="mr-2">
              {searchTerm}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setInputValue('');
              router.push('/explore');
            }}
            className="ml-2"
          >
            Clear
          </Button>
        </div>
      ) : (
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
                <p className="text-muted-foreground">No users found matching your search.</p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm('');
                      setInputValue('');
                      router.push('/explore');
                    }}
                  >
                    Clear Search
                  </Button>
                )}
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
              </div>
            )
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">No posts found matching your search.</p>
              {searchTerm && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setInputValue('');
                    router.push('/explore');
                  }}
                >
                  Clear Search
                </Button>
              )}
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
            </div>
          )}
        </div>

        <div className="hidden md:block">
          <div className="sticky top-20">
            <TagCloud posts={[...hotPosts, ...newPosts].filter((post, index, self) =>
              index === self.findIndex((p) => p.id === post.id)
            )} />
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
