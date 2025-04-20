'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import MarkdownContent from '@/components/markdown-content';
import EnhancedPostEditor from '@/components/enhanced-post-editor';
import Link from 'next/link';
import { Edit } from '@mynaui/icons-react';

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
}

export default function CommentSection({ postId, initialComments, compact = false }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [error, setError] = useState('');

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

      // Comment added successfully
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

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>

      {comments.length > 0 ? (
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 pb-4 border-b">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author.profileImage} alt={comment.author.username} />
                <AvatarFallback>
                  {comment.author.displayName?.[0] || comment.author.username[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/users/${comment.author.username}`} className="font-semibold hover:underline">
                    {comment.author.displayName || comment.author.username}
                  </Link>
                  <span className="text-muted-foreground text-sm">@{comment.author.username}</span>
                  <span className="text-muted-foreground text-sm">·</span>
                  <span className="text-muted-foreground text-sm">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {editingCommentId === comment.id ? (
                  <div className="mt-2">
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
                  <div className="mt-1">
                    <MarkdownContent content={comment.content} />
                    {user && user.id === comment.author.id && (
                      <button
                        className="text-xs text-muted-foreground hover:text-primary mt-1 flex items-center gap-1 transition-colors duration-200"
                        onClick={() => handleEditComment(comment)}
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground mb-6">No comments yet. Be the first to comment!</p>
      )}

      {user ? (
        <div className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Avatar className="h-8 w-8 mt-1">
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
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 border rounded-md">
          <p className="mb-2">You need to be logged in to comment.</p>
          <Link href="/login">
            <Button size="sm">Login</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
