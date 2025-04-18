'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MarkdownContent from '@/components/markdown-content';
import { useAuth } from '@/lib/auth-context';
import TagCloud from '@/components/tag-cloud';
import { formatDistanceToNow } from '@/lib/utils';

// Import Mynaui icons
import {
  Edit,
  Heart,
  HeartSolid,
  MessageDots,
  Share
} from '@mynaui/icons-react';

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName?: string;
    profileImage?: string;
  };
  likes: any[];
  comments: any[];
}

export default function Timeline() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const fetchPosts = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/posts');

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(data);

      // Update liked posts set
      const newLikedPosts = new Set<string>();
      data.forEach((post: Post) => {
        if (post.likes && post.likes.some((like: any) => like.userId === user.id)) {
          newLikedPosts.add(post.id);
        }
      });
      setLikedPosts(newLikedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const handleLikeUnlike = async (postId: string) => {
    if (!user) return;

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

        // Update post likes count in the UI
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes: isLiked
                ? post.likes.filter((like: any) => like.userId !== user.id)
                : [...post.likes, { userId: user.id }]
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (postId: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`/api/posts/single?postId=${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map(post => post.id === postId ? updatedPost : post));
        setEditingPostId(null);
        setEditContent('');
      } else {
        console.error('Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-3 bg-muted/30 rounded-lg animate-pulse">
          <div className="h-6 w-32 bg-muted rounded mb-2"></div>
          <div className="h-4 w-48 bg-muted/70 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="inline-block p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-500 dark:text-red-400">
          <p className="font-medium">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="inline-block p-6 bg-muted/30 rounded-lg max-w-md">
          <h3 className="text-xl font-medium mb-2">Your timeline is empty</h3>
          <p className="mb-6 text-muted-foreground">Follow some users or create your first post to get started!</p>
          <Link href="/compose">
            <Button className="shadow-sm hover:shadow-md transition-all duration-200">
              Create Your First Post
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
      <div className="md:col-span-3">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-background/80 backdrop-blur-sm py-3 z-10">
          <h2 className="text-xl font-bold">
            Timeline
          </h2>
          <Link href="/compose">
            <Button size="sm" className="shadow-sm hover:shadow-md transition-all duration-200">
              <span className="mr-1">+</span> New Post
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {posts.map((post, index) => (
            <Card
              key={post.id}
              className="border border-border/40 hover:border-primary/20 transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
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

                    {editingPostId === post.id ? (
                      <div className="mt-2">
                        <textarea
                          className="w-full p-2 border rounded-md text-sm min-h-[100px] outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors duration-200"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-3 py-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors duration-200"
                            onClick={() => handleSaveEdit(post.id)}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
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
                    )}

                    <div className="flex gap-4 mt-2 text-sm">
                      {user && user.id === post.author.id && !editingPostId && (
                        <button
                          className="text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors duration-200"
                          onClick={(e) => {
                            e.preventDefault();
                            handleEditPost(post);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      )}
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
                          handleLikeUnlike(post.id);
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
      </div>

      <div className="hidden md:block">
        <div className="sticky top-20">
          <TagCloud posts={posts} />
        </div>
      </div>
    </div>
  );
}
