'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import MarkdownContent from '@/components/markdown-content';
import { useAuth } from '@/lib/auth-context';
import TagCloud from '@/components/tag-cloud';
import { formatDistanceToNow } from '@/lib/utils';
import EnhancedPostEditor from '@/components/enhanced-post-editor';
import CommentSidebar from '@/components/comment-sidebar';
import PostInteractionButtons from '@/components/post-interaction-buttons';

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
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [commentSidebarOpen, setCommentSidebarOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

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

        // Find the post that was liked/unliked
        const targetPost = posts.find(post => post.id === postId);

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

        // Show toast notification when liking a post (not when unliking)
        if (!isLiked && targetPost && targetPost.author.id !== user.id) {
          toast({
            title: "Post liked",
            description: `${targetPost.author.displayName || targetPost.author.username} will be notified of your like.`,
            duration: 3000
          });
        }
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
      toast({
        title: "Error",
        description: "Failed to like/unlike post. Please try again.",
        variant: "destructive"
      });
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

  const handleSaveEdit = async (postId: string, newContent: string) => {
    if (!newContent.trim()) return;

    try {
      const response = await fetch(`/api/posts/single?postId=${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map(post => post.id === postId ? updatedPost : post));
        setEditingPostId(null);
        setEditContent('');
        toast({
          title: "Post updated",
          description: "Your post has been successfully updated"
        });
      } else {
        console.error('Failed to update post');
        toast({
          title: "Update failed",
          description: "Could not update your post",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Update failed",
        description: "An error occurred while updating your post",
        variant: "destructive"
      });
    }
  };

  // This function is no longer needed as we're using EnhancedPostEditor

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
              className="p-1 border border-border/40 hover:border-primary/20 transition-all duration-200 animate-fade-in-up"
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
                        <EnhancedPostEditor
                          mode="edit"
                          initialContent={editContent}
                          isLoading={isLoading}
                          onEditSubmit={(newContent) => handleSaveEdit(post.id, newContent)}
                          onCancel={handleCancelEdit}
                        />
                      </div>
                    ) : (
                      <div className="mt-1">
                        <div className="prose prose-sm dark:prose-invert max-w-none transition-colors duration-200">
                          <MarkdownContent content={post.content} />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 mt-2 text-sm">
                      <PostInteractionButtons
                        postId={post.id}
                        authorId={post.author.id}
                        isLiked={likedPosts.has(post.id)}
                        likesCount={post.likes?.length || 0}
                        commentsCount={post.comments?.length || 0}
                        onLike={() => handleLikeUnlike(post.id)}
                        onEdit={user && user.id === post.author.id && !editingPostId ? () => handleEditPost(post) : undefined}
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
      </div>

      <div className="hidden md:block">
        <div className="sticky top-20">
          <TagCloud posts={posts} />
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
