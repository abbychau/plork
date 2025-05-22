'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import CreatePostModal from '@/components/create-post-modal';
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
import { useInfiniteScroll } from '@/hooks';

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
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [checkingNewPosts, setCheckingNewPosts] = useState(false);
  const [lastPostId, setLastPostId] = useState<string | null>(null);

  // Pagination state - using nextOffset instead of page
  const [nextOffset, setNextOffset] = useState<number | null>(0);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Initial data loading
  useEffect(() => {
    if (!user) return;

    const fetchInitialPosts = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch('/api/posts?limit=10&offset=0');

        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        setPosts(data);

        // Store the ID of the most recent post for checking new posts later
        if (data.length > 0) {
          setLastPostId(data[0].id);
        }

        // Set next offset for pagination or null if no more posts
        setNextOffset(data.length < 10 ? null : 10);

        // Update liked posts set
        const newLikedPosts = new Set<string>();
        data.forEach((post: Post) => {
          if (post.likes && post.likes.some((like: any) => like.userId === user.id)) {
            newLikedPosts.add(post.id);
          }
        });
        setLikedPosts(newLikedPosts);
      } catch (err) {
        console.error('Error fetching initial posts:', err);
        setError('Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialPosts();
  }, [user]);

  // Function to load more posts
  const loadMorePosts = useCallback(async () => {
    // If there's no next offset, we've reached the end
    if (nextOffset === null || isLoading) {
      return false;
    }

    try {
      console.log(`Loading more posts with offset: ${nextOffset}`);
      const response = await fetch(`/api/posts?limit=10&offset=${nextOffset}`);

      if (!response.ok) {
        throw new Error('Failed to fetch more posts');
      }

      const data = await response.json();

      // If we got fewer than 10 posts, we've reached the end
      if (data.length < 10) {
        setNextOffset(null); // No more posts to load
      } else {
        setNextOffset(nextOffset + 10); // Set next offset
      }

      // Append new posts to existing ones
      setPosts(prevPosts => [...prevPosts, ...data]);

      // Update liked posts set
      const newLikedPosts = new Set<string>(likedPosts);
      data.forEach((post: Post) => {
        if (post.likes && post.likes.some((like: any) => like.userId === user.id)) {
          newLikedPosts.add(post.id);
        }
      });
      setLikedPosts(newLikedPosts);

      // Return true if there are more posts to load
      return data.length === 10;
    } catch (err) {
      console.error('Error loading more posts:', err);
      return false;
    }
  }, [nextOffset, isLoading, user, likedPosts]);

  // Set up infinite scrolling
  const { isLoading: isLoadingMore } = useInfiniteScroll(
    loadMorePosts,
    loaderRef
  );

  // Function to check for new posts
  const checkForNewPosts = useCallback(async () => {
    if (!user || !lastPostId || checkingNewPosts) return;

    setCheckingNewPosts(true);
    try {
      // Fetch the most recent posts to see if there are any new ones
      const response = await fetch('/api/posts?limit=1&offset=0');

      if (!response.ok) {
        throw new Error('Failed to check for new posts');
      }

      const data = await response.json();

      // If we got a post and it's different from our most recent one, there are new posts
      if (data.length > 0 && data[0].id !== lastPostId) {
        setHasNewPosts(true);
      }
    } catch (err) {
      console.error('Error checking for new posts:', err);
    } finally {
      setCheckingNewPosts(false);
    }
  }, [user, lastPostId, checkingNewPosts]);

  // Function to load new posts
  const loadNewPosts = useCallback(async () => {
    if (!user || !lastPostId) return;

    setIsLoading(true);
    setHasNewPosts(false);

    try {
      // Fetch all posts since the last time we loaded
      const response = await fetch('/api/posts?limit=50&offset=0');

      if (!response.ok) {
        throw new Error('Failed to fetch new posts');
      }

      const data = await response.json();

      // Find the index of our current most recent post
      const lastPostIndex = data.findIndex((post: Post) => post.id === lastPostId);

      // If we found it and there are new posts before it
      if (lastPostIndex > 0) {
        // Get only the new posts
        const newPosts = data.slice(0, lastPostIndex);

        // Update the posts list with the new posts at the top
        setPosts(prevPosts => [...newPosts, ...prevPosts]);

        // Update the last post ID
        if (newPosts.length > 0) {
          setLastPostId(newPosts[0].id);
        }

        // Update liked posts set
        const newLikedPosts = new Set<string>(likedPosts);
        newPosts.forEach((post: Post) => {
          if (post.likes && post.likes.some((like: any) => like.userId === user.id)) {
            newLikedPosts.add(post.id);
          }
        });
        setLikedPosts(newLikedPosts);
      } else if (data.length > 0) {
        // If we didn't find our last post, just replace everything
        setPosts(data);
        setLastPostId(data[0].id);

        // Update liked posts set
        const newLikedPosts = new Set<string>();
        data.forEach((post: Post) => {
          if (post.likes && post.likes.some((like: any) => like.userId === user.id)) {
            newLikedPosts.add(post.id);
          }
        });
        setLikedPosts(newLikedPosts);
      }
    } catch (err) {
      console.error('Error loading new posts:', err);
      setError('Failed to load new posts');
    } finally {
      setIsLoading(false);
    }
  }, [user, lastPostId, likedPosts]);

  // Set up periodic checking for new posts
  useEffect(() => {
    if (!user) return;

    // Check for new posts every 30 seconds
    const interval = setInterval(() => {
      checkForNewPosts();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, checkForNewPosts]);

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
      const response = await fetch(`/api/posts/${postId}`, {
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

  const handleDeletePost = async (postId: string) => {
    if (!user) return;

    try {
      // Send DELETE request to the API
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove post from the UI
        setPosts(posts.filter(post => post.id !== postId));
        toast({
          title: "Post deleted",
          description: "Your post has been successfully deleted"
        });
      } else {
        console.error('Failed to delete post');
        toast({
          title: "Delete failed",
          description: "Could not delete your post",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting your post",
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
          <CreatePostModal
            onPostCreated={(newPost) => {
              console.log('Timeline: New post created callback executed:', newPost);
              // Add the new post to the beginning of the list
              if (newPost) {
                setPosts(prevPosts => [newPost, ...prevPosts]);
                // Update the last post ID for checking new posts
                setLastPostId(newPost.id);
              }
            }}
          >
            <Button className="shadow-sm hover:shadow-md transition-all duration-200">
              Create Your First Post
            </Button>
          </CreatePostModal>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
      <div className="md:col-span-3">
        <div className="flex flex-col gap-2 mb-4 sticky top-0 bg-background/80 backdrop-blur-sm py-3 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">
              Timeline
            </h2>
            <CreatePostModal
              onPostCreated={(newPost) => {
                console.log('Timeline header: New post created callback executed:', newPost);
                // Add the new post to the top of the list
                if (newPost) {
                  setPosts(prevPosts => [newPost, ...prevPosts]);
                  // Update the last post ID for checking new posts
                  setLastPostId(newPost.id);
                }
              }}
            >
              <Button size="sm" className="shadow-sm hover:shadow-md transition-all duration-200">
                <span className="mr-1">+</span> New Post
              </Button>
            </CreatePostModal>
          </div>

          {/* New posts notification button */}
          {hasNewPosts && (
            <Button
              variant="outline"
              className="w-full bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary transition-all duration-200"
              onClick={loadNewPosts}
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"></polyline>
                <polyline points="23 20 23 14 17 14"></polyline>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
              </svg>
              New posts available
            </Button>
          )}
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
                        onDelete={
                          ()=>{
                            console.log("Delete post clicked");
                            if(!user || user.id !== post.author.id){
                              console.error("You are not authorized to delete this post");
                              return;
                            }
                            handleDeletePost(post.id)
                          }
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
      </div>

      <div className="hidden md:block">
        <div className="sticky top-20">
          <TagCloud />
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
