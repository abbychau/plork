'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import MarkdownContent from '@/components/markdown-content';
import CommentSection from '@/components/comment-section';

// Import Mynaui icons
import {
  Edit,
  Heart,
  HeartSolid,
  Share
} from '@mynaui/icons-react';

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
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
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
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (!post || !editContent.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/posts/single?postId=${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update post');
      }

      const updatedPost = await response.json();
      setPost(updatedPost);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
      console.error('Error updating post:', err);
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.back()}
      >
        ← Back
      </Button>

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
                  <textarea
                    className="w-full p-3 border rounded-md text-sm min-h-[150px] focus:outline-none focus:ring-2 focus:ring-primary"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <MarkdownContent content={post.content} />
                </div>
              )}

              <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                <div>
                  <span>{post.comments?.length || 0}</span> Comments
                </div>
                <div>
                  <span>{post.likes?.length || 0}</span> Likes
                </div>
              </div>

              <div className="border-t mt-4 pt-4">
                <div className="flex gap-4">
                  {user && user.id === post.author.id && !isEditing && (
                    <button
                      className="text-muted-foreground hover:text-primary flex items-center gap-1"
                      onClick={handleEditPost}
                    >
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </button>
                  )}

                  <button
                    className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                    onClick={handleLike}
                  >
                    {isLiked ?
                      <HeartSolid className="w-4 h-4 mr-1" /> :
                      <Heart className="w-4 h-4 mr-1" />
                    }
                    {isLiked ? 'Liked' : 'Like'}
                  </button>
                  <button className="text-muted-foreground hover:text-primary flex items-center gap-1">
                    <Share className="w-4 h-4 mr-1" /> Share
                  </button>
                </div>
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
