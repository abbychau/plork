'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import MarkdownContent from '@/components/markdown-content';
import CommentSection from '@/components/comment-section';
import EnhancedPostEditor from '@/components/enhanced-post-editor';

import PostInteractionButtons from '@/components/post-interaction-buttons';

interface Like {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName?: string;
    profileImage?: string;
  };
}

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
  likes: Like[];
  comments: Comment[];
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  // isPreviewMode is now handled by the EnhancedPostEditor
  const [editContent, setEditContent] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  const postId = params.postId as string;

  useEffect(() => {
    // Skip if no postId
    if (!postId) return;

    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/posts/single?postId=${postId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Post not found');
          }
          throw new Error('Failed to fetch post');
        }

        const data = await response.json();
        setPost(data);
        setEditContent(data.content);

        // Check if the post is liked by the current user
        if (user) {
          const liked = data.likes.some((like: any) => like.userId === user.id);
          setIsLiked(liked);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, user]);

  const handleEditPost = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(post?.content || '');
  };



  const handleLike = async () => {
    if (!user || !post) {
      router.push('/login');
      return;
    }

    try {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/likes?postId=${post.id}`, {
        method,
      });

      if (response.ok) {
        // Update local state
        setIsLiked(!isLiked);

        // Update post likes count
        setPost(prevPost => {
          if (!prevPost) return null;

          return {
            ...prevPost,
            likes: isLiked
              ? prevPost.likes.filter((like) => like.userId !== user.id)
              : [...prevPost.likes, { id: 'temp-' + Date.now(), userId: user.id, user: { id: user.id, username: user.username } }]
          };
        });

        // Show toast notification
        if (!isLiked && post.author.id !== user.id) {
          toast({
            title: "Post liked",
            description: `${post.author.displayName || post.author.username} will be notified of your like.`,
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

  const handleSaveEdit = async (newContent: string) => {
    if (!post || !newContent.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update post');
      }

      const updatedPost = await response.json();
      setPost(updatedPost);
      setIsEditing(false);
      toast({
        title: "Post updated",
        description: "Your post has been successfully updated"
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
      console.error('Error updating post:', err);
      toast({
        title: "Update failed",
        description: "Could not update your post",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading post...</div>;
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500 mb-4">{error || 'Post not found'}</p>
        <Button onClick={() => router.push('/')}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={post.author.profileImage} alt={post.author.username} />
              <AvatarFallback>
                {post.author.displayName?.[0] || post.author.username[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link href={`/users/${post.author.username}`} className="font-semibold hover:underline">
                  {post.author.displayName || post.author.username}
                </Link>
                <span className="text-muted-foreground">@{post.author.username}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              {isEditing ? (
                <div className="mt-4">
                  <EnhancedPostEditor
                    mode="edit"
                    initialContent={editContent}
                    isLoading={isLoading}
                    onEditSubmit={handleSaveEdit}
                    onCancel={handleCancelEdit}
                  />
                </div>
              ) : (
                <div className="mt-2">
                  <MarkdownContent content={post.content} />
                </div>
              )}

              {/* Post interaction buttons will show the counts */}

              <div className="border-t mt-4 pt-4">
                <PostInteractionButtons
                  postId={post.id}
                  authorId={post.author.id}
                  isLiked={isLiked}
                  likesCount={post.likes?.length || 0}
                  commentsCount={post.comments?.length || 0}
                  onLike={() => handleLike()}
                  onEdit={user && user.id === post.author.id && !isEditing ? handleEditPost : undefined}
                  hideViewFullPost={true}
                />
              </div>
            </div>
          </div>

          <CommentSection
            postId={post.id}
            initialComments={post.comments || []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
