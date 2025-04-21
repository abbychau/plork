'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import EnhancedPostEditor from '@/components/enhanced-post-editor';

interface CreatePostModalProps {
  triggerClassName?: string;
  compact?: boolean;
  children?: React.ReactNode;
  className?: string;
  onPostCreated?: (post: any) => void;
}

export default function CreatePostModal({ triggerClassName, compact, children, className, onPostCreated }: CreatePostModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdPost, setCreatedPost] = useState<any>(null);

  const handleSubmit = async (content: string) => {
    setError('');
    setIsLoading(true);

    try {
      // Create the post via API
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create post');
      }

      // Store the created post data
      setCreatedPost(responseData);

      // Close the modal
      setIsOpen(false);

      // Call the onPostCreated callback if provided
      if (onPostCreated) {
        onPostCreated(responseData);
      }

      // Refresh the page or specific components based on the current path
      if (pathname === '/' || pathname.startsWith('/users/')) {
        // If on timeline or user profile, refresh to show the new post
        router.refresh();
      }

      toast({
        title: "Post created",
        description: "Your post has been published successfully",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      console.error(err);

      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to create post',
        variant: "destructive",
      });

      throw err; // Re-throw to let the PostEditor component handle the error state
      setCreatedPost(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className={className}>
        {children ? (
          children
        ) : compact ? (
          <Button size="icon" className={triggerClassName}>
            <Plus className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" className={`gap-1 ${triggerClassName}`}>
            <Plus className="h-4 w-4" />
            <span>New Post</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create a New Post</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <EnhancedPostEditor
          mode="create"
          onCreateSubmit={handleSubmit}
          isLoading={isLoading}
          placeholder="What's on your mind? You can use Markdown and upload images!"
          submitLabel="Post"
        />
      </DialogContent>
    </Dialog>
  );
}
