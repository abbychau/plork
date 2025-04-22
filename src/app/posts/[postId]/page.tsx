'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import MarkdownContent from '@/components/markdown-content';
import CommentSection from '@/components/comment-section';
import EnhancedPostEditor from '@/components/enhanced-post-editor';
import PostInteractionButtons from '@/components/post-interaction-buttons';
import { formatDistanceToNow } from '@/lib/utils';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import logo from '@/app/favicon.svg';

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

// Separate component for post detail content
function PostDetailContent() {
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
  const commentsRef = useRef<HTMLDivElement>(null);

  const postId = params.postId as string;


  // Add a class to the body to ensure scrolling works
  useEffect(() => {
    document.body.classList.add('overflow-auto');
    return () => {
      document.body.classList.remove('overflow-auto');
    };
  }, []);

  // Set document title when post loads
  useEffect(() => {
    if (post) {
      const authorName = post.author.displayName || post.author.username;
      document.title = `${authorName}'s Post - Plork`;
    }
    return () => {
      document.title = 'Plork';
    };
  }, [post]);

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

  const scrollToComments = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Loading state with skeleton UI
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 h-full overflow-y-scroll w-full">
        <div className="mb-4 flex items-center justify-between max-w-5xl m-auto">
          <img src={logo.src} alt="Plork" width={40} height={40} className="h-10 w-10" />
          <Skeleton className="h-9 w-32" />
        </div>

        <Card className="shadow-sm border-muted max-w-5xl m-auto">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-8 w-full mb-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8 h-full overflow-y-scroll w-full">
        <div className="mb-4 flex items-center justify-between max-w-5xl m-auto">
          <img src={logo.src} alt="Plork" width={40} height={40} className="h-10 w-10" />
        </div>

        <Card className="shadow-sm border-muted max-w-5xl m-auto">
          <CardContent className="py-12 text-center">
            <p className="text-red-500 mb-4 text-lg">{error || 'Post not found'}</p>
            <Button onClick={() => router.push('/')} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Normal render with post data
  return (
    <div className="container mx-auto px-4 py-8 h-full overflow-y-scroll w-full">
      <div className="mb-4 flex items-center justify-between max-w-5xl m-auto">
        <img src={logo.src} alt="Plork" width={40} height={40} className="h-10 w-10" />

        <Button
          variant="outline"
          size="sm"
          onClick={scrollToComments}
          className="gap-2"
        >
          <MessageSquare className="h-4 w-4" /> Comments ({post.comments?.length || 0})
        </Button>
      </div>

      <Card className=" shadow-sm border-muted max-w-5xl m-auto">
        <CardHeader className="">
          <div className="flex items-start gap-4">
            <Link href={`/users/${post.author.username}`}>
              <Avatar className="h-12 w-12 border-2 border-background shadow-sm hover:border-primary transition-colors">
                <AvatarImage src={post.author.profileImage} alt={post.author.username} />
                <AvatarFallback className="text-lg">
                  {post.author.displayName?.[0] || post.author.username[0]}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/users/${post.author.username}`} className="font-semibold hover:underline text-lg">
                  {post.author.displayName || post.author.username}
                </Link>
                <span className="text-muted-foreground">@{post.author.username}</span>
              </div>
              <div className="text-muted-foreground text-sm">
                <time dateTime={post.createdAt} title={new Date(post.createdAt).toLocaleString()}>
                  {formatDistanceToNow(new Date(post.createdAt))}
                </time>
              </div>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          {isEditing ? (
            <div className="mb-6">
              <EnhancedPostEditor
                mode="edit"
                initialContent={editContent}
                isLoading={isLoading}
                onEditSubmit={handleSaveEdit}
                onCancel={handleCancelEdit}
              />
            </div>
          ) : (
            <div className="mb-6">
              <MarkdownContent content={post.content} className="text-lg" />
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
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
        </CardContent>
      </Card>

      <Card className="shadow-sm border-muted max-w-5xl m-auto pt-0 mt-4">
        <CardContent className="pt-0">
          <div ref={commentsRef}>
            <CommentSection
              postId={post.id}
              initialComments={post.comments || []}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main page component with Suspense boundary
export default function PostDetailPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 h-full overflow-y-scroll w-full">
        <div className="mb-4 flex items-center justify-between max-w-5xl m-auto">
          <img src={logo.src} alt="Plork" width={40} height={40} className="h-10 w-10" />
          <Skeleton className="h-9 w-32" />
        </div>

        <Card className="shadow-sm border-muted max-w-5xl m-auto">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-8 w-full mb-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <PostDetailContent />
    </Suspense>
  );
}
