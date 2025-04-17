'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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

// Import Mynaui icons
import {
  Heart,
  HeartSolid,
  MessageDots,
  Share
} from '@mynaui/icons-react';

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

function ExplorePageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tagParam = searchParams.get('tag');

  const [hotPosts, setHotPosts] = useState<Post[]>([]);
  const [newPosts, setNewPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(tagParam ? `#${tagParam}` : '');
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

      // Regular search
      const response = await fetch(`/api/posts/explore?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to search posts');
      }
      const data = await response.json();
      setFilteredPosts(data);
    } catch (err) {
      console.error('Error searching:', err);
      setError('Failed to search');
    } finally {
      setIsLoading(false);
    }
  }, [user, hotPosts, newPosts, searchTerm]);

  useEffect(() => {
    fetchPosts('hot');
    fetchPosts('new');
  }, [fetchPosts]);

  useEffect(() => {
    if (searchTerm) {
      searchPosts();
    } else {
      // If no search term, show posts based on active tab
      setFilteredPosts(activeTab === 'hot' ? hotPosts : newPosts);
    }
  }, [searchTerm, searchPosts, activeTab, hotPosts, newPosts]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredPosts(activeTab === 'hot' ? hotPosts : newPosts);
    }
  }, [activeTab, searchTerm, hotPosts, newPosts]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (!searchTerm) {
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Explore</h1>
          <div className="w-full max-w-md">
            <Input
              type="search"
              placeholder="Search users, posts, or 'my posts'"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              disabled
            />
          </div>
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
          <Input
            type="search"
            placeholder="Search users, posts, or 'my posts'"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
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
            onClick={() => setSearchTerm('')}
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
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">No posts found matching your search.</p>
              {searchTerm && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchTerm('')}
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
                  className="border border-border/40 hover:border-primary/20 transition-all duration-200"
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
                          <Link
                            href={`/posts/${post.id}`}
                            className="block mt-2 text-xs text-muted-foreground hover:text-primary transition-colors duration-200"
                          >
                            View full post
                          </Link>
                        </div>

                        {/* Extract and display hashtags */}
                        {extractHashtags(post.content).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {extractHashtags(post.content).map(tag => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs hover:bg-primary/10 transition-colors cursor-pointer"
                                onClick={() => setSearchTerm(`#${tag}`)}
                              >
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-4 mt-2 text-sm">
                          <Link
                            href={`/posts/${post.id}`}
                            className="text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors duration-200"
                          >
                            <MessageDots className="w-4 h-4" />
                            <span>{post.comments?.length || 0}</span>
                          </Link>
                          <button
                            className="text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors duration-200"
                            onClick={(e) => {
                              e.preventDefault();
                              // Share functionality would go here
                              alert('Share functionality coming soon!');
                            }}
                          >
                            <Share className="w-4 h-4" />
                            <span>{0}</span>
                          </button>
                          <button
                            className={`flex items-center gap-1 transition-colors duration-200 ${likedPosts.has(post.id) ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleLikePost(post.id);
                            }}
                          >
                            {likedPosts.has(post.id) ?
                              <HeartSolid className="w-4 h-4" /> :
                              <Heart className="w-4 h-4" />
                            }
                            <span>{post.likes?.length || 0}</span>
                          </button>
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
