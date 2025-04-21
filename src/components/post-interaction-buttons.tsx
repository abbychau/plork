'use client';

import Link from 'next/link';
import { ClipboardCopy } from 'lucide-react';
import { copyToClipboard } from '@/lib/clipboard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';

// Import Mynaui icons
import {
  Edit,
  Heart,
  HeartSolid,
  MessageDots,
  Eye
} from '@mynaui/icons-react';

interface PostInteractionButtonsProps {
  postId: string;
  authorId: string;
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  onLike: (postId: string) => void;
  onEdit?: () => void;
  onComment?: () => void;
  hideViewFullPost?: boolean;
}

export default function PostInteractionButtons({
  postId,
  authorId,
  isLiked,
  likesCount,
  commentsCount,
  onLike,
  onEdit,
  onComment,
  hideViewFullPost = false
}: PostInteractionButtonsProps) {

  const { user } = useAuth();
  const { toast } = useToast();

  const isAuthor = user && user.id === authorId;

  const handleShare = async () => {
    // Get the base URL of the site
    const baseUrl = window.location.origin;
    const postUrl = `${baseUrl}/posts/${postId}`;

    const success = await copyToClipboard(postUrl);

    if (success) {
      toast({
        title: "Copied to clipboard",
        description: "The post link has been copied to your clipboard",
      });
    } else {
      toast({
        title: "Failed to copy",
        description: "Could not copy the post link to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-1 text-sm">
      {onComment ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-foreground hover:text-primary"
          onClick={onComment}
          title={`${commentsCount} comment${commentsCount !== 1 ? 's' : ''}`}
        >
          <MessageDots className="w-4 h-4" />
          <span className="sr-only">Comments</span>
          <span className="ml-1 text-xs">{commentsCount}</span>
        </Button>
      ) : (
        <Link
          href={`/posts/${postId}#comments`}
          title={`${commentsCount} comment${commentsCount !== 1 ? 's' : ''}`}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-foreground hover:text-primary"
          >
            <MessageDots className="w-4 h-4" />
            <span className="sr-only">Comments</span>
            <span className="ml-1 text-xs">{commentsCount}</span>
          </Button>
        </Link>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-foreground hover:text-primary"
        onClick={handleShare}
        title="Copy permalink"
      >
        <ClipboardCopy className="w-4 h-4" />
        <span className="sr-only">Copy</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${isLiked ? 'text-red-500' : 'text-foreground hover:text-red-500'}`}
        onClick={() => onLike(postId)}
        title={`${likesCount} like${likesCount !== 1 ? 's' : ''}`}
      >
        {isLiked ?
          <HeartSolid className="w-4 h-4" /> :
          <Heart className="w-4 h-4" />
        }
        <span className="sr-only">Like</span>
        <span className="ml-1 text-xs">{likesCount}</span>
      </Button>

      {!hideViewFullPost && (
        <Link
          href={`/posts/${postId}`}
          title="View full post"
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-foreground hover:text-primary"
          >
            <Eye className="w-4 h-4" />
            <span className="sr-only">View Full Post</span>
          </Button>
        </Link>
      )}

      {isAuthor && onEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-foreground hover:text-primary"
          onClick={onEdit}
          title="Edit post"
        >
          <Edit className="w-4 h-4" />
          <span className="sr-only">Edit</span>
        </Button>
      )}
    </div>
  );
}
