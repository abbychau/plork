'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import CommentSection from '@/components/comment-section';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

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
  author: {
    id: string;
    username: string;
    displayName?: string;
    profileImage?: string;
  };
  comments?: Comment[];
}

interface CommentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string | null;
}

export default function CommentSidebar({ isOpen, onClose, postId }: CommentSidebarProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && postId) {
      fetchPost(postId);
    } else {
      // Reset state when sidebar is closed
      setPost(null);
      setError('');
    }
  }, [isOpen, postId]);

  const fetchPost = async (id: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/posts/single?postId=${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }

      const data = await response.json();
      setPost(data);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load post and comments');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle the case when a comment is added or edited
  const handleCommentUpdate = () => {
    if (postId) {
      fetchPost(postId);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Comments</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
          </div>
        ) : post ? (
          <div>
            <div className="mb-4 pb-4 border-b">
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href={`/posts/${post.id}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  View full post
                </Link>
              </div>
            </div>
            <CommentSection
              postId={post.id}
              initialComments={post.comments || []}
              compact={true}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Select a post to view comments</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
