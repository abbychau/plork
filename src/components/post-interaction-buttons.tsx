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
  Trash,
} from '@mynaui/icons-react';

interface PostInteractionButtonsProps {
  postId: string;
  authorId: string;
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  onLike: () => void;
  onEdit?: () => void;
  onComment?: () => void;
  hideViewFullPost?: boolean;
  onDelete?: () => void;
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
  onDelete
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
    <div className="flex justify-between items-center w-full text-sm">
      {/* Left side - Comment and Like counts */}
      <div className="flex items-center gap-4 ml-2">
        {/* Comment count - now black and clickable */}
        {onComment ? (
          <button
            onClick={onComment}
            className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
            title={`${commentsCount} comment${commentsCount !== 1 ? 's' : ''}`}
          >
            <MessageDots className="w-4 h-4" />
            <span className="text-sm">{commentsCount}</span>
          </button>
        ) : (
          <Link
            href={`/posts/${postId}#comments`}
            className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
            title={`${commentsCount} comment${commentsCount !== 1 ? 's' : ''}`}
          >
            <MessageDots className="w-4 h-4" />
            <span className="text-sm">{commentsCount}</span>
          </Link>
        )}

        {/* Like count - now black and clickable */}
        <button
          onClick={() => onLike()}
          className={`flex items-center gap-1.5 ${isLiked ? 'text-red-500' : 'hover:text-red-500'} transition-colors cursor-pointer`}
          title={`${likesCount} like${likesCount !== 1 ? 's' : ''}`}
        >
          {isLiked ?
            <HeartSolid className="w-4 h-4" /> :
            <Heart className="w-4 h-4" />
          }
          <span className="text-sm">{likesCount}</span>
        </button>
      </div>

      {/* Right side - Action buttons */}
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-foreground hover:text-primary cursor-pointer"
          onClick={handleShare}
          title="Copy permalink"
        >
          <ClipboardCopy className="w-4 h-4" />
          <span className="sr-only">Copy</span>
        </Button>

        {isAuthor && onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-foreground hover:text-primary cursor-pointer"
            onClick={onEdit}
            title="Edit post"
          >
            <Edit className="w-4 h-4" />
            <span className="sr-only">Edit</span>
          </Button>
        )}
        
        {isAuthor && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-foreground hover:text-destructive cursor-pointer"
            onClick={onDelete}
            title="Delete post"
          >
            <Trash className="w-4 h-4" />
            <span className="sr-only">Delete</span>
          </Button>
        )}
      </div>
    </div>
  );
}
