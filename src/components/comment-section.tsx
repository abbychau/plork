'use client';

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { usePinnedUsers } from '@/lib/pinned-users-context';
import MarkdownContent from '@/components/markdown-content';
import EnhancedPostEditor from '@/components/enhanced-post-editor';
import UserProfilePopover from '@/components/user-profile-popover';
import Link from 'next/link';
import { Edit, Trash } from '@mynaui/icons-react';
import { formatDistanceToNow } from '@/lib/utils';
import type { CustomEmoji } from '@/components/custom-emoji-picker';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
  compact?: boolean;
  userEmojis?: CustomEmoji[]; // Add prop for user emojis
}

export default function CommentSection({ postId, initialComments, compact = false, userEmojis = [] }: CommentSectionProps) {
  const { user } = useAuth();
  const { addPinnedUser } = usePinnedUsers();
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [error, setError] = useState('');
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [localUserEmojis, setLocalUserEmojis] = useState<CustomEmoji[]>(userEmojis);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Update comments when initialComments changes
  useEffect(() => {
    setComments(initialComments || []);
  }, [initialComments]);

  // Update local emojis when prop changes
  useEffect(() => {
    setLocalUserEmojis(userEmojis);
  }, [userEmojis]);

  // Function to refresh emojis
  const refreshEmojis = async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/emojis/collection');
      if (!response.ok) {
        throw new Error('Failed to fetch user emojis');
      }
      const data: CustomEmoji[] = await response.json();
      setLocalUserEmojis(data);
    } catch (err) {
      console.error('Error fetching user emojis:', err);
    }
  };

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitComment = async (content: string) => {
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/comments?postId=${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post comment');
      }

      const comment = await response.json();

      // Add the new comment to the list
      setComments([...comments, comment]);
      
      // Scroll to bottom after a short delay to ensure the new comment is rendered
      setTimeout(scrollToBottom, 100);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (content: string) => {
    if (!editingCommentId || !content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/comments?commentId=${editingCommentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update comment');
      }

      const updatedComment = await response.json();
      setComments(comments.map(comment =>
        comment.id === editingCommentId ? updatedComment : comment
      ));
      setEditingCommentId(null);
      setEditContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update comment');
      console.error('Error updating comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!commentId || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete comment');
      }

      // Remove the deleted comment from the list
      setComments(comments.filter(comment => comment.id !== commentId));
      setCommentToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
      console.error('Error deleting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" id="comments">
        Comments
        {comments.length > 0 && (
          <span className="text-sm font-normal bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            {comments.length}
          </span>
        )}
      </h3>

      {comments.length > 0 ? (
        <div className="space-y-3 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="group flex gap-4 pb-3 border-b last:border-b-0">
              <UserProfilePopover
                username={comment.author.username}
                onPin={() => addPinnedUser({
                  id: comment.author.id,
                  username: comment.author.username,
                  displayName: comment.author.displayName,
                  profileImage: comment.author.profileImage
                })}
              >
                <div className="cursor-pointer">
                  <Avatar className="h-10 w-10 border border-muted hover:border-primary transition-colors">
                    <AvatarImage src={comment.author.profileImage} alt={comment.author.username} />
                    <AvatarFallback>
                      {comment.author.displayName?.[0] || comment.author.username[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </UserProfilePopover>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <UserProfilePopover
                    username={comment.author.username}
                    onPin={() => addPinnedUser({
                      id: comment.author.id,
                      username: comment.author.username,
                      displayName: comment.author.displayName,
                      profileImage: comment.author.profileImage
                    })}
                  >
                    <span className="font-semibold hover:underline cursor-pointer">
                      {comment.author.displayName || comment.author.username}
                    </span>
                  </UserProfilePopover>
                  <span className="text-muted-foreground text-sm">@{comment.author.username}</span>
                  <span className="text-muted-foreground text-sm">·</span>
                  <span className="text-muted-foreground text-sm" title={new Date(comment.createdAt).toLocaleString()}>
                    {formatDistanceToNow(new Date(comment.createdAt))}
                  </span>
                  {user && user.id === comment.author.id && (
                      <div className="flex items-center gap-3 ml-2">
                        <button
                          className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors duration-200 py-1"
                          onClick={() => handleEditComment(comment)}
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          className="text-xs font-medium text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors duration-200 py-1"
                          onClick={() => setCommentToDelete(comment.id)}
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                </div>

                {editingCommentId === comment.id ? (
                  <div className="mt-3">
                    <EnhancedPostEditor
                      mode="edit"
                      initialContent={editContent}
                      isLoading={isSubmitting}
                      onEditSubmit={handleSaveEdit}
                      onCancel={handleCancelEdit}
                      placeholder="Edit your comment..."
                      compact={compact}
                    />
                  </div>
                ) : (
                  <div className="mt-2">
                    <MarkdownContent content={comment.content} userEmojis={localUserEmojis} />

                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={commentsEndRef} />
        </div>
      ) : (
        <div className="text-center py-8 mb-6 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
        </div>
      )}

      {user ? (
        <div className="space-y-4 mt-8">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Avatar className="h-10 w-10 mt-1 border border-muted hidden xl:block">
              <AvatarImage src={user.profileImage} alt={user.username} />
              <AvatarFallback>
                {user.displayName?.[0] || user.username[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <EnhancedPostEditor
                mode="create"
                placeholder="Write a comment..."
                isLoading={isSubmitting}
                onCreateSubmit={handleSubmitComment}
                submitLabel="Post Comment"
                compact={compact}
                onEmojiUploaded={refreshEmojis}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 border rounded-md bg-muted/20 mt-8">
          <p className="mb-3 text-muted-foreground">You need to be logged in to comment.</p>
          <Link href="/login">
            <Button size="sm" variant="outline">Login to comment</Button>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => commentToDelete && handleDeleteComment(commentToDelete)}
              disabled={isSubmitting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
