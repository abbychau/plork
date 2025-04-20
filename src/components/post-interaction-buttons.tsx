'use client';

import Link from 'next/link';
import { ClipboardCopy } from 'lucide-react';
import { copyToClipboard } from '@/lib/clipboard';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import { useCompactMode } from '@/hooks/use-compact-mode';

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
  compact?: boolean;
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
  compact, // No default value, will be determined by useCompactMode
  hideViewFullPost = false
}: PostInteractionButtonsProps) {
  // Determine if compact mode should be used based on screen width
  // If compact prop is provided, it will override the screen width detection
  const isCompact = useCompactMode(compact);

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
    <div className="flex gap-4 text-sm">
      {onComment ? (
        <button
          className="text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors duration-200 cursor-pointer"
          onClick={onComment}
        >
          <MessageDots className="w-4 h-4" />
          <span>{commentsCount}</span>
          {!isCompact && <span>Comment{commentsCount>1 ? 's' : ''}</span>}
        </button>
      ) : (
        <Link
          href={`/posts/${postId}#comments`}
          className="text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors duration-200 cursor-pointer"
        >
          <MessageDots className="w-4 h-4" />
          <span>{commentsCount}</span>
          {!isCompact && <span>Comment{commentsCount>1 ? 's' : ''}</span> }
        </Link>
      )}

      <button
        className="text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors duration-200 cursor-pointer"
        onClick={handleShare}
        title="Copy permalink"
      >
        <ClipboardCopy className="w-4 h-4" />
        {!isCompact && <span>Copy</span>}
      </button>

      <button
        className={`flex items-center gap-1 transition-colors duration-200 cursor-pointer ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
        onClick={() => onLike(postId)}
      >
        {isLiked ?
          <HeartSolid className="w-4 h-4" /> :
          <Heart className="w-4 h-4" />
        }
        <span>{likesCount}</span>
        {!isCompact && <span>Like{likesCount>1 ? 's' : ''}</span>}
      </button>

      {!hideViewFullPost && (
        <Link
          href={`/posts/${postId}`}
          className="text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors duration-200 cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          {!isCompact && <span>View Full Post</span>}
        </Link>
      )}

      {isAuthor && onEdit && (
        <button
          className="text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors duration-200 cursor-pointer"
          onClick={onEdit}
        >
          <Edit className="w-4 h-4" />
          {!isCompact && <span>Edit</span>}
        </button>
      )}
    </div>
  );
}
