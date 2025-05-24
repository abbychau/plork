import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { usePinnedUsers } from '@/lib/pinned-users-context';
import MarkdownContent from '@/components/markdown-content';
import UserProfilePopover from '@/components/user-profile-popover';
import PostInteractionButtons from '@/components/post-interaction-buttons';
import { formatDistanceToNow } from '@/lib/utils';
import type { Post } from '@/lib/post-context';
import type { CustomEmoji } from '@/components/custom-emoji-picker';

interface PostCardProps {
  post: Post;
  showUserInfo?: boolean;
  showCommentCount?: boolean;
  showLikeCount?: boolean;
  userEmojis?: CustomEmoji[];
}

export default function PostCard({ 
  post,
  showUserInfo = true,
  showCommentCount = true,
  showLikeCount = true,
  userEmojis = []
}: PostCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addPinnedUser } = usePinnedUsers();
  const [isLiked, setIsLiked] = useState(post.likes?.some(like => like.userId === user?.id) || false);

  const handleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }

      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error updating like status:', error);
    }
  };

  const handleEdit = () => {
    router.push(`/posts/${post.id}/edit`);
  };
  const handleComment = () => {
    router.push(`/posts/${post.id}#comments`);
  };

  const handleDelete = async () => {
    if (!user || user.id !== post.authorId) {
      console.error('You are not authorized to delete this post');
      return;
    }
    
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies in the request
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      // Refresh the page or update the UI after successful deletion
      router.refresh();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };
  console.log(user);
  console.log(post.authorId);
  return (
    <div className="bg-card rounded-lg border p-4">
      {showUserInfo && (
        <div className="flex items-center gap-2 mb-3">
          <UserProfilePopover
            username={post.author.username}
            onPin={() => addPinnedUser({
              id: post.author.id,
              username: post.author.username,
              displayName: post.author.displayName,
              profileImage: post.author.profileImage
            })}
          >
            <div className="cursor-pointer">
              <Avatar className="h-8 w-8 border border-muted hover:border-primary transition-colors">
                <AvatarImage src={post.author.profileImage} alt={post.author.username} />
                <AvatarFallback>
                  {post.author.displayName?.[0] || post.author.username[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </UserProfilePopover>

          <div className="flex flex-col">
            <UserProfilePopover
              username={post.author.username}
              onPin={() => addPinnedUser({
                id: post.author.id,
                username: post.author.username,
                displayName: post.author.displayName,
                profileImage: post.author.profileImage
              })}
            >
              <span className="font-semibold hover:underline cursor-pointer">
                {post.author.displayName || post.author.username}
              </span>
            </UserProfilePopover>
            <span className="text-xs text-muted-foreground">@{post.author.username}</span>
          </div>
        </div>
      )}

      <div className="prose dark:prose-invert max-w-none">
        <MarkdownContent content={post.content} userEmojis={userEmojis} />
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <span title={new Date(post.createdAt).toLocaleString()}>
          {formatDistanceToNow(new Date(post.createdAt))}
        </span>
        {showCommentCount && (
          <span>{post.comments?.length || 0} comments</span>
        )}
        {showLikeCount && (
          <span>{post.likes?.length || 0} likes</span>
        )}
      </div>      <div className="mt-4">
        <PostInteractionButtons
          postId={post.id}
          authorId={post.authorId}
          isLiked={isLiked}
          likesCount={post.likes?.length || 0}
          commentsCount={post.comments?.length || 0}
          onLike={handleLike}
          onEdit={user?.id === post.authorId ? handleEdit : undefined}
          onComment={handleComment}
          onDelete={user?.id === post.authorId ? handleDelete : undefined}
        />

      </div>
    </div>
  );
} 